#!/usr/bin/env python
import os,sys, shutil, logging
import struct
import cStringIO
import math
import zipfile
import re
import optparse
import binascii
import base64
import zlib
import email  # for MHTML parsing
import string # for printable
import json   # for json output mode (argument --json)

# import lxml or ElementTree for XML parsing:
try:
    # lxml: best performance for XML processing
    import lxml.etree as ET
except ImportError:
    try:
        # Python 2.5+: batteries included
        import xml.etree.cElementTree as ET
    except ImportError:
        try:
            # Python <2.5: standalone ElementTree install
            import elementtree.cElementTree as ET
        except ImportError:
            raise ImportError, "lxml or ElementTree are not installed, " \
                               + "see http://codespeak.net/lxml " \
                               + "or http://effbot.org/zone/element-index.htm"

import thirdparty.olefile as olefile
from thirdparty.prettytable import prettytable
from thirdparty.xglob import xglob, PathNotFoundException
from thirdparty.pyparsing.pyparsing import \
        CaselessKeyword, CaselessLiteral, Combine, Forward, Literal, \
        Optional, QuotedString,Regex, Suppress, Word, WordStart, \
        alphanums, alphas, hexnums,nums, opAssoc, srange, \
        infixNotation
import ppt_parser

# monkeypatch email to fix issue #32:
# allow header lines without ":"
import email.feedparser
email.feedparser.headerRE = re.compile(r'^(From |[\041-\071\073-\176]{1,}:?|[\t ])')


# === LOGGING =================================================================

class NullHandler(logging.Handler):
    """
    Log Handler without output, to avoid printing messages if logging is not
    configured by the main application.
    Python 2.7 has logging.NullHandler, but this is necessary for 2.6:
    see https://docs.python.org/2.6/library/logging.html#configuring-logging-for-a-library
    """
    def emit(self, record):
        pass

def get_logger(name, level=logging.CRITICAL+1):
    """
    Create a suitable logger object for this module.
    The goal is not to change settings of the root logger, to avoid getting
    other modules' logs on the screen.
    If a logger exists with same name, reuse it. (Else it would have duplicate
    handlers and messages would be doubled.)
    The level is set to CRITICAL+1 by default, to avoid any logging.
    """
    # First, test if there is already a logger with the same name, else it
    # will generate duplicate messages (due to duplicate handlers):
    if name in logging.Logger.manager.loggerDict:
        #NOTE: another less intrusive but more "hackish" solution would be to
        # use getLogger then test if its effective level is not default.
        logger = logging.getLogger(name)
        # make sure level is OK:
        logger.setLevel(level)
        return logger
    # get a new logger:
    logger = logging.getLogger(name)
    # only add a NullHandler for this logger, it is up to the application
    # to configure its own logging:
    logger.addHandler(NullHandler())
    logger.setLevel(level)
    return logger

# a global logger object used for debugging:
log = get_logger('olevba')


#=== EXCEPTIONS ==============================================================

class OlevbaBaseException(Exception):
    """ Base class for exceptions produced here for simpler except clauses """
    def __init__(self, msg, filename=None, orig_exc=None, **kwargs):
        if orig_exc:
            super(OlevbaBaseException, self).__init__(msg +
                                                      ' ({})'.format(orig_exc),
                                                      **kwargs)
        else:
            super(OlevbaBaseException, self).__init__(msg, **kwargs)
        self.msg = msg
        self.filename = filename
        self.orig_exc = orig_exc


class FileOpenError(OlevbaBaseException):
    """ raised by VBA_Parser constructor if all open_... attempts failed

    probably means the file type is not supported
    """

    def __init__(self, filename, orig_exc=None):
        super(FileOpenError, self).__init__(
            'Failed to open file %s' % filename, filename, orig_exc)


class ProcessingError(OlevbaBaseException):
    """ raised by VBA_Parser.process_file* functions """

    def __init__(self, filename, orig_exc):
        super(ProcessingError, self).__init__(
            'Error processing file %s' % filename, filename, orig_exc)


class MsoExtractionError(RuntimeError, OlevbaBaseException):
    """ raised by mso_file_extract if parsing MSO/ActiveMIME data failed """

    def __init__(self, msg):
        MsoExtractionError.__init__(self, msg)
        OlevbaBaseException.__init__(self, msg)


class SubstreamOpenError(FileOpenError):
    """ special kind of FileOpenError: file is a substream of original file """

    def __init__(self, filename, subfilename, orig_exc=None):
        super(SubstreamOpenError, self).__init__(
            str(filename) + '/' + str(subfilename), orig_exc)
        self.filename = filename   # overwrite setting in OlevbaBaseException
        self.subfilename = subfilename


class UnexpectedDataError(OlevbaBaseException):
    """ raised when parsing is strict (=not relaxed) and data is unexpected """

    def __init__(self, stream_path, variable, expected, value):
        super(UnexpectedDataError, self).__init__(self,
            'Unexpected value in {} for variable {}: '
            'expected {:04X but found {:04X}!'
            .format(stream_path, variable, expected, value))
        self.stream_path = stream_path
        self.variable = variable
        self.expected = expected
        self.value = value

#--- CONSTANTS ----------------------------------------------------------------

# return codes
RETURN_OK             = 0
RETURN_WARNINGS       = 1  # (reserved, not used yet)
RETURN_WRONG_ARGS     = 2  # (fixed, built into optparse)
RETURN_FILE_NOT_FOUND = 3
RETURN_XGLOB_ERR      = 4
RETURN_OPEN_ERROR     = 5
RETURN_PARSE_ERROR    = 6
RETURN_SEVERAL_ERRS   = 7
RETURN_UNEXPECTED     = 8

# URL and message to report issues:
URL_OLEVBA_ISSUES = 'https://github.com/decalage2/oletools/issues'
MSG_OLEVBA_ISSUES = 'Please report this issue on %s' % URL_OLEVBA_ISSUES

# Container types:
TYPE_OLE = 'OLE'
TYPE_OpenXML = 'OpenXML'
TYPE_Word2003_XML = 'Word2003_XML'
TYPE_MHTML = 'MHTML'
TYPE_TEXT = 'Text'
TYPE_PPT = 'PPT'

# short tag to display file types in triage mode:
TYPE2TAG = {
    TYPE_OLE: 'OLE:',
    TYPE_OpenXML: 'OpX:',
    TYPE_Word2003_XML: 'XML:',
    TYPE_MHTML: 'MHT:',
    TYPE_TEXT: 'TXT:',
    TYPE_PPT: 'PPT',
}


# MSO files ActiveMime header magic
MSO_ACTIVEMIME_HEADER = 'ActiveMime'

MODULE_EXTENSION = "bas"
CLASS_EXTENSION = "cls"
FORM_EXTENSION = "frm"

# Namespaces and tags for Word2003 XML parsing:
NS_W = '{http://schemas.microsoft.com/office/word/2003/wordml}'
# the tag <w:binData w:name="editdata.mso"> contains the VBA macro code:
TAG_BINDATA = NS_W + 'binData'
ATTR_NAME = NS_W + 'name'

# Keywords to detect auto-executable macros
AUTOEXEC_KEYWORDS = {
    # MS Word:
    'Runs when the Word document is opened':
        ('AutoExec', 'AutoOpen', 'Document_Open', 'DocumentOpen'),
    'Runs when the Word document is closed':
        ('AutoExit', 'AutoClose', 'Document_Close', 'DocumentBeforeClose'),
    'Runs when the Word document is modified':
        ('DocumentChange',),
    'Runs when a new Word document is created':
        ('AutoNew', 'Document_New', 'NewDocument'),

    # MS Excel:
    'Runs when the Excel Workbook is opened':
        ('Auto_Open', 'Workbook_Open', 'Workbook_Activate'),
    'Runs when the Excel Workbook is closed':
        ('Auto_Close', 'Workbook_Close'),

    #TODO: full list in MS specs??
}

# Suspicious Keywords that may be used by malware
# See VBA language reference: http://msdn.microsoft.com/en-us/library/office/jj692818%28v=office.15%29.aspx
SUSPICIOUS_KEYWORDS = {
    #TODO: use regex to support variable whitespaces
    'May read system environment variables':
        ('Environ',),
    'May open a file':
        ('Open',),
    'May write to a file (if combined with Open)':
    #TODO: regex to find Open+Write on same line
        ('Write', 'Put', 'Output', 'Print #'),
    'May read or write a binary file (if combined with Open)':
    #TODO: regex to find Open+Binary on same line
        ('Binary',),
    'May copy a file':
        ('FileCopy', 'CopyFile'),
    #FileCopy: http://msdn.microsoft.com/en-us/library/office/gg264390%28v=office.15%29.aspx
    #CopyFile: http://msdn.microsoft.com/en-us/library/office/gg264089%28v=office.15%29.aspx
    'May delete a file':
        ('Kill',),
    'May create a text file':
        ('CreateTextFile', 'ADODB.Stream', 'WriteText', 'SaveToFile'),
    #CreateTextFile: http://msdn.microsoft.com/en-us/library/office/gg264617%28v=office.15%29.aspx
    #ADODB.Stream sample: http://pastebin.com/Z4TMyuq6
    'May run an executable file or a system command':
        ('Shell', 'vbNormal', 'vbNormalFocus', 'vbHide', 'vbMinimizedFocus', 'vbMaximizedFocus', 'vbNormalNoFocus',
         'vbMinimizedNoFocus', 'WScript.Shell', 'Run', 'ShellExecute'),
    #Shell: http://msdn.microsoft.com/en-us/library/office/gg278437%28v=office.15%29.aspx
    #WScript.Shell+Run sample: http://pastebin.com/Z4TMyuq6
    'May run PowerShell commands':
    #sample: https://malwr.com/analysis/M2NjZWNmMjA0YjVjNGVhYmJlZmFhNWY4NmQxZDllZTY/
    #also: https://bitbucket.org/decalage/oletools/issues/14/olevba-library-update-ioc
    # ref: https://blog.netspi.com/15-ways-to-bypass-the-powershell-execution-policy/
    # TODO: add support for keywords starting with a non-alpha character, such as "-noexit"
    # TODO: '-command', '-EncodedCommand', '-scriptblock'
        ('PowerShell', 'noexit', 'ExecutionPolicy', 'noprofile', 'command', 'EncodedCommand',
         'invoke-command', 'scriptblock', 'Invoke-Expression', 'AuthorizationManager'),
    'May run an executable file or a system command using PowerShell':
        ('Start-Process',),
    'May hide the application':
        ('Application.Visible', 'ShowWindow', 'SW_HIDE'),
    'May create a directory':
        ('MkDir',),
    'May save the current workbook':
        ('ActiveWorkbook.SaveAs',),
    'May change which directory contains files to open at startup':
    #TODO: confirm the actual effect
        ('Application.AltStartupPath',),
    'May create an OLE object':
        ('CreateObject',),
    'May create an OLE object using PowerShell':
        ('New-Object',),
    'May run an application (if combined with CreateObject)':
        ('Shell.Application',),
    'May enumerate application windows (if combined with Shell.Application object)':
        ('Windows', 'FindWindow'),
    'May run code from a DLL':
    #TODO: regex to find declare+lib on same line
        ('Lib',),
    'May inject code into another process':
        ('CreateThread', 'VirtualAlloc', # (issue #9) suggested by Davy Douhine - used by MSF payload
        ),
    'May download files from the Internet':
    #TODO: regex to find urlmon+URLDownloadToFileA on same line
        ('URLDownloadToFileA', 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP',
         'MSXML2.ServerXMLHTTP', # suggested in issue #13
         'User-Agent', # sample from @ozhermit: http://pastebin.com/MPc3iV6z
        ),
    'May download files from the Internet using PowerShell':
    #sample: https://malwr.com/analysis/M2NjZWNmMjA0YjVjNGVhYmJlZmFhNWY4NmQxZDllZTY/
        ('Net.WebClient', 'DownloadFile', 'DownloadString'),
    'May control another application by simulating user keystrokes':
        ('SendKeys', 'AppActivate'),
    #SendKeys: http://msdn.microsoft.com/en-us/library/office/gg278655%28v=office.15%29.aspx
    'May attempt to obfuscate malicious function calls':
        ('CallByName',),
    #CallByName: http://msdn.microsoft.com/en-us/library/office/gg278760%28v=office.15%29.aspx
    'May attempt to obfuscate specific strings':
    #TODO: regex to find several Chr*, not just one
        ('Chr', 'ChrB', 'ChrW', 'StrReverse', 'Xor'),
    #Chr: http://msdn.microsoft.com/en-us/library/office/gg264465%28v=office.15%29.aspx
    'May read or write registry keys':
    #sample: https://malwr.com/analysis/M2NjZWNmMjA0YjVjNGVhYmJlZmFhNWY4NmQxZDllZTY/
        ('RegOpenKeyExA', 'RegOpenKeyEx', 'RegCloseKey'),
    'May read registry keys':
    #sample: https://malwr.com/analysis/M2NjZWNmMjA0YjVjNGVhYmJlZmFhNWY4NmQxZDllZTY/
        ('RegQueryValueExA', 'RegQueryValueEx',
         'RegRead',  #with Wscript.Shell
        ),
    'May detect virtualization':
    # sample: https://malwr.com/analysis/M2NjZWNmMjA0YjVjNGVhYmJlZmFhNWY4NmQxZDllZTY/
        (r'SYSTEM\ControlSet001\Services\Disk\Enum', 'VIRTUAL', 'VMWARE', 'VBOX'),
    'May detect Anubis Sandbox':
    # sample: https://malwr.com/analysis/M2NjZWNmMjA0YjVjNGVhYmJlZmFhNWY4NmQxZDllZTY/
    # NOTES: this sample also checks App.EXEName but that seems to be a bug, it works in VB6 but not in VBA
    # ref: http://www.syssec-project.eu/m/page-media/3/disarm-raid11.pdf
        ('GetVolumeInformationA', 'GetVolumeInformation',  # with kernel32.dll
         '1824245000', r'HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProductId',
         '76487-337-8429955-22614', 'andy', 'sample', r'C:\exec\exec.exe', 'popupkiller'
        ),
    'May detect Sandboxie':
    # sample: https://malwr.com/analysis/M2NjZWNmMjA0YjVjNGVhYmJlZmFhNWY4NmQxZDllZTY/
    # ref: http://www.cplusplus.com/forum/windows/96874/
        ('SbieDll.dll', 'SandboxieControlWndClass'),
    'May detect Sunbelt Sandbox':
    # ref: http://www.cplusplus.com/forum/windows/96874/
        (r'C:\file.exe',),
    'May detect Norman Sandbox':
    # ref: http://www.cplusplus.com/forum/windows/96874/
        ('currentuser',),
    'May detect CW Sandbox':
    # ref: http://www.cplusplus.com/forum/windows/96874/
        ('Schmidti',),
    'May detect WinJail Sandbox':
    # ref: http://www.cplusplus.com/forum/windows/96874/
        ('Afx:400000:0',),
}

