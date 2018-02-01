/*
* Following rules are dynamic rules
*/

//generic
rule PDF_GENERIC_HEAPSPRAY_B {
  strings:
    $s1 = "concatheapsprayslicecode" nocase
  condition:
    $s1
}



rule PDF_GENERIC_EOF_SCRIPT_CHECK_COOKIE_CTEATE_IFRAME{
  strings:
    $s1 = "getter cookieenabled" nocase
    $s2 = "getter document.cookie" nocase
    $s3 = "document.createelement('iframe')" nocase
  condition:
    all of them
}

rule PDF_GENERIC_EVAL_ACCESS{
  strings:
    $s1 = "eval_access" nocase
  condition:
    $s1
}

rule PDF_GENERIC_EVAL_APP_METHOD_CALL_B{
  strings:
    $s1 = "eval_access" nocase
    $r = /app\.\w+/
  condition:
    $s1 and $r
}

rule PDF_GENERIC_APP_FUNCTION{
  strings:
    $s1 = "getpagenthword" nocase
    $s2 = "pagenum" nocase
    $s3 = "eval content" nocase
    $s4 = "join" nocase
    $r = /app\[.*?\]\(.*?\);/
  condition:
    ($s1 or $s2 or $s3 or $s4) and $r
}

rule PDF_GENERIC_SCRIPT_IN_ANNOT{
  strings:
    $s1 = "get_annots_access" nocase
    $s2 = "eval_access" nocase
  condition:
    all of them
}

rule PDF_GENERIC_SCRIPT_IN_PAGE{
  strings:
    $s1 = "get_page_nth_word_access" nocase
    $s2 = "get_page_num_words_access" nocase
    $s3 = "eval_access" nocase
  condition:
    ($s1 or $s2) and $s3
}

rule PDF_GENERIC_EOF_SCRIPT_CHECK_COOKIE{
  strings:
    $s1 = "getter cookieenabled" nocase
    $s2 = "getter document.cookie" nocase
  condition:
    all of them
}

rule PDF_GENERIC_STACKOVERFLOW{
  strings:
    $s1 = "rangeerror: maximum call stack size exceeded" nocase
  condition:
    $s1
}

rule PDF_GENERIC_GETURL{
  strings:
    $s1 = "geturl access" nocase
    $s2 = "unescape_access_but_not_shellcode" nocase
  condition:
    all of them
}

rule PDF_GENERIC_PDF_INFO_SCRIPT{
  strings:
    $s1 = "find script in pdf info" nocase
  condition:
    $s1
}

rule PDF_GENERIC_RANGE_ERROR{
  strings:
    $s1 = "RangeError: Maximum call stack size exceeded" nocase
  condition:
    $s1
}

rule PDF_GENERIC_HEAPSPRAY{
  strings:
    $s1 = "concatshellcode" nocase
  condition:
    $s1
}

rule PDF_GENERIC_SHELLCODE_DETECTION{
  strings:
    $s1 = "find shellcode" nocase
  condition:
    $s1
}

//CVE
rule PDF_EXPLOIT_CVE_2009_4324_A {
  strings:
    $s1 = "js_checker_cve_2009_4324" nocase
  condition:
    $s1
}

rule PDF_BEHAVIOR_CVE_2013_2729_C {
  strings:
    $s1 = "javascript namespace" nocase
    $s2 = "eval_access" nocase
    $s3 = "xfa_resolveNode" nocase
  condition:
    all of them
}

rule PDF_GENERIC_JS_NAMESPACE{
  strings:
    $s1 = "javascript namespace" nocase
  condition:
    $s1
}

rule PDF_EXPLOIT_CVE_2013_0640_A {
  strings:
    $s1 = "xfa_resolveNode" nocase
    $r = /xfa\[\d\]\.form\[\d]\.form\d\[\d\]\.#pageset\[\d\]\.page\d\[\d\]\.#subform\[\d\]\.field\d{1,3}\[\d\]\.#ui\[\d\](\.#choicelist\[\d\])?/ nocase
  condition:
    all of them 
}

