/*
* Following rules are dynamic rules
*/
rule SWF_DYN_HEAPSPRAY_WHITE_STRING_B {
  meta:
    sha1 = "AEBE42A251CC2900A4209C2E5A908EA90786DD7C"
  strings:
    $r1 = /'sin'[\w\W]{1,20}0.1/
    $r2 = /'sin'[\w\W]{1,20}0.0125/
    $r3 = /'sqrt'[\w\W]{1,20}0.25/
    $r4 = /'atan'[\w\W]{1,20}0.06/
  condition:
    all of them
}

rule SWF_DYN_HEAPSPRAY_WHITE_STRING {
  meta:
    s3 = "016c49df1937a0a40dc1d8f6e3e294572176bb5d"
    s4 = "136342bc8891e942b2230c2a4d2a178371a75579"
  strings:
    $s1 = "kprotect" nocase
    $s2 = "popAds" nocase
    $s3 = "find_com.d_project.qrcode_in_constant"
    $s4 = "find_pigg.blog.view_in_constant"
    
  condition:
    any of them or SWF_DYN_HEAPSPRAY_WHITE_STRING_B
}


rule SWF_DYN_HEAPSPRAY {
  strings:
    $s = "[heap spray]" nocase
  condition:
    $s
}

rule SWF_DYN_HEAPSPRAY_SLICE_CODE {
  strings:
    $s = "concatheapsprayslicecode" nocase
  condition:
    $s
}

rule SWF_DYN_CHECK_VERSION {
  strings:
    $s1 = "Access Capabilities.version"
    $s2 = "Access Capabilities.os"
    $s3 = "Access Capabilities.playerType"
  condition:
    $s1 or $s2 or $s3
}

rule SWF_DYN_BIG_SIZE_STRING {
  strings:
    $s = "[Long string in string append]" nocase
    $s1 = "class info count larger than"
    $s2 = "method info count larger than"
  condition:
    $s and (not $s1) and (not $s2)
}

rule SWF_DYN_EI_CALL_EVAL {
  strings:
    $s = "ExternalInterface->FirefoxCom.requestSync->eval" nocase
  condition:
    #s > 1
}

rule SWF_DYN_TOO_MANY_SET_NUMBERIC_PROPERTY_WHITE_STRING {
  meta:
    sha1 = "bb02f04475dfe677ffac6ecc799d034cc58648d8" 
  strings:
    $s1 = "FVBookOpenTool" nocase
    $s2 = "FVAudioTool" nocase
  condition:
    $s1 and $s2
}

rule SWF_DYN_TOO_MANY_SET_NUMBERIC_PROPERTY {
  strings:
    $s = "Find set numberic property too many times"
  condition:
    $s
}

rule SWF_DYN_HIDDEN_IFRAME {
  strings:
    $s1 = "Create hidden iframe in binary"
  condition:
    $s1
}

rule SWF_DYN_CREATE_ELEMENT {
  strings:
    $s1 = "Create script element in binary"
  condition:
    $s1
}

rule SWF_DYN_EI_CALL_EVAL_IN_BINARY {
  strings:
    $s = "Call ExternalInterface->eval in binary"
    $s1 = "popAds" nocase
  condition:
    $s and not $s1
}


/*
* Following rules are static rules
*/
rule SWF_STATIC_HEU_ROP {
  strings:
    $s1 = "VirtualProtect"
    $s2 = "VirtualAlloc"
    $s3 = "CreateThread"
    $s4 = "URLDownloadToFileA"
    $s5 = "KERNEL32.dll"
  condition:
    ($s1 and $s2 and $s3) or ($s1 and $s4) or ($s1 and $s5)
}

rule SWF_STATIC_HEU_WRITE {
  strings:
    $s1 = /write(U|I|B|D|F|S)/
    $s2 = "JPGEncoder"
    $s3 = "class info count smaller than"
  condition:
    #s1 > 50 and $s3 and (not $s2)
}

rule SWF_STATIC_BIG_SIZE_STRING {
  strings:
    $s = "Find big size string"
    $s1 = "hex rate"
    $s2 = "ExternalInterface"
    $s3 = "class info count smaller than"
  condition:
    $s and $s3 and ($s1 or $s2)
}

rule SWF_STATIC_CHECK_VERSION {
  strings:
    $s1 = "Find check flash version in constant string"
    $s2 = "Find check os version in constant string"
  condition:
    #s1 > 3 or #s2 > 3
}