# Regular Expression for a URL:
# http://en.wikipedia.org/wiki/Uniform_resource_locator
# http://www.w3.org/Addressing/URL/uri-spec.html
#TODO: also support username:password@server
#TODO: other protocols (file, gopher, wais, ...?)
SCHEME = r'\b(?:http|ftp)s?'
# see http://en.wikipedia.org/wiki/List_of_Internet_top-level_domains
TLD = r'(?:xn--[a-zA-Z0-9]{4,20}|[a-zA-Z]{2,20})'
DNS_NAME = r'(?:[a-zA-Z0-9\-\.]+\.' + TLD + ')'
#TODO: IPv6 - see https://www.debuggex.com/
# A literal numeric IPv6 address may be given, but must be enclosed in [ ] e.g. [db8:0cec::99:123a]
NUMBER_0_255 = r'(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])'
IPv4 = r'(?:' + NUMBER_0_255 + r'\.){3}' + NUMBER_0_255
# IPv4 must come before the DNS name because it is more specific
SERVER = r'(?:' + IPv4 + '|' + DNS_NAME + ')'
PORT = r'(?:\:[0-9]{1,5})?'
SERVER_PORT = SERVER + PORT
URL_PATH = r'(?:/[a-zA-Z0-9\-\._\?\,\'/\\\+&%\$#\=~]*)?'  # [^\.\,\)\(\s"]
URL_RE = SCHEME + r'\://' + SERVER_PORT + URL_PATH
re_url = re.compile(URL_RE)


# Patterns to be extracted (IP addresses, URLs, etc)
# From patterns.py in balbuzard
RE_PATTERNS = (
    ('URL', re.compile(URL_RE)),
    ('IPv4 address', re.compile(IPv4)),
    # TODO: add IPv6
    ('E-mail address', re.compile(r'(?i)\b[A-Z0-9._%+-]+@' + SERVER + '\b')),
    # ('Domain name', re.compile(r'(?=^.{1,254}$)(^(?:(?!\d+\.|-)[a-zA-Z0-9_\-]{1,63}(?<!-)\.?)+(?:[a-zA-Z]{2,})$)')),
    # Executable file name with known extensions (except .com which is present in many URLs, and .application):
    ("Executable file name", re.compile(
        r"(?i)\b\w+\.(EXE|PIF|GADGET|MSI|MSP|MSC|VBS|VBE|VB|JSE|JS|WSF|WSC|WSH|WS|BAT|CMD|DLL|SCR|HTA|CPL|CLASS|JAR|PS1XML|PS1|PS2XML|PS2|PSC1|PSC2|SCF|LNK|INF|REG)\b")),
    # Sources: http://www.howtogeek.com/137270/50-file-extensions-that-are-potentially-dangerous-on-windows/
    # TODO: https://support.office.com/en-us/article/Blocked-attachments-in-Outlook-3811cddc-17c3-4279-a30c-060ba0207372#__attachment_file_types
    # TODO: add win & unix file paths
    #('Hex string', re.compile(r'(?:[0-9A-Fa-f]{2}){4,}')),
)

# regex to detect strings encoded in hexadecimal
re_hex_string = re.compile(r'(?:[0-9A-Fa-f]{2}){4,}')

# regex to detect strings encoded in base64
#re_base64_string = re.compile(r'"(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?"')
# better version from balbuzard, less false positives:
# (plain version without double quotes, used also below in quoted_base64_string)
BASE64_RE = r'(?:[A-Za-z0-9+/]{4}){1,}(?:[A-Za-z0-9+/]{2}[AEIMQUYcgkosw048]=|[A-Za-z0-9+/][AQgw]==)?'
re_base64_string = re.compile('"' + BASE64_RE + '"')
# white list of common strings matching the base64 regex, but which are not base64 strings (all lowercase):
BASE64_WHITELIST = set(['thisdocument', 'thisworkbook', 'test', 'temp', 'http', 'open', 'exit'])

# regex to detect strings encoded with a specific Dridex algorithm
# (see https://github.com/JamesHabben/MalwareStuff)
re_dridex_string = re.compile(r'"[0-9A-Za-z]{20,}"')
# regex to check that it is not just a hex string:
re_nothex_check = re.compile(r'[G-Zg-z]')

# regex to extract printable strings (at least 5 chars) from VBA Forms:
re_printable_string = re.compile(r'[\t\r\n\x20-\xFF]{5,}')


# === PARTIAL VBA GRAMMAR ====================================================

# REFERENCES:
# - [MS-VBAL]: VBA Language Specification
#   https://msdn.microsoft.com/en-us/library/dd361851.aspx
# - pyparsing: http://pyparsing.wikispaces.com/

# TODO: set whitespaces according to VBA
# TODO: merge extended lines before parsing

# VBA identifier chars (from MS-VBAL 3.3.5)
vba_identifier_chars = alphanums + '_'

class VbaExpressionString(str):
    """
    Class identical to str, used to distinguish plain strings from strings
    obfuscated using VBA expressions (Chr, StrReverse, etc)
    Usage: each VBA expression parse action should convert strings to
    VbaExpressionString.
    Then isinstance(s, VbaExpressionString) is True only for VBA expressions.
     (see detect_vba_strings)
    """
    # TODO: use Unicode everywhere instead of str
    pass


# --- NUMBER TOKENS ----------------------------------------------------------

# 3.3.2 Number Tokens
# INTEGER = integer-literal ["%" / "&" / "^"]
# integer-literal = decimal-literal / octal-literal / hex-literal
# decimal-literal = 1*decimal-digit
# octal-literal = "&" [%x004F / %x006F] 1*octal-digit
# ; & or &o or &O
# hex-literal = "&" (%x0048 / %x0068) 1*hex-digit
# ; &h or &H
# octal-digit = "0" / "1" / "2" / "3" / "4" / "5" / "6" / "7"
# decimal-digit = octal-digit / "8" / "9"
# hex-digit = decimal-digit / %x0041-0046 / %x0061-0066 ;A-F / a-f

# NOTE: here Combine() is required to avoid spaces between elements
# NOTE: here WordStart is necessary to avoid matching a number preceded by
#       letters or underscore (e.g. "VBT1" or "ABC_34"), when using scanString
decimal_literal = Combine(WordStart(vba_identifier_chars) + Word(nums)
                          + Suppress(Optional(Word('%&^', exact=1))))
decimal_literal.setParseAction(lambda t: int(t[0]))

octal_literal = Combine(Suppress(Literal('&') + Optional((CaselessLiteral('o')))) + Word(srange('[0-7]'))
                + Suppress(Optional(Word('%&^', exact=1))))
octal_literal.setParseAction(lambda t: int(t[0], base=8))

hex_literal = Combine(Suppress(CaselessLiteral('&h')) + Word(srange('[0-9a-fA-F]'))
                + Suppress(Optional(Word('%&^', exact=1))))
hex_literal.setParseAction(lambda t: int(t[0], base=16))

integer = decimal_literal | octal_literal | hex_literal


# --- QUOTED STRINGS ---------------------------------------------------------

# 3.3.4 String Tokens
# STRING = double-quote *string-character (double-quote / line-continuation / LINE-END)
# double-quote = %x0022 ; "
# string-character = NO-LINE-CONTINUATION ((double-quote double-quote) termination-character)

quoted_string = QuotedString('"', escQuote='""')
quoted_string.setParseAction(lambda t: str(t[0]))


#--- VBA Expressions ---------------------------------------------------------

# See MS-VBAL 5.6 Expressions

# need to pre-declare using Forward() because it is recursive
# VBA string expression and integer expression
vba_expr_str = Forward()
vba_expr_int = Forward()

# --- CHR --------------------------------------------------------------------

# MS-VBAL 6.1.2.11.1.4 Chr / Chr$
# Function Chr(CharCode As Long) As Variant
# Function Chr$(CharCode As Long) As String
# Parameter Description
# CharCode Long whose value is a code point.
# Returns a String data value consisting of a single character containing the character whose code
# point is the data value of the argument.
# - If the argument is not in the range 0 to 255, Error Number 5 ("Invalid procedure call or
# argument") is raised unless the implementation supports a character set with a larger code point
# range.
# - If the argument value is in the range of 0 to 127, it is interpreted as a 7-bit ASCII code point.
# - If the argument value is in the range of 128 to 255, the code point interpretation of the value is
# implementation defined.
# - Chr$ has the same runtime semantics as Chr, however the declared type of its function result is
# String rather than Variant.

