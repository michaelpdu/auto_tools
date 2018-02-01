#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import print_function
#from __future__ import unicode_literals


import logging
import string
import sys
import time

# Fall back to default JSON lib if third-party libs is not found.
try:
    import ujson as json
except ImportError:
    try:
        import simplejson as json
    except ImportError:
        import json


logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)
"""Default logger"""


# For trie tree
__END__ = '__end__'

# Form schema
DEFAULT_TOKEN = '_'
ERROR_TOKEN = '\x7F'

# Character sets
#
# A word character is a character from a-z, A-Z, 0-9, including the _ (underscore) character.
# !!!: add '$' char into WORD_CHARS for jQuery.
# Refer to: http://www.w3schools.com/js/js_syntax.asp
# Subsequent characters may be letters, digits, underscores, or dollar signs.
WORD_CHARS = set(list(string.ascii_letters) + list(string.digits) + ['_', '$'])
DIGIT_CHARS = set(list(string.digits))
DIGIT_AND_E_CHARS = set(list(string.digits) + ['e', 'E'])
DIGIT_AND_SIGN_CHARS = set(list(string.digits) + ['+', '-'])
DIGIT_AND_SCIENCE_CHARS = set(list(string.digits) + ['e', 'E', '+', '-'])
E_CHARS = {'e', 'E'}
SIGN_CHARS = {'+', '-'}
# https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Grammar_and_types
WHITESPACE_CHARS = set(list(string.whitespace))    # {'\t', '\n', '\x0b', '\x0c', '\r', ' '}
NEWLINE_CHARS = {'\n', '\r'}
# Follow JSLint's rule to distinguish between division operator and regex syntax.
# http://stackoverflow.com/questions/4726295/division-regexp-conflict-while-tokenizing-javascript
LIKELY_REGEX_CHARS = set(list('(,=:[!&|?{};'))
LIMIT_NUMBERS = {'Infinity', 'NaN'}

# Types
#
COMMENT_TYPE = 'CommentType'
SKIP_TYPE = 'SkipType'
STRING_TYPE = 'StringType'
REGEX_TYPE = 'RegExType'
NUMBER_TYPE = 'NumberType'
UNKNOWN_TYPE = 'UnknownType'
JS_TYPES = {STRING_TYPE, REGEX_TYPE, NUMBER_TYPE}
STRUCT_TYPES = {REGEX_TYPE, NUMBER_TYPE, UNKNOWN_TYPE}

# For input/output
#
JS_FILE_EXTENSION = '.js'

# @cc_on
IS_CC_ON = True    #False


def load_mapper(schema_path):
    with open(schema_path, 'r') as f:
        try:
            tmp_mapper = json.load(f)
        except:
            LOGGER.error('Read schema file failed. Please make sure the file format is JSON.')
            sys.exit(1)

    return {key: val for key, val in tmp_mapper.iteritems()}

def make_trie(words):
    root = dict()
    for word in words:
        current_dict = root
        for letter in word:
            current_dict = current_dict.setdefault(letter, {})
        current_dict[__END__] = __END__

    return root

def in_trie(trie, word):
    current_dict = trie
    for letter in word:
        if letter in current_dict:
            current_dict = current_dict[letter]
        else:
            return False
    else:
        if __END__ in current_dict:
            return True
        else:
            return False

def search_trie(trie, text, i):
    current_dict = trie
    length = len(text)
    for j in xrange(i, length):
        letter = text[j]
        if letter in current_dict:
            current_dict = current_dict[letter]
        # For partial matching.
        elif __END__ in current_dict:
            return j
        else:
            return -1
    else:
        if __END__ in current_dict:
            return j + 1
        else:
            return -1

def is_escaping(text, i):
    return backward_count(text, i, '\\') % 2

def backward_count(text, i, char):
    count = 0
    i -= 1
    while i > 0:
        if text[i] != char:
            break

        count += 1
        i -= 1

    return count

def get_prev_valid_char(text, i, tokens, chunks):
    tmp_chunks = []
    length = len(tokens)
    end = -1
    begin = -1 * (length + 1)
    for k in xrange(end, begin, -1):
        tmp_chunks.append(chunks[k])
        if tokens[k] not in {SKIP_TYPE, COMMENT_TYPE}:
            break
    i -= len(''.join(tmp_chunks))