rule SWF_STATIC_CVE_2013_0634 {
  strings:
    $s = "signiture_cve_2013_0634"
  condition:
    $s
}

rule SWF_STATIC_CVE_2014_0556 {
  strings:
    $s1 = "find_capabilities_in_constant"
    $s2 = "find_version_in_constant"
    $s3 = "check_os_version_in_constant"
    $s4 = "find_copyPixelsToByteArray_in_constant"
  condition:
    ($s1 or $s2 or $s3) and $s4
}

rule SWF_STATIC_CVE_2015_0313 {
  strings:
    $s1 = "find_version_in_constant"
    $s2 = "find_domainMemory_in_constant"
    $s3 = "find_createMessageChannel_in_constant"
    $s4 = "find_exec_in_constant"
    $s5 = "find_createWorker_in_constant"
    $s6 = "find_capabilities_in_constant"
    $s7 = "Find normal evidence in constant string"
  condition:
    (not $s7) and $s1 and $s2 and ($s3 or $s4) and $s5 and $s6
}

rule SWF_STATIC_CVE_2015_5119 {
  strings:
    $s1 = "find_valueof_in_constant"
    $s2 = "find_vector_in_constant"
    $s3 = "find_capabilities_in_constant"
    $s4 = "find_version_in_constant"
    $s5 = "check_os_version_in_constant"
    $s6 = "find_virtualprotect_in_constant"
    $s7 = "Find normal evidence in constant string"
    $s8 = "find_recreateTextLine_in_constant"
  condition:
    (not $s7) and $s1 and $s2 and $s3 and $s4 and ($s5 or $s6) and (not $s8)
}

rule SWF_STATIC_CVE_2015_5122 {
  strings:
    $s1 = "find_valueof_in_constant"
    $s2 = "find_vector_in_constant"
    $s3 = "find_opaqueBackground_in_constant"
    $s4 = "find_recreateTextLine_in_constant"
  condition:
    $s1 and $s2 and $s3 and $s4
}

rule SWF_STATIC_CVE_2015_5122_B {
  strings:
    $s1 = "find_valueof_in_constant"
    $s2 = "find_vector_in_constant"
    $s3 = "find_opaqueBackground_in_constant"
    $s4 = "find_recreateTextLine_in_constant"
    $s5 = "find_virtualprotect_in_constant"
    $s6 = "find_version_in_constant"
    $s7 = "check_os_version_in_constant"
  condition:
    $s1 and $s2 and $s3 and $s4 and $s5 and ($s6 or $s7)
}

rule SWF_STATIC_CVE_2016_4117 {
  strings:
    $s1 = "find_DeleteRangeTimelineOperation"
    $s2 = "find_Placement_in_constant"
    $s3 = "find_version_in_constant"
    $s4 = "find_capabilities_in_constant"
    $s5 = "negative number count larger than max"
  condition:
    $s1 and $s2 and $s3 and $s4 and $s5
}

rule SWF_STATIC_CVE_2010_1297 {
  strings:
    $s = "signiture_cve_2010_1297"
  condition:
    $s
}

rule SWF_STATIC_HEU_WHILE_NEW_VECTOR {
  strings:
    $s = /while\s\(true\)\s{[\w\W]{1,200}if\s\(v\d{1,5}\s[<>]\s\w{2,10}\)\s{[\w\W]{1,500}findScopeProperty\(\$O\d{1,5},\s'Vector'[\w\W]{1,200}asGetProperty\(\$O\d{1,5},\s'Vector'[\w\W]{1,2000}continue;/
    $s1 = "class info count smaller than 10"
  condition:
    $s and $s1
}

/* SWF.SIG.DecompiledCode.I
rule SWF_STATIC_HEU_STRING_FROMCHARCODE {
  strings:
    $s = /asCallProperty\(\$O\d{1,5},\s'fromCharCode'[\w\W]{1,20}/
    $s1 = "class info count smaller than 10"
    $s2 = "JSON"
  condition:
    $s and $s1 and (not $s2) 
}
*/

rule SWF_STATIC_HEU_WHILE_SETPROPERTY {
  strings:
    $s = /while\s\(true\)\s{[\w\W]{1,200}if\s\(v\d{1,5}\s[<>]\s\w{2,10}\)\s{[\w\W]{1,500}asGetProperty\(\$O\d{1,5},\s'(Vector|Array)'[\w\W]{1,500}asSetProperty[\w\W]{1,300}continue;/
    $s1 = /asGetSlot[\w\W]{1,50}asGetSlot[\w\W]{1,50}asSetProperty/
    $s2 = "class info count smaller than 10"
    $s3 = "method info count larger than 400"
    $s4 = "germanwing Headline Box Construction Kit"
    $s5 = "http://edpn.ebay.com"
  condition:
    ($s or #s1 > 500) and $s2 and (not $s3) and (not $s4) and (not $s5)
}

rule SWF_STATIC_HEU_WHILE_PUSH {
  strings:
    $s = /while\s\(true\)\s\{[\w\W]{1,1000}if\s\(v\d{1,5}\s[<>]\s\w{2,10}\)\s{[\w\W]{1,500}asCallProperty\([\w\W]{1,10}'push'[\w\W]{1,300}continue;/
  condition:
    $s
}

/* SWF.SIG.DecompiledCode.E
rule SWF_STATIC_HEU_WHILE_WRITEBYTE {
  strings:
    $s = /while\s\(true\)\s{[\w\W]{1,200}if\s\(\w{2,5}\s[<>]\s\D\w{2,10}\)\s{[\w\W]{1,500}asCallProperty\(\$O\w{1,5}, 'writeByte[\w\W]{1,300}continue;/
  condition:
    $s
}
*/

rule SWF_STATIC_HEU_WHILE_WRITEBYTE_MAL {
  strings:
    $s = /while\s\(true\)\s{[\w\W]{1,200}if\s\(\w{2,5}\s[<>]\s\d{3,10}\)\s{[\w\W]{1,500}asCallProperty\(\$O\w{1,5}, 'writeByte[\w\W]{1,300}continue;/
  condition:
    $s
}

/* SWF.SIG.DecompiledCode.F
rule SWF_STATIC_HEU_STRANGE_STRING_CONCAT {
  strings:
    $s1 = /while\s\(true\)\s{[\w\W]{1,1000}'fromCharCode'[\w\W]{1,1000}'escape'[\w\W]{1,1000}asAdd[\w\W]{1,300}continue;/
    $s2 = /while\s\(true\)\s{[\w\W]{1,1000}'fromCharCode'[\w\W]{1,1000}asCoerceString\(asAdd[\w\W]{1,300}continue;/
    $s3 = "class info count smaller than 10"
  condition:
    ($s1 or $s2) and $s3
}
*/

rule SWF_STATIC_HEU_SUSPICIOUS_NUMBER {
  strings:
    $s = "Find suspicious number"
  condition:
    $s
}

rule SWF_STATIC_EMBEDFLASH {
  strings:
    $s = "loadBytes" nocase
  condition:
    $s
}

rule SWF_DEBUG_READ_TAG_ERROR {
  strings:
    $s = "Error in readTag"
  condition:
    $s
}

rule SWF_DEBUG_METHOD_INFO_COUNT_ZERO {
  strings:
    $s = "method info count is 0"
  condition:
    $s
}

rule SWF_DEBUG_VALID_METHOD_INFO_COUNT_LARGER_THAN_MAX {
  strings:
    $s = "valid method info count larger than"
  condition:
    $s
}

rule SWF_DEBUG_CLASS_INFO_COUNT_LARGER_THAN_MAX {
  strings:
    $s = "class info count larger than"
  condition:
    $s
}

rule SWF_DEBUG_METHOD_INFO_COUNT_LARGER_THAN_MAX {
  strings:
    $s = /method info count is ([4-9]\d{2}|\d{4,10})/
  condition:
    $s
}

rule SWF_DEBUG_FAMOUS_URL_IN_CONSTANT_STRING {
  strings:
    $s = "Find famous url in constant string"
  condition:
    $s
}

rule SWF_DEBUG_CONSTANT_POOL_PARSE_ERROR {
  strings:
    $s = "parse constant pool error"
  condition:
    $s
}

rule SWF_STATIC_HIDE_HTML_ELEMENT {
  strings:
    $s = /\'ExternalInterface\'[\w\W]{1,100}\'call\'[\w\W]{1,200}style\.display=\"none\"/
  condition:
    $s
}

rule SWF_STATIC_HIDDEN_IFRAME {
  strings:
    $s1 = "Find create hidden iframe jscode"
    $s2 = /style\.display=\\\'none\\\'[\w\W]{1,50}iframe\s+src/
    $s3 = /createElement\(\\\'iframe\\\'\)[\w\W]{1,20}\.src[\w\W]{1,200}\.style\.(left|right)\s*=\s*\\\'\-\d{1,5}px\\\'/
    $s4 = /createElement\(\'iframe\'\)[\w\W]{1,50}style\.(width|height)\s*=\s*0/
    $s5 = /createElement\(\\\'iframe\\\'\)/
    $s6 = /style\.(width|height)\s*=\s*0/
  condition:
    $s1 or $s2 or $s3 or $s4 or ($s5 and $s6)
}

rule SWF_STATIC_HIDDEN_ELEMENT {
  strings:
    $s1 = /\<script[\w\W]{1,1000}style\.(width|height)\s*=\s*\"0px\"/
    $s2 = /\<script[\w\W]{1,1000}style\.display\s*=\s*\"none\"/
  condition:
    $s1 or $s2
}

rule SWF_STATIC_CREATE_SCRIPT_ELEMENT {
  strings:
    $s1 = "Find create script jscode"
  condition:
    $s1
}

rule SWF_STATIC_CVE_2012_0779 {
  strings:
    $s1 = "Find rtmp in constant string"
    $s2 = "Find systemMemoryCall in constant string"
  condition:
    $s1 and $s2
}

rule SWF_STATIC_HEU_WHILE_STRING_ADD {
  strings:
    $s = /while\s*\(true\)\s*\{[\w\W]{1,100}asCoerceString\(asAdd[\w\W]{1,30}if\s\(\w{2,6}\s\<\s\d{4,10}\)\s\{[\w\W]{1,50}continue;/
  condition:
    $s
}

rule SWF_CVE_2014_0498 {
  meta:
    check_point = "check regexp param, for (?n){i,j}, find x numbers of '()' before it ,and (n - x) numbers of '()' after it..."
  strings:
    $s = "Found CVE_2014_0498"
  condition:
    $s
}

rule SWF_DYN_NEW_REGEXP_PARAM_CVE_2014_0499 {
  meta:
    check_point = "check regexp param, back reference not less than 33 and has {0,} and num of parentheses not less than 49"
  strings:
    $s = /regexp pattern is\[([^\(]){0,}(\(([^\(])*){49,99}\\[3-9][3-9]\)+\{0,\d*\}\]/
  condition:
    $s
}

rule SWF_DYN_STRING_APPEND_REGEXP_CVE_2014_0499 {
  meta:
    check_point = "check string append regexp, back reference not less than 33 and has {0,} and num of parentheses not less than 49"
  strings:
    $s = /string append regexp\[([^\(]){0,}(\(([^\(])*){49,99}\\[3-9][3-9]\)+\{0,\d*\}\]/
  condition:
    $s
}

rule SWF_STATIC_CONST_STRING_REGEXP_CVE_2014_0499 {
  meta:
    check_point = "check const string regexp, back reference not less than 33 and has {0,} and num of parentheses not less than 49"
  strings:
    $s = /const string regexp\[([^\(]){0,}(\(([^\(])*){49,99}\\[3-9][3-9]\)+\{0,\d*\}\]/
  condition:
    $s
}

rule SWF_STATIC_CVE_2014_0502 {
  strings:
    $s1 = /asGetProperty\([\w\W]{1,10}\'SharedObject\'[\w\W]{1,10}\)[\w\W]{1,50}asCallProperty\([\w\W]{1,10}\'getLocal\'/
    $s2 = /asGetProperty\([\w\W]{1,10}\'Worker\'[\w\W]{1,10}\)[\w\W]{1,50}asGetProperty\([\w\W]{1,10}\'current\'[\w\W]{1,10}\)[\w\W]{1,50}asCallProperty\([\w\W]{1,10}\'terminate\'/
  condition:
    $s1 and $s2
}

rule SWF_CVE_2015_0336_SUBRULE_PACKER {
  strings:
    $s1 = "Find embedded swf"
    $s2 = "Find Embedded Flash and Trigger LoadBytes"
  condition:
    $s1 and $s2
}

rule SWF_CVE_2015_0336_SUBRULE_EMBEDDED {
  strings:
    $s1 = "Find LocalConnection in constant string"
    $s2 = "Find embedded swf"
    $s3 = "Find payload in constant string"
  condition:
    $s1 and $s2 and $s3
}

rule SWF_DEBUG_NORMAL_EVIDENCE_IN_CONSTANT_STRING {
  strings:
    $s = "Find normal evidence in constant string"
  condition:
    $s
}

rule SWF_STATIC_NORMAL_CRASH {
  strings:
    $s1 = "signature_normal_crash"
  condition:
    $s1
}

/* SWF.SIG.LocalConnection.A
rule SWF_STATIC_LOCAL_CONNECTION {
  strings:
    $s1 = "find_api_local_connection_in_constant"
  condition:
    $s1
}
*/


rule SWF_STATIC_LOCALCONNECTION_A {
  strings:
    $s1 = "find_capabilities_in_constant"
    $s2 = "find_version_in_constant"
    $s3 = "find_payload_in_constant"
    $s4 = "negative number count larger than max"
    $s5 = "find_api_local_connection_in_constant"
  condition:
    $s1 and $s2 and $s3 and $s4 and $s5
}

rule SWF_STATIC_FIND_PAYLOAD_A {
  meta:
    author = "Chaoying_Liu"
    sha1 = "f2e5eed8ecb4c995061154f6c578c72de4acf896"
    date = "2016-08-19"
  strings:
    $s1 = "find_payloadUrl_in_constant"
    $s2 = "find_payloadRc4Key_in_constant"
    $s3 = "find_embedHtml_in_constant"
    $s4 = "find_exploitWrappers_in_constant"
  condition:
    all of them
}

rule SWF_STATIC_GRAY_EVIDENCE{
  strings:
    $s1 = "find_getDefinitionByName_in_constant"
    $s2 = "find_ByteArrayAsset_in_constant"
    $s3 = "find_addEventListener_in_constant"
    $s4 = "find_loadBytes_in_constant"
    $s5 = "find_binaryData_in_constant" 
    
  condition:
    ($s1 and $s2 and $s3) or $s4 or $s5
}

rule SWF_STATIC_FIND_ASSEMBLY{
  meta:
    author = "Chaoying_Liu"
    sha1 = "0196763a769c434ff3ad791fa1ae7816fcf58fee"
    date = "2016-08-31"
  strings:
    $s1 = "find_NOP_in_constant"
  condition:
    $s1
}

rule SWF_STATIC_OBFUSCATION_A{
  meta:
    author = "Chaoying_Liu"
    sha1 = "b241cfac0dd78048eb24343b26acbac57851982e"
    date = "2016-09-14"
  strings:
    $r1 = /asGetProperty\(\S{1,5}, '[Il1_]{5,20}'/
    $s1 = "BitmapAsset"
  condition:
    #r1 > 50 and $s1
}

rule SWF_STATIC_MALICIOUS_HEX_A {
  meta:
    author = "Chaoying_Liu"
    sha1 = "7586fda91279cf9e6f79c3085551d5fe514a1801"
    date = "2016-09-28"
  strings:
    $s1 = "Find suspicious number, val=100000" nocase
    $s2 = "Find suspicious number, val=aabbc000" nocase
    $s3 = "Find suspicious number, val=7ffffffc" nocase
    $s4 = "Find suspicious number, val=ffeedd00" nocase
    $s5 = "Find suspicious number, val=ffeedd0f" nocase
    $s6 = "Find suspicious number, val=face0000" nocase
  condition:
    all of them
}

rule SWF_STATIC_MALICIOUS_HEX_B {
  meta:
    author = "Chaoying_Liu"
    sha1 = "CB1E30E6E583178F8D4BF6A487A399BD341C0CDC"
    description = "for pawn storm operation zeroday"
    date = "2016-11-03"
  strings:
    $s1 = "Find suspicious number, val=41414140" nocase
    $s2 = "Find suspicious number, val=41414141" nocase
    $s3 = "Find suspicious number, val=41414142" nocase
    $s4 = "Find suspicious number, val=41414146" nocase
    $s5 = "Find suspicious number, val=41414171" nocase
    $s6 = "Find suspicious number, val=41414184" nocase
    $s7 = "Find suspicious number, val=41414143" nocase
  condition:
    all of them
}