# 6.1.2.11.1.5 ChrB / ChrB$
# Function ChrB(CharCode As Long) As Variant
# Function ChrB$(CharCode As Long) As String
# CharCode Long whose value is a code point.
# Returns a String data value consisting of a single byte character whose code point value is the
# data value of the argument.
# - If the argument is not in the range 0 to 255, Error Number 6 ("Overflow") is raised.
# - ChrB$ has the same runtime semantics as ChrB however the declared type of its function result
# is String rather than Variant.
# - Note: the ChrB function is used with byte data contained in a String. Instead of returning a
# character, which may be one or two bytes, ChrB always returns a single byte. The ChrW function
# returns a String containing the Unicode character except on platforms where Unicode is not
# supported, in which case, the behavior is identical to the Chr function.

# 6.1.2.11.1.6 ChrW/ ChrW$
# Function ChrW(CharCode As Long) As Variant
# Function ChrW$(CharCode As Long) As String
# CharCode Long whose value is a code point.
# Returns a String data value consisting of a single character containing the character whose code
# point is the data value of the argument.
# - If the argument is not in the range -32,767 to 65,535 then Error Number 5 ("Invalid procedure
# call or argument") is raised.
# - If the argument is a negative value it is treated as if it was the value: CharCode + 65,536.
# - If the implemented uses 16-bit Unicode code points argument, data value is interpreted as a 16-
# bit Unicode code point.
# - If the implementation does not support Unicode, ChrW has the same semantics as Chr.
# - ChrW$ has the same runtime semantics as ChrW, however the declared type of its function result
# is String rather than Variant.

# Chr, Chr$, ChrB, ChrW(int) => char
vba_chr = Suppress(
            Combine(WordStart(vba_identifier_chars) + CaselessLiteral('Chr')
            + Optional(CaselessLiteral('B') | CaselessLiteral('W')) + Optional('$'))
            + '(') + vba_expr_int + Suppress(')')

def vba_chr_tostr(t):
    try:
        i = t[0]
        # normal, non-unicode character:
        if i>=0 and i<=255:
            return VbaExpressionString(chr(i))
        else:
            return VbaExpressionString(unichr(i).encode('utf-8', 'backslashreplace'))
    except ValueError:
        log.exception('ERROR: incorrect parameter value for chr(): %r' % i)
        return VbaExpressionString('Chr(%r)' % i)

vba_chr.setParseAction(vba_chr_tostr)


# --- ASC --------------------------------------------------------------------

# Asc(char) => int
#TODO: see MS-VBAL 6.1.2.11.1.1 page 240 => AscB, AscW
vba_asc = Suppress(CaselessKeyword('Asc') + '(') + vba_expr_str + Suppress(')')
vba_asc.setParseAction(lambda t: ord(t[0]))


# --- VAL --------------------------------------------------------------------

# Val(string) => int
# TODO: make sure the behavior of VBA's val is fully covered
vba_val = Suppress(CaselessKeyword('Val') + '(') + vba_expr_str + Suppress(')')
vba_val.setParseAction(lambda t: int(t[0].strip()))


# --- StrReverse() --------------------------------------------------------------------

# StrReverse(string) => string
strReverse = Suppress(CaselessKeyword('StrReverse') + '(') + vba_expr_str + Suppress(')')
strReverse.setParseAction(lambda t: VbaExpressionString(str(t[0])[::-1]))


# --- ENVIRON() --------------------------------------------------------------------

# Environ("name") => just translated to "%name%", that is enough for malware analysis
environ = Suppress(CaselessKeyword('Environ') + '(') + vba_expr_str + Suppress(')')
environ.setParseAction(lambda t: VbaExpressionString('%%%s%%' % t[0]))


# --- IDENTIFIER -------------------------------------------------------------

#TODO: see MS-VBAL 3.3.5 page 33
# 3.3.5 Identifier Tokens
# Latin-identifier = first-Latin-identifier-character *subsequent-Latin-identifier-character
# first-Latin-identifier-character = (%x0041-005A / %x0061-007A) ; A-Z / a-z
# subsequent-Latin-identifier-character = first-Latin-identifier-character / DIGIT / %x5F ; underscore
latin_identifier = Word(initChars=alphas, bodyChars=alphanums + '_')

# --- HEX FUNCTION -----------------------------------------------------------

# match any custom function name with a hex string as argument:
# TODO: accept vba_expr_str_item as argument, check if it is a hex or base64 string at runtime

# quoted string of at least two hexadecimal numbers of two digits:
quoted_hex_string = Suppress('"') + Combine(Word(hexnums, exact=2) * (2, None)) + Suppress('"')
quoted_hex_string.setParseAction(lambda t: str(t[0]))

hex_function_call = Suppress(latin_identifier) + Suppress('(') + \
                    quoted_hex_string('hex_string') + Suppress(')')
hex_function_call.setParseAction(lambda t: VbaExpressionString(binascii.a2b_hex(t.hex_string)))


# --- BASE64 FUNCTION -----------------------------------------------------------

# match any custom function name with a Base64 string as argument:
# TODO: accept vba_expr_str_item as argument, check if it is a hex or base64 string at runtime

# quoted string of at least two hexadecimal numbers of two digits:
quoted_base64_string = Suppress('"') + Regex(BASE64_RE) + Suppress('"')
quoted_base64_string.setParseAction(lambda t: str(t[0]))

base64_function_call = Suppress(latin_identifier) + Suppress('(') + \
                    quoted_base64_string('base64_string') + Suppress(')')
base64_function_call.setParseAction(lambda t: VbaExpressionString(binascii.a2b_base64(t.base64_string)))


# ---STRING EXPRESSION -------------------------------------------------------

def concat_strings_list(tokens):
    """
    parse action to concatenate strings in a VBA expression with operators '+' or '&'
    """
    # extract argument from the tokens:
    # expected to be a tuple containing a list of strings such as [a,'&',b,'&',c,...]
    strings = tokens[0][::2]
    return VbaExpressionString(''.join(strings))


vba_expr_str_item = (vba_chr | strReverse | environ | quoted_string | hex_function_call | base64_function_call)

vba_expr_str <<= infixNotation(vba_expr_str_item,
    [
        ("+", 2, opAssoc.LEFT, concat_strings_list),
        ("&", 2, opAssoc.LEFT, concat_strings_list),
    ])


# --- INTEGER EXPRESSION -------------------------------------------------------

def sum_ints_list(tokens):
    """
    parse action to sum integers in a VBA expression with operator '+'
    """
    # extract argument from the tokens:
    # expected to be a tuple containing a list of integers such as [a,'&',b,'&',c,...]
    integers = tokens[0][::2]
    return sum(integers)


def subtract_ints_list(tokens):
    """
    parse action to subtract integers in a VBA expression with operator '-'
    """
    # extract argument from the tokens:
    # expected to be a tuple containing a list of integers such as [a,'&',b,'&',c,...]
    integers = tokens[0][::2]
    return reduce(lambda x,y:x-y, integers)


def multiply_ints_list(tokens):
    """
    parse action to multiply integers in a VBA expression with operator '*'
    """
    # extract argument from the tokens:
    # expected to be a tuple containing a list of integers such as [a,'&',b,'&',c,...]
    integers = tokens[0][::2]
    return reduce(lambda x,y:x*y, integers)


def divide_ints_list(tokens):
    """
    parse action to divide integers in a VBA expression with operator '/'
    """
    # extract argument from the tokens:
    # expected to be a tuple containing a list of integers such as [a,'&',b,'&',c,...]
    integers = tokens[0][::2]
    return reduce(lambda x,y:x/y, integers)


vba_expr_int_item = (vba_asc | vba_val | integer)

# operators associativity:
# https://en.wikipedia.org/wiki/Operator_associativity

vba_expr_int <<= infixNotation(vba_expr_int_item,
    [
        ("*", 2, opAssoc.LEFT, multiply_ints_list),
        ("/", 2, opAssoc.LEFT, divide_ints_list),
        ("-", 2, opAssoc.LEFT, subtract_ints_list),
        ("+", 2, opAssoc.LEFT, sum_ints_list),
    ])


# see detect_vba_strings for the deobfuscation code using this grammar

# === MSO/ActiveMime files parsing ===========================================

def is_mso_file(data):
    """
    Check if the provided data is the content of a MSO/ActiveMime file, such as
    the ones created by Outlook in some cases, or Word/Excel when saving a
    file with the MHTML format or the Word 2003 XML format.
    This function only checks the ActiveMime magic at the beginning of data.
    :param data: bytes string, MSO/ActiveMime file content
    :return: bool, True if the file is MSO, False otherwise
    """
    return data.startswith(MSO_ACTIVEMIME_HEADER)


# regex to find zlib block headers, starting with byte 0x78 = 'x'
re_zlib_header = re.compile(r'x')


def mso_file_extract(data):
    """
    Extract the data stored into a MSO/ActiveMime file, such as
    the ones created by Outlook in some cases, or Word/Excel when saving a
    file with the MHTML format or the Word 2003 XML format.

    :param data: bytes string, MSO/ActiveMime file content
    :return: bytes string, extracted data (uncompressed)

    raise a MsoExtractionError if the data cannot be extracted
    """
    # check the magic:
    assert is_mso_file(data)

    # In all the samples seen so far, Word always uses an offset of 0x32,
    # and Excel 0x22A. But we read the offset from the header to be more
    # generic.
    offsets = [0x32, 0x22A]

    # First, attempt to get the compressed data offset from the header
    # According to my tests, it should be an unsigned 16 bits integer,
    # at offset 0x1E (little endian) + add 46:
    try:
        offset = struct.unpack_from('<H', data, offset=0x1E)[0] + 46
        log.debug('Parsing MSO file: data offset = 0x%X' % offset)
        offsets.insert(0, offset)  # insert at beginning of offsets
    except struct.error as exc:
        log.info('Unable to parse MSO/ActiveMime file header (%s)' % exc)
        log.debug('Trace:', exc_info=True)
        raise MsoExtractionError('Unable to parse MSO/ActiveMime file header')
    # now try offsets
    for start in offsets:
        try:
            log.debug('Attempting zlib decompression from MSO file offset 0x%X' % start)
            extracted_data = zlib.decompress(data[start:])
            return extracted_data
        except zlib.error as exc:
            log.info('zlib decompression failed for offset %s (%s)'
                     % (start, exc))
            log.debug('Trace:', exc_info=True)
    # None of the guessed offsets worked, let's try brute-forcing by looking
    # for potential zlib-compressed blocks starting with 0x78:
    log.debug('Looking for potential zlib-compressed blocks in MSO file')
    for match in re_zlib_header.finditer(data):
        start = match.start()
        try:
            log.debug('Attempting zlib decompression from MSO file offset 0x%X' % start)
            extracted_data = zlib.decompress(data[start:])
            return extracted_data
        except zlib.error as exc:
            log.info('zlib decompression failed (%s)' % exc)
            log.debug('Trace:', exc_info=True)
    raise MsoExtractionError('Unable to decompress data from a MSO/ActiveMime file')


#--- FUNCTIONS ----------------------------------------------------------------

# set of printable characters, for is_printable
_PRINTABLE_SET = set(string.printable)

def is_printable(s):
    """
    returns True if string s only contains printable ASCII characters
    (i.e. contained in string.printable)
    This is similar to Python 3's str.isprintable, for Python 2.x.
    :param s: str
    :return: bool
    """
    # inspired from http://stackoverflow.com/questions/3636928/test-if-a-python-string-is-printable
    # check if the set of chars from s is contained into the set of printable chars:
    return set(s).issubset(_PRINTABLE_SET)


