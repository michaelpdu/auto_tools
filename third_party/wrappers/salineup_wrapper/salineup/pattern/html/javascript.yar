rule JS_CC_ON {
meta:
  author = "MD"
  description = "classification rule for Script Malware"
strings:
  $s = "/*@cc_on"
condition:
  $s
}

rule JS_UNKONWN_TYPEOF {
meta:
  author = "MD"
  description = "classification rule for Script Malware"
strings:
  $r = /typeof \w{1,30}\[.*\]\[.*\]\s*==\s*.*\)/ nocase
condition:
  $r
}

rule JS_VBS_KEYWORDS {
meta:
  author = "MD"
  description = "classification rule for Script Malware"
strings:
  $s1 = "dim" nocase
  $s2 = "end sub" nocase
condition:
  all of them
}



rule JS_SHELLCODE_B {
strings:
  $s = "unescape"
  $r = "E8|E9|EB"
condition:
  $s and $r and obfuscation >= 1
}

rule JS_RISKACX_C {
strings:
  $r = /\.SaveToFile[\w\W]{0,200}(\.Run|\.ShellExecute)/ nocase
condition:
  $r
}

rule JS_RISKACX_D {
strings:
  $s1 = "on error resume next" nocase
  $s2 = "savetofile" nocase
  $s3 = "ShellExecute" nocase
  $s4 = "execute" nocase
  $s5 = "RegWrite" nocase
condition:
  $s1 and $s2 and ($s3 or $s4 or $s5)
}

rule JS_RISKACX_E {
strings:
  $s1 = "http://178.shen9.net/jdwin/soft/289f2030c5d3236c.exe" nocase
  $s2 = "http://u.uu500.com/a8da234k8asdf.exe" nocase
  $s3 = "http://news.163-stv.com/page/image/page.exe" nocase
  $s4 = "EXECUTE" nocase
  $r1 = /DO WHILE [\w\W]{50,100}LOOP/
condition:
  ($s1 or $s2 or $s3) and $s4 and $r1 and obfuscation >= 2
}

rule JS_RISKACX_F {
strings:
  $s1 = "60,104,116,109,108,62,13,10,60,84,73,84,76,69,62,73,32,76,111,118,101" nocase
  $s2 = "60,104,116,109,108,62,13,10,60,84,73,84,76,69,62,73,32,76,111,118,101" nocase
  $s3 = "98,111,100,121,62,13,10,60,47,104,116,109,108,62,13,10" nocase
  $s4 = "function rechange" nocase
  $s5 = "document.write rechange" nocase
condition:
  $s1 and $s2 and $s3 and $s4 and $s5 and obfuscation >= 5
}

rule JS_RISKACX_G {
strings:
  $s1 = "unescape(\"\"%u54eb%u758b%u8b3c%u3574%u0378%u56f5%u768b%u0320" nocase
  $s2 = "unescape(\"%ff%13" nocase
  $s3 = "unescape(\"%01%0a" nocase
  $s4 = "DirectSS.FindEngine EngineID" nocase
condition:
  $s1 and $s2 and $s3 and $s4 and obfuscation >= 2
}

rule JS_RISKACX_H {
strings:
  $s1 = "expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000)" nocase
  $s2 = "document.write(\"<iframe width=0 height=0 src=help.htm" nocase
  $s3 = "document.cookie = \"woshi0day=Ms06-046;expires=\" + expires.toGMTString()" nocase
condition:
  all of them
}

rule JS_RISKACX_O {
strings:
  $s1 = "obj.DloadDS(\"http://user3.33391.net/Baidu.cab\", \"Baidu.exe" nocase
  $s2 = "ado.createobject(\"Adodb.Stream" nocase
  $s3 = "document.write('<iframe width=100 height=0 src=http://user3.33391.net/Thunder.html" nocase
condition:
  all of them
}

rule JS_HEAPLIB_A {
strings:
  $s = "heaplib" nocase
condition:
  $s and obfuscation >= 1
}

rule JS_CVE_2013_1347 {
strings:
  $s = "collectgarbage" nocase
  $r = /\.offsetParent[\w\W]{0,10}=[\w\W]{0,10}null[\w\W]{0,200}\.innerHTML[\w\W]{0,10}=[\w\W]{0,10}\"\"[\w\W]{0,200}\.appendChild/ nocase
condition:
  $s and $r
}

rule JS_HEAPSPRAY_A {
strings:
  //$r = /for\s*\([\w\W]{5,50}\)\s*\{[\w\W]{5,50}=\s*[\w\W]{1,50}\.createElement\([\w\W]{1,20}\)[\w\W]{1,50}\.(class[nN]ame|title|value)\s*=\s*[^\}]{1,150}\}/
  $r = /for\s*\([\w\W]{5,50}\)[\w\W]{0,50}\{[\w\W]{5,50}=[\w\W]{1,50}\.createElement\([\w\W]{1,20}\)[\w\W]{1,50}\.(class[nN]ame|title|value)\s*=\s*[^\}]{1,150}\}/ nocase
