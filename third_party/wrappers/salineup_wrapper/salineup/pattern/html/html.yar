rule HTML_CVE_2013_0758_A {
strings:
  $s = "<iframe" nocase
  $s = /href\s*=\s*"chrome:\/\// nocase
condition:
  all of them
}

rule HTML_SIG_APPENDCHILD_PO565{
strings:
  $s1 = /appendChild\(po5/ nocase
condition:
  all of them
}

rule HTML_CVE_2009_0187_A {
strings:
  $s1 = "3f1d494b-0cef-4468-96c9-386e2e4dec90" nocase
  $s2 = "download" nocase
  //$r = /<script[\w\W]*(?!&lt;script)new\s+String\(\s*('http:\/\/[^\']{1000,}\.com'|"http:\/\/[^\"]{1000,}\.com")\s*\)/ nocase
  //$r = /new\s+String\(\s*('http:\/\/[^\']{1000,}\.com'|"http:\/\/[^\"]{1000,}\.com")\s*\)/ nocase
  //$r = /new[\w\W]+String\(\s*'http:\/\/([^']{1,3}){300,}\.com'\s*\)/ nocase
  $r = /new[\s\n\r\t]+String\(\s*('http:\/\/([^']){900,}\.com'|"http:\/\/([^"]){900,}\.com")\s*\)/ nocase
  
  
condition:
  all of them
}

rule HTML_CVE_2009_1568_A {
strings:
  $s = "36723f97-7aa0-11d4-8919-ff2d71d0d32c" nocase
  $t1 = "op-client-interface-version" nocase
  $t2 = "op-client-version-info" nocase
  $t3 = "op-client-is-printer-installed" nocase
  $t4 = "op-user-get-role" nocase
  $t5 = "op-printer-install" nocase
  $t6 = "op-printer-remove" nocase
  $t7 = "op-printer-get-status" nocase
  $t8 = "op-printer-get-info" nocase
  $t9 = "op-printer-pause" nocase
  $t10 = "op-printer-resume" nocase
  $t11 = "op-printer-purge-jobs" nocase
  $t12 = "op-printer-list-users-jobs" nocase
  $t13 = "op-printer-list-all-jobs" nocase
  $t14 = "op-printer-send-test-page" nocase
  $t15 = "op-printer-send-file" nocase
  $t16 = "op-printer-setup-install" nocase
  $t17 = "op-job-get-info" nocase
  $t18 = "op-job-hold" nocase
  $t19 = "op-job-release-hold" nocase
  $t20 = "op-job-cancel" nocase
  $t21 = "op-job-restart" nocase
  $t22 = "op-dbg-printer-get-all-attrs" nocase
  $t23 = "op-dbg-job-get-all-attrs" nocase
  $t24 = "target-frame" nocase
  $t25 = "persistence" nocase
  //$r = /<param\s+name\s*=\s*('|")(target-frame|persistence)('|")\s+value\s*=\s*('[^\']{1500,}|"[^\"]{1500,})/ nocase
  $r = /<param[\s\n\r\t]+name\s*=\s*('|")(target-frame|persistence)('|")[\s\n\r\t]+value\s*=\s*('([^']){900}|"([^"]){900})/ nocase
condition:
  (any of ($t*)) and $s and $r
}

rule HTML_CVE_2007_3435_A {
strings:
  $s = "c26d9ca8-6747-11d5-ad4b-c01857c10000" nocase
  //$r = /<script[\s\S]*(?!&lt;script).BeginPrint\(\s*('([^\']{1,3}){300,}'|"([^\"]{1,3}){300,}")\s*\)/ nocase
  //$r = /\.BeginPrint\(\s*('[^\']{1000,}'|"[^\"]{1000,}")\s*\)/ nocase
  $r = /\.BeginPrint\(\s*('([^\']){900,}'|"([^\"]){900,}")\s*\)/ nocase
condition:
  all of them
}

rule HTML_CVE_2009_3031_A {
strings:
  $s1 = "b44d252d-98fc-4d5c-948c-be868392a004" nocase
  $s2 = ".browseandsavefile" nocase
  //$r = /<script[\s\S]*(?!&lt;script)unescape\(.{2500,}\)/ nocase
  $r = /unescape\(\s*(\'|\")\s*(%u\w{4}){400}/ nocase
condition:
  all of them
}

rule HTML_CVE_2010_3552_A {
strings:
  $s1 = "cafeefac-dec7-0000-0000-abcdeffedcba" nocase
  $s2 = "launchjnlp" nocase
  $r = /<PARAM[\s\n\r\t]+name\s*=\s*('docbase'|"docbase")[\s\n\r\t]+value\s*=\s*('([^\']){800,}'|"([^\"]){800,}")/ nocase
condition:
  all of them
}

rule HTML_CVE_2010_3552_B {
strings:
  $s = "launchjnlp" nocase
  $r = /docbase\s*=\s*('([^\']){800,}'|"([^\"]){800,}")/ nocase
condition:
  all of them
}

rule HTML_OSVDB_64839_A {
strings:
  $s1 = "f8d07b72-b4b4-46a0-acc0-c771d4614b82" nocase
  $s2 = ".addattachments" nocase
  //$r = /<script[\s\S]*(?!&lt;script)new\s+\n*String\(\s*('[^\']{1000,}'|"[^\"]{1000,}")\s*\)/ nocase
  $r = /new[\s\n\r\t]+String\(\s*('([^\']){900,}'|"([^\"]){900,}")\s*\)/ nocase
condition:
  all of them
}

rule HTML_CVE_2009_3867_A {
strings:
  $s1 = "archive" nocase
  $s2 = "applet" nocase
  $s3 = "90909090" nocase
  $r = /<param[\s\n\r\t]+name\s*=\s*('sc'|"sc")[\s\n\r\t]+value\s*=\s*('[^\']{380,}'|"[^\"]{380,}")/ nocase
condition:
  all of them
}

rule HTML_CVE_2008_5353_A {
strings:
  $s1 = "archive" nocase
  $s2 = "applet" nocase
  $s3 = ".jar" nocase
  //$r = /<param\s+name\s*=\s*(('(data|jar)')|("(data|jar)"))\s+value\s*=\s*('([^\']{1,20}){200,}'|"[^\"]{8000,}")/ nocase
  $r = /<param[\s\n\r\t]+name\s*=\s*(('(data|jar)')|("(data|jar)"))[\s\n\r\t]+value\s*=\s*('([^\']){900}|"([^\"]){900})/ nocase
condition:
  all of them
}

rule HTML_CVE_2010_0805_A {
strings:
  $s1 = "333c7bc4-460f-11d0-bc04-0080c7055a83" nocase
  $s2 = "dataurl" nocase
  $s3 = "unescape" nocase
  $r = /%u0c0c%u0c0c|%u0d0d%u0d0d|%u0a0a%u0a0a|\\x0c\\x0c\\x0c\\x0c|\\x0d\\x0d\\x0d\\x0d|\\x0a\\x0a\\x0a\\x0a/ nocase
condition:
  all of them
}

rule HTML_CVE_2010_3747_A {
strings:
  $s = "cfcdaa03-8be4-11cf-b84b-0020afbbccfa" nocase
  $r = /<param[\s\n\r\t]+name\s*=\s*('src'|"src")[\s\n\r\t]+value\s*=\s*('cdda:([^\']){900,}'|"cdda:([^\"]){900,}")/ nocase
condition:
  all of them
}

rule HTML_CVE_2010_4452_B {
strings:
  $r = /<applet[\s\n\r\t]+codebase\s*=\s*('file:[^\n\']*java\\jre6\\lib\\ext'|"file:[^\n\"]*java\\jre6\\lib\\ext")/ nocase
condition:
  $r
}

rule HTML_CVE_2010_1885_C {
strings:
  $s = "6bf52a52-394a-11d3-b153-00c04f79faa6" nocase
  //$r = /<script[\s\S]*(?!&lt;script)\.setAttribute\(\s*('uiMode'|"uiMode")[^\)]+('invisible'|"invisible")\s*\)[\s\S]*\.openPlayer/ nocase
  $r = /\.setAttribute\(\s*('uiMode'|"uiMode")[^\)]+('invisible'|"invisible")\s*\)[\w\W]*\.openPlayer/ nocase
condition:
  all of them
}

rule HTML_CVE_2009_0950_A {
strings:
  $r = /document\.location\.assign\(('itms:\/\/([^\']){500,}'|"itms:\/\/([^\"]){500,}")\)/ nocase
condition:
  $r
}

rule HTML_CVE_2010_1799_A {
strings:
  $r = /<img\s*src\s*=\s*"HLgcO:\/\/([^\"]){900,}/ nocase
condition:
  $r
}

rule HTML_CVE_2008_2551_A {
strings:
  $r = /<OBJECT[^<>]{1,200}(width|height)\s*=\s*[0-9][^<>]{1,200}c1b7e532-3ecb-4e9e-bb3a-2951ffe67c61[\w\W]{1,400}NAME\s*=\s*('|")propDownloadUrl('|")\s*VALUE\s*=\s*('|")http[^\'\"]*\.exe"[\w\W]{1,200}NAME\s*=\s*('|")propPostDownloadAction('|")\s*VALUE\s*=\s*('|")run('|")/ nocase
condition:
  $r
}

rule HTML_CVE_2008_4844_A {
strings:
  $r = /<xml[\s]+id[\s]*=[\s]*i>[\s]*<x>[\s]*<c>[\w\W]{1,20}image[\s]+src[\s]*=/ nocase
condition:
  $r
}

rule HTML_CVE_2008_4844_B {
strings:
  $r = /<object[\s\n\r\t]+classid\s*=\s*('|")[^\'\"]{1,100}\.dll[^\'\"]{1,200}('|")\s*>/ nocase
condition:
  $r
}

rule HTML_CVE_2008_4844_C {
strings:
  $r1 = /<object[\s\n\r\t]+classid\s*=\s*('|")[^\'\"]{1,100}\.dll[^\'\"]{1,200}('|")\s*>/ nocase
  $r2 = /window\.location\s*=\s*window\.location\s*\+\s*['|"]\?\d{10}/ nocase
condition:
  all of them
}
rule HTML_CVE_2004_1043_A {
strings:
  $s = "adb880a6-d8ff-11cf-9377-00aa003b7a11" nocase
  $r = /windows[\w\W]{1,10}pchealth[\w\W]{1,10}helpctr[\w\W]{1,10}system/ nocase
condition:
  $s and $r
}

rule HTML_SMALLWINDOWSIZE_C {
strings:
  $r = /<(applet|object)[\w\W]{1,200}(archive|codebase|data)[\w\W]{10,80}\.(in|info|tk|cc|cu|to)\/[\w\W]{1,200}(width|height)[\s]*=[\s]*('|"){0,1}[0-9]\W('|"){0,1}/ nocase
condition:
  $r
}

rule HTML_CVE_2008_3008_A {
strings:
  $s = "A8D3AD02-7508-4004-B2E9-AD33F087F43C" nocase
  $r = "getdetailsstring" nocase
condition:
  $s and $r
}

rule HTML_CVE_2008_1472_A {
strings:
  $s = "BF6EFFF3-4558-4C4C-ADAF-A87891C5F3A3" nocase
  $r = ".addcolumn" nocase
condition:
  $s and $r
}

rule HTML_CVE_2008_1309_A {
strings:
  $s = "2F542A2E-EDC9-4BF7-8CB1-87C9919F7F93" nocase
  $r = ".console" nocase
condition:
  $s and $r
}

rule HTML_CVE_2008_0624_B {
strings:
  $s = "5f810afc-bb5f-4416-be63-e01dd117bd6c" nocase
  $r = /\.(addbutton|addimage)\(\s*(\'|\")http:\/\// nocase
condition:
  $s and $r
}

rule HTML_CVE_2007_5779_A {
strings:
	$s = "clsid:DC07C721-79E0-4BD4-A89F-C90871946A31" nocase
	$r = "document.getElementById" nocase
	$t = "OpenURL" nocase
	$r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
	$r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
condition:
	$s and $r and $t and ($r1 or $r2)
}

rule HTML_CVE_2007_4336_A {
strings:
  $s = "201EA564-A6F6-11D1-811D-00C04FB6BD36" nocase
  $r = ".reload" nocase
condition:
  $s and $r
}

rule HTML_OSVDB_54706 {
strings:
  $s = "fe0bd779-44ee-4a4b-aa2e-743c63f2e5e6" nocase
  $r = ".convertfile" nocase
condition:
  $s and $r
}

rule HTML_CVE_2005_2265_A {
strings:
  $r = /InstallVersion[\s\)]\.compareTo\(\s*new/ nocase
condition:
  $r
}

rule HTML_CVE_2007_2222_A {
strings:
  $s = "eee78591-fe22-11d0-8bef-0060081841de" nocase
  $r = ".findengine" nocase
condition:
  $s and $r
}

rule HTML_CVE_2007_0018_A {
strings:
  $s = "clsid:77829F14-D911-40FF-A2F0-D11DB8D6D0BC" nocase
  $r = /\.SetFormatLikeSample\s*\(/ nocase
condition:
  $s and $r
}

rule HTML_IE8ZERODAYYMJF_A {
strings:
  $s = "document.execcommand" nocase
  $r = /src[\w\W]{0,10}=\s*['"]YMjf\\u0c08\\u0c0cKDogjsiIejengNEkoPDjfiJDIWUAzdfghjAAuUFGGBSIPPPUDFJKSOQJGH['"]/ nocase
condition:
  $s and $r
}

rule HTML_PDFINIFRAME_A {
strings:
  $r = /<iframe[^>]*src\s*=\s*('|"){0,1}\w*\.(pdf)\s*('|"){0,1}[^>]*(width|height)\s*=\s*('|"){0,1}[0-9]\W('|"){0,1}/ nocase
condition:
  $r
}

rule HTML_PDFINIFRAME_B {
strings:
  $r = /<iframe[^>]*(width|height)\s*=\s*('|"){0,1}[0-9]\W('|"){0,1}[^>]*src\s*=\s*('|"){0,1}\w*\.pdf\s*('|"){0,1}/ nocase
condition:
  $r
}

rule HTML_DMAC_A {
strings:
  $r = /<applet[^>]*>\s*<param\s*name\s*=\s*('|"){0,1}(dmac|msize)('|"){0,1}[^>]*value\s*=\s*('|"){0,1}[\w]*[?%:]/ nocase
condition:
  $r
}

rule HTML_INCOGNITO_A {
strings:
  $r = /<applet[^>]*archive\s*=\s*('|"){0,1}[^'">]*osa\.pl\/[^'">]*('|"){0,1}/ nocase
condition:
  $r
}

rule HTML_INCOGNITO_B {
strings:
  $r = /<applet[^>]*>\s*<param\s*name\s*=\s*('|"){0,1}[0-9a-f]{8,8}('|"){0,1}[^>]*value\s*=\s*('|"){0,1}[0-9a-f]{32,32}('|"){0,1}/ nocase
condition:
  $r
}

rule HTML_INCOGNITO_C {
strings:
  $r = /<applet[^>]*>\s*<param[^>]*>\s*<param[^>]*value\s*=\s*('|"){0,1}7GGm3aa/ nocase
condition:
  $r
}

rule HTML_CVE_2007_3147_A {
 strings:
	$s = "clsid:DCE2F8B1-A520-11D4-8FD0-00D0B7730277" nocase
	$t1 = /\.server\s*=[\w\W]{100}/ nocase
	$t2 = /\.send\s*\(\s*\)/ nocase	
condition:
	all of them
}

rule HTML_VBS_CVE_2014_6332_A {
strings:
  $s1 = "on error resume next" nocase
  $r1 = /\w{1,20}\s*=\s*\w{1,20}\s*\+\s*&h8000000[\w\W]{1,300}redim[\w\W]{1,300}redim[\w\W]{1,300}redim\s*preserve\s*\w{1,20}\s*\(s*\w{1,20}\s*\)/ nocase
condition:
  all of them
}

rule HTML_VBS_CVE_2014_6332_B {
strings:
  $s1 = "on error resume next" nocase
  $r1 = /redim[\w\W]{1,300}redim[\w\W]{1,300}redim\s*Preserve / nocase
  $r2 = /\w{1,20}\s*\+\s*&\s*h8000000/ nocase
  $r3 = /unescape\(['"][^)]*(%u[\da-fA-F]{4}){5}/ nocase
condition:
  $s1 and $r1 and ($r2 or #r3 >= 5)
}

rule HTML_VBS_CVE_2014_6332_C {
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

rule HTML_VBS_OBFUSCATION_A {
strings:
  $r1 = /language\s*=\s*vbscript/ nocase
  $r2 = /\d{2,4}/ nocase
  $r3 = /For[\w\W]{3,20}To\s*UBound[\w\W]{4,30}Chrw\s*\(\s*eval/ nocase
  $s4 = "document.write" nocase
condition:
  $r1 and #r2 >= 300 and $r3 and $s4
}

rule HTML_VBS_OBFUSCATION_B {
strings:
    $r1 = /language\s*=\s*['"]vbscript/ nocase
    $r2 = /\d{2,4}/ nocase
    $r3 = /For[\w\W]{3,20}LBound[\w\W]*To\s*UBound[\w\W]{4,30}Cstr\s*\(\s*Chr/ nocase
    $s1 = "execute" nocase
  
condition:
    $r1 and #r2 >= 300 and $r3 and $s1
  
}

rule HTML_INJECTED_IFRAME_A {
strings:
  $r1 = /<!--\w{6}--><script type=\"text\/javascript\"\s{1,20}src=\"http:\/\/[\w|\W]{3,200}.php[\w|\W]{0,200}\"><\/script><!--\/\w{6}-->/ nocase
condition:
  $r1
}

rule HTML_CVE_2003_0344_A {
    strings:
        $s = "<object" nocase
        $t = "type" nocase
        $r = /<object[\w\W]{1,100}type\s*=\s*['"]\/{1,}/ nocase
    condition:
        all of them
}

rule HTML_CVE_2007_0038_A {
    strings:
        $r = /style\s*=\s*[\w\W]{100,500}[^\w]cuRsoR[^\w][^'"<{:]{100,500}:[\w\W]{100,500}[^\w]url\s*\([\w\W]{100,500}\.[\w]{3}\s*["|'][\w\W]{100,500}\)\s*;/ nocase
    condition:
        $r
}

// please refer to comment in HTML.SPEC.CVE-2010-0480.A
//rule HTML_CVE_2010_0480_A {
//    strings:
//        $s = "22d6f312-b0f6-11d0-94ab-0080c74c7e95" nocase
//        $r = "application/x-mplayer2" nocase
//        $t = ".avi" nocase
//        //$r = /type\s*=\s*['"]\s*application\/x-mplayer2\s*['"][\w\W]{1,100}src\s*=\s*[\w\W]{1,50}\.avi/ nocase
//    condition:
//        all of them
//}

rule HTML_CVE_2010_0483_A {
    strings:
        $s = /<script[\w\W]{1,100}vbscript/ nocase
        $r = /MsgBox[\w\W]{1,100}F1/ nocase
    condition:
        all of them
}

rule HTML_CVE_2005_4560_A {
    strings:
        $s = /<meta[\w\W]{1,50}http-equiv\s*=\s*['"]refresh['"]\s*content\s*=\s*['"][\w\W]{1,150}\.wmf/ nocase
    condition:
        $s
}

rule HTML_CVE_2013_0074_A {
    strings:
        $r = /<object[\w\W]{1,100}type\s*=\s*['"]application\/x-silverlight-2['"][\w\W]{1,100}<param[\w\W]{1,100}\.xap[\w\W]{1,100}<param[\w\W]{1,100}InitParams['"]\s*value\s*=\s*["|']\s*payload\s*=[\w\W]{100,}/ nocase
    condition:
        $r
}

rule HTML_CVE_2006_3961_A {
	strings:
        $s = "clsid:9BE8D7B2-329C-442A-A4AC-ABA9D7572602" nocase
        $r = "document.getElementById" nocase
        $t = ".IsAppExpired" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{100}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{100}/ nocase
    condition:
        $s and $r and $t and ($r1 or $r2)
}

rule HTML_AVENTAIL_EPI_ACTIVEX_A {
	strings:
		$s = "clsid:2A1BE1E7-C550-4D67-A553-7F2D3A39233D" nocase
		$r = /\.AuthCredential/ nocase
	condition:
		$s and $r
}

rule HTML_CISCO_PLAYERPT_SETSOURCE_A {
	strings:
        $s = "clsid:9E065E4A-BD9D-4547-8F90-985DC62A5591" nocase
        $t = /\.SetSource\s*\(("\w*"\s*,){4}\s*"[^"\)]{100}/ nocase
    condition:
        all of them
}

rule HTML_CVE_2003_1336_A {
	strings:
		$r = /<iframe\s+src\s*=\s*['"]irc:\/\/[^>]{200}/ nocase
	condition:
		$r
}

rule HTML_CVE_2004_0636_A {
	strings:
        $r = /aim\s*:\s*goaway\?message\s*=\s*[\w\W]{1024}/ nocase
    condition:
        $r
}

rule HTML_CVE_2006_2086_A {
	strings:
        $s = "CLSID:E5F5D008-DD2C-4D32-977D-1A0ADF03058B" nocase
        $r = /<\s*PARAM\s*NAME\s*=\s*['"]ProductName['"]\s*VALUE\s*=[^>]{100}/ nocase
    condition:
        all of them
}

rule HTML_CVE_2007_0325_A {
	strings:
        $s = "clsid:08d75bb0-d2b5-11d1-88fc-0080c859833b" nocase
        $r = "document.getElementById" nocase
        $t = ".CgiOnUpdate" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $r and $t and ($r1 or $r2)
}

rule HTML_CVE_2007_0348_A {
	strings:
        $s = "clsid:B727C217-2022-11D4-B2C6-0050DA1BD906" nocase
        $t = ".ApplicationType" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{260}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{260}/ nocase
    condition:
        $s and $t and ($r1 or $r2)
}

rule HTML_CVE_2007_1689_A {
	strings:
        $s = "clsid:BE39AEFD-5704-4BB5-B1DF-B7992454AB7E" nocase
        $r = "document.getElementById" nocase
        $t = ".Get" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $r and $t and ($r1 or $r2)
}

rule HTML_CVE_2007_2918_A {
	strings:
        $s = "clsid:BF4C7B03-F381-4544-9A33-CB6DAD2A87CD" nocase
        $r = "document.getElementById" nocase
        $t = ".Start" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{100}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{100}/ nocase
    condition:
        $s and $r and $t and ($r1 or $r2)
}

rule HTML_CVE_2007_2987_A {
	strings:
        $s = "clsid:59DBDDA6-9A80-42A4-B824-9BC50CC172F5" nocase
        $t = /\.DownloadFile\s*\([^,]{2,300},\s*[^,]{2,300}\.exe/ nocase
    condition:
        all of them
}

rule HTML_CVE_2007_3605_A {
	strings:
        $s = "clsid:2137278D-EF5C-11D3-96CE-0004AC965257" nocase
        $t = ".PrepareToPostHTML" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $t and ($r1 or $r2)
}

rule HTML_CVE_2007_4515_A {
	strings:
        $s = "clsid:D5184A39-CBDF-4A4F-AC1A-7A45A852C883" nocase
        $t = /\.fvcom\s*\(/ nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $t and ($r1 or $r2)
}

rule HTML_CVE_2007_5107_A {
	strings:
        $s = "clsid:5A074B2B-F830-49DE-A31B-5BB9D7F6B407" nocase
        $t = ".ShortFormat" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $t and ($r1 or $r2)
}

rule HTML_CVE_2007_5601_A {
	strings:
        $s = "clsid:FDC7A535-4070-4B92-A0EA-D9994BCC0DC5" nocase
        $r = "document.getElementById" nocase
        $t = /\.Import\s*\([\w\W]{1,50}\.rm/ nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $r and $t and ($r1 or $r2)
}

rule HTML_CVE_2007_5603_A {
	 strings:
        $s = "clsid:6EEFD7B1-B26C-440D-B55A-1EC677189F30" nocase
        $r = "document.getElementById" nocase
        $t = ".AddRouteEntry" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $r and $t and ($r1 or $r2)
}

rule HTML_CVE_2007_5660_A {
	 strings:
        $s = "clsid:E9880553-B8A7-4960-A668-95C68BED571E" nocase
        $t = ".DownloadAndExecute" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $t and ($r1 or $r2)
}

rule HTML_CVE_2007_6530_A {
	 strings:
        $s = "clsid:E87F6C8E-16C0-11D3-BEF7-009027438003" nocase
        $t = ".AddFolder" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $t and ($r1 or $r2)
}

rule HTML_CVE_2008_0492_A {
	 strings:
        $s = "clsid:E87F6C8E-16C0-11D3-BEF7-009027438003" nocase
        $t = ".AddFile" nocase
        $r = /unescape\(['"](%u\w{4}){100}/ nocase
    condition:
        all of them
}

rule HTML_CVE_2008_1724_A {
	strings:
        $r = "CLSID:38681fbd-d4cc-4a59-a527-b3136db711d3" nocase
        $t = /\.TransferFile\s*\((\s*['"]\w+['"]\s*,){3}\s*['"][^'")]{500}/ nocase
    condition:
        all of them
}

rule HTML_CVE_2008_2551_B {
	strings:
        $r = /CLSID:c1b7e532-3ecb-4e9e-bb3a-2951ffe67c61/ nocase
        $t = /<OBJECT[^<>]{1,200}(width|height)\s*=\s*['"][0-9]['"][^<>]{1,200}c1b7e532-3ecb-4e9e-bb3a-2951ffe67c61[\w\W]{1,600}NAME\s*=\s*['"]propDownloadUrl['"]\s*VALUE\s*=\s*['"]http[^'"]*\.exe"[\w\W]{1,200}NAME\s*=\s*['"]propPostDownloadAction['"]\s*VALUE\s*=\s*['"]run['"]/ nocase
    condition:
        all of them
}

rule HTML_CVE_2008_2683_A {
	strings:
        $r = "clsid:79956462-F148-497F-B247-DF35A095F80B" nocase
        $a = "vbscript" nocase
        $b = /\w{1,10}\s*=\s*['"]\s*http:[\w\W]{1,50}\.MOF\s*['"]\s+\w{1,10}\s*=\s*['"]\s*[\w\W]{1,50}\.MOF\s*['"]\s+\w{1,100}\.DownloadImageFileURL/ nocase
        $c = /\w{1,10}\s*=\s*['"]\s*http:[\w\W]{1,50}\.EXE\s*['"]\s+\w{1,10}\s*=\s*['"]\s*[\w\W]{1,50}\.EXE\s*['"]\s+\w{1,100}\.DownloadImageFileURL/ nocase
    condition:
        all of them
}

rule HTML_CVE_2008_4385_A {
	strings:
        $s = "clsid:67A5F8DC-1A4B-4D66-9F24-A704AD929EEE" nocase
        $r = /.Init\s*\(\s*[\w\W]{1,300}\.exe/ nocase
    condition:
        all of them
}

rule HTML_CVE_2008_4388_A {
	strings:
        $s = "clsid:3356DB7C-58A7-11D4-AA5C-006097314BF8" nocase
        $r = /.installAppMgr\s*\(\s*[\w\W]{1,300}\.exe/ nocase
    condition:
        all of them
}

rule HTML_CVE_2008_4830_A {
	strings:
        $r = "ActiveXObject" nocase
        $s = "Kweditcontrol.KWedit.1" nocase
        $t = /\.Comp_Download\s*\(['"]\s*http:[^'"]{1,}['"]\s*,\s*['"][^'"]{1,}\.exe/ nocase
    condition:
        all of them
}

rule HTML_CVE_2009_2011_A {
	strings:
		$s = "clsid:0AC2706C-8623-46F8-9EDD-8F71A897FDAE" nocase
		
	condition:
		all of them
}

rule HTML_CVE_2009_4850_A {
	strings:
		$s1 = "clsid:17A54E7D-A9D4-11D8-9552-00E04CB09903" nocase
		$s2 = "SceneURL" nocase
		
	condition:
		all of them
}


rule HTML_CVE_2011_1774_A {
	strings:
		$s1 = /extension-element-prefixes=\"sx\"/ nocase
		$s2 = /<xsl:variable name=\"\w{1,}"\s*select=\".{1,}\"\/>/ nocase
	condition:
		all of them
}


rule HTML_CVE_2013_2827_A {
	strings:
		$s1 = "clsid:1A90B808-6EEF-40FF-A94C-D7C43C847A9F"
		$s2 = "ProjectURL"
	condition:
		all of them	
}

rule HTML_CVE_2009_0323_A {
	strings:
		$s1 = /<bdo dir="\w{1000,}/ nocase
	condition:
		all of them	
}

rule HTML_CVE_2012_2174_A {
	strings:
		$s1 = /notes:\/\/.{1,}-RPARAMS java -vm.{1,}\.exe/ nocase
	condition:
		all of them
}

rule HTML_CVE_2010_3971_A {
strings:
  $a = /var\s*([\w]{1,100})\s*=\s*unescape/ nocase
  $b = /while\s*\(([\w]{1,200})\.length\s*[^<\)]*<[^\)]*\)\s*\{*\s*([\w]{1,200})\s*\+=\s*([\w]{1,200})/ nocase
  $r = /<object[\s\n\r\t]+classid\s*=\s*('|")[^\'\"]{1,100}\.dll[^\'\"]{1,200}('|")\s*>/ nocase
condition:
  all of them
}

rule HTML_CVE_2012_0003_A {
  strings:
    $s1 = "CLSID:22D6F312-B0F6-11D0-94AB-0080C74C7E95" nocase
    $s2 = ".mid" nocase
    $s3 = "CollectGarbage" nocase
    $s4 = /\.play\(/ nocase
    $s5 = /unescape\(['"](%u\w{4}){100}/ nocase
  condition:
    all of them 
}

rule HTML_CVE_2012_1876_A {
  strings:
    $r1 = /<table\s{0,10}style\s{0,5}=\s{0,5}['"]table-layout:\s{0,5}fixed/ nocase
    $r2 = /document\.getElementById\([^\(|^\)]+\)[\w\W]{0,100}\.width[\w\W]{0,100}\.span/ nocase
  condition:
    all of them 
}

rule HTML_CVE_2013_0025_A {
  strings:
    $r1 = /\.whiteSpace\s*=\s*["|']pre-line["|']/ nocase
    $r2 = /document\.body\.innerHTML\s*=\s*["|']\w{1,}["\"]/ nocase
    $r3 = /\<body\>\s*\<p\>\s*\<\/p\>\s*\<\/body\>/ nocase
  condition:
    all of them
}

rule HTML_CVE_2013_3184_A {
  strings:
    $r1 = /body\.contentEditable\s*=\s*['|"]true['|"];/ nocase
    $r2 = /document\.execCommand\(['|"]SelectAll['|"]\)/ nocase
    $r3 = /document\.execCommand\(['|"]InsertButton['|"]\)/ nocase
    $r4 = /\<body[\w\W]{1,50}[^\w]onmove[^\w]/ nocase
  condition:
    all of them
}

rule HTML_EMBED_MOV_A {
strings:
  $s = /embed src=\".{3,}\.mov\"/ nocase
condition:
  all of them
}

rule HTML_REAL_ARCADE_INSTALLERDLG_A {
strings:
  $s = "clsid:5818813E-D53D-47A5-ABBB-37E2A07056B5" nocase
  $r = ".Exec" nocase
condition:
  all of them
}

rule HTML_CVE_2011_0065_A {
  strings:
    $s1 = "onChannelRedirect" nocase
    $s2 = "0x800000" nocase
    $r = /\.QueryInterface\s*\(Components\.interfaces\.nsIChannelEventSink\s*\)\.onChannelRedirect\s*\(/ nocase 
  condition:
    all of them
}

rule HTML_CVE_2011_2950_A {
  strings:
    $r = /\.qcp[^\w]/ nocase
    $a = /var\s*([\w]{1,100})\s*=\s*unescape/ nocase
    $b = /while\s*\(([\w]{1,200})\.length\s*[^<\)]*<[^\)]*\)\s*\{*\s*([\w]{1,200})\s*\+=\s*([\w]{1,200})/ nocase
  condition:
    all of them
}


rule HTML_AM_TEAM_FLASHMULTIDOT_A {
  strings:
		$r1 = /<html><body><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" allowScriptAccess="always"[\w\W]{18,30}<param name="movie" value="http:\/\/([a-z0-9]+\.){4,}[a-z]{3,4}\/"><param name="play" value="true"><\/object><object type="application\/x-shockwave-flash" data="http:\/\/([a-z0-9]+\.){4,}[a-z]{3,4}\/" allowScriptAccess="always"[\w\W]{18,30}<param name="movie" value="http:\/\/([a-z0-9]+\.){4,}[a-z]{3,4}\/"><param name="play" value="true"><\/object>/
  condition:
    $r1
}

rule HTML_CVE_2015_2419_A {
  strings:
    $s1 = "stringify" nocase
    $s2 = "JSON" nocase
    $s3 = "CollectGarbage" nocase
    $s4 = "window.Froogaloop"
  condition:
    $s1 and $s2 and $s3 and (not $s4) 
}

rule HTML_AM_TEAM_SPACES_TAGS_A {
strings:
  $s1 = " = typeof(location.replace);"
  $r1 = /<html>[ ]+<body>[ ]+<script>[ ]+var [a-z]+/
  $r2 = /; \};[ ]+<\/script>[ ]+<\/body>[ ]+<\/html>/
  $c1 = /<html>[ ]{4,}<body>/
  $c2 = /<body>[ ]{4,}<script>/
  $c3 = /<script>[ ]{4,}var [a-z]+/
  $c4 = /<; \};>[ ]{4,}<\/script>/
  $c5 = /<\/script>[ ]{4,}<\/body>/
  $c6 = /<\/body>[ ]{4,}<\/html>/
condition:
  $s1 and $r1 and $r2 and 3 of ($c1,$c2,$c3,$c4,$c5,$c6)
}

rule HTML_AM_TEAM_MULTIVAR_FLASH_A {
strings:
  $s1 = "classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\""
  $s2 = "codebase=\"http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version="
  $r1 = /<html>\n<body>\n<script>(\s+var [a-z]+ = [0-9]+;)+\n<\/script>\n<object /
  $r2 = / ((<param name="movie")|(<param)) value="[a-zA-Z0-9\/-]+(.html)?"(( name="movie"\/>)|(\/>))\s+<param ((name="bgcolor" value="#ffffff")|(value="#ffffff" name="bgcolor"))\/>\s+<param ((name="allowScriptAccess" value="always")|(value="always" name="allowScriptAccess"))\/>\s+<embed /
  
condition:
  all of them
}

rule HTML_AM_TEAM_REVERSEVBS_A{
  strings:
    $s1 = "txeN emuseR rorrE nO"
    $s2 = ")(edocllehsnur"
    $s3 = ")(edomefastontes"
    $s4 = ")\"EI >rb<\"(etirw.tnemucod"
    $s4 = ")noisreVtni(etirw.tnemucod"
    $s5 = "<script language=\"VBScript\">"
    condition:
    all of them
}

rule HTML_SWFLOADFRAME_A {
  strings:
    $r1 = /^<html><body>\n<SCRIPT>\nvar ([a-z]+=[a-z]+,\n)*?[a-z]+=[a-z]+\.[a-z]+,\n[a-z]+=[a-z]+\.protocol\+"\/\/"\+[a-z]+\.hostname\+"\/";\n[a-z]+\.write(ln)?\('.+\n[a-z]+\.write(ln)?\('.+\n[a-z]+\.write(ln)?\('.+\n<\/script>\n<\/body><\/html>$/ nocase
    $s1 = "('<object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\""
    $s2 = "('<object type=\"application/x-shockwave-flash\""
    $r3 = /[a-z]+\.write(ln)?\('<iframe src="'\+[a-z]+\+'[a-z0-9]+" width="[0-9]{2,3}" height="[0-9]{2,3}"><\/iframe>'\);/
  condition:
    all of them
}

rule HTML_SCRIPTDROPPER_A {
  strings:
    $s1 = "<script type=\"text/vbscript\">" nocase
    $r1 = /<script>\s*var [a-z]+ = ['"]http:\/\/\S+\s*<\/script>/ nocase
    $s2 = "=UnEscape(\"%63%6D%64%2E%65%78%65%20%2F%71%20%2F%63%20%63%64%20%2F%64%20" nocase
    $r3 = /%2E%73%61%76%65%74%6F%66%69%6C%65[0-9a-fA-F%]+?%2E%43%6C%6F%73%65[0-9a-fA-F%]+?%26%26%20%73%74%61%72%74%20%77%73%63%72%69%70%74%20%2F%2F%42%20%2F%2F%45%3A%/
  condition:
    all of them
}

rule HTML_SIG_OBFUSCATION_A {
meta:
  author = "Chaoying_Liu"
  sha1 = "0dd29cfd2d4930a87fa68ac786b2820736aae2e6"
  date = "2016-09-02"
strings:
  $r1 = /as2\("[l\d]{1,100}"\)/
  $r2 = /\/\*\([,\d]{1,20}\)\*\//
  $s1 = "appendChild" nocase
  
condition:
  #r1 > 2000 and #r2 > 3000 and #s1 > 2
}

rule HTML_VBS_CVE_2016_0189_A_exploit {
meta:
  author = "Chaoying_Liu"
  sha1 = "7b07950a8409107341b9db3c63753bd9f58cf49f"
  date = "2016-10-09"
strings:
  $s0 = "vbscript" nocase
  $s1 = "CSng" nocase
  $s2 = "VarType" nocase
  $s3 = "Class_Initialize" nocase
  $r1 = /ReDim\s+Preserve\s+\w{1,10}\s?\(1\s?,\s?1\s?\)/ nocase
  $r2 = /ReDim\s+Preserve\s+\w{1,10}\s?\(1\s?,\s?2000\s?\)/ nocase
  $r3 = /&H134|&H138|&H168|&H174/ nocase
condition:
  all of them
}

rule HTML_SIG_SCAM_SITE_MYFUNCTION_A {
meta:
    author = "bo_li"
    date = "2016-11-7"
    wrs_rule = "1"
strings:
    $s0 = "onload=\"myfunction();\"" nocase
    $s1 = "onclick=\"myfunction();\"" nocase
    $s2 = "onkeydown=\"myfunction();\"" nocase
condition:
    all of them
}

rule HTML_SIG_SCAM_SITE_SENDKEY_A {
meta:
    author = "bo_li"
    date = "2016-11-7"
    wrs_rule = "3"
strings:
    $r0 = /if\s+\(wscript!=null\)\s+\{\s+wscript\.SendKeys\("\{F11\}"\);\s+\}/ nocase
condition:
    all of them
}

rule HTML_SIG_SCAM_SITE_AUTOPLAY_A {
meta:
    author = "bo_li"
    date = "2016-11-7"
    wrs_rule = "4;7;8;16"
strings:
    $s0 = "<audio autoplay=\"autoplay\" loop" nocase
    $s1 = "<audio autoplay loop>" nocase
condition:
    $s0 or $s1
}


rule HTML_SIG_SCAM_SITE_CALL_A {
meta:
    author = "bo_li"
    date = "2016-11-7"
strings:
    $r0 = /\scall\s[^(]/ nocase
condition:
    #r0 > 2
}


rule HTML_SIG_SCAM_SITE_FOXBTN_A {
meta:
    author = "bo_li"
    date = "2016-11-7"
    wrs_rule = "9"
strings:
    $s0 = "<button onclick=\"foxpop()\" id=\"foxbtn\">" nocase
condition:
    $s0
}