def copytoken_help(decompressed_current, decompressed_chunk_start):
    """
    compute bit masks to decode a CopyToken according to MS-OVBA 2.4.1.3.19.1 CopyToken Help

    decompressed_current: number of decompressed bytes so far, i.e. len(decompressed_container)
    decompressed_chunk_start: offset of the current chunk in the decompressed container
    return length_mask, offset_mask, bit_count, maximum_length
    """
    difference = decompressed_current - decompressed_chunk_start
    bit_count = int(math.ceil(math.log(difference, 2)))
    bit_count = max([bit_count, 4])
    length_mask = 0xFFFF >> bit_count
    offset_mask = ~length_mask
    maximum_length = (0xFFFF >> bit_count) + 3
    return length_mask, offset_mask, bit_count, maximum_length


def decompress_stream(compressed_container):
    """
    Decompress a stream according to MS-OVBA section 2.4.1

    compressed_container: string compressed according to the MS-OVBA 2.4.1.3.6 Compression algorithm
    return the decompressed container as a string (bytes)
    """
    # 2.4.1.2 State Variables

    # The following state is maintained for the CompressedContainer (section 2.4.1.1.1):
    # CompressedRecordEnd: The location of the byte after the last byte in the CompressedContainer (section 2.4.1.1.1).
    # CompressedCurrent: The location of the next byte in the CompressedContainer (section 2.4.1.1.1) to be read by
    #                    decompression or to be written by compression.

    # The following state is maintained for the current CompressedChunk (section 2.4.1.1.4):
    # CompressedChunkStart: The location of the first byte of the CompressedChunk (section 2.4.1.1.4) within the
    #                       CompressedContainer (section 2.4.1.1.1).

    # The following state is maintained for a DecompressedBuffer (section 2.4.1.1.2):
    # DecompressedCurrent: The location of the next byte in the DecompressedBuffer (section 2.4.1.1.2) to be written by
    #                      decompression or to be read by compression.
    # DecompressedBufferEnd: The location of the byte after the last byte in the DecompressedBuffer (section 2.4.1.1.2).

    # The following state is maintained for the current DecompressedChunk (section 2.4.1.1.3):
    # DecompressedChunkStart: The location of the first byte of the DecompressedChunk (section 2.4.1.1.3) within the
    #                         DecompressedBuffer (section 2.4.1.1.2).

    decompressed_container = ''  # result
    compressed_current = 0

    sig_byte = ord(compressed_container[compressed_current])
    if sig_byte != 0x01:
        raise ValueError('invalid signature byte {0:02X}'.format(sig_byte))

    compressed_current += 1

    #NOTE: the definition of CompressedRecordEnd is ambiguous. Here we assume that
    # CompressedRecordEnd = len(compressed_container)
    while compressed_current < len(compressed_container):
        # 2.4.1.1.5
        compressed_chunk_start = compressed_current
        # chunk header = first 16 bits
        compressed_chunk_header = \
            struct.unpack("<H", compressed_container[compressed_chunk_start:compressed_chunk_start + 2])[0]
        # chunk size = 12 first bits of header + 3
        chunk_size = (compressed_chunk_header & 0x0FFF) + 3
        # chunk signature = 3 next bits - should always be 0b011
        chunk_signature = (compressed_chunk_header >> 12) & 0x07
        if chunk_signature != 0b011:
            raise ValueError('Invalid CompressedChunkSignature in VBA compressed stream')
        # chunk flag = next bit - 1 == compressed, 0 == uncompressed
        chunk_flag = (compressed_chunk_header >> 15) & 0x01
        log.debug("chunk size = {0}, compressed flag = {1}".format(chunk_size, chunk_flag))

        #MS-OVBA 2.4.1.3.12: the maximum size of a chunk including its header is 4098 bytes (header 2 + data 4096)
        # The minimum size is 3 bytes
        # NOTE: there seems to be a typo in MS-OVBA, the check should be with 4098, not 4095 (which is the max value
        # in chunk header before adding 3.
        # Also the first test is not useful since a 12 bits value cannot be larger than 4095.
        if chunk_flag == 1 and chunk_size > 4098:
            raise ValueError('CompressedChunkSize > 4098 but CompressedChunkFlag == 1')
        if chunk_flag == 0 and chunk_size != 4098:
            raise ValueError('CompressedChunkSize != 4098 but CompressedChunkFlag == 0')

        # check if chunk_size goes beyond the compressed data, instead of silently cutting it:
        #TODO: raise an exception?
        if compressed_chunk_start + chunk_size > len(compressed_container):
            log.warning('Chunk size is larger than remaining compressed data')
        compressed_end = min([len(compressed_container), compressed_chunk_start + chunk_size])
        # read after chunk header:
        compressed_current = compressed_chunk_start + 2

        if chunk_flag == 0:
            # MS-OVBA 2.4.1.3.3 Decompressing a RawChunk
            # uncompressed chunk: read the next 4096 bytes as-is
            #TODO: check if there are at least 4096 bytes left
            decompressed_container += compressed_container[compressed_current:compressed_current + 4096]
            compressed_current += 4096
        else:
            # MS-OVBA 2.4.1.3.2 Decompressing a CompressedChunk
            # compressed chunk
            decompressed_chunk_start = len(decompressed_container)
            while compressed_current < compressed_end:
                # MS-OVBA 2.4.1.3.4 Decompressing a TokenSequence
                # log.debug('compressed_current = %d / compressed_end = %d' % (compressed_current, compressed_end))
                # FlagByte: 8 bits indicating if the following 8 tokens are either literal (1 byte of plain text) or
                # copy tokens (reference to a previous literal token)
                flag_byte = ord(compressed_container[compressed_current])
                compressed_current += 1
                for bit_index in xrange(0, 8):
                    # log.debug('bit_index=%d / compressed_current=%d / compressed_end=%d' % (bit_index, compressed_current, compressed_end))
                    if compressed_current >= compressed_end:
                        break
                    # MS-OVBA 2.4.1.3.5 Decompressing a Token
                    # MS-OVBA 2.4.1.3.17 Extract FlagBit
                    flag_bit = (flag_byte >> bit_index) & 1
                    #log.debug('bit_index=%d: flag_bit=%d' % (bit_index, flag_bit))
                    if flag_bit == 0:  # LiteralToken
                        # copy one byte directly to output
                        decompressed_container += compressed_container[compressed_current]
                        compressed_current += 1
                    else:  # CopyToken
                        # MS-OVBA 2.4.1.3.19.2 Unpack CopyToken
                        copy_token = \
                            struct.unpack("<H", compressed_container[compressed_current:compressed_current + 2])[0]
                        #TODO: check this
                        length_mask, offset_mask, bit_count, _ = copytoken_help(
                            len(decompressed_container), decompressed_chunk_start)
                        length = (copy_token & length_mask) + 3
                        temp1 = copy_token & offset_mask
                        temp2 = 16 - bit_count
                        offset = (temp1 >> temp2) + 1
                        #log.debug('offset=%d length=%d' % (offset, length))
                        copy_source = len(decompressed_container) - offset
                        for index in xrange(copy_source, copy_source + length):
                            decompressed_container += decompressed_container[index]
                        compressed_current += 2
    return decompressed_container