condition:
  $r
}

rule JS_HEAPSPRAY_B {
strings:
  $s = "collectgarbage" nocase
  $r = /for\s*\([\w\W]{5,50}\)[\w\W]{0,50}\{[\w\W]{5,50}[\(=][\w\W]{1,50}\.createElement\([\w\W]{1,20}\)[\w\W]{1,20}[^\}]{1,150}\}/ nocase
condition:
  $s and $r
}

rule JS_HEAPSPRAY_C {
strings:
  $r = /For\s+[\w\W]{1,40}\s*=\s*[\w\W]{1,40}\s*to\s*[\w\W]{1,40}\s*Set\s*[\w\W]{1,40}\s*=\s*[\w\W]{1,50}\.createElement\([\w\W]{1,20}\)/ nocase
condition:
  $r
}

rule JS_CVE_2010_1423_A {
strings:
  $s = "cafeefac-dec7-0000-0000-abcdeffedcba" nocase
  $r = /http: -J-xxaltjvm.*\.jnlp|[\w\W]{0,10}-J[\w\W]{0,10}-jar[\w\W]{0,10}-J[\w\W]{1,300}none[\w\W]{0,10}/ nocase
condition:
  all of them
}

rule JS_CVE_2010_0806_A {
strings:
  $r = /document\.createElement\(.+\)[\w\W]{1,100}\.addBehavior\(.+\)[\w\W]{1,400}\.setAttribute[\w\W]{1,400}window\.status/ nocase
condition:
  $r
}
/*
rule JS_MS06_013_A {
strings:
  $r = /([^|]\s)(\S{1,20})\s*=\s*unescape\([\w\W]{10,300}(for|while)[\w\W]{10,300}(=|\+)\s*\2[\w\W]{10,300}document\.getElementById\([^\(|^\)]+\)\.createTextRange\(\s*\)/ nocase
condition:
  $r
}
*/
rule JS_LONGUNESCAPE_A {
strings:
  $r = /unescape\(['"](%u\w{4}){100,}/ nocase
condition:
  $r
}

rule JS_GENERIC_Z {
strings:
  $s1 = "0d43fe01-f093-11cf-8940-00a0c9054228" nocase
  $s2 = "f935dc22-1cf0-11d0-adb9-00c04fd58a0b" nocase
condition:
  all of them
}

rule JS_CVE_2010_1885_A {
strings:
  $s = "6bf52a52-394a-11d3-b153-00c04f79faa6" nocase
  $r1 = /setAttribute\(\s*"uiMode"\s*,\s*"invisible"/ nocase
  $r2 = /openPlayer\(\s*['"]http/ nocase
condition:
  all of them
}

rule JS_CVE_2010_1885_D {
strings:
  $s = "hcp://system/sysinfo/sysinfomain.htm" nocase
condition:
  $s
}

rule JS_BLACKHOLEKIT_A {
strings:
  $s1 = "javaversions" nocase
  $s2 = "adobereader" nocase
  $r = /(function\s+spl\d[^\}]{1,400}\}){4}/ nocase
condition:
  (any of ($s*)) and $r
}

rule JS_BLACKHOLEKIT_F {
strings:
  $s1 = "javaversions" nocase
  $s2 = "adobereader" nocase
  $s3 = "plugindetect" nocase
  $r1 = "getallocsize" nocase
  $r2 = "getfillbytes" nocase
  $r3 = "getshellcode" nocase
condition:
  (any of ($s*)) and (all of ($r*)) and obfuscation >= 1
}

rule JS_BLACKHOLEKIT_G {
strings:
  $s1 = "javaversions" nocase
  $s2 = "adobereader" nocase
  $s3 = "plugindetect" nocase
  $r1 = "show_pdf" nocase
  $r2 = "end_redirect" nocase
condition:
  (any of ($s*)) and (all of ($r*)) and obfuscation >= 1
}

rule JS_BLACKHOLEKIT_H {
strings:
  $s1 = "javaversions" nocase
  $s2 = "adobereader" nocase
  $s3 = "plugindetect" nocase
  $r1 = "check_win" nocase
  $r2 = "is_chrome" nocase
condition:
  (any of ($s*)) and (all of ($r*)) and obfuscation >= 1
}

rule JS_BLACKHOLEKIT_K {
strings:
  $s1 = "plugins" nocase
  $s2 = "mimetype" nocase
  $s3 = "classid" nocase
  $r1 = /setTimeout\(pdf,\s*[0-9]{1,4}\)/ nocase
  $r2 = /function\s*pdf\(\)[\w\W]{1,300}pdfver(<|>|<=|>=|==)[\w\W][0-9]{1,5}/ nocase
condition:
  (any of ($s*)) and $r1 and $r2
}

rule JS_CSS_A {
strings:
  $r = /createCSS\(('|")#[^'"]{2,4}('|"),('|")background:url\(data:,(eval|(va)?String\.fromCharCode)\)('|")/ nocase
condition:
  $r and obfuscation >= 1
}

rule JS_FAKEALERT_A {
strings:
  $r = /Your\s*computer\s*remains\s*infected\s*by\s*viruses/ nocase
condition:
  $r
}

rule JS_FAKEALERT_B {
strings:
  $r = /Your\s*computer\s*is\s*infected\s*by\s*malicious/ nocase
condition:
  $r
}

rule JS_CVE_2007_5601_A {
strings:
  $s1 = "LLLL\\\\XXXXXLD" nocase
  $s2 = ".Import" nocase
condition:
  all of them
}

rule JS_NIMDA_A {
strings:
  $r1 = /window\.open\("[\w]{1,}\.eml"/ nocase
  $r2 = /top\s*=\s*[0-9]*[1-9][0-9]{3,10}[\w\W]{1,5}left\s*=\s*[0-9]*[1-9][0-9]{3,10}/ nocase
condition:
  all of them
}

rule JS_CVE_2009_0075_A {
strings:
  $r = /\.click[\w\W]{1,400}\.cloneNode[\w\W]{1,400}\.clearAttributes[\w\W]{1,400}=[\s]*null[\w\W]{1,100}CollectGarbage[\w\W]{1,400}\.click/ nocase
condition:
  $r
}

rule JS_CVE_2009_1136_A {
strings:
  $s1 = "owc10.spreadsheet" nocase
  $s2 = "owc11.spreadsheet" nocase
  $r = /\.push\(window\)[\w\W]{1,100}for[\w\W]{1,100}\.Evaluate\(/ nocase
condition:
  ($s1 or $s2) and $r
}

rule JS_CVE_2008_0624_AB {
strings:
  $s = "5f810afc-bb5f-4416-be63-e01dd117bd6c" nocase
condition:
  $s
}

rule JS_CVE_2008_0015_A {
strings:
  $s1 = "f9769a06-7aca-4e39-9cfb-97bb35f0e77e" nocase
  $s2 = "8a674b4d-1f63-11d3-b64c-00c04f79498e" nocase
  $s3 = "0369B4E5-45B6-11D3-B650-00C04F79498E" nocase
  $s4 = "0369B4E6-45B6-11D3-B650-00C04F79498E" nocase
  $s5 = "055CB2D7-2969-45CD-914B-76890722F112" nocase
  $s6 = "0955AC62-BF2E-4CBA-A2B9-A63F772D46CF" nocase
  $s7 = "15D6504A-5494-499C-886C-973C9E53B9F1" nocase
  $s8 = "59DC47A8-116C-11D3-9D8E-00C04F72D980" nocase
  $s9 = "8A674B4C-1F63-11D3-B64C-00C04F79498E" nocase
  $s10 = "8A674B4D-1F63-11D3-B64C-00C04F79498E" nocase
  $s11 = "A2E30750-6C3D-11D3-B653-00C04F79498E" nocase
  $s12 = "B64016F3-C9A2-4066-96F0-BD9563314726" nocase
  $s13 = "C6B14B32-76AA-4A86-A7AC-5C79AAF58DA7" nocase
  $s14 = "F9769A06-7ACA-4E39-9CFB-97BB35F0E77E" nocase
  $r = "classid" nocase
condition:
  (any of ($s*)) and $r
}

rule JS_CVE_2009_1534_A {
strings:
  //$r = /\.HTMLURL\s*=\s*unescape\(.{9000,}\)/ nocase
  $r = /\.HTMLURL\s*=\s*unescape\(\s*(\'|\")\s*(%u\w{4}){400}/ nocase
condition:
  $r and obfuscation >= 1
}

rule JS_2012_4792_G {
strings:
  $r = /document\.createElement\(('|")[a-z]?button('|")\)[\w\W]{0,300}=\s*('|")\s*('|")[\w\W]{0,300}CollectGarbage/ nocase
condition:
  $r
}

rule JS_STYX_A {
strings:
  $r = /getElementById\([^\)]+\)\.contentWindow[\w\W]{0,100}for\s*\([^\)]+\)\s*.{1,40}String\.fromCharCode\([^\)]*value[^\)]*\)/ nocase
condition:
  $r
}

rule JS_PHOENIXKIT_A {
strings:
  $r = /try\s*\{\s*document\.getElementById\((\"|\')yahoo(\"|\')\)\.internet\}/ nocase
condition:
  $r
}

rule JS_CVE_2009_0950_B {
strings:
  //$r = /document\.location\.assign\(((\'itms:\/\/[^\']{500,}\')|(\"itms:\/\/[^\"]{500,}\"))\)/ nocase
  $r = /document\.location\.assign\(\'itms:\/\/([^\']){500,}\'|\"itms:\/\/([^\"]){500,}\"\)/ nocase
condition:
  $r
}

rule JS_CVE_2013_3893_A {
strings:
  $r = /\.applyElement\([\w\W]{1,200}\.onlosecapture\s*=\s*[\w\W]{1,500}outerText[\w\W]{1,200}\.setCapture/ nocase
condition:
  $r
}

rule JS_CVE_2013_3893_B {
  strings:
    $s1 = ".applyElement" nocase
    $s2 = ".onlosecapture" nocase
    $s3 = "outerText" nocase
    $s4 = ".setCapture" nocase
    $s5 = /unescape\(['"](%u\w{4}){300}/ nocase
  condition:
    all of them
}
rule JS_CVE_2014_0322_A {
strings:
  $r1 = /\w+\.(getElementsByTagName|getelementById)\([\w\W]{0,200}onpropertychange[\w\W]{0,100}\.createElement\(["']SELECT["']\)[\w\W]{0,80}appendChild/ nocase
  $r2 = /this\.outerHTML\s*=\s*this\.outerHTML[\w\W]{0,200}CollectGarbage/ nocase
condition:
  all of them
}

rule JS_VBS_CVE_2014_6332_A {
strings:
  $s1 = "on error resume next" nocase
  $r1 = /\w{1,20}\s*=\s*\w{1,20}\s*\+\s*&h8000000[\w\W]{1,300}redim[\w\W]{1,300}redim[\w\W]{1,300}redim\s*preserve\s*\w{1,20}\s*\(s*\w{1,20}\s*\)/ nocase
condition:
  all of them
}

rule JS_VBS_CVE_2014_6332_B {
strings:
  $s1 = "on error resume next" nocase
  $r1 = /redim[\w\W]{1,300}redim[\w\W]{1,300}redim\s*Preserve / nocase
  $r2 = /\w{1,20}\s*[\+=]\s*&\s*h\d000000/ nocase
  $r3 = /unescape\(['"][^)]*(%u[\da-fA-F]{4}){5}/ nocase
condition:
  $s1 and $r1 and ($r2 or #r3 >= 5)
}

rule JS_VBS_CVE_2014_6332_C {
meta:
    author = "Chaoying_Liu"
    sha1 = "5af61d796d0bc4524f4b030e4a32e3f1a5321a59"
    date = "2016-07-27"
    

strings:
    $s1 = "on error resume next" nocase
    $r1 = /chr\(\S+?\)/ nocase
    $r2 = /function[\w\W]*?redim\s+preserve[\w\W]*?end\s+function/nocase
    $r3 = /%[\d\w]{1,3}/ nocase
condition:
    $s1 and $r2 and #r1 > 25 and #r3 > 500
}
rule JS_CVE_2013_2551_B {
strings:
  $r = /\.dashstyle\.array\.length\s*=\s*0\s*-\s*1/ nocase
condition:
  $r
}

rule JS_CVE_2013_3897_A {
strings:
  $s1 = ".swapnode" nocase
  $s2 = ".onselect" nocase
  $s3 = ".execcommand" nocase
  $s4 = ".onpropertychange" nocase
condition:
  all of them
}


rule JS_CVE_2015_2425_A {
strings:
  $s1 = "createElementNS('http://www.w3.org/2000/svg'" nocase
  $s2 = "new MutationObserver" nocase
  $s3 = "document.write" nocase
  $s4 = /var \w{1,30} = new MutationObserver[\w\W]{3,50}\.observe/ nocase
condition:
  all of them
}

rule JS_CVE_2005_1790_A {
    meta:
        author = "Chaoying_Liu"
        sample = "pattern_test_msf_CVE-2005-1790"
        date = "2016-10-09"
    strings:
        $s1 = "window.location.reload()" nocase
        $r1 = /onload\s{0,5}=\s{0,5}window\(\)/ nocase
        $r2 = /String.fromCharCode\(([\w]{2,4},){5,}/ nocase
    condition:
        all of them
}

rule JS_CVE_2006_1016_A {
    strings:
        $s = "isComponentInstalled" nocase
        $t = "componentid" nocase
        $r = /isComponentInstalled\(\s*['"]\w{256,}/ nocase
    condition:
        all of them
}

rule JS_SIG_GENERIC_A {
    strings:
        $s = "location.search.substring" nocase
        $r = /var\s*\w{1,100}\s*=\s*['"][\w]{100,}/ nocase
        $t = /for\s*\([^\)]+\)\s*\{\s*[\w]{1,50}\s*\+=\s*String\.fromCharCode\([^\)]*substring/ nocase
    condition:
        all of them
}

rule JS_CVE_2012_3993_A {
strings:
  $r1 = /try{InstallTrigger\.install\(0\)}catch[\w\W]{1,40}Object\.getPrototypeOf\(Object\.getPrototypeOf\([\w\W]{1,40}\.__exposedProps__=/ nocase
condition:
  all of them
}
  
rule JS_CVE_2013_0758_A {
strings:
  $s1 = /use['"]\)(\[0\]){0,1}\.setAttributeNS/ nocase
  $s2 = /object['"]\)(\[0\]){0,1}\.data/ nocase
  $s3 = /"href",\s+location\.href/ nocase
condition:
  all of them
}

rule JS_CVE_2013_0758_B {
strings:
  $s4 = "__exposedProps__"
  $s5 = "__proto__"
condition:
  all of them
}

rule JS_CVE_2013_1710_A_MAIN {
strings:
  $s1 = "crypto.generateCRMFRequest" nocase
condition:
  all of them
}

rule JS_SIG_PAYLOAD_SHELLCODE_1 {
strings:
  $s2 = "2e%u6578%u4100\\\");\\n      execShellcode(sc, 194);\\n    \"}" nocase
  $s3 = "var execShellcode = function(shellcode, bytes) {\\n        Components.utils.import" nocase
  $s4 = "constructor.prototype.toString=function()" nocase
condition:
  all of them
}

rule JS_SIG_PAYLOAD_FIREFOX_PRIVILEGE_1 {
strings:
  /* for sample 3500ee3de9724fb759e5dc8dea5e60b9fb014c15 */
  $s2 = "Components.classes[\\\"@mozilla.org/file/local;1" nocase
condition:
  all of them 
}

rule JS_CVE_2013_1710_A{
condition:
  JS_SIG_PAYLOAD_FIREFOX_PRIVILEGE_1 or JS_SIG_PAYLOAD_SHELLCODE_1 and JS_CVE_2013_1710_A_MAIN
}


rule JS_CVE_2014_1510_A {
strings:
  $s1 = "window.open('chrome://" nocase
  $s2 = "top.vvv.messageManager.loadFrameScript('data:,'+key, false)" nocase 
  $s3 = "top.vvv.location = 'data:text/html,<html><body><iframe mozBrowser" nocase
  $s4 = "frames[0].frames[2].location=window.atob('ZGF0YTp0ZXh0L2h0bWwsPHNjcmlwdD5jID0gbmV3IG1" nocase
condition:
  all of them
}

rule JS_CVE_2014_8636_A {
strings:
  $s1 = "window.top.x=window.open(\"chrome://" nocase
  $s2 = "messageManager.loadFrameScript('data:,'+key, false)" nocase
  $s3 = "Object.setPrototypeOf" nocase
condition:
  all of them
}

rule JS_CHECKAV_J {
strings:
  $r1 = /newActiveXObject\s*\(\s*["|']Kaspersky.IeVirtualKeyboardPlugin.JavascriptApi.1["|']\s*\)/ nocase
  $r2 = /c:\\\\Windows\\\\System32\\\\drivers\\\\[\w\W]{1,10}\.sys/ nocase
  $r3 = /[^\w]VBoxMouse[^\w]|[^\w]vmmouse[^\w]|[^\w]kl1[^\w]|[^\w]tmactmon[^\w]|[^\w]tmcomm[^\w]|[^\w]tmevtmgr[^\w]|[^\w]TMEBC32[^\w]|[^\w]tmeext[^\w]|[^\w]tmnciesc[^\w]|[^\w]VBoxSF[^\w]/ nocase
condition:
  all of them
}

rule JS_QuickTime_ActiveX_A {
strings:
	$s1 = "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" nocase
condition:
  all of them
}

rule JS_CVE_2006_5650_A {
strings:
	$s = "ActiveXObject" nocase
	$t = "ICQPhone.SipxPhoneManager" nocase
	$r = ".DownloadAgent" nocase
condition:
	all of them
}

//
rule JS_CVE_2008_3878_A {
  strings:
    $s1 = "Ultra.OfficeControl" nocase
    //$s2 = /String\.fromCharCode\s*\(\s*0125\s*,\s*0154\s*,\s*0164\s*,\s*0162\s*,\s*0141\s*,\s*0x2e\s*,\s*0117\s*,\s*102\s*,\s*0146\s*,\s*0151\s*,\s*0x63\s*,\s*0x65\s*,\s*0x43\s*,\s*0157\s*,\s*0x6e\s*,\s*116\s*,\s*114\s*,\s*0157\s*,\s*0154\s*\)/ nocase
    //$s3 = "%55%6c%74%72%61%2e%4f%66%66%69%63%65%43%6f%6e%74%72%6f%6c" nocase
    //$s4 = /unescape\s*\(\s*\"%55%6c/ nocase
    //$s5 = "%6f%6c\"" nocase
    
    $s6 = "HttpUpload" nocase
    $s7 = "0xc0c0c0c" nocase
    $s8 = "ActiveXObject" nocase
    $s9 = "fromCharCode" nocase
    $s10 = "unescape" nocase
    condition:
       5 of($s1, $s6, $s7, $s8, $s9, $s10)
}


rule JS_X360_VIDEO_PLAYER_A {
	strings:
		$s1 = "clsid:4B3476C6-185A-4D19-BB09-718B565FA67B" nocase
		$s2 = "SetText" nocase
		$s3 = "virtualAlloc"
	condition:
		all of them
}

rule JS_CVE_2008_2683_A {
  strings:
        $b = /\w{1,10}\s*=\s*['"]\s*http:[\w\W]{1,50}\.MOF\s*['"]\s+\w{1,10}\s*=\s*['"]\s*[\w\W]{1,50}\.MOF\s*['"]\s+\w{1,100}\.DownloadImageFileURL/ nocase
        $c = /\w{1,10}\s*=\s*['"]\s*http:[\w\W]{1,50}\.EXE\s*['"]\s+\w{1,10}\s*=\s*['"]\s*[\w\W]{1,50}\.EXE\s*['"]\s+\w{1,100}\.DownloadImageFileURL/ nocase
    condition:
        all of them
}

rule JS_CVE_2006_3677_A {
	strings:
		$s1 = "java.lang.Runtime" nocase
		$s2 = "window.navigator.javaEnabled" nocase
		$r = /window\.navigator\s*=/ nocase
	condition:
		all of them	
}

rule JS_CVE_2011_3658_A {
strings:
	$r1 = /addEventListener\(\"DOMAttrModified\",/ nocase
	$s1 = "createSVGMatrix" nocase
	$s2 = "setMatrix" nocase
	$s3 = "%u0c0c" nocase
condition:
        all of them	
}

rule JS_CVE_2013_1690_A {
strings:
	$s1 = "window.stop();" nocase
	$r1 = /addEventListener\(\"readystatechange\",/ nocase
	$r2 = /unescape\(['"](%u\w{4}){100,}/ nocase
condition:
	all of them	
}

rule JS_CVE_2011_0073_A {
strings:
	$s1 = "%u0000%u0f00" nocase
	$s2 = "invalidateSelection" nocase
	$r1 = /document\.getElementById\(\"\w{1,}\"\)\.view\.selection;/ nocase
	
condition:
	all of them	
}

rule JS_CVE_2011_1996_A {
strings:
  $r1 = /document\.createElement\s*\(['|"]option['|"]\s*\)[\w\W]{10,50}\.add[\w\W]{10,50}\.innerText\s*=/ nocase
  $r2 = /unescape\(['"](%u\w{4}){100,}/ nocase
  $s = "collectgarbage" nocase
condition:
  all of them
}

rule JS_CVE_2014_0307_A {
  strings:
    $r1 = /var\s*\w{1,30}\s*=\s*document\.body\.createTextRange/ nocase
    $s1 = ".moveToElementText" nocase
    $s2 = ".execCommand" nocase
    $s3 = "InsertInputSubmit" nocase
    $s4 = "InsertOrderedList" nocase
    $s5 = "RemoveFormat" nocase
    $s6 = ".moveEnd" nocase
  condition:
    all of them
}

rule JS_EK_PAGE_A {
strings:
  $r2 = /window\.fv[\w\W]{2,20}=[\w\W]{0,10}window\.fv[\w\W]{2,20}=[\w\W]{0,10}window\.fv[\w\W]{2,20}=[\w\W]{0,10}window\.fv[\w\W]{2,20}=[\w\W]{0,10}t/ nocase
  $s1 = "navigator.appVersion.indexOf('Trident" nocase
  $s2 = "navigator.userAgent.indexOf('msie')" nocase
  $s3 = "'Kaspersky.IeVir' + 'tualKeyboa' + 'rdPlugin.JavascriptApi'" nocase
condition:
  all of them and obfuscation >= 2
}

rule JS_EK_PAGE_B {
strings:
  $s1 = "360\\\\360sd\\\\MiniUI.dll" nocase
  $s2 = "ksafe\\\\kclear.dll/" nocase
  $s3 = "kingsoft%20antivirus\\\\defendmon.dll" nocase
  $s4 = "alert(\"sys drivers is found!\")" nocase
condition:
  all of them
}

rule JS_MAXTHON_HISTORY_XCS {
  strings:
    $s1 = "location.href" nocase
    $r1 = /\w{1,10}\s*=\s*\w{1,10}\s*\+\s*["']\?jspayload\s*=\s*1["']/ nocase
    $r2 = /\w{1,10}\s*=\s*["']\?history\#\%22\/\>\s*\<\s*img\s*src\s*=\s*a\s*onerror\s*=\s*\%22["']/ nocase
    $r3 = /window\.location\s*=\s*unescape\(\w{1,10}\)\s*\+\s*\w{1,10}/ nocase
  condition:
    all of them
}

rule JS_CVE_2011_0065_A {
  strings:
    $s1 = "onChannelRedirect" nocase
    $s2 = "0x800000" nocase
    $r = /\.QueryInterface\s*\(Components\.interfaces\.nsIChannelEventSink\s*\)\.onChannelRedirect\s*\(/ nocase 
  condition:
    all of them
}

rule JS_AM_TEAM_EK_PAGE_C {
strings:
  $r2 = /window\.[a-zA-Z0-9]{4,20}.?[\s\n\r]*=.?[\s\n\r]*window\.[a-zA-Z0-9]{4,20}.?[\s\n\r]*=.?[\s\n\r]*window\.[a-zA-Z0-9]{4,20}.?[\s\n\r]*=.?[\s\n\r]*window\.[a-zA-Z0-9]{4,20}.?[\s\n\r]*=.?[\s\n\r]*t/ nocase
  $s1 = "navigator.appVersion.indexOf('Trident" nocase
  $s2 = "navigator.userAgent.indexOf('msie')" nocase
condition:
  all of them and obfuscation >= 2
}

rule JS_AM_TEAM_RISK_AUTOFLASH_A{
strings:
	$s1 = "appendChild" nocase
 	$s3 = "<object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" allowScriptAccess=always" nocase
 	$s4 = "<param name=\"movie\" value=\"http://" nocase
 	$s5 = "<param name=\"play\" value=\"true\"/>" nocase
  $r1 = /<param name=FlashVars value=['"]idd[a-z]*=N3NN[a-zA-Z0-9]+LLLLLLLL['"] \/>/  nocase

condition:
  all of them and obfuscation >= 1
}
rule JS_CHECK_AV_SIG_A{
strings:
    $s2 = /window\.ava\s*=\s*true/ nocase
condition:
  all of them
}

rule JS_AM_TEAM_LANDING_JAR_A{
strings:
  $r1 = /benz='[a-zA-Z]+\.jar',audi='[a-zA-Z]+\.jar',jaguar='[a-zA-Z]+\.jar'/  nocase
  
condition:
  $r1 and obfuscation >= 2
}

rule JS_RISKACX_R {
strings:
  $r1 = /CreateObject\([\w\W]{0,20}Wscript\.Shell/ nocase
  $r2 = /createObject\([\w\W]{0,20}Microsoft\.XMLHTTP/ nocase
  $r3 = /\.SaveToFile[\w\W]{1,100}\.exe/ nocase
  $r4 = /\.Open[\w\W]{1,20}GET/ nocase
  $r5 = /\.run[\w\W]{1,20}cscript\.exe/ nocase
condition:
  all of them
}
  
rule JS_AM_TEAM_FLASHRUN_FUFD_A{
strings:
  $r1 = /function flash_run\(fu,\s*fd/ nocase
  $s2 = "<object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" allowScriptAccess=always" nocase
  $s3 = "<param name=\"movie\" value=\"' + fu + '\" />" nocase
  $r4 = /<param name=FlashVars value="(exec=)?' \+ fd \+ / nocase
  
condition:
  all of them
}

/*sample:02bed3120643985869949c58603ab7a38d9541b8*/
rule JS_CHECK_PLATFORM_LOAD_SWF_A_1 {
strings:
  /*$obfuscation1 = /(\|\w{1,20}){6}/*/
  $platform1 = /Windows NT|Mac|X11/ nocase
  /*$base64 = /[a-zA-Z0-9\+\/=]{60}/ nocase*/
  $s1 = "sh=6wLrBej5////XoHu5v///zPJZrlaAIteBDEewQ4Bg+784"
  $s2 = "9090EB02EB05E8F9FFFFFF5E81EEE6FFFF"
  $s3 = "id=EB02EB05E8F9FFFFFF5E81EEE6FF"
condition:
  #platform1 >= 2 and $s1 or $s2 or $s3
}

rule JS_CHECK_PLATFORM_LOAD_SWF_A_2 {
strings:
  $flash1 = "d27cdb6e-ae6d-11cf-96b8-444553540000" nocase
condition:
  all of them
}

rule JS_CVE_2013_0758_C {
strings:
  $s1 = "document.querySelector('use').setAttributeNS" nocase
  $s2 = "document.querySelector('object').data" nocase
  $s3 = "\"http://www.w3.org/1999/xlink\", \"href\", location.href + \"#a\"" nocase
  $s4 = "var payload_obj = {\"k\":\"\\n      \\n      var execShellcode = function(shellcode, bytes) {\\n        Components.utils" nocase
  $s5 = "2e%u6578%u4100\\\");\\n      execShellcode(sc, 194);\\n    \"};" nocase
condition:
  all of them
}

rule JS_CHECK_VERSION_AND_REDIRECT_A {
strings:
  $s1 = "os_detect.getVersion" nocase
  $s2 = /window\.location\s*=/ nocase
condition:
  all of them
}

rule JS_VBS_CVE_2016_0189_A_valueof {
meta:
  author = "Chaoying_Liu"
  sha1 = "7b07950a8409107341b9db3c63753bd9f58cf49f"
  date = "2016-08-16"

strings:
  $r1 = /"valueOf"\s{0,20}:\s{0,20}function\s{0,20}\(\s{0,20}\)/ nocase
condition:
  $r1
}

rule JS_VBS_CVE_2016_0189_A_valueof_fuzz {
meta:
  author = "Nico_Jiang"
  sha1 = "292DEA1C7DA35677734F2B426A552BB0FBE8225F"
  date = "2016-10-21"
strings:
  $r1 = "valueOf" nocase
  $r2 = "triggerBug" nocase
condition:
  all of them
}

rule JS_VBS_CVE_2016_0189_A_exploit {
meta:
  author = "Chaoying_Liu"
  sha1 = "7b07950a8409107341b9db3c63753bd9f58cf49f"
  date = "2016-08-16"

strings:
  $s1 = "CSng" nocase
  $s2 = "VarType" nocase
  $s3 = "Class_Initialize" nocase
  $r1 = /ReDim\s+Preserve\s+\w{1,10}\s?\(1\s?,\s?1\s?\)/ nocase
  $r2 = /ReDim\s+Preserve\s+\w{1,10}\s?\(1\s?,\s?2000\s?\)/ nocase
  $r3 = /&H134|&H138|&H168|&H174/ nocase
condition:
  all of them
}

rule JS_SIG_COLLECTGARBAGE {
meta:
  author = "Chaoying_Liu"
  sha1 = "59a748fe5097051f47bcce9ef67a65f65b9fcfbd"
  date = "2016-08-23"
strings:
  $s1 = "CollectGarbage" nocase
condition:
  $s1
}

rule JS_SIG_VERSION_KEY{
meta:
  author = "Chaoying_Liu"
  sha1 = "844274289bd0e4aa7e9805882e45938085ed0a21"
  date = "2016-09-01"
strings:
  $r1 = /["']17496["']:\s{0,10}4080636/
  $r2 = /["']17631["']:\s{0,10}4084748/
  $r3 = /["']17640["']:\s{0,10}4084748/
  $r4 = /["']17689["']:\s{0,10}4080652/
  $r5 = /["']17728["']:\s{0,10}4088844/
  $r6 = /["']17801["']:\s{0,10}4088844/
  $r7 = /["']17840["']:\s{0,10}4088840/
  $r8 = /["']17905["']:\s{0,10}4088840/
condition:
  all of them
}

rule JS_CVE_2015_2419_A_STRINGIFY {
meta:
  author = "Chaoying_Liu"
  sha1 = "59a748fe5097051f47bcce9ef67a65f65b9fcfbd"
  date = "2016-08-23"
strings:
  $s1 = "JSON" nocase
  $s2 = "stringify" nocase
  $s3 = "ScriptEngineBuildVersion" nocase
  $s4 = "ScriptEngineMajorVersion" nocase
  $s5 = "ScriptEngineMinorVersion" nocase
condition:
  all of them
}

rule JS_SIG_ASSEMBLY {
meta:
  author = "Chaoying_Liu"
  sha1 = "17ee5f5132fe94958366f4077b3fae207bfc464c"
  date = "2016-08-26"
strings:
  $s1 = "MOV" nocase
  $s2 = "ECX" nocase
  $s3 = "EAX" nocase
  $s4 = "EDI" nocase
  $s5 = "ESP" nocase
  $s6 = "CALL" nocase
  $s7 = "XCHG" nocase
condition:
  all of them
}

rule JS_VBS_OBFUSCATION {

meta:
    author = "Chaoying_Liu"
    sha1 = "a0cd989936e651e810a8f45860caa37f82f22bab"
    date = "2016-09-20"
strings:
    $r1 = /Chr\(\d{1,5}\)/ nocase
    $s1 = "&"
    $s2 = "execute" nocase
    
condition:
    #r1 > 2000 and #s1 > 2000 and $s2
}

rule JS_SIG_FLASHSHELL {
  meta:
    author = "Chaoying_Liu"
    sha1 = "E3A6B1716DDC0765020F605859EBF757EBAD00FF"
    description = "for pawn storm operation zeroday"
    date = "2016-11-03"
  strings:
    $s1 = "embedSWF" nocase 
    $s2 = "swfobject" nocase
    $r1 = /0x90909090/ nocase
    $r2 = /0x00000000/ nocase
  condition:
    $s1 and $s2 and #r1>250 and #r2>250
}

rule JS_SIG_SCAM_SITE_INTERVAL_A {
meta:
    author = "bo_li"
    date = "2016-11-7"
    wrs_rule = "5"
strings:
    $r0 = /setInterval\(function\(\)\{\s+alert/ nocase
condition:
    $r0
}

rule JS_SIG_SCAM_SITE_INTERVAL_B {
meta:
    author = "bo_li"
    date = "2016-11-7"
    wrs_rule = "5"
strings:
    $s0 = "window.setInterval(function(){msg_ch()}" nocase
condition:
    $s0
}

rule JS_SIG_SCAM_SITE_ALERT_A {
meta:
    author = "bo_li"
    date = "2016-11-7"
    wrs_rule = "4;6;13;14;15"
strings:
    $r0 = /\balert\s{0,3}\(/
condition:
    $r0
}

rule JS_SIG_SCAM_SITE_TWOFUNCTION_A {
meta:
    author = "bo_li"
    date = "2016-11-7"
    wrs_rule = "12"
strings:
    $s0 = "function alertLoop()\n\t\t\t{\n\t\t\t\tfor (i = 0; i < 500; i++)\n\t\t\t\t{\n\t\t\t\t\talertCall();" nocase
    $s1 = "function alertCall()" nocase
condition:
    all of them
}