#    LOGGER.debug('get_prev_valid_char: k: {}, tmp_chunks: {}, num_tmp_chunks: {}, num_tokens: {} num_chunks: {}'.format(
#            k, tmp_chunks, len(tmp_chunks), length, len(chunks)))

    char = None
    while i > 0:
        if text[i] not in WHITESPACE_CHARS:
            char = text[i]
            break
        i -= 1

    return char


def obfuscate(file_path, mapper, trie):
    '''Obfuscate JavaScript file, follows ATSE's rule.

    Step 0: Build a Trie Tree for searching and matching.
    Step 1: Find word Boundary and do Tokenization
    Step 2: Created Custom Type Matcher: Number, String, RegEx and Comment.
    Step 3: While doing tokenization, make use of the Trie Tree to solve ambiguous words.
    Step 4: Also make use of the Trie Tree to match the remaining words is Number or Unknown type,
            like regular expression's \w.
    Step 5: Convert the found words to one byte char by a custom defined mapper/schema (from ATSE).
    '''

    # Process JS file only.
#    if file_path.suffix != JS_FILE_EXTENSION:
#        return
    LOGGER.info('Obfuscating file: {}'.format(file_path))

    tokens = []
    chunks = []    # Recording splitted words
    strings = []
    struct_tokens = []
    # Read file in binary mode is much faster.
    with open(file_path, 'rb') as f:
        text = f.read()
#        # !!!: Convert to byte array is WAY faster.
#        try:
#            text = bytearray(text)
#        except TypeError:
#            pass
        length = len(text)

        last = 0
        i = 0
        data_type = None
        while i < length:
#            LOGGER.debug('i letter: {}'.format(text[i]))

            # Primary tokenization
            i, data_type = tokenize(text, i, trie, tokens, chunks)

            token = None
            if data_type:
                add_token_by_type(tokens, data_type)
#                LOGGER.debug('Found data type token: {}'.format(text[last:i + 1]))
                if data_type == STRING_TYPE:
                    str_ = text[last + 1:i]
                    strings.append(str_)
            else:
                # Secondary token matching
                token, data_type = match(text, last, i, trie)
                if token:
                    tokens.append(token)
                else:
                    add_token_by_type(tokens, data_type)
            chunk = text[last:i + 1]
            chunks.append(chunk)

            # Handle structure tokens
            if token or data_type in STRUCT_TYPES:
                # XXX: Follow ATSE's rule, stop encoding while an error occurs.
                if mapper.get(token, DEFAULT_TOKEN) == ERROR_TOKEN:
                    break
                struct_tokens.append(chunk)

            i += 1
            last = i

#    LOGGER.debug('Tokens: {}'.format(tokens))
    obfuscated = []
    for token in tokens:
        # Follow ATSE's rule, stop encoding while an error occurs.
        # TODO: create obfuscated list simultaneously.
        if mapper.get(token, DEFAULT_TOKEN) == ERROR_TOKEN:
            break
        obfuscated_token = mapper.get(token, DEFAULT_TOKEN)
        obfuscated.append(obfuscated_token)
#        LOGGER.debug('{} => {}'.format(token, obfuscated_token))
#    obfuscated = [mapper.get(token, DEFAULT_TOKEN) for token in tokens
#            if mapper.get(token, DEFAULT_TOKEN) != ERROR_TOKEN]
#    if LOGGER.isEnabledFor(logging.DEBUG):
#        length = len(obfuscated)
#        for i in xrange(length):
#            LOGGER.debug('{} => {}'.format(tokens[i], obfuscated[i]))

    obfuscated_text = ''.join(obfuscated)
#    LOGGER.debug('Obfuscated list: {}'.format(obfuscated))
#    LOGGER.debug('Obfuscated text: {}'.format(obfuscated_text))

#    return obfuscated_text
    return ''.join(strings)
#    return struct_tokens