def _extract_vba(ole, vba_root, project_path, dir_path, relaxed=False):
    """
    Extract VBA macros from an OleFileIO object.
    Internal function, do not call directly.

    vba_root: path to the VBA root storage, containing the VBA storage and the PROJECT stream
    vba_project: path to the PROJECT stream
    :param relaxed: If True, only create info/debug log entry if data is not as expected
                    (e.g. opening substream fails); if False, raise an error in this case
    This is a generator, yielding (stream path, VBA filename, VBA source code) for each VBA code stream
    """
    # Open the PROJECT stream:
    project = ole.openstream(project_path)
    log.debug('relaxed is {}'.format(relaxed))

    # sample content of the PROJECT stream:

    ##    ID="{5312AC8A-349D-4950-BDD0-49BE3C4DD0F0}"
    ##    Document=ThisDocument/&H00000000
    ##    Module=NewMacros
    ##    Name="Project"
    ##    HelpContextID="0"
    ##    VersionCompatible32="393222000"
    ##    CMG="F1F301E705E705E705E705"
    ##    DPB="8F8D7FE3831F2020202020"
    ##    GC="2D2FDD81E51EE61EE6E1"
    ##
    ##    [Host Extender Info]
    ##    &H00000001={3832D640-CF90-11CF-8E43-00A0C911005A};VBE;&H00000000
    ##    &H00000002={000209F2-0000-0000-C000-000000000046};Word8.0;&H00000000
    ##
    ##    [Workspace]
    ##    ThisDocument=22, 29, 339, 477, Z
    ##    NewMacros=-4, 42, 832, 510, C

    code_modules = {}

    for line in project:
        line = line.strip()
        if '=' in line:
            # split line at the 1st equal sign:
            name, value = line.split('=', 1)
            # looking for code modules
            # add the code module as a key in the dictionary
            # the value will be the extension needed later
            # The value is converted to lowercase, to allow case-insensitive matching (issue #3)
            value = value.lower()
            if name == 'Document':
                # split value at the 1st slash, keep 1st part:
                value = value.split('/', 1)[0]
                code_modules[value] = CLASS_EXTENSION
            elif name == 'Module':
                code_modules[value] = MODULE_EXTENSION
            elif name == 'Class':
                code_modules[value] = CLASS_EXTENSION
            elif name == 'BaseClass':
                code_modules[value] = FORM_EXTENSION

    # read data from dir stream (compressed)
    dir_compressed = ole.openstream(dir_path).read()

    def check_value(name, expected, value):
        if expected != value:
            if relaxed:
                log.error("invalid value for {0} expected {1:04X} got {2:04X}"
                          .format(name, expected, value))
            else:
                raise UnexpectedDataError(dir_path, name, expected, value)

    dir_stream = cStringIO.StringIO(decompress_stream(dir_compressed))

    # PROJECTSYSKIND Record
    projectsyskind_id = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTSYSKIND_Id', 0x0001, projectsyskind_id)
    projectsyskind_size = struct.unpack("<L", dir_stream.read(4))[0]
    check_value('PROJECTSYSKIND_Size', 0x0004, projectsyskind_size)
    projectsyskind_syskind = struct.unpack("<L", dir_stream.read(4))[0]
    if projectsyskind_syskind == 0x00:
        log.debug("16-bit Windows")
    elif projectsyskind_syskind == 0x01:
        log.debug("32-bit Windows")
    elif projectsyskind_syskind == 0x02:
        log.debug("Macintosh")
    elif projectsyskind_syskind == 0x03:
        log.debug("64-bit Windows")
    else:
        log.error("invalid PROJECTSYSKIND_SysKind {0:04X}".format(projectsyskind_syskind))

    # PROJECTLCID Record
    projectlcid_id = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTLCID_Id', 0x0002, projectlcid_id)
    projectlcid_size = struct.unpack("<L", dir_stream.read(4))[0]
    check_value('PROJECTLCID_Size', 0x0004, projectlcid_size)
    projectlcid_lcid = struct.unpack("<L", dir_stream.read(4))[0]
    check_value('PROJECTLCID_Lcid', 0x409, projectlcid_lcid)

    # PROJECTLCIDINVOKE Record
    projectlcidinvoke_id = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTLCIDINVOKE_Id', 0x0014, projectlcidinvoke_id)
    projectlcidinvoke_size = struct.unpack("<L", dir_stream.read(4))[0]
    check_value('PROJECTLCIDINVOKE_Size', 0x0004, projectlcidinvoke_size)
    projectlcidinvoke_lcidinvoke = struct.unpack("<L", dir_stream.read(4))[0]
    check_value('PROJECTLCIDINVOKE_LcidInvoke', 0x409, projectlcidinvoke_lcidinvoke)

    # PROJECTCODEPAGE Record
    projectcodepage_id = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTCODEPAGE_Id', 0x0003, projectcodepage_id)
    projectcodepage_size = struct.unpack("<L", dir_stream.read(4))[0]
    check_value('PROJECTCODEPAGE_Size', 0x0002, projectcodepage_size)
    projectcodepage_codepage = struct.unpack("<H", dir_stream.read(2))[0]

    # PROJECTNAME Record
    projectname_id = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTNAME_Id', 0x0004, projectname_id)
    projectname_sizeof_projectname = struct.unpack("<L", dir_stream.read(4))[0]
    if projectname_sizeof_projectname < 1 or projectname_sizeof_projectname > 128:
        log.error("PROJECTNAME_SizeOfProjectName value not in range: {0}".format(projectname_sizeof_projectname))
    projectname_projectname = dir_stream.read(projectname_sizeof_projectname)
    unused = projectname_projectname

    # PROJECTDOCSTRING Record
    projectdocstring_id = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTDOCSTRING_Id', 0x0005, projectdocstring_id)
    projectdocstring_sizeof_docstring = struct.unpack("<L", dir_stream.read(4))[0]
    if projectdocstring_sizeof_docstring > 2000:
        log.error(
            "PROJECTDOCSTRING_SizeOfDocString value not in range: {0}".format(projectdocstring_sizeof_docstring))
    projectdocstring_docstring = dir_stream.read(projectdocstring_sizeof_docstring)
    projectdocstring_reserved = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTDOCSTRING_Reserved', 0x0040, projectdocstring_reserved)
    projectdocstring_sizeof_docstring_unicode = struct.unpack("<L", dir_stream.read(4))[0]
    if projectdocstring_sizeof_docstring_unicode % 2 != 0:
        log.error("PROJECTDOCSTRING_SizeOfDocStringUnicode is not even")
    projectdocstring_docstring_unicode = dir_stream.read(projectdocstring_sizeof_docstring_unicode)
    unused = projectdocstring_docstring
    unused = projectdocstring_docstring_unicode

    # PROJECTHELPFILEPATH Record - MS-OVBA 2.3.4.2.1.7
    projecthelpfilepath_id = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTHELPFILEPATH_Id', 0x0006, projecthelpfilepath_id)
    projecthelpfilepath_sizeof_helpfile1 = struct.unpack("<L", dir_stream.read(4))[0]
    if projecthelpfilepath_sizeof_helpfile1 > 260:
        log.error(
            "PROJECTHELPFILEPATH_SizeOfHelpFile1 value not in range: {0}".format(projecthelpfilepath_sizeof_helpfile1))
    projecthelpfilepath_helpfile1 = dir_stream.read(projecthelpfilepath_sizeof_helpfile1)
    projecthelpfilepath_reserved = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTHELPFILEPATH_Reserved', 0x003D, projecthelpfilepath_reserved)
    projecthelpfilepath_sizeof_helpfile2 = struct.unpack("<L", dir_stream.read(4))[0]
    if projecthelpfilepath_sizeof_helpfile2 != projecthelpfilepath_sizeof_helpfile1:
        log.error("PROJECTHELPFILEPATH_SizeOfHelpFile1 does not equal PROJECTHELPFILEPATH_SizeOfHelpFile2")
    projecthelpfilepath_helpfile2 = dir_stream.read(projecthelpfilepath_sizeof_helpfile2)
    if projecthelpfilepath_helpfile2 != projecthelpfilepath_helpfile1:
        log.error("PROJECTHELPFILEPATH_HelpFile1 does not equal PROJECTHELPFILEPATH_HelpFile2")

    # PROJECTHELPCONTEXT Record
    projecthelpcontext_id = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTHELPCONTEXT_Id', 0x0007, projecthelpcontext_id)
    projecthelpcontext_size = struct.unpack("<L", dir_stream.read(4))[0]
    check_value('PROJECTHELPCONTEXT_Size', 0x0004, projecthelpcontext_size)
    projecthelpcontext_helpcontext = struct.unpack("<L", dir_stream.read(4))[0]
    unused = projecthelpcontext_helpcontext

    # PROJECTLIBFLAGS Record
    projectlibflags_id = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTLIBFLAGS_Id', 0x0008, projectlibflags_id)
    projectlibflags_size = struct.unpack("<L", dir_stream.read(4))[0]
    check_value('PROJECTLIBFLAGS_Size', 0x0004, projectlibflags_size)
    projectlibflags_projectlibflags = struct.unpack("<L", dir_stream.read(4))[0]
    check_value('PROJECTLIBFLAGS_ProjectLibFlags', 0x0000, projectlibflags_projectlibflags)

    # PROJECTVERSION Record
    projectversion_id = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTVERSION_Id', 0x0009, projectversion_id)
    projectversion_reserved = struct.unpack("<L", dir_stream.read(4))[0]
    check_value('PROJECTVERSION_Reserved', 0x0004, projectversion_reserved)
    projectversion_versionmajor = struct.unpack("<L", dir_stream.read(4))[0]
    projectversion_versionminor = struct.unpack("<H", dir_stream.read(2))[0]
    unused = projectversion_versionmajor
    unused = projectversion_versionminor

    # PROJECTCONSTANTS Record
    projectconstants_id = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTCONSTANTS_Id', 0x000C, projectconstants_id)
    projectconstants_sizeof_constants = struct.unpack("<L", dir_stream.read(4))[0]
    if projectconstants_sizeof_constants > 1015:
        log.error(
            "PROJECTCONSTANTS_SizeOfConstants value not in range: {0}".format(projectconstants_sizeof_constants))
    projectconstants_constants = dir_stream.read(projectconstants_sizeof_constants)
    projectconstants_reserved = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTCONSTANTS_Reserved', 0x003C, projectconstants_reserved)
    projectconstants_sizeof_constants_unicode = struct.unpack("<L", dir_stream.read(4))[0]
    if projectconstants_sizeof_constants_unicode % 2 != 0:
        log.error("PROJECTCONSTANTS_SizeOfConstantsUnicode is not even")
    projectconstants_constants_unicode = dir_stream.read(projectconstants_sizeof_constants_unicode)
    unused = projectconstants_constants
    unused = projectconstants_constants_unicode

    # array of REFERENCE records
    check = None
    while True:
        check = struct.unpack("<H", dir_stream.read(2))[0]
        log.debug("reference type = {0:04X}".format(check))
        if check == 0x000F:
            break

        if check == 0x0016:
            # REFERENCENAME
            reference_id = check
            reference_sizeof_name = struct.unpack("<L", dir_stream.read(4))[0]
            reference_name = dir_stream.read(reference_sizeof_name)
            reference_reserved = struct.unpack("<H", dir_stream.read(2))[0]
            check_value('REFERENCE_Reserved', 0x003E, reference_reserved)
            reference_sizeof_name_unicode = struct.unpack("<L", dir_stream.read(4))[0]
            reference_name_unicode = dir_stream.read(reference_sizeof_name_unicode)
            unused = reference_id
            unused = reference_name
            unused = reference_name_unicode
            continue

        if check == 0x0033:
            # REFERENCEORIGINAL (followed by REFERENCECONTROL)
            referenceoriginal_id = check
            referenceoriginal_sizeof_libidoriginal = struct.unpack("<L", dir_stream.read(4))[0]
            referenceoriginal_libidoriginal = dir_stream.read(referenceoriginal_sizeof_libidoriginal)
            unused = referenceoriginal_id
            unused = referenceoriginal_libidoriginal
            continue

        if check == 0x002F:
            # REFERENCECONTROL
            referencecontrol_id = check
            referencecontrol_sizetwiddled = struct.unpack("<L", dir_stream.read(4))[0]  # ignore
            referencecontrol_sizeof_libidtwiddled = struct.unpack("<L", dir_stream.read(4))[0]
            referencecontrol_libidtwiddled = dir_stream.read(referencecontrol_sizeof_libidtwiddled)
            referencecontrol_reserved1 = struct.unpack("<L", dir_stream.read(4))[0]  # ignore
            check_value('REFERENCECONTROL_Reserved1', 0x0000, referencecontrol_reserved1)
            referencecontrol_reserved2 = struct.unpack("<H", dir_stream.read(2))[0]  # ignore
            check_value('REFERENCECONTROL_Reserved2', 0x0000, referencecontrol_reserved2)
            unused = referencecontrol_id
            unused = referencecontrol_sizetwiddled
            unused = referencecontrol_libidtwiddled
            # optional field
            check2 = struct.unpack("<H", dir_stream.read(2))[0]
            if check2 == 0x0016:
                referencecontrol_namerecordextended_id = check
                referencecontrol_namerecordextended_sizeof_name = struct.unpack("<L", dir_stream.read(4))[0]
                referencecontrol_namerecordextended_name = dir_stream.read(
                    referencecontrol_namerecordextended_sizeof_name)
                referencecontrol_namerecordextended_reserved = struct.unpack("<H", dir_stream.read(2))[0]
                check_value('REFERENCECONTROL_NameRecordExtended_Reserved', 0x003E,
                            referencecontrol_namerecordextended_reserved)
                referencecontrol_namerecordextended_sizeof_name_unicode = struct.unpack("<L", dir_stream.read(4))[0]
                referencecontrol_namerecordextended_name_unicode = dir_stream.read(
                    referencecontrol_namerecordextended_sizeof_name_unicode)
                referencecontrol_reserved3 = struct.unpack("<H", dir_stream.read(2))[0]
                unused = referencecontrol_namerecordextended_id
                unused = referencecontrol_namerecordextended_name
                unused = referencecontrol_namerecordextended_name_unicode
            else:
                referencecontrol_reserved3 = check2

            check_value('REFERENCECONTROL_Reserved3', 0x0030, referencecontrol_reserved3)
            referencecontrol_sizeextended = struct.unpack("<L", dir_stream.read(4))[0]
            referencecontrol_sizeof_libidextended = struct.unpack("<L", dir_stream.read(4))[0]
            referencecontrol_libidextended = dir_stream.read(referencecontrol_sizeof_libidextended)
            referencecontrol_reserved4 = struct.unpack("<L", dir_stream.read(4))[0]
            referencecontrol_reserved5 = struct.unpack("<H", dir_stream.read(2))[0]
            referencecontrol_originaltypelib = dir_stream.read(16)
            referencecontrol_cookie = struct.unpack("<L", dir_stream.read(4))[0]
            unused = referencecontrol_sizeextended
            unused = referencecontrol_libidextended
            unused = referencecontrol_reserved4
            unused = referencecontrol_reserved5
            unused = referencecontrol_originaltypelib
            unused = referencecontrol_cookie
            continue

        if check == 0x000D:
            # REFERENCEREGISTERED
            referenceregistered_id = check
            referenceregistered_size = struct.unpack("<L", dir_stream.read(4))[0]
            referenceregistered_sizeof_libid = struct.unpack("<L", dir_stream.read(4))[0]
            referenceregistered_libid = dir_stream.read(referenceregistered_sizeof_libid)
            referenceregistered_reserved1 = struct.unpack("<L", dir_stream.read(4))[0]
            check_value('REFERENCEREGISTERED_Reserved1', 0x0000, referenceregistered_reserved1)
            referenceregistered_reserved2 = struct.unpack("<H", dir_stream.read(2))[0]
            check_value('REFERENCEREGISTERED_Reserved2', 0x0000, referenceregistered_reserved2)
            unused = referenceregistered_id
            unused = referenceregistered_size
            unused = referenceregistered_libid
            continue

        if check == 0x000E:
            # REFERENCEPROJECT
            referenceproject_id = check
            referenceproject_size = struct.unpack("<L", dir_stream.read(4))[0]
            referenceproject_sizeof_libidabsolute = struct.unpack("<L", dir_stream.read(4))[0]
            referenceproject_libidabsolute = dir_stream.read(referenceproject_sizeof_libidabsolute)
            referenceproject_sizeof_libidrelative = struct.unpack("<L", dir_stream.read(4))[0]
            referenceproject_libidrelative = dir_stream.read(referenceproject_sizeof_libidrelative)
            referenceproject_majorversion = struct.unpack("<L", dir_stream.read(4))[0]
            referenceproject_minorversion = struct.unpack("<H", dir_stream.read(2))[0]
            unused = referenceproject_id
            unused = referenceproject_size
            unused = referenceproject_libidabsolute
            unused = referenceproject_libidrelative
            unused = referenceproject_majorversion
            unused = referenceproject_minorversion
            continue

        log.error('invalid or unknown check Id {0:04X}'.format(check))
        sys.exit(0)

    projectmodules_id = check  #struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTMODULES_Id', 0x000F, projectmodules_id)
    projectmodules_size = struct.unpack("<L", dir_stream.read(4))[0]
    check_value('PROJECTMODULES_Size', 0x0002, projectmodules_size)
    projectmodules_count = struct.unpack("<H", dir_stream.read(2))[0]
    projectmodules_projectcookierecord_id = struct.unpack("<H", dir_stream.read(2))[0]
    check_value('PROJECTMODULES_ProjectCookieRecord_Id', 0x0013, projectmodules_projectcookierecord_id)
    projectmodules_projectcookierecord_size = struct.unpack("<L", dir_stream.read(4))[0]
    check_value('PROJECTMODULES_ProjectCookieRecord_Size', 0x0002, projectmodules_projectcookierecord_size)
    projectmodules_projectcookierecord_cookie = struct.unpack("<H", dir_stream.read(2))[0]
    unused = projectmodules_projectcookierecord_cookie

    # short function to simplify unicode text output
    uni_out = lambda unicode_text: unicode_text.encode('utf-8', 'replace')

    log.debug("parsing {0} modules".format(projectmodules_count))
    for projectmodule_index in xrange(0, projectmodules_count):
        try:
            modulename_id = struct.unpack("<H", dir_stream.read(2))[0]
            check_value('MODULENAME_Id', 0x0019, modulename_id)
            modulename_sizeof_modulename = struct.unpack("<L", dir_stream.read(4))[0]
            modulename_modulename = dir_stream.read(modulename_sizeof_modulename)
            # account for optional sections
            section_id = struct.unpack("<H", dir_stream.read(2))[0]
            if section_id == 0x0047:
                modulename_unicode_id = section_id
                modulename_unicode_sizeof_modulename_unicode = struct.unpack("<L", dir_stream.read(4))[0]
                modulename_unicode_modulename_unicode = dir_stream.read(
                    modulename_unicode_sizeof_modulename_unicode).decode('UTF-16LE', 'replace')
                    # just guessing that this is the same encoding as used in OleFileIO
                unused = modulename_unicode_id
                section_id = struct.unpack("<H", dir_stream.read(2))[0]
            if section_id == 0x001A:
                modulestreamname_id = section_id
                modulestreamname_sizeof_streamname = struct.unpack("<L", dir_stream.read(4))[0]
                modulestreamname_streamname = dir_stream.read(modulestreamname_sizeof_streamname)
                modulestreamname_reserved = struct.unpack("<H", dir_stream.read(2))[0]
                check_value('MODULESTREAMNAME_Reserved', 0x0032, modulestreamname_reserved)
                modulestreamname_sizeof_streamname_unicode = struct.unpack("<L", dir_stream.read(4))[0]
                modulestreamname_streamname_unicode = dir_stream.read(
                    modulestreamname_sizeof_streamname_unicode).decode('UTF-16LE', 'replace')
                    # just guessing that this is the same encoding as used in OleFileIO
                unused = modulestreamname_id
                section_id = struct.unpack("<H", dir_stream.read(2))[0]
            if section_id == 0x001C:
                moduledocstring_id = section_id
                check_value('MODULEDOCSTRING_Id', 0x001C, moduledocstring_id)
                moduledocstring_sizeof_docstring = struct.unpack("<L", dir_stream.read(4))[0]
                moduledocstring_docstring = dir_stream.read(moduledocstring_sizeof_docstring)
                moduledocstring_reserved = struct.unpack("<H", dir_stream.read(2))[0]
                check_value('MODULEDOCSTRING_Reserved', 0x0048, moduledocstring_reserved)
                moduledocstring_sizeof_docstring_unicode = struct.unpack("<L", dir_stream.read(4))[0]
                moduledocstring_docstring_unicode = dir_stream.read(moduledocstring_sizeof_docstring_unicode)
                unused = moduledocstring_docstring
                unused = moduledocstring_docstring_unicode
                section_id = struct.unpack("<H", dir_stream.read(2))[0]
            if section_id == 0x0031:
                moduleoffset_id = section_id
                check_value('MODULEOFFSET_Id', 0x0031, moduleoffset_id)
                moduleoffset_size = struct.unpack("<L", dir_stream.read(4))[0]
                check_value('MODULEOFFSET_Size', 0x0004, moduleoffset_size)
                moduleoffset_textoffset = struct.unpack("<L", dir_stream.read(4))[0]
                section_id = struct.unpack("<H", dir_stream.read(2))[0]
            if section_id == 0x001E:
                modulehelpcontext_id = section_id
                check_value('MODULEHELPCONTEXT_Id', 0x001E, modulehelpcontext_id)
                modulehelpcontext_size = struct.unpack("<L", dir_stream.read(4))[0]
                check_value('MODULEHELPCONTEXT_Size', 0x0004, modulehelpcontext_size)
                modulehelpcontext_helpcontext = struct.unpack("<L", dir_stream.read(4))[0]
                unused = modulehelpcontext_helpcontext
                section_id = struct.unpack("<H", dir_stream.read(2))[0]
            if section_id == 0x002C:
                modulecookie_id = section_id
                check_value('MODULECOOKIE_Id', 0x002C, modulecookie_id)
                modulecookie_size = struct.unpack("<L", dir_stream.read(4))[0]
                check_value('MODULECOOKIE_Size', 0x0002, modulecookie_size)
                modulecookie_cookie = struct.unpack("<H", dir_stream.read(2))[0]
                unused = modulecookie_cookie
                section_id = struct.unpack("<H", dir_stream.read(2))[0]
            if section_id == 0x0021 or section_id == 0x0022:
                moduletype_id = section_id
                moduletype_reserved = struct.unpack("<L", dir_stream.read(4))[0]
                unused = moduletype_id
                unused = moduletype_reserved
                section_id = struct.unpack("<H", dir_stream.read(2))[0]
            if section_id == 0x0025:
                modulereadonly_id = section_id
                check_value('MODULEREADONLY_Id', 0x0025, modulereadonly_id)
                modulereadonly_reserved = struct.unpack("<L", dir_stream.read(4))[0]
                check_value('MODULEREADONLY_Reserved', 0x0000, modulereadonly_reserved)
                section_id = struct.unpack("<H", dir_stream.read(2))[0]
            if section_id == 0x0028:
                moduleprivate_id = section_id
                check_value('MODULEPRIVATE_Id', 0x0028, moduleprivate_id)
                moduleprivate_reserved = struct.unpack("<L", dir_stream.read(4))[0]
                check_value('MODULEPRIVATE_Reserved', 0x0000, moduleprivate_reserved)
                section_id = struct.unpack("<H", dir_stream.read(2))[0]
            if section_id == 0x002B:  # TERMINATOR
                module_reserved = struct.unpack("<L", dir_stream.read(4))[0]
                check_value('MODULE_Reserved', 0x0000, module_reserved)
                section_id = None
            if section_id != None:
                log.warning('unknown or invalid module section id {0:04X}'.format(section_id))

            log.debug('Project CodePage = %d' % projectcodepage_codepage)
            vba_codec = 'cp%d' % projectcodepage_codepage
            log.debug("ModuleName = {0}".format(modulename_modulename))
            log.debug("ModuleNameUnicode = {0}".format(uni_out(modulename_unicode_modulename_unicode)))
            log.debug("StreamName = {0}".format(modulestreamname_streamname))
            streamname_unicode = modulestreamname_streamname.decode(vba_codec)
            log.debug("StreamName.decode('%s') = %s" % (vba_codec, uni_out(streamname_unicode)))
            log.debug("StreamNameUnicode = {0}".format(uni_out(modulestreamname_streamname_unicode)))
            log.debug("TextOffset = {0}".format(moduleoffset_textoffset))

            code_data = None
            try_names = streamname_unicode, \
                        modulename_unicode_modulename_unicode, \
                        modulestreamname_streamname_unicode
            for stream_name in try_names:
                # TODO: if olefile._find were less private, could replace this
                #        try-except with calls to it
                try:
                    code_path = vba_root + u'VBA/' + stream_name
                    log.debug('opening VBA code stream %s' % uni_out(code_path))
                    code_data = ole.openstream(code_path).read()
                    break
                except IOError as ioe:
                    log.debug('failed to open stream VBA/{} ({}), try other name'
                              .format(uni_out(stream_name), ioe))

            if code_data is None:
                log.info("Could not open stream {} of {} ('VBA/' + one of {})!"
                         .format(projectmodule_index, projectmodules_count,
                                 '/'.join("'" + uni_out(stream_name) + "'"
                                          for stream_name in try_names)))
                if relaxed:
                    continue   # ... with next submodule
                else:
                    raise SubstreamOpenError('[BASE]', 'VBA/' +
                                uni_out(modulename_unicode_modulename_unicode))

            log.debug("length of code_data = {0}".format(len(code_data)))
            log.debug("offset of code_data = {0}".format(moduleoffset_textoffset))
            code_data = code_data[moduleoffset_textoffset:]
            if len(code_data) > 0:
                code_data = decompress_stream(code_data)
                # case-insensitive search in the code_modules dict to find the file extension:
                filext = code_modules.get(modulename_modulename.lower(), 'bin')
                filename = '{0}.{1}'.format(modulename_modulename, filext)
                #TODO: also yield the codepage so that callers can decode it properly
                yield (code_path, filename, code_data)
                # print '-'*79
                # print filename
                # print ''
                # print code_data
                # print ''
                log.debug('extracted file {0}'.format(filename))
            else:
                log.warning("module stream {0} has code data length 0".format(modulestreamname_streamname))
        except (UnexpectedDataError, SubstreamOpenError):
            raise
        except Exception as exc:
            log.info('Error parsing module {} of {} in _extract_vba:'
                     .format(projectmodule_index, projectmodules_count),
                     exc_info=True)
            if not relaxed:
                raise
    _ = unused   # make pylint happy: now variable "unused" is being used ;-)
    return


def vba_collapse_long_lines(vba_code):
    """
    Parse a VBA module code to detect continuation line characters (underscore) and
    collapse split lines. Continuation line characters are replaced by spaces.

    :param vba_code: str, VBA module code
    :return: str, VBA module code with long lines collapsed
    """
    # TODO: use a regex instead, to allow whitespaces after the underscore?
    vba_code = vba_code.replace(' _\r\n', ' ')
    vba_code = vba_code.replace(' _\r', ' ')
    vba_code = vba_code.replace(' _\n', ' ')
    return vba_code


def filter_vba(vba_code):
    """
    Filter VBA source code to remove the first lines starting with "Attribute VB_",
    which are automatically added by MS Office and not displayed in the VBA Editor.
    This should only be used when displaying source code for human analysis.

    Note: lines are not filtered if they contain a colon, because it could be
    used to hide malicious instructions.

    :param vba_code: str, VBA source code
    :return: str, filtered VBA source code
    """
    vba_lines = vba_code.splitlines()
    start = 0
    for line in vba_lines:
        if line.startswith("Attribute VB_") and not ':' in line:
            start += 1
        else:
            break
    #TODO: also remove empty lines?
    vba = '\n'.join(vba_lines[start:])
    return vba

class VBA_Parser(object):
    """
    Class to parse MS Office files, to detect VBA macros and extract VBA source code
    Supported file formats:
    - Word 97-2003 (.doc, .dot)
    - Word 2007+ (.docm, .dotm)
    - Word 2003 XML (.xml)
    - Word MHT - Single File Web Page / MHTML (.mht)
    - Excel 97-2003 (.xls)
    - Excel 2007+ (.xlsm, .xlsb)
    - PowerPoint 97-2003 (.ppt)
    - PowerPoint 2007+ (.pptm, .ppsm)
    """

    def __init__(self, filename, data=None, container=None, relaxed=False):
        """
        Constructor for VBA_Parser

        :param filename: filename or path of file to parse, or file-like object

        :param data: None or bytes str, if None the file will be read from disk (or from the file-like object).
        If data is provided as a bytes string, it will be parsed as the content of the file in memory,
        and not read from disk. Note: files must be read in binary mode, i.e. open(f, 'rb').

        :param container: str, path and filename of container if the file is within
        a zip archive, None otherwise.

        :param relaxed: if True, treat mal-formed documents and missing streams more like MS office:
                        do nothing; if False (default), raise errors in these cases

        raises a FileOpenError if all attemps to interpret the data header failed
        """
        #TODO: filename should only be a string, data should be used for the file-like object
        #TODO: filename should be mandatory, optional data is a string or file-like object
        #TODO: also support olefile and zipfile as input
        if data is None:
            # open file from disk:
            _file = filename
        else:
            # file already read in memory, make it a file-like object for zipfile:
            _file = cStringIO.StringIO(data)
        #self.file = _file
        self.ole_file = None
        self.ole_subfiles = []
        self.filename = filename
        self.container = container
        self.relaxed = relaxed
        self.type = None
        self.vba_projects = None
        self.vba_forms = None
        self.contains_macros = None # will be set to True or False by detect_macros
        self.vba_code_all_modules = None # to store the source code of all modules
        # list of tuples for each module: (subfilename, stream_path, vba_filename, vba_code)
        self.modules = None
        # Analysis results: list of tuples (type, keyword, description) - See VBA_Scanner
        self.analysis_results = None
        # statistics for the scan summary and flags
        self.nb_macros = 0
        self.nb_autoexec = 0
        self.nb_suspicious = 0
        self.nb_iocs = 0
        self.nb_hexstrings = 0
        self.nb_base64strings = 0
        self.nb_dridexstrings = 0
        self.nb_vbastrings = 0

        # if filename is None:
        #     if isinstance(_file, basestring):
        #         if len(_file) < olefile.MINIMAL_OLEFILE_SIZE:
        #             self.filename = _file
        #         else:
        #             self.filename = '<file in bytes string>'
        #     else:
        #         self.filename = '<file-like object>'
        if olefile.isOleFile(_file):
            # This looks like an OLE file
            self.open_ole(_file)

            # if this worked, try whether it is a ppt file (special ole file)
            self.open_ppt()
        if self.type is None and zipfile.is_zipfile(_file):
            # Zip file, which may be an OpenXML document
            self.open_openxml(_file)
        if self.type is None:
            # read file from disk, check if it is a Word 2003 XML file (WordProcessingML), Excel 2003 XML,
            # or a plain text file containing VBA code
            if data is None:
                data = open(filename, 'rb').read()
            # check if it is a Word 2003 XML file (WordProcessingML): must contain the namespace
            if 'http://schemas.microsoft.com/office/word/2003/wordml' in data:
                self.open_word2003xml(data)
            # store a lowercase version for the next tests:
            data_lowercase = data.lower()
            # check if it is a MHT file (MIME HTML, Word or Excel saved as "Single File Web Page"):
            # According to my tests, these files usually start with "MIME-Version: 1.0" on the 1st line
            # BUT Word accepts a blank line or other MIME headers inserted before,
            # and even whitespaces in between "MIME", "-", "Version" and ":". The version number is ignored.
            # And the line is case insensitive.
            # so we'll just check the presence of mime, version and multipart anywhere:
            if self.type is None and 'mime' in data_lowercase and 'version' in data_lowercase \
                and 'multipart' in data_lowercase:
                self.open_mht(data)
        #TODO: handle exceptions
        #TODO: Excel 2003 XML
            # Check if this is a plain text VBA or VBScript file:
            # To avoid scanning binary files, we simply check for some control chars:
            if self.type is None and '\x00' not in data:
                self.open_text(data)
        if self.type is None:
            # At this stage, could not match a known format:
            msg = '%s is not a supported file type, cannot extract VBA Macros.' % self.filename
            log.info(msg)
            raise FileOpenError(msg)

    def open_ole(self, _file):
        """
        Open an OLE file
        :param _file: filename or file contents in a file object
        :return: nothing
        """
        log.info('Opening OLE file %s' % self.filename)
        try:
            # Open and parse the OLE file, using unicode for path names:
            self.ole_file = olefile.OleFileIO(_file, path_encoding=None)
            # set type only if parsing succeeds
            self.type = TYPE_OLE
        except (IOError, TypeError, ValueError) as exc:
            # TODO: handle OLE parsing exceptions
            log.info('Failed OLE parsing for file %r (%s)' % (self.filename, exc))
            log.debug('Trace:', exc_info=True)


    def open_openxml(self, _file):
        """
        Open an OpenXML file
        :param _file: filename or file contents in a file object
        :return: nothing
        """
        # This looks like a zip file, need to look for vbaProject.bin inside
        # It can be any OLE file inside the archive
        #...because vbaProject.bin can be renamed:
        # see http://www.decalage.info/files/JCV07_Lagadec_OpenDocument_OpenXML_v4_decalage.pdf#page=18
        log.info('Opening ZIP/OpenXML file %s' % self.filename)
        try:
            z = zipfile.ZipFile(_file)
            #TODO: check if this is actually an OpenXML file
            #TODO: if the zip file is encrypted, suggest to use the -z option, or try '-z infected' automatically
            # check each file within the zip if it is an OLE file, by reading its magic:
            for subfile in z.namelist():
                magic = z.open(subfile).read(len(olefile.MAGIC))
                if magic == olefile.MAGIC:
                    log.debug('Opening OLE file %s within zip' % subfile)
                    ole_data = z.open(subfile).read()
                    try:
                        self.ole_subfiles.append(
                            VBA_Parser(filename=subfile, data=ole_data,
                                       relaxed=self.relaxed))
                    except OlevbaBaseException as exc:
                        if self.relaxed:
                            log.info('%s is not a valid OLE file (%s)' % (subfile, exc))
                            log.debug('Trace:', exc_info=True)
                            continue
                        else:
                            raise SubstreamOpenError(self.filename, subfile,
                                                     exc)
            z.close()
            # set type only if parsing succeeds
            self.type = TYPE_OpenXML
        except OlevbaBaseException as exc:
            if self.relaxed:
                log.info('Error {} caught in Zip/OpenXML parsing for file {}'
                         .format(exc, self.filename))
                log.debug('Trace:', exc_info=True)
            else:
                raise
        except (RuntimeError, zipfile.BadZipfile, zipfile.LargeZipFile, IOError) as exc:
            # TODO: handle parsing exceptions
            log.info('Failed Zip/OpenXML parsing for file %r (%s)'
                          % (self.filename, exc))
            log.debug('Trace:', exc_info=True)

    def open_word2003xml(self, data):
        """
        Open a Word 2003 XML file
        :param data: file contents in a string or bytes
        :return: nothing
        """
        log.info('Opening Word 2003 XML file %s' % self.filename)
        try:
            # parse the XML content
            # TODO: handle XML parsing exceptions
            et = ET.fromstring(data)
            # find all the binData elements:
            for bindata in et.getiterator(TAG_BINDATA):
                # the binData content is an OLE container for the VBA project, compressed
                # using the ActiveMime/MSO format (zlib-compressed), and Base64 encoded.
                # get the filename:
                fname = bindata.get(ATTR_NAME, 'noname.mso')
                # decode the base64 activemime
                mso_data = binascii.a2b_base64(bindata.text)
                if is_mso_file(mso_data):
                    # decompress the zlib data stored in the MSO file, which is the OLE container:
                    # TODO: handle different offsets => separate function
                    try:
                        ole_data = mso_file_extract(mso_data)
                        self.ole_subfiles.append(
                            VBA_Parser(filename=fname, data=ole_data,
                                       relaxed=self.relaxed))
                    except OlevbaBaseException as exc:
                        if self.relaxed:
                            log.info('Error parsing subfile {}: {}'
                                     .format(fname, exc))
                            log.debug('Trace:', exc_info=True)
                        else:
                            raise SubstreamOpenError(self.filename, fname, exc)
                else:
                    log.info('%s is not a valid MSO file' % fname)
            # set type only if parsing succeeds
            self.type = TYPE_Word2003_XML
        except OlevbaBaseException as exc:
            if self.relaxed:
                log.info('Failed XML parsing for file %r (%s)' % (self.filename, exc))
                log.debug('Trace:', exc_info=True)
            else:
                raise
        except Exception as exc:
            # TODO: differentiate exceptions for each parsing stage
            # (but ET is different libs, no good exception description in API)
            # found: XMLSyntaxError
            log.info('Failed XML parsing for file %r (%s)' % (self.filename, exc))
            log.debug('Trace:', exc_info=True)

    def open_mht(self, data):
        """
        Open a MHTML file
        :param data: file contents in a string or bytes
        :return: nothing
        """
        log.info('Opening MHTML file %s' % self.filename)
        try:
            # parse the MIME content
            # remove any leading whitespace or newline (workaround for issue in email package)
            stripped_data = data.lstrip('\r\n\t ')
            # strip any junk from the beginning of the file
            # (issue #31 fix by Greg C - gdigreg)
            # TODO: improve keywords to avoid false positives
            mime_offset = stripped_data.find('MIME')
            content_offset = stripped_data.find('Content')
            # if "MIME" is found, and located before "Content":
            if -1 < mime_offset <= content_offset:
                stripped_data = stripped_data[mime_offset:]
            # else if "Content" is found, and before "MIME"
            # TODO: can it work without "MIME" at all?
            elif content_offset > -1:
                stripped_data = stripped_data[content_offset:]
            # TODO: quick and dirty fix: insert a standard line with MIME-Version header?
            mhtml = email.message_from_string(stripped_data)
            # find all the attached files:
            for part in mhtml.walk():
                content_type = part.get_content_type()  # always returns a value
                fname = part.get_filename(None)  # returns None if it fails
                # TODO: get content-location if no filename
                log.debug('MHTML part: filename=%r, content-type=%r' % (fname, content_type))
                part_data = part.get_payload(decode=True)
                # VBA macros are stored in a binary file named "editdata.mso".
                # the data content is an OLE container for the VBA project, compressed
                # using the ActiveMime/MSO format (zlib-compressed), and Base64 encoded.
                # decompress the zlib data starting at offset 0x32, which is the OLE container:
                # check ActiveMime header:
                if isinstance(part_data, str) and is_mso_file(part_data):
                    log.debug('Found ActiveMime header, decompressing MSO container')
                    try:
                        ole_data = mso_file_extract(part_data)

                        # TODO: check if it is actually an OLE file
                        # TODO: get the MSO filename from content_location?
                        self.ole_subfiles.append(
                            VBA_Parser(filename=fname, data=ole_data,
                                       relaxed=self.relaxed))
                    except OlevbaBaseException as exc:
                        if self.relaxed:
                            log.info('%s does not contain a valid OLE file (%s)'
                                      % (fname, exc))
                            log.debug('Trace:', exc_info=True)
                            # TODO: bug here - need to split in smaller functions/classes?
                        else:
                            raise SubstreamOpenError(self.filename, fname, exc)
                else:
                    log.debug('type(part_data) = %s' % type(part_data))
                    try:
                        log.debug('part_data[0:20] = %r' % part_data[0:20])
                    except TypeError as err:
                        log.debug('part_data has no __getitem__')
            # set type only if parsing succeeds
            self.type = TYPE_MHTML
        except OlevbaBaseException:
            raise
        except Exception:
            log.info('Failed MIME parsing for file %r - %s'
                          % (self.filename, MSG_OLEVBA_ISSUES))
            log.debug('Trace:', exc_info=True)

    def open_ppt(self):
        """ try to interpret self.ole_file as PowerPoint 97-2003 using PptParser

        Although self.ole_file is a valid olefile.OleFileIO, we set
        self.ole_file = None in here and instead set self.ole_subfiles to the
        VBA ole streams found within the main ole file. That makes most of the
        code below treat this like an OpenXML file and only look at the
        ole_subfiles (except find_vba_* which needs to explicitly check for
        self.type)
        """

        log.info('Check whether OLE file is PPT')
        ppt_parser.enable_logging()
        try:
            ppt = ppt_parser.PptParser(self.ole_file, fast_fail=True)
            for vba_data in ppt.iter_vba_data():
                self.ole_subfiles.append(VBA_Parser(None, vba_data,
                                                    container='PptParser'))
            log.info('File is PPT')
            self.ole_file.close()  # just in case
            self.ole_file = None   # required to make other methods look at ole_subfiles
            self.type = TYPE_PPT
        except Exception as exc:
            if self.container == 'PptParser':
                # this is a subfile of a ppt --> to be expected that is no ppt
                log.debug('PPT subfile is not a PPT file')
            else:
                log.debug("File appears not to be a ppt file (%s)" % exc)


    def open_text(self, data):
        """
        Open a text file containing VBA or VBScript source code
        :param data: file contents in a string or bytes
        :return: nothing
        """
        log.info('Opening text file %s' % self.filename)
        # directly store the source code:
        self.vba_code_all_modules = data
        self.contains_macros = True
        # set type only if parsing succeeds
        self.type = TYPE_TEXT


    def find_vba_projects(self):
        """
        Finds all the VBA projects stored in an OLE file.

        Return None if the file is not OLE but OpenXML.
        Return a list of tuples (vba_root, project_path, dir_path) for each VBA project.
        vba_root is the path of the root OLE storage containing the VBA project,
        including a trailing slash unless it is the root of the OLE file.
        project_path is the path of the OLE stream named "PROJECT" within the VBA project.
        dir_path is the path of the OLE stream named "VBA/dir" within the VBA project.

        If this function returns an empty list for one of the supported formats
        (i.e. Word, Excel, Powerpoint), then the file does not contain VBA macros.

        :return: None if OpenXML file, list of tuples (vba_root, project_path, dir_path)
        for each VBA project found if OLE file
        """
        log.debug('VBA_Parser.find_vba_projects')

        # if the file is not OLE but OpenXML, return None:
        if self.ole_file is None and self.type != TYPE_PPT:
            return None

        # if this method has already been called, return previous result:
        if self.vba_projects is not None:
            return self.vba_projects

        # if this is a ppt file (PowerPoint 97-2003):
        # self.ole_file is None but the ole_subfiles do contain vba_projects
        # (like for OpenXML files).
        if self.type == TYPE_PPT:
            # TODO: so far, this function is never called for PPT files, but
            # if that happens, the information is lost which ole file contains
            # which storage!
            log.warning('Returned info is not complete for PPT types!')
            self.vba_projects = []
            for subfile in self.ole_subfiles:
                self.vba_projects.extend(subfile.find_vba_projects())
            return self.vba_projects

        # Find the VBA project root (different in MS Word, Excel, etc):
        # - Word 97-2003: Macros
        # - Excel 97-2003: _VBA_PROJECT_CUR
        # - PowerPoint 97-2003: PptParser has identified ole_subfiles
        # - Word 2007+: word/vbaProject.bin in zip archive, then the VBA project is the root of vbaProject.bin.
        # - Excel 2007+: xl/vbaProject.bin in zip archive, then same as Word
        # - PowerPoint 2007+: ppt/vbaProject.bin in zip archive, then same as Word
        # - Visio 2007: not supported yet (different file structure)

        # According to MS-OVBA section 2.2.1:
        # - the VBA project root storage MUST contain a VBA storage and a PROJECT stream
        # - The root/VBA storage MUST contain a _VBA_PROJECT stream and a dir stream
        # - all names are case-insensitive

        def check_vba_stream(ole, vba_root, stream_path):
            full_path = vba_root + stream_path
            if ole.exists(full_path) and ole.get_type(full_path) == olefile.STGTY_STREAM:
                log.debug('Found %s stream: %s' % (stream_path, full_path))
                return full_path
            else:
                log.debug('Missing %s stream, this is not a valid VBA project structure' % stream_path)
                return False

        # start with an empty list:
        self.vba_projects = []
        # Look for any storage containing those storage/streams:
        ole = self.ole_file
        for storage in ole.listdir(streams=False, storages=True):
            log.debug('Checking storage %r' % storage)
            # Look for a storage ending with "VBA":
            if storage[-1].upper() == 'VBA':
                log.debug('Found VBA storage: %s' % ('/'.join(storage)))
                vba_root = '/'.join(storage[:-1])
                # Add a trailing slash to vba_root, unless it is the root of the OLE file:
                # (used later to append all the child streams/storages)
                if vba_root != '':
                    vba_root += '/'
                log.debug('Checking vba_root="%s"' % vba_root)

                # Check if the VBA root storage also contains a PROJECT stream:
                project_path = check_vba_stream(ole, vba_root, 'PROJECT')
                if not project_path: continue
                # Check if the VBA root storage also contains a VBA/_VBA_PROJECT stream:
                vba_project_path = check_vba_stream(ole, vba_root, 'VBA/_VBA_PROJECT')
                if not vba_project_path: continue
                # Check if the VBA root storage also contains a VBA/dir stream:
                dir_path = check_vba_stream(ole, vba_root, 'VBA/dir')
                if not dir_path: continue
                # Now we are pretty sure it is a VBA project structure
                log.debug('VBA root storage: "%s"' % vba_root)
                # append the results to the list as a tuple for later use:
                self.vba_projects.append((vba_root, project_path, dir_path))
        return self.vba_projects

    def detect_vba_macros(self):
        """
        Detect the potential presence of VBA macros in the file, by checking
        if it contains VBA projects. Both OLE and OpenXML files are supported.

        Important: for now, results are accurate only for Word, Excel and PowerPoint

        Note: this method does NOT attempt to check the actual presence or validity
        of VBA macro source code, so there might be false positives.
        It may also detect VBA macros in files embedded within the main file,
        for example an Excel workbook with macros embedded into a Word
        document without macros may be detected, without distinction.

        :return: bool, True if at least one VBA project has been found, False otherwise
        """
        #TODO: return None or raise exception if format not supported
        #TODO: return the number of VBA projects found instead of True/False?
        # if this method was already called, return the previous result:
        if self.contains_macros is not None:
            return self.contains_macros
        # if OpenXML/PPT, check all the OLE subfiles:
        if self.ole_file is None:
            for ole_subfile in self.ole_subfiles:
                if ole_subfile.detect_vba_macros():
                    self.contains_macros = True
                    return True
            # otherwise, no macro found:
            self.contains_macros = False
            return False
        # otherwise it's an OLE file, find VBA projects:
        vba_projects = self.find_vba_projects()
        if len(vba_projects) == 0:
            self.contains_macros = False
        else:
            self.contains_macros = True
        # Also look for VBA code in any stream including orphans
        # (happens in some malformed files)
        ole = self.ole_file
        for sid in xrange(len(ole.direntries)):
            # check if id is already done above:
            log.debug('Checking DirEntry #%d' % sid)
            d = ole.direntries[sid]
            if d is None:
                # this direntry is not part of the tree: either unused or an orphan
                d = ole._load_direntry(sid)
                log.debug('This DirEntry is an orphan or unused')
            if d.entry_type == olefile.STGTY_STREAM:
                # read data
                log.debug('Reading data from stream %r - size: %d bytes' % (d.name, d.size))
                try:
                    data = ole._open(d.isectStart, d.size).read()
                    log.debug('Read %d bytes' % len(data))
                    if len(data) > 200:
                        log.debug('{}...[much more data]...{}'
                                  .format(repr(data[:100]), repr(data[-50:])))
                    else:
                        log.debug(repr(data))
                    if 'Attribut' in data:
                        log.debug('Found VBA compressed code')
                        self.contains_macros = True
                except IOError as exc:
                    if self.relaxed:
                        log.info('Error when reading OLE Stream %r' % d.name)
                        log.debug('Trace:', exc_trace=True)
                    else:
                        raise SubstreamOpenError(self.filename, d.name, exc)
        return self.contains_macros

    def extract_macros(self):
        """
        Extract and decompress source code for each VBA macro found in the file

        Iterator: yields (filename, stream_path, vba_filename, vba_code) for each VBA macro found
        If the file is OLE, filename is the path of the file.
        If the file is OpenXML, filename is the path of the OLE subfile containing VBA macros
        within the zip archive, e.g. word/vbaProject.bin.
        If the file is PPT, result is as for OpenXML but filename is useless
        """
        log.debug('extract_macros:')
        if self.ole_file is None:
            # This may be either an OpenXML/PPT or a text file:
            if self.type == TYPE_TEXT:
                # This is a text file, yield the full code:
                yield (self.filename, '', self.filename, self.vba_code_all_modules)
            else:
                # OpenXML/PPT: recursively yield results from each OLE subfile:
                for ole_subfile in self.ole_subfiles:
                    for results in ole_subfile.extract_macros():
                        yield results
        else:
            # This is an OLE file:
            self.find_vba_projects()
            # set of stream ids
            vba_stream_ids = set()
            for vba_root, project_path, dir_path in self.vba_projects:
                # extract all VBA macros from that VBA root storage:
                for stream_path, vba_filename, vba_code in \
                        _extract_vba(self.ole_file, vba_root, project_path,
                                     dir_path, self.relaxed):
                    # store direntry ids in a set:
                    vba_stream_ids.add(self.ole_file._find(stream_path))
                    yield (self.filename, stream_path, vba_filename, vba_code)
            # Also look for VBA code in any stream including orphans
            # (happens in some malformed files)
            ole = self.ole_file
            for sid in xrange(len(ole.direntries)):
                # check if id is already done above:
                log.debug('Checking DirEntry #%d' % sid)
                if sid in vba_stream_ids:
                    log.debug('Already extracted')
                    continue
                d = ole.direntries[sid]
                if d is None:
                    # this direntry is not part of the tree: either unused or an orphan
                    d = ole._load_direntry(sid)
                    log.debug('This DirEntry is an orphan or unused')
                if d.entry_type == olefile.STGTY_STREAM:
                    # read data
                    log.debug('Reading data from stream %r' % d.name)
                    data = ole._open(d.isectStart, d.size).read()
                    for match in re.finditer(r'\x00Attribut[^e]', data, flags=re.IGNORECASE):
                        start = match.start() - 3
                        log.debug('Found VBA compressed code at index %X' % start)
                        compressed_code = data[start:]
                        vba_code = decompress_stream(compressed_code)
                        yield (self.filename, d.name, d.name, vba_code)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print """
Usage:
    %prog pro_file dest_dir
        """

    pro_file = sys.argv[1]
    dest_dir = sys.argv[2]

    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)

    # with open(list_file, 'r') as fh:
    #     for line in fh.readlines():
    #         file_path = line.strip()
    #         if os.path.exists(file_path):
    #             shutil.copy2(file_path, dest_dir)
    #         else:
    #             print "[ERROR] cannot find " + file_path
