/*
* Following rules are dynamic rules
*/

//format
rule PDF_FORMAT_EMBEDDED_FLASH {
  strings:
    $s1 = "Find flash in this PDF file" nocase
  condition:
    $s1
}

rule PDF_FORMAT_EOF_SCRIPT{
  strings:
    $s1 = "Find script in EOF" nocase
  condition:
    $s1
}

//generic
rule PDF_GENERIC_XREF_EVAL{
  strings:
    $s1 = "warning"
    $s2 = "XRefOffset is larger than file size"
  condition:
    all of them
}

rule PDF_GENERIC_EVAL_APP_METHOD_CALL_A{
  strings:
    $r = /app\.\w+/
  condition:
    $r
}

rule PDF_GENERIC_OPENACTION_MAL_URI{
  strings:
    //$s1 = "malicious_url" nocase
    $r = /www\.seguridadyaltura\.com/
  condition:
    $r
}

// CVE

rule PDF_FORMAT_CVE_2008_0655_A {
  strings:
    $s1 = "js_checker_cve_2008_0655" nocase
    $s2 = "collab.collectEmailInfo" nocase
  condition:
    $s1 or $s2
}

rule PDF_EXPLOIT_CVE_2010_2883_A{
  strings:
    $s1 = "ttf_checker_cve_2010_2883"
  condition:
    $s1
}

rule PDF_CVE_2009_0837_A{
  strings:
    $s1 = "action_launch" nocase
  condition:
    $s1
}

rule PDF_EXPLOIT_CVE_2012_0754_A{
  strings:
    $s1 = "mp4_checker_cve_2012_0754" nocase
  condition:
    $s1
}

rule PDF_EXPLOIT_CVE_2009_1492_B{
  strings:
    $s1 = "app.doc.syncAnnotScan" nocase
    $s2 = "app.doc.getAnnots" nocase
  condition:
    $s1 or $s2
}

rule PDF_FORMAT_CVE_2013_3346_A{
  strings:
    //$s1 = "RangeError: Maximum call stack size exceeded" nocase
    $r = /Q=~\[\];/ nocase
  condition:
    $r
}

rule PDF_EXPLOIT_CVE_2010_1240_A {
  strings:
    $r = /F\s=\scmd\.exe,.*\/P\s=.*start/ nocase
  condition:
    $r
}

rule PDF_EXPLOIT_CVE_2007_3896_A{
  strings:
    $s1 = "URI"
    $r1 = /mailto\:/
    $r2 = /windows\/system32/ 
  condition:
    all of them
}

rule PDF_EXPLOIT_CVE_2011_2462_A {
  strings:
    $s1 = "u3d_checker_cve_2011_2462" nocase
  condition:
    $s1
}
            
rule PDF_EXPLOIT_CVE_2009_3953_A {
  strings:
    $s1 = "u3d_CLODProgressiveMeshContinuation" nocase
    $r = /0c004e6e7a42414677684e726870(0){20,50}(10000000){10,}/
  condition:
    all of them 
}

rule PDF_EXPLOIT_CVE_2010_0188_H {
  strings:
    $r =/\WSUkq|\WTU0A/
  condition:
    $r
}

rule PDF_EXPLOIT_CVE_2010_0188_A{
  strings:
    //$s1 = "pdf_tiff" nocase
    $r = /(4\+Pj){50,100}/
  condition:
    $r 
}

rule PDF_EXPLOIT_CVE_2010_0188_B{
  strings:
    //$s1 = "tiff_conten" nocase
    $r = /(MDAw){50,100}/
  condition:
    $r 
}

rule PDF_EXPLOIT_CVE_2010_0188_G{
  strings:
    //$s = "tiff_content" nocase
    $r = /(CQkJ){50,100}/
  condition:
    $r
}

rule PDF_EXPLOIT_CVE_2010_0188_C {
  strings:
    $s1 = "tiff_checker_cve_2010_0188" nocase
  condition:
    $s1
}

//debug
rule PDF_VBS_RUN_PE_FILE{
  strings:
    $s1 = "cmd.exe"
    $s2 = ".pdf"
  condition:
    all of them
}