def tokenize(text, i, trie, tokens, chunks):
    length = len(text)

    # Always starts from boundary,
    # because we're looking for another boundary to split text.
    is_prev_boundary = True

    ori_i = i
    j = i
    num_slashs = 0
    is_single_comment = False
    is_multi_comments = False
    is_string = False
    while j < length:
        letter = text[j]
        LOGGER.debug('j: {} letter: {}'.format(j, letter))

        # Comments
        # Will eat up everything until the terminator to be matched, including nested comments.
        #
        # Mixed examples with differnet comment types: 'ooxx"gg"damn' or "ooxx'gg'damn"
        first_two = text[j:j + 2]
        if first_two == '//':
            is_single_comment = True

            j += 2
            while j < length:
                if text[j] in NEWLINE_CHARS:
                    break
                j += 1
            i = j
            break

        elif first_two == '/*':
            # XXX: Do tokenization for /*@ @*/ comment if @cc_on is been turned on.
            if text[j:j + 8] == '/*@cc_on':
                j += 7
                i = j
                global IS_CC_ON
                IS_CC_ON = True
                LOGGER.info('@cc_on is on.');
                break

            is_multi_comments = True

            j += 2
            while j < length:
                if text[j - 1:j + 1] == '*/':
                    break
                j += 1
            i = j
            break

        # Floating point numbers, including scientific notation form.
        # Example: Math.random()||.1,
        #
        # Scientific notation Examples:
        # var a = 4.23E-10;
        # var a = 4.23e-10;
        # var a = 4.23E+10;
        # var a = 4.23e+10;
        # var a = 4.23E10;
        # var a = 4.23e10;
        #
        # var a = 4.E-10;
        # var a = 4.e-10;
        # var a = 4.E+10;
        # var a = 4.e+10;
        # var a = 4.E10;
        # var a = 4.e10;
        elif text[j] == '.' and (j + 1) < length  and text[j + 1] in DIGIT_AND_E_CHARS:
            # Example: return.5-Math.cos(a*Math.PI)/2
            # Example with 'e' char: var exponent = parsedNumber.e;
            if is_prev_boundary or ((j - 1) >= 0 and text[j - 1] in DIGIT_CHARS):
                # !!!: Scientific notation must be followed by digits or sign symbols.
                if text[j + 1] in E_CHARS and (j + 2) < length  and text[j + 2] not in DIGIT_AND_SIGN_CHARS:
                    pass
                else:
                    j += 1
                    # XXX: Reset to False, so it'll go to Boundary type II.
                    is_prev_boundary = False

                    while j < length:
                        if text[j] in E_CHARS:
                            j += 1
                            if j < length and text[j] in SIGN_CHARS:
                                j += 1
                        elif text[j] not in DIGIT_CHARS:
                            break
                        j += 1

        # Interger numbers in scientific notation
        #
        # Scientific notation Examples:
        # var a = 4E-10;
        # var a = 4e-10;
        # var a = 4E+10;
        # var a = 4e+10;
        # var a = 4E10;
        # var a = 4e10;
        elif text[j] in E_CHARS and (j - 1) >= 0 and text[j - 1] in DIGIT_CHARS:
            j += 1
            if j < length and text[j] in SIGN_CHARS:
                j += 2

        # String
        #
        # With single quote
        # XXX: Hardcode check is_prev_boundary, in odrder to fix the minified case: return"function".
        elif text[j] == '\'' and is_prev_boundary and not is_escaping(text, j):
            is_string = True

            j += 1
            while j < length:
                if text[j] == '\'' and not is_escaping(text, j):
                    break
                j += 1
            i = j
            break
        # With double quotes
        elif text[j] == '"' and is_prev_boundary and not is_escaping(text, j):
            is_string = True

            j += 1
            while j < length:
                if text[j] == '"' and not is_escaping(text, j):
                    break
                j += 1
            i = j
            break

        # Division operator or regex syntax
        #
        elif text[j] == '/' and is_prev_boundary and not is_escaping(text, j):
            prev_char = get_prev_valid_char(text, j, tokens, chunks)
#            LOGGER.debug('{}CHECK REGEX{}: text[j-1]: {}, prev char: {}, In RegEx Chars: {}, is_prev_boundary: {}'.format(
#                    '-'*10, '-'*10, text[j - 1], prev_char, prev_char not in LIKELY_REGEX_CHARS, is_prev_boundary))
            # !!!: Special case: return/[$_a-zA-Z][$_a-zA-Z0-9]*/.test(b)
            if ((chunks and chunks[-1] == 'return') or
                    ((j - 1) >= 0 and text[j - 1] not in WORD_CHARS and prev_char in LIKELY_REGEX_CHARS)):
                num_slashs += 1
#                LOGGER.debug('num_slashs++')

                j += 1
                # XXX: Reset to False, so it'll go to Boundary type II.
                is_prev_boundary = False

                while j < length:
                    if text[j] == '/' and not is_escaping(text, j):
                        num_slashs += 1
                        break
                    j += 1
        elif IS_CC_ON and text[j:j + 3] == '@*/':
            j += 2
            i = j
            LOGGER.info('Skip conditional comment end tag, @*/');
            break

        # RegEx may come with modifiers, like /\w+/ig.
        # So that, we should read more chars.
        if 0 < num_slashs and num_slashs <= 2:
            j += 1
            if num_slashs == 2:
                num_slashs += 1
            continue


        # !!!: Check is j bigger than length, since j may have been modified.

        # Boundary Type I: boundary is between current char and its next char.
        # Example: "ooxox";    <== boundary is bet. "\"" and ";"
        if is_prev_boundary and (j >= length or text[j] not in WORD_CHARS):
            # Greedy searching trie tree for ambiguous examples, e.g., "=", "==" and "===".
            # For example:
            # when we meet "=", we should peek the following two chars,
            # because the to-be-parsed word may be "==" or "===".
            pos = search_trie(trie, text, j)
            LOGGER.debug('SEARCH FOUND WITH BOUNDARY: {}, pos: {}, j: {}'.format(text[j], pos, j))
            if pos >= 0:
                i = pos - 1
            else:
                i = j
            break
        # Boundary Type II: boundary is between previous char and current char.
        # Example: /[A-Z]/ig;    <== boundary is bet. "g" and ";"
        elif not is_prev_boundary and (j >= length or text[j] not in WORD_CHARS):
            pos = search_trie(trie, text, j - 1)
            LOGGER.debug('SEARCH FOUND WITHOUT BOUNDARY: {}, pos: {}, j: {}'.format(text[j - 1], pos, j))
            if pos >= 0:
                i = pos - 1
            else:
                i = j - 1
            break

        # Set up boundary
        if j < length and text[j] not in WORD_CHARS:
            is_prev_boundary = True
        else:
            is_prev_boundary = False

        j += 1

    data_type = None
    if is_single_comment or is_multi_comments:
        data_type = COMMENT_TYPE
    elif is_string:
        data_type = STRING_TYPE
    elif num_slashs == 3:
        data_type = REGEX_TYPE

    # Fixed non-js file case, e.g., jsdb2/cc/files/63498de04bd2099e438d1a5dd1b709d84970e07b
    if i == ori_i and j == length:
        i = length - 1

    return (i, data_type)

def add_token_by_type(tokens=None, data_type=None):
    if tokens is None:
        return

    if data_type == COMMENT_TYPE:
        tokens.append(data_type)
    elif data_type in JS_TYPES:
        tokens.append(data_type)
    elif data_type == UNKNOWN_TYPE:
        tokens.append(DEFAULT_TOKEN)
    else:
        # Try to record everything.
        tokens.append(SKIP_TYPE)

def match(text, last, i, trie):
    token = text[last:i + 1]
    is_matched = in_trie(trie, token)
#    LOGGER.debug('Is Matched: {}: token: {}, last: {}, i: {}'.format(is_matched, token, last, i))

    matched_token = None
    data_type = None
    if is_matched:
        # XXX: Follow ATSE's logic to deal with @ sign.
        if not IS_CC_ON and token == '@':
            matched_token = ERROR_TOKEN
        else:
            matched_token = token
    # FIXME: check whole chars in text[last:i + 1] are belonging to WORD_CHARS.
    # Floating example: Math.random()||.1,z=x.length;
    elif not is_matched and (text[last] == '.' or text[last] in WORD_CHARS):
        # !!!: Don't let Python cast float('Infinity') to inf, or cast float('NaN') to nan.
        if token in LIMIT_NUMBERS:
            data_type = UNKNOWN_TYPE
        elif text[last:last + 2] == '0x':
            try:
                int(token, 16)
                data_type = NUMBER_TYPE
            except ValueError:
                data_type = UNKNOWN_TYPE
        elif text[last] == '0':
            try:
                int(token, 8)
                data_type = NUMBER_TYPE
            except ValueError:
                try:
                    float(token)
                    data_type = NUMBER_TYPE
                except ValueError:
                    data_type = UNKNOWN_TYPE
        else:
            try:
                float(token)
                data_type = NUMBER_TYPE
            except ValueError:
                data_type = UNKNOWN_TYPE

    # Debugging
#    LOGGER.debug('Found data_type: {}'.format(data_type))
#    if matched_token:
#        LOGGER.debug('Found token: {}'.format(token))
#    elif data_type == NUMBER_TYPE:
#        LOGGER.debug('Found number token: {}'.format(token))
#    elif data_type == UNKNOWN_TYPE:
#        LOGGER.debug('Found unknown token: {}'.format(token))
    return (matched_token, data_type)


# vim: set hls is ai et sw=4 sts=4 ts=8 nu ft=python:

