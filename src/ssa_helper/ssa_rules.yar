rule judge_iframe
{
    meta:
        index = 1
    strings:
        $s1 = "<iframe"
    condition:
        all of them
}

rule judge_embed
{
    meta:
        index = 2
    strings:
        $s1 = "<embed"
    condition:
        all of them
}

rule applet
{
    meta:
        index = 3
    strings:
        $s1 = "applet"
    condition:
        all of them
}

rule document
{
    meta:
        index = 4
    strings:
        $s1 = "document"
    condition:
        all of them
}

rule href
{
    meta:
        index = 5
    strings:
        $s1 = "href"
    condition:
        all of them
}

rule window
{
    meta:
        index = 6
    strings:
        $s1 = "window"
    condition:
        all of them
}

rule location
{
    meta:
        index = 7
    strings:
        $s1 = "location"
    condition:
        all of them
}

rule setInterval
{
    meta:
        index = 8
    strings:
        $s1 = "setInterval"
    condition:
        all of them
}

rule setTimeout
{
    meta:
        index = 9
    strings:
        $s1 = "setTimeout"
    condition:
        all of them
}

rule addEventListener
{
    meta:
        index = 10
    strings:
        $s1 = "addEventListener"
    condition:
        all of them
}

rule appendChild
{
    meta:
        index = 11
    strings:
        $s1 = "appendChild"
    condition:
        all of them
}

rule createTextNode
{
    meta:
        index = 12
    strings:
        $s1 = "createTextNode"
    condition:
        all of them
}

rule insertBefore
{
    meta:
        index = 13
    strings:
        $s1 = "insertBefore"
    condition:
        all of them
}

rule getElementById
{
    meta:
        index = 14
    strings:
        $s1 = "getElementById"
    condition:
        all of them
}

rule getElementsByName
{
    meta:
        index = 15
    strings:
        $s1 = "getElementsByName"
    condition:
        all of them
}

rule getElementsByTagName
{
    meta:
        index = 16
    strings:
        $s1 = "getElementsByTagName"
    condition:
        all of them
}

rule nodeValue
{
    meta:
        index = 17
    strings:
        $s1 = "nodeValue"
    condition:
        all of them
}

rule open
{
    meta:
        index = 18
    strings:
        $s1 = "open"
    condition:
        all of them
}

rule removeChild
{
    meta:
        index = 19
    strings:
        $s1 = "removeChild"
    condition:
        all of them
}

rule setAttribute
{
    meta:
        index = 20
    strings:
        $s1 = "setAttribute"
    condition:
        all of them
}

rule write
{
    meta:
        index = 21
    strings:
        $s1 = "write"
    condition:
        all of them
}

rule ActiveXObject
{
    meta:
        index = 22
    strings:
        $s1 = "ActiveXObject"
    condition:
        all of them
}

rule SaveToFile
{
    meta:
        index = 23
    strings:
        $s1 = "SaveToFile"
    condition:
        all of them
}

rule Shellrun
{
    meta:
        index = 24
    strings:
        $s1 = "Shell.run"
    condition:
        all of them
}

rule wscript
{
    meta:
        index = 25
    strings:
        $s1 = "wscript"
    condition:
        all of them
}

rule Array
{
    meta:
        index = 26
    strings:
        $s1 = "Array"
    condition:
        all of them
}

rule charAt
{
    meta:
        index = 27
    strings:
        $s1 = "charAt"
    condition:
        all of them
}

rule charCodeAt
{
    meta:
        index = 28
    strings:
        $s1 = "charCodeAt"
    condition:
        all of them
}

rule concat
{
    meta:
        index = 29
    strings:
        $s1 = "concat"
    condition:
        all of them
}

rule CreateObject
{
    meta:
        index = 30
    strings:
        $s1 = "CreateObject"
    condition:
        all of them
}

rule decodeURI
{
    meta:
        index = 31
    strings:
        $s1 = "decodeURI"
    condition:
        all of them
}

rule eval
{
    meta:
        index = 32
    strings:
        $s1 = "eval"
    condition:
        all of them
}