rule PDF_EXPLOIT_CVE_2008_0655_A {
  strings:
    $s1 = "js_checker_cve_2008_0655" nocase
    $s2 = "collab.collectEmailInfo" nocase
  condition:
    $s1 or $s2
}

rule PDF_EXPLOIT_CVE_2010_0188_F {
  strings:
    $s = ".rawValue" nocase
    $r =/SUkq|qwe123ba|TU0A/
  condition:
    $s and $r
}

rule PDF_EXPLOIT_CVE_2008_2992_A{
  strings:
    $s1 = "js_checker_cve_2008_2992" nocase
  condition:
    $s1
}

rule PDF_EXPLOIT_CVE_2009_4324_B {
  strings:
    $s1 = "media" nocase
    $s2 = "util.printd" nocase
  condition:
    all of them 
}

rule PDF_EXPLOIT_CVE_2009_0927_A{
  strings:
    $s1 = "js_checker_cve_2009_0927" nocase
  condition:
    $s1
}

rule PDF_EXPLOIT_CVE_2009_1492_A{
  strings:
    $s1 = "js_checker_cve_2009_1492" nocase
  condition:
    $s1
}

rule PDF_EXPLOIT_CVE_2010_0491_A{
  strings:
    $s1 = "js_checker_cve_2010_0491" nocase
  condition:
    $s1
}

rule PDF_EXPLOIT_CVE_2010_0188_D{
  strings:
    $s1 = "eval content" nocase
    $r = /t_p.{1,5}n_bbgle9t_p.{1,10}aaa.{1,5}bbb.{1,5}ccc.{1,5}ddd.{1,5}eee.{1,5}fff/ nocase
  condition:
    all of them
}

rule PDF_EXPLOIT_CVE_2010_0188_E{
  strings:
    $s1 = "string.prototype.slice" nocase
    $r = /function.{1,20}\{var.{1,20}cie.{1,20}t4vy3/ nocase
  condition:
    all of them
}

rule PDF_EXPLOIT_CVE_2013_2550_A{
  strings:
    $s1 = "get_page_nth_word_access" nocase
    $r = /e\*d\*\(\(g\|h\)\{8,512\}\|\(\(i\|j\)\|\(k\|f\)\)\)(.{5,20})(\|a\*){20,100}/
  condition:
    all of them
}

rule PDF_EXPLOIT_CVE_2013_2729_A{
  strings:
    $s1 = "javascript namespace util" nocase
    $s2 = "javascript namespace spray" nocase
  condition:
    $s1 or  $s2
}

rule PDF_EXPLOIT_CVE_2013_2729_A1{
  strings:

    $s3 = "AddXfaField" nocase
    $r1 = /(\\u4f4f){20}/
  condition:
    $r1 and $s3
}

rule PDF_EXPLOIT_CVE_2013_3346_B{
  strings:
    $r = /app\.media\.getPlayers\(\)\.length.{3,20}~\[\]/ nocase
  condition:
    $r
}

//getterViewVersion
rule PDF_EXPLOIT_GETTERVIEWVERSION_EVAL {
  strings:
    $s1 = "eval_access" nocase
    $s2 = "getter viewerversion" nocase
  condition:
    $s1 or $s2
}

rule PDF_EXPLOIT_UNESCAPE_NOT_SHELLCODE {
  strings:
    $s = "unescape_access_but_not_shellcode" nocase
  condition:
    $s
}

rule PDF_DOCODE_SHELLCODE_REPORT{
  strings:
    $s = "_docode_shellcode_report" nocase
  condition:
    $s
}

//debug
rule PDF_DEBUG_DATE_REPLACE{
  strings:
    $s1 = "date.getFullYear" nocase
    $s2 = "replace"
    $s3 = "2011"
  condition:
    all of them
}

rule PDF_DEBUG_EICAR_FILE{
  strings:
    $s1 = "call exportDataObject, nLaunch=2" nocase
  condition:
    $s1
}

rule PDF_DEBUG_VIRUS_XFA_DATA_UNSAFE{
  strings:
    $s1 = "k94id5xi3_uopa2g" nocase
  condition:
    $s1
}

