rule fromCharCode
{
    meta:
        index = 33
    strings:
        $s1 = "fromCharCode"
    condition:
        all of them
}

rule getMilliseconds
{
    meta:
        index = 34
    strings:
        $s1 = "getMilliseconds"
    condition:
        all of them
}

rule indexOf
{
    meta:
        index = 35
    strings:
        $s1 = "indexOf"
    condition:
        all of them
}

rule join
{
    meta:
        index = 36
    strings:
        $s1 = "join"
    condition:
        all of them
}

rule length
{
    meta:
        index = 37
    strings:
        $s1 = "length"
    condition:
        all of them
}

rule match
{
    meta:
        index = 38
    strings:
        $s1 = "match"
    condition:
        all of them
}

rule Math
{
    meta:
        index = 39
    strings:
        $s1 = "Math"
    condition:
        all of them
}

rule onreadystatechange
{
    meta:
        index = 40
    strings:
        $s1 = "onreadystatechange"
    condition:
        all of them
}

rule pop
{
    meta:
        index = 41
    strings:
        $s1 = "pop"
    condition:
        all of them
}

rule prototype
{
    meta:
        index = 42
    strings:
        $s1 = "prototype"
    condition:
        all of them
}

rule push
{
    meta:
        index = 43
    strings:
        $s1 = "push"
    condition:
        all of them
}

rule random
{
    meta:
        index = 44
    strings:
        $s1 = "random"
    condition:
        all of them
}

rule replace
{
    meta:
        index = 45
    strings:
        $s1 = "replace"
    condition:
        all of them
}

rule reverse
{
    meta:
        index = 46
    strings:
        $s1 = "reverse"
    condition:
        all of them
}

rule search
{
    meta:
        index = 47
    strings:
        $s1 = "search"
    condition:
        all of them
}

rule shift
{
    meta:
        index = 48
    strings:
        $s1 = "shift"
    condition:
        all of them
}

rule slice
{
    meta:
        index = 49
    strings:
        $s1 = "slice"
    condition:
        all of them
}

rule sort
{
    meta:
        index = 50
    strings:
        $s1 = "sort"
    condition:
        all of them
}

rule split
{
    meta:
        index = 51
    strings:
        $s1 = "split"
    condition:
        all of them
}

rule substr
{
    meta:
        index = 52
    strings:
        $s1 = "substr"
    condition:
        all of them
}

rule substring
{
    meta:
        index = 53
    strings:
        $s1 = "substring"
    condition:
        all of them
}

rule toLowerCase
{
    meta:
        index = 54
    strings:
        $s1 = "toLowerCase"
    condition:
        all of them
}

rule toString
{
    meta:
        index = 55
    strings:
        $s1 = "toString"
    condition:
        all of them
}

rule toUpperCase
{
    meta:
        index = 56
    strings:
        $s1 = "toUpperCase"
    condition:
        all of them
}

rule typeof
{
    meta:
        index = 57
    strings:
        $s1 = "typeof"
    condition:
        all of them
}

rule unescape
{
    meta:
        index = 58
    strings:
        $s1 = "unescape"
    condition:
        all of them
}

rule unshift
{
    meta:
        index = 59
    strings:
        $s1 = "unshift"
    condition:
        all of them
}

rule valueOf
{
    meta:
        index = 60
    strings:
        $s1 = "valueOf"
    condition:
        all of them
}

rule onerrorresumenext
{
    meta:
        index = 61
    strings:
        $s1 = "on error resume next"
    condition:
        all of them
}

rule IEX
{
    meta:
        index = 62
    strings:
        $s1 = "IEX"
    condition:
        all of them
}

rule trigger
{
    meta:
        index = 63
    strings:
        $s1 = "trigger"
    condition:
        all of them
}

rule ShellExecute
{
    meta:
        index = 64
    strings:
        $s1 = "ShellExecute"
    condition:
        all of them
}

rule powershell
{
    meta:
        index = 65
    strings:
        $s1 = "powershell"
    condition:
        all of them
}

rule runshellcode
{
    meta:
        index = 66
    strings:
        $s1 = "runshellcode"
    condition:
        all of them
}

rule shellcode
{
    meta:
        index = 67
    strings:
        $s1 = "shellcode"
    condition:
        all of them
}

rule ShellExecuteEx
{
    meta:
        index = 68
    strings:
        $s1 = "ShellExecuteEx"
    condition:
        all of them
}

rule UseShellExecute
{
    meta:
        index = 69
    strings:
        $s1 = "UseShellExecute"
    condition:
        all of them
}

rule ProcessStartInfo 
{
    meta:
        index = 70
    strings:
        $s1 = "ProcessStartInfo "
    condition:
        all of them
}

rule Application
{
    meta:
        index = 71
    strings:
        $s1 = "Application"
    condition:
        all of them
}

rule WindowsPowerShell
{
    meta:
        index = 72
    strings:
        $s1 = "WindowsPowerShell"
    condition:
        all of them
}

rule FromBase64String
{
    meta:
        index = 73
    strings:
        $s1 = "FromBase64String"
    condition:
        all of them
}

rule Base64
{
    meta:
        index = 74
    strings:
        $s1 = "Base64"
    condition:
        all of them
}

rule wscriptshell
{
    meta:
        index = 75
    strings:
        $s1 = "wscript.shell"
    condition:
        all of them
}

rule wshshell
{
    meta:
        index = 76
    strings:
        $s1 = "wshshell"
    condition:
        all of them
}

rule wshshellrun
{
    meta:
        index = 77
    strings:
        $s1 = "wshshell.run"
    condition:
        all of them
}

rule cmdexe
{
    meta:
        index = 78
    strings:
        $s1 = "cmd.exe"
    condition:
        all of them
}

rule LCase
{
    meta:
        index = 79
    strings:
        $s1 = "LCase"
    condition:
        all of them
}

rule ADODBStream
{
    meta:
        index = 80
    strings:
        $s1 = "ADODB.Stream"
    condition:
        all of them
}

rule cscript 
{
    meta:
        index = 81
    strings:
        $s1 = "cscript "
    condition:
        all of them
}

rule del
{
    meta:
        index = 82
    strings:
        $s1 = "del"
    condition:
        all of them
}

rule igetvbs
{
    meta:
        index = 83
    strings:
        $s1 = "iget.vbs"
    condition:
        all of them
}

rule run
{
    meta:
        index = 84
    strings:
        $s1 = "run"
    condition:
        all of them
}

rule UserAgent
{
    meta:
        index = 85
    strings:
        $s1 = "UserAgent"
    condition:
        all of them
}

rule lenb
{
    meta:
        index = 86
    strings:
        $s1 = "lenb"
    condition:
        all of them
}

rule Preserve
{
    meta:
        index = 87
    strings:
        $s1 = "Preserve"
    condition:
        all of them
}

rule SafeMode
{
    meta:
        index = 88
    strings:
        $s1 = "SafeMode"
    condition:
        all of them
}

rule IsObject
{
    meta:
        index = 89
    strings:
        $s1 = "IsObject"
    condition:
        all of them
}

rule innerHTML
{
    meta:
        index = 90
    strings:
        $s1 = "innerHTML"
    condition:
        all of them
}

rule lastIndexOf
{
    meta:
        index = 91
    strings:
        $s1 = "lastIndexOf"
    condition:
        all of them
}

rule parseInt
{
    meta:
        index = 92
    strings:
        $s1 = "parseInt"
    condition:
        all of them
}

rule Number
{
    meta:
        index = 93
    strings:
        $s1 = "Number"
    condition:
        all of them
}

rule escape
{
    meta:
        index = 94
    strings:
        $s1 = "escape"
    condition:
        all of them
}

rule encodeURI
{
    meta:
        index = 95
    strings:
        $s1 = "encodeURI"
    condition:
        all of them
}

rule encodeURIComponent
{
    meta:
        index = 96
    strings:
        $s1 = "encodeURIComponent"
    condition:
        all of them
}

rule decodeURIComponent
{
    meta:
        index = 97
    strings:
        $s1 = "decodeURIComponent"
    condition:
        all of them
}

rule div
{
    meta:
        index = 98
    strings:
        $s1 = "div"
    condition:
        all of them
}

rule input
{
    meta:
        index = 99
    strings:
        $s1 = "input"
    condition:
        all of them
}

rule childNodes
{
    meta:
        index = 100
    strings:
        $s1 = "childNodes"
    condition:
        all of them
}

rule span
{
    meta:
        index = 101
    strings:
        $s1 = "span"
    condition:
        all of them
}

rule documentwrite
{
    meta:
        index = 102
    strings:
        $s1 = "document.write"
    condition:
        all of them
}

rule floor
{
    meta:
        index = 103
    strings:
        $s1 = "floor"
    condition:
        all of them
}

rule exec
{
    meta:
        index = 104
    strings:
        $s1 = "exec"
    condition:
        all of them
}

rule createElement
{
    meta:
        index = 105
    strings:
        $s1 = "createElement"
    condition:
        all of them
}

rule body
{
    meta:
        index = 106
    strings:
        $s1 = "body"
    condition:
        all of them
}

rule none
{
    meta:
        index = 107
    strings:
        $s1 = "none"
    condition:
        all of them
}

rule spider
{
    meta:
        index = 108
    strings:
        $s1 = "spider"
    condition:
        all of them
}

rule bot
{
    meta:
        index = 109
    strings:
        $s1 = "bot"
    condition:
        all of them
}

rule script
{
    meta:
        index = 110
    strings:
        $s1 = "script"
    condition:
        all of them
}

rule svchostexe
{
    meta:
        index = 111
    strings:
        $s1 = "svchost.exe"
    condition:
        all of them
}

rule windowopen
{
    meta:
        index = 112
    strings:
        $s1 = "window.open"
    condition:
        all of them
}

rule exploit
{
    meta:
        index = 113
    strings:
        $s1 = "exploit"
    condition:
        all of them
}

rule WriteData
{
    meta:
        index = 114
    strings:
        $s1 = "WriteData"
    condition:
        all of them
}

rule DropFile
{
    meta:
        index = 115
    strings:
        $s1 = "DropFile"
    condition:
        all of them
}

rule triggerBug
{
    meta:
        index = 116
    strings:
        $s1 = "triggerBug"
    condition:
        all of them
}

rule judgeiframe
{
    meta:
        index = 117
    strings:
        $s1 = "\"iframe\""
    condition:
        all of them
}

rule styleborder0px
{
    meta:
        index = 118
    strings:
        $s1 = "style.border = \"0px\""
    condition:
        all of them
}

rule frameBorder0
{
    meta:
        index = 119
    strings:
        $s1 = "frameBorder = \"0\""
    condition:
        all of them
}

rule setframeBorder0
{
    meta:
        index = 120
    strings:
        $s1 = "setAttribute(\"frameBorder\", \"0\")"
    condition:
        all of them
}

rule STROLLCOM
{
    meta:
        index = 121
    strings:
        $s1 = "help.2STROLL.COM"
    condition:
        all of them
}

rule DECKDEFENDERCA
{
    meta:
        index = 122
    strings:
        $s1 = "help.DECKDEFENDER.CA"
    condition:
        all of them
}

rule exe
{
    meta:
        index = 123
    strings:
        $s1 = ".exe"
    condition:
        all of them
}

rule src_split
{
    meta:
        index = 124
    strings:
        $s1 = "\"s\"+\"r\"+\"c\""
    condition:
        all of them
}

rule onError_split
{
    meta:
        index = 125
    strings:
        $s1 = "\"on\"+\"err\"+\"or\""
    condition:
        all of them
}

rule newImage_split
{
    meta:
        index = 126
    strings:
        $s1 = "new Image()"
    condition:
        all of them
}

rule res
{
    meta:
        index = 127
    strings:
        $s1 = "res="
    condition:
        all of them
}

rule require
{
    meta:
        index = 128
    strings:
        $s1 = "require"
    condition:
        all of them
}