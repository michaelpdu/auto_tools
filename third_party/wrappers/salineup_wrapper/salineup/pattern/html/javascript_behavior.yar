rule JSB_ADODB_KEYWORDS {
meta:
  author = "MD"
  description = "classification rule for Script Malware"
strings:
  $s1 = "CreateObject" nocase
  $s2 = "ADODB.Stream" nocase
  $s3 = "SaveToFile" nocase
  $s4 = "LoadFromFile" nocase
condition:
  $s1 and $s2 and ($s3 or $s4)
}

rule JSB_HTTP_REQUEST_ADODB {
meta:
  author = "MD"
  description = "classification rule for Script Malware which cannot execute to end"
strings:
  $s1 = "window.eval" nocase
  $s2 = "[XMLHttpRequest] open HTTP request" nocase
  $s3 = "[WScript.Shell] ExpandEnvironmentStrings" nocase
condition:
  all of ($s*) and JSB_ADODB_KEYWORDS
}

rule JSB_EXPANDENV_TEMP_CHARCODEAT {
meta:
  description = "Rule for classification"
  author = "michael_du"
  date = "2016-09-09"
strings:
  $s1 = "create WScript.Shell" nocase
  $s2 = "ExpandEnvironmentStrings, path = %TEMP%" nocase
  $s3 = "ExpandEnvironmentStrings.charCodeAt(\"1\"" nocase
condition:
  all of them
}

rule JSB_CREATEXOBJECT_DCC {
meta:
  description = "Rule for classification"
  author = "michael_du"
  date = "2016-09-09"
strings:
  $s1 = "Create ActiveXObject: dcc" nocase
condition:
  all of them
}

rule JSB_CHECK_FILE_EXISTS {
meta:
  description = "Rule for classification"
  author = "michael_du"
  date = "2016-09-12"
strings:
  $s1 = "[FileSystemObject] File exists:" nocase
condition:
  #s1 >= 5
}

rule JSB_STDIN_COLUMN {
meta:
  description = "Rule for classification"
  author = "michael_du"
  date = "2016-09-12"
strings:
  $s1 = "[WScript] get StdIn property" nocase
  $s2 = "[Text.Stream] get Column property" nocase
condition:
  $s1 and $s2
}

rule JSB_CALL_SCRIPTENGINE {
meta:
  description = "Rule for classification"
  author = "michael_du"
  date = "2016-09-13"
strings:
  $s1 = "[Window Global] Call ScriptEngine()" nocase
condition:
  $s1
}

rule JSB_SHELL_EXECUTE {
meta:
  description = "Rule for Script Malware, which will execute a local file"
  author = "michael_du"
  date = "2016-12-14"
strings:
  $s1 = "[WScript.Shell] Run!" nocase
  $s2 = "[WScript.Shell] Exec!" nocase
  $s3 = "[Shell.Application] ShellExecute" nocase
condition:
  any of them
}

rule JSB_HTTP_REQUEST {
meta:
  description = "Rule for JS Ransomware, which will send HTTP request to download file"
  SHA1 = "0564D12500D391AD5661325E72DEF774B9BD4FD2"
  author = "michael_du"
  date = "2016-12-14"
strings:
  $s1 = "open HTTP request" nocase
  $s2 = "send HTTP request" nocase
  $s3 = "get HTTP Response Body" nocase
condition:
  all of them
}

rule JSB_ADODB_FILE_OP {
meta:
  description = "Rule for JS Ransomware, which will use ADODB.Stream to save file"
  SHA1 = "0564D12500D391AD5661325E72DEF774B9BD4FD2"
  author = "michael_du"
  date = "2016-12-14"
strings:
  $s1 = "[ADODB.Stream] write content" nocase
  $s2 = "[ADODB.Stream] save to file" nocase
condition:
  all of them
}

//rule JSB_XMLDOCUMENT_FILE_OP {
//meta:
// description = "Rule for JS Ransomware, which will use XML.Document to save file"
//  SHA1 = ""
//  author = "michael_du"
//  date = "2016-12-14"
//strings:
//  $s1 = "" nocase
//  $s2 = "" nocase
//condition:
//  all of them
//}

rule JSB_FILESYSTEM_FILE_OP {
meta:
  description = "Rule for JS Ransomware, which will use FileSystem to save file"
//  SHA1 = ""
  author = "michael_du"
  date = "2016-12-14"
strings:
  $s1 = "[FileSystemObject] Open text file" nocase
  $s2 = "[FileSystemObject] GetFile" nocase
condition:
  all of them
}

rule JSB_HTTP_DOWNLOAD_SAVE {
meta:
  description = "Rule for JS Ransomware, which includes following behaviors: send HTTP request to download and save to file"
  SHA1 = "0564D12500D391AD5661325E72DEF774B9BD4FD2"
  author = "michael_du"
  date = "2016-07-22"
condition:
  JSB_HTTP_REQUEST and (JSB_ADODB_FILE_OP or JSB_FILESYSTEM_FILE_OP)
}

rule JSB_HTTP_DOWNLOAD_SAVE_EXEC {
meta:
  description = "Rule for JS Ransomware, which includes following behaviors: 1. send HTTP request to download and save to file; 2. call WScript.Shell to run this file"
  SHA1 = "0564D12500D391AD5661325E72DEF774B9BD4FD2"
  author = "michael_du"
  date = "2016-07-22"
condition:
  JSB_HTTP_DOWNLOAD_SAVE and JSB_SHELL_EXECUTE
}

rule JSB_HTTP_DOWNLOAD_EXEC {
meta:
  description = "Rule for JS Ransomware, which includes following behaviors: 1. send HTTP request to download, but no behavior to save to file; 2. call WScript.Shell to run this file"
//  SHA1 = ""
  author = "michael_du"
  date = "2016-12-14"
condition:
  JSB_HTTP_REQUEST and JSB_SHELL_EXECUTE
}

rule JSB_HTTP_DOWNLOAD_SAVE_ACCESS_FAKE_BODY {
meta:
  description = "Rule for JS Ransomware, which includes following behaviors: 1. send HTTP request to download and save to file; 2. access fake response body"
  SHA1 = "0564D12500D391AD5661325E72DEF774B9BD4FD2"
  author = "michael_du"
  date = "2016-07-22"
strings:
  $s1 = "[TMSAString] call charCodeAt, return fake value (A)" nocase
condition:
  $s1 and JSB_HTTP_DOWNLOAD_SAVE
}

rule JSB_HTTP_DOWNLOAD_SAVE_LOAD_CONTENT {
meta:
  description = "Rule for JS Ransomware, which includes following behaviors: 1. send HTTP request to download and save to file; 2. load content of saved file"
  SHA1 = "0564D12500D391AD5661325E72DEF774B9BD4FD2"
  author = "michael_du"
  date = "2016-07-22"
strings:
  $s1 = "[ADODB.Stream] Load contents of existing file" nocase
condition:
  $s1 and JSB_HTTP_DOWNLOAD_SAVE
}


//
// SAL rules for exploit detection
//

rule JSB_SHELLCODE_A {
strings:
  $s = "concatshellcode" nocase
condition:
  $s
}

rule JSB_CHECK_SCRIPT_ENGINE_A {
strings:
  $s1 = "call TMSA ScriptEngineBuildVersion()" nocase
  $s2 = "call TMSA ScriptEngineMajorVersion()" nocase
  $s3 = "call TMSA ScriptEngineMinorVersion()" nocase
condition:
  any of them
}


rule JSB_UNESCAPEPARAMTOOLONG_A {
strings:
  $s = "LongUnescape.Dynamic" nocase
condition:
  $s
}

rule JSB_COLLECT_GARBAGE {
strings:
  $s = "_global.CollectGarbage()" nocase
condition:
  $s
}

rule JSB_SHELLCODE_C {
strings:
  $s1 = /unescape\(['"][^)]*%u9090%u9090/ nocase
  $s2 = /unescape\(['"][^)]*%u0505%u0505/ nocase
  $s3 = /unescape\(['"][^)]*%u0c0c%u0c0c/ nocase
  $s4 = /unescape\(['"][^)]*%u0d0d%u0d0d/ nocase
  $s5 = /unescape\(['"][^)]*%u0a0a%u0a0a/ nocase
  $s6 = /unescape\(['"][^)]*%ucccc%ucccc/ nocase
condition:
  (any of ($s*)) and obfuscation >= 1
}

rule JSB_SHELLCODE_D {
strings:
  $r1 = /unescape\(['"][^)]*%u9000%u9090%ucccc/ nocase
  $r2 = /unescape\(['"][^)]*%u1c1c%u1c1c/ nocase
  $r3 = /unescape\(['"][^)]*%u0024%u0c0c/ nocase
  $r4 = /unescape\(['"][^)]*%u001c%u1000/ nocase
  $r5 = /unescape\(['"][^)]*%u9090%u7ceb/ nocase
  $r6 = /unescape\(['"][^)]*%u4141%u4141/ nocase
  $r7 = /unescape\(['"][^)]*%u0000%u0f00/ nocase
condition:
  (any of ($r*)) and obfuscation >= 1
}
rule JSB_SHELLCODE_F {
strings:
  $s1 = "collectgarbage" nocase
  $s2 = /unescape\s*\(\s*['"]%u9090%u9090/ nocase
  $s3 = /unescape\s*\(\s*['"](%u\w{4}){100}/ nocase
condition:
  all of them
}

rule JSB_SHELLCODE_G {
strings:
  $s1 = "_global.unescape(\"%u373f%ufd96%ufc49%u9999%u4749%ud64b" nocase
  $s2 = "%u7dd5%u1c7a%u3991%u6c97%uaf8a%uc397%ue5ab%u8cf9%u6327%u3275%u6bac\"" nocase
  $s3 = "_global.unescape(\"%u0c0c%u0c0c%u0c0c%u0c0c\"" nocase
  $s4 = "_global.ConcatShellCode(\"concatheapsprayslicecode\"" nocase
condition:
  all of them
}

rule JSB_SHELLCODE_H {
strings:
  $s1 = "_global.unescape(\"%u9090%u9090%u5858%u5858%u10eb%u4b5b" nocase
  $s2 = "bd%ubdbd%ubdbd%ubdbd%ubdbd%ueaea\"" nocase
  $s3 = "_global.unescape(\"%u9090%u9090\"" nocase
  $s4 = "document.write(\"Exploit Success" nocase
condition:
  all of them
}

rule JSB_RANDOMNUMBER_D {
strings:
  $r = "eval" nocase
  $s1 = "nextrandomnumber" nocase
  $s2 = "randomnumbergenerator" nocase
  $s3 = "createrandomnumber" nocase
condition:
  $r and (any of ($s*))
}

rule JSB_IFRAMEHIDDEN_D {
strings:
  $s = "eval" nocase
  $r = /document\.createElement\(("|')IFRAME("|')\)[\w\W]{1,300}\.style\.(width|height|visibility)\s*(=|:)\W*(0|none|1|2|hidden)\W[^><]*/ nocase
condition:
  all of them
}

rule JSB_IFRAME_A {
strings:
  $s = "window.eval" nocase
  $r = /document\.getElementsByTagName[\w\W]{1,400}<iframe[^<>]*(width|height)\s*=\s*('|"){0,1}[1-2]?[0-9]\W('|"){0,1}[\w\W]{0,50}visibility:hidden/ nocase  
condition:
  all of them and obfuscation >= 1
}

rule JSB_JSGENERATEAPPLET_A {
strings:
  $r1 = /document\.createElement\(\s*"applet"/ nocase
  $r2 = /document\.applet\.setAttribute\(\s*"archive",\s*"\s*http:\/\// nocase
  $r3 = /document\.applet\.setAttribute\(\s*("width"|"height"),\s*"[0-5]"/ nocase  
condition:
  all of them
}

rule JSB_ROP_A {
strings:
  $s = /unescape\(['"][^)]*%ud801%u77c4/ nocase
condition:
  $s
}

rule JSB_ROP_B {
strings:
  $s = /unescape\(['"][^)]*%u45f8%u7c34/ nocase
condition:
  $s
}

rule JSB_ROP_C {
strings:
  $s = /unescape\(['"][^)]*%ud801%u77bf/ nocase
condition:
  $s
}

rule JSB_CVE_2011_0026_A {
strings:
  $s = "htmlxmlelement.recordset" nocase
  $r = /htmlxmlelement\.CacheSize\("\w{10}/ nocase
condition:
  $s and $r
}

rule JSB_CVE_2008_2463_B {
strings:
  $r1 = /ActiveXObject[\w\W]{0,10}snpvw.snapshot/ nocase
  $r2 = /snpvw\.Snapshot[\w\W]{1,50}\.setAttribute\([^\)]{1,50}http/ nocase
  $r3 = "printsnapshot" nocase
condition:
  all of them
}

rule JSB_CVE_2010_1423_A {
strings:
  $s = "cafeefac-dec7-0000-0000-abcdeffedcba" nocase
  $r = /http: -J-xxaltjvm.*\.jnlp|[\w\W]{0,10}-J[\w\W]{0,10}-jar[\w\W]{0,10}-J[\w\W]{1,300}none[\w\W]{0,10}/ nocase
condition:
  all of them
}

rule JSB_CVE_2010_1423_B {
strings:
  $s = "createElement(\"object" nocase
  $r = /document\.OBJECT\.launch\(\s*"http: -J-xxaltjvm.*\.jnlp|[\w\W]{0,10}-J[\w\W]{0,10}-jar[\w\W]{0,10}-J[\w\W]{1,300}none[\w\W]{0,10}/ nocase
condition:
  all of them
}

rule JSB_GENERIC_Z {
strings:
  $s1 = "0d43fe01-f093-11cf-8940-00a0c9054228" nocase
  $s2 = "f935dc22-1cf0-11d0-adb9-00c04fd58a0b" nocase
condition:
  all of them
}

rule JSB_CVE_2010_4452_A {
strings:
  $r = /file:[^\n]*Java\\jre6\\lib\\ext/ nocase
condition:
  $r
}

rule JSB_CVE_2010_1885_A {
strings:
  $s = "6bf52a52-394a-11d3-b153-00c04f79faa6" nocase
  $r1 = /setAttribute\(\s*"uiMode"\s*,\s*"invisible"/ nocase
  $r2 = /openPlayer\(\s*['"]http/ nocase
condition:
  all of them
}

rule JSB_CVE_2010_1885_B {
strings:
  $r = /hcp:\/\/system\/sysinfo\/sysinfomain\.htm(%A%){1,100}.{0,400}script.{0,10}defer/ nocase
condition:
  $r
}

rule JSB_CVE_2010_1885_D {
strings:
  $s = "hcp://system/sysinfo/sysinfomain.htm" nocase
condition:
  $s
}

rule JSB_BLACKHOLEKIT_A {
strings:
  $s1 = "javaversions" nocase
  $s2 = "adobereader" nocase
  $r = /(function\s+spl\d[^\}]{1,400}\}){4}/ nocase
condition:
  (any of ($s*)) and $r
}

rule JSB_BLACKHOLEKIT_B {
strings:
  $s1 = "window.eval" nocase
  $s2 = "plugindetect" nocase
  $s3 = "findnavplugin" nocase
  $s4 = "getmimeenabledplugin" nocase
  $s5 = "getpluginfileversion" nocase
  $s6 = "x-java-applet" nocase
  $s7 = "javaversions" nocase
condition:
  (all of them) and obfuscation >= 1 
}

rule JSB_BLACKHOLEKIT_F {
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

rule JSB_BLACKHOLEKIT_G {
strings:
  $s1 = "javaversions" nocase
  $s2 = "adobereader" nocase
  $s3 = "plugindetect" nocase
  $r1 = "show_pdf" nocase
  $r2 = "end_redirect" nocase
condition:
  (any of ($s*)) and (all of ($r*)) and obfuscation >= 1
}

rule JSB_BLACKHOLEKIT_H {
strings:
  $s1 = "javaversions" nocase
  $s2 = "adobereader" nocase
  $s3 = "plugindetect" nocase
  $r1 = "check_win" nocase
  $r2 = "is_chrome" nocase
condition:
  (any of ($s*)) and (all of ($r*)) and obfuscation >= 1
}

rule JSB_BLACKHOLEKIT_L {
strings:
  $s1 = "document.object.setAttribute(\"classid\", \"clsid:CA8A9780-280D-11CF-A24D-444553540000\"" nocase
  $s2 = "document.object.setAttribute(\"src\"" nocase
condition:
  all of them
}

rule JSB_COOLEK_C {
strings:
  $s1 = "window.eval" nocase
  $s2 = "getmimeenabledplugin" nocase
  $s3 = "getpluginfileversion" nocase
  $s4 = ".initscript(" nocase
  $s5 = ".getversion(" nocase
  $s6 = ".push(function" nocase
  $r = /\.innerHTML\s*=\s*("|'){0,1}\<object/ nocase
condition:
  all of them
}

rule JSB_RISKACX_B {
strings:
  $s1 = "ADODB.Stream.SaveTofile" nocase
  $s2 = "Shell.Application.ShellExecute" nocase
  $s3 = "WScript.Shell.Run" nocase
condition:
  $s1 and ($s2 or $s3)
}

rule JSB_RISKACX_I {
strings:
  $s1 = "unescape(\"%u9090%u6090%u17eb%u645e%u30a1%u0000%u0500%u0800" nocase
  $r1 = /Internet\.HHCtrl\.1\.setAttribute\("Image", "ActiveX\.[^)]{1,10}RtlAllocateHeapRtlCreateHeap/ nocase
condition:
  all of them
}

rule JSB_RISKACX_J {
strings:
  $s1 = "unescape(\"ddxx%0d%0a%0d%0a%0d%0a%3cscript%20type%3d" nocase
  $s2 = "http%3a%5c%2f%5c%2fs15%2ecnzz%2ecom%5c%2fstat%2ephp%3fid" nocase
  $s3 = "http:\\/\\/js.tongji.linezing.com\\/1461221\\/tongji.js" nocase 
  $s4 = "http:\\/\\/s15.cnzz.com\\/stat.php?id=3656726&web_id=3656726&show=pic" nocase
condition:
  $s1 and $s2 and $s3 and $s4 and obfuscation >= 3
}

rule JSB_RISKACX_K {
strings:
  $s1 = "allowScriptAccess" nocase
  $s2 = "<embed src=\"http://www.wwsb.net.cn/ie.swf" nocase 
  $s3 = "document.writeln(\"<iframe src=../css/reg.htm width=50 height=0></iframe>" nocase
condition:
  all of them
}

rule JSB_RISKACX_L {
strings:
  $s1 = "document.OBJECT.createobject(\"Adodb.Stream\"," nocase
  $s2 = "document.object.setAttribute(\"classid\", \"clsid:BD96C556-65A3-11D0-983A-00C04FC29E36\", )" nocase 
  $s3 = "document.write(\"<iframe src=06014.html>" nocase
condition:
  all of them
}

rule JSB_RISKACX_M {
strings:
  $s1 = "document.write(\"<iframe width=100 height=0 src=flash.htm></iframe>" nocase
  $s2 = "document.write(\"<iframe width=100 height=0 src=office.htm></iframe>" nocase 
  $r1 = /ActiveXObject[\w\W]{0,10}IERPCtl.IERPCtl.1/ nocase
  $r2 = /ActiveXObject[\w\W]{0,10}GLIEDown.IEDown.1/ nocase
condition:
  all of them
}

rule JSB_RISKACX_N {
strings:
  $s1 = "WScript.Shell.run(\"PowerShell (New-Object System.Net.WebClient)" nocase
  $s2 = "DownloadFile('http://newsitesss.co.vu/ASD/infobanner.php?d=LHKLGKHLTKHLJTYIJ6TRIYJITJYIUJHY5IUJHIU5YTUI5T-2.exe" nocase 
  $s3 = "Start-Process 'LHKLGKHLTKHLJTYIJ6TRIYJITJYIUJHY5IUJHIU5YTUI5T-2.exe" nocase
  $r1 = /ActiveXObject[\w\W]{0,10}Microsoft.XMLDOM/ nocase
condition:
  all of them
}

rule JSB_RISKACX_P {
strings:
  $r1 = /ActiveXObject[\w\W]{0,10}WScript.Shell/ nocase
  $s1 = "WScript.Shell.run(\"PowerShell (New-Object System.Net.WebClient).DownloadFile" nocase 
  $s2 = "Start-Process 'LHKLGKHLTKHLJTYIJ6TRIYJITJYIUJHY5IUJHIU5YTUI5T-2.exe'" nocase 
  $s3 = "http://sitenewwwe.co.vu/new/download.php?d=ee85da3e7630759aa9d61eec5ff15a44" nocase
condition:
  all of them
}

rule JSB_RISKACX_Q {
strings:
  $r1 = /ActiveXObject[\w\W]{0,10}WScript.Shell/ nocase
  $r2 = /ActiveXObject[\w\W]{0,10}Scripting.FileSystemObject/ nocase
  $s1 = "WScript.Shell.ExpandEnvironmentStrings(\"%TEMP%\"," nocase
  $s2 = "Scripting.FileSystemObject.OpenTextFile" nocase
  $s3 = "4d5a90000300000004000000ffff0000b8000000000000004000000000000000000" nocase
  $s4 = "Scripting.FileSystemObject.DeleteFile(" nocase
  $s5 = "WScript.Shell.run(\"wscript.exe" nocase
condition:
  all of them
}

rule JSB_CVE_2009_1136_A {
strings:
  $s1 = "owc10.spreadsheet" nocase
  $s2 = "owc11.spreadsheet" nocase
  $r = /\.push\(window\)[\w\W]{1,100}for[\w\W]{1,100}\.Evaluate\(/ nocase
condition:
  ($s1 or $s2) and $r
}

rule JSB_CVE_2008_0624_AB {
strings:
  $s = "5f810afc-bb5f-4416-be63-e01dd117bd6c" nocase
condition:
  $s
}

rule JSB_CVE_2008_0624_A {
strings:
  $r1 = /AddImage\(\s*(\'|\")http:\/\/[^\'\"]{256}/ nocase
  $r2 = /AddButton\(\s*(\'|\")http:\/\/[^\'\"]{256}/ nocase
condition:
  any of them
}

rule JSB_CVE_2012_1889_A {
strings:
  $s1 = "f6d90f11-9c73-11d3-b32e-00c04f990bb4" nocase
  $s2 = "object.definition" nocase
condition:
  all of them
}

rule JSB_CVE_2009_1534_A {
strings:
  $s1 = "0002e510-0000-0000-c000-000000000046" nocase
  $s2 = "0002e511-0000-0000-c000-000000000046" nocase
  $s3 = "0002e512-0000-0000-c000-000000000046" nocase
condition:
  any of them
}

rule JSB_2012_4792_H {
strings:
  $s = "window.eval" nocase
  $r = /document\.createElement\(('|")[a-z]?button('|")\)[\w\W]{0,300}=\s*null[\w\W]{0,300}CollectGarbage/ nocase
condition:
  all of them
}

rule JSB_FSOSTARTUP_A {
strings:
  $r = /Start Menu(\/|\\|\s){0,1}Programs(\/|\\|\s){0,1}Startup(\/|\\|\s){0,1}[\S]{1,255}\.exe/ nocase
condition:
  $r
}

rule JSB_OBJLOADBINARY_A {
strings:
  $s = "c1b7e532-3ecb-4e9e-bb3a-2951ffe67c61" nocase
  $r = /PARAM\s*NAME=\s*('|")\s*propDownloadUrl\s*('|")\s*VALUE\s*=\s*('[^\']{1,400}|"[^\"]{1,400})\.exe/ nocase
condition:
  all of them and obfuscation >= 1
}

rule JSB_CVE_2006_1016_A {
strings:
  $r = /isComponentInstalled\(\s*"\w{256,}[^\(]*",\s*"componentid"/ nocase
condition:
  $r
}

rule JSB_CVE_2012_0003_A {
strings:
  $s1 = "_global.CollectGarbage" nocase
  $s2 = "document.object" nocase
  $s3 = /\.getclassid\("[\w]{1,50}:22d6f312-b0f6-11d0-94ab-0080c74c7e95"/ nocase
  $s4 = /\.play\(/ nocase
condition:
  all of them
}

rule JSB_CVE_2007_5660_A {
strings:
  $s = "e9880553-b8a7-4960-a668-95c68bed571e" nocase
  $r = /\.DownloadAndExecute\([^\)]{1,100}http/ nocase
condition:
  $s and $r
}

rule JSB_CVE_2013_3897_A {
strings:
  $r = /unescape\s*\(\s*['"](%u4141%u4141|%u1414%u1414)/ nocase
condition:
  $r
}

rule JSB_CVE_2013_2551_A {
strings:
  $r = /dashstyle\.array\.setlength\(['"]\-\d+/ nocase
condition:
  $r
}

rule JSB_CVE_2013_2551_B {
strings:
  $s = "[document.namespaces.add] URN:urn:schemas-microsoft-com:vml, URL:#default#VML" nocase
condition:
  $s
}

rule JSB_CVE_2011_2039_A {
strings:
  $s = "55963676-2f5e-4baf-ac28-cf26aa587566" nocase
  $r = /setAttribute\s*\(\s*\"url\",\s*\"http:/ nocase
condition:
  all of them and obfuscation >= 1
}

rule JSB_WEBHMI_A {
strings:
  $s = "clsid:d25fcafc-f795-4609-89bb-5f78b4acaf2c" nocase
  $r = /SetActiveXGUID\s*\(['"].{300,}/ nocase
condition:
  all of them
}

rule JSB_CHECKAV_A {
strings:
  $r1 = /Microsoft\.XMLDOM\.loadXML\([\w\W]{1,80}res:\/\/c:\\Windows\\System32\\drivers\\kl1\.sys[\w\W]{1,80}\)/ nocase
  $r2 = /Microsoft\.XMLDOM\.loadXML\([\w\W]{1,80}res:\/\/c:\\Windows\\System32\\drivers\\tmactmon\.sys[\w\W]{1,80}\)/ nocase
condition:
  all of them
}

rule JSB_CHECKAV_B {
strings:
  $r1 = /Microsoft\.XMLDOM\.loadXML\([\w\W]{1,80}res:\/\/c:\\Windows\\System32\\drivers\\vmmouse\.sys[\w\W]{1,80}\)/ nocase
condition:
  all of them
}

rule JSB_CHECKAV_C {
strings:
  $r1 = /Microsoft\.XMLDOM\.loadXML\([\w\W]{1,80}res:\/\/c:\\Windows\\System32\\drivers\\vboxmouse\.sys[\w\W]{1,80}\)/ nocase
condition:
  all of them
}

rule JSB_CHECKAV_D {
strings:
  $r1 = /window\.eval\([\w\W]{1,500}kaspersky\.ievirtualkeyboardplugin/ nocase
condition:
  all of them
}

rule JSB_CHECKAV_E {
strings:
  $s1 = "kaspersky.ievirtualkeyboardplugin" nocase
  $s2 = "kl1" nocase
  $s3 = "vmmouse" nocase
  $s4 = "vboxmouse" nocase
condition:
  all of them
}

rule JSB_CHECKAV_F {
strings:
  $r1 = /Microsoft\.XMLDOM\.loadXML\([\w\W]{1,80}res:\/\/c:\\Windows\\System32\\drivers\\kl1\.sys[\w\W]{1,80}\)/ nocase
condition:
  all of them
}

rule JSB_CHECKAV_G {
strings:
  $r1 = /Microsoft\.XMLDOM\.loadXML\([\w\W]{1,100}360\\total\s+security\\360base\.dll[\w\W]{1,80}\)/ nocase
condition:
  all of them
}

rule JSB_CHECKAV_H {
strings:
  $r1 = /Microsoft\.XMLDOM\.loadXML\([\w\W]{1,100}malwarebytes\s+anti-exploit\\mbae.sys[\w\W]{1,80}\)/ nocase
condition:
  all of them
}

rule JSB_CHECKAV_I {
strings:
  $r1 = /ActiveXObject[\w\W]{0,10}kaspersky\.ievirtualkeyboardplugin[\w\W]{0,20}/ nocase
condition:
  all of them
}

rule JSB_CHECKAV_J {
strings:
  $s1 = "c:\\\\windows\\\\system32\\\\drivers\\\\tmactmon.sys" nocase
  $s2 = "c:\\\\windows\\\\system32\\\\drivers\\\\tmcomm.sys" nocase
  $s3 = "Microsoft.XMLDOM" nocase
condition:
  ($s1 or $s2) and $s3
}

rule JSB_GONDADY_A {
  strings:
    $r1 = "xiaomaolv" nocase
    $r2 = "gondad" nocase
  condition:
    all of them
}

// please refer to comment in HTML.SPEC.CVE-2010-0480.A
//rule JSB_CVE_2010_0480_A {
//    strings:
//        $s = "22d6f312-b0f6-11d0-94ab-0080c74c7e95" nocase
//        $r = "application/x-mplayer2" nocase
//        $t = ".avi" nocase
//        //$r = /type\s*=\s*['"]\s*application\/x-mplayer2\s*['"][\w\W]{1,100}src\s*=\s*[\w\W]{1,50}\.avi/ nocase
//    condition:
//        all of them
//}

rule JSB_CVE_2003_0344_A {
    strings:
        $s = "<object" nocase
        $t = "type" nocase
        $r = /<object[\w\W]{1,100}type\s*=\s*['"]\/{1,}/ nocase
    condition:
        all of them
}

rule JSB_CVE_2005_4560_A {
    strings:
        $s = /<meta[\w\W]{1,50}http-equiv\s*=\s*['"]refresh['"]\s*content\s*=\s*['"][\w\W]{1,150}\.wmf/ nocase
    condition:
        $s
}

rule JSB_CVE_2008_4844_A {
strings:
  $s1 = "document.write(\"?<XML ID=I>?  <X>?    <C>?      <![CDATA[" nocase
  $s2 = "SRC=\\\\&#8293;&#4919;&#8293;&#4919;&#8293;&#4919;&#8293;&#4919;&#8293;&#4919;.X" nocase
  $s3 = "<DIV DATASRC=#I DATAFLD=C DATAFORMATAS=HTML>?<XML ID=I></XML>?<SPAN DATASRC=#I DATAFLD=C DATAFORMATAS=HTML>" nocase
condition:
  all of them
}

rule JSB_RISK_LANDINGPAGE_A{
strings:
  $s1 = "TypeError: Cannot set property 'dashstyle' of null" nocase
  $s2 = "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" nocase
  $s3 = "application/x-silverlight-2" nocase
  $s4 = "window.eval" nocase
  $r1 = /ActiveXObject[\w\W]{0,10}AgControl.AgControl/ nocase
condition:
  all of them
}

rule JSB_CVE_2008_5492_A {
strings:
	$s1 = "clsid:433268D7-2CD4-43E6-AA24-2188672E7252" nocase
	$s2 = /OpenPDF\(".{1006,}/ nocase
condition:
  all of them
}

rule JSB_CVE_2008_5711_A {
strings:
	$s2 = /setAttribute\("ExtractIptc".{270,}/ nocase
condition:
  all of them
}

rule JSB_CVE_2009_0215_A {
strings:
	$s1 = "IbmEgath.IbmEgathCtl.1" nocase
	$s2 = "concatheapsprayslicecode" nocase
condition:
  all of them	
}

rule JSB_CVE_2009_1612_A {
strings:
	$s1 = "MPS.StormPlayer.1" nocase
	$s2 = "concatheapsprayslicecode" nocase
condition:
  all of them	
}

rule JSB_CVE_2009_3028_A {
strings:
	$s1 = "Altiris.AeXNSPkgDL.1.DownloadAndInstall" nocase
condition:
  all of them	
}

rule JSB_CVE_2009_3033_A {
strings:
	$s1 = "Altiris.AeXNSConsoleUtilities.1" nocase
	$s2 = "concatheapsprayslicecode" nocase
condition:
  all of them	
}

rule JSB_CVE_2009_3693_A {
strings:
	$s1 = "E87F6C8E-16C0-11D3-BEF7-009027438003" nocase
	$s2 = /MakeHttpRequest\(.{5,}\"..\// nocase
condition:
  all of them	
}

rule JSB_Microsoft_WMI_Administration_Tools_ActiveX_A {
strings:
	$s1 = "clsid:2745E5F5-D234-11D0-847A-00C04FD7BB08" nocase
condition:
  all of them
}

rule JSB_HP_Easy_Printer_Care_XMLSimpleAccessor_ActiveX_A {
strings:
	$s1 = "HPESPRIT.XMLSimpleAccessor.1" nocase
condition:
  all of them
}

rule JSB_CVE_2011_2657_A {
strings:
	$s1 = /LaunchHelp\.HelpLauncher\.1\.LaunchProcess\(.{5,}\.exe/ nocase
condition:
  all of them
}

rule JSB_HP_Easy_Printer_Care_XMLCacheMgr_ActiveX_A {
strings:
	$s1 = "HPESPRIT.XMLCacheMgr.1" nocase
condition:
  all of them
}

rule JSB_CVE_2012_0708_A {
strings:
	$s1 = "clsid:94773112-72E8-11D0-A42E-00A024DED613" nocase
	$s2 = "RegisterSchemaRepoFromFileByDbSet" nocase
	$s3 = "LongUnescape.Dynamic" nocase
condition:
  all of them
}

rule JSB_CVE_2012_2516_A {
strings:
	$s1 = /KeyHelp\.KeyScript\.LaunchTriPane\("-decompile.{5,}mof.{5,}\.chm/ nocase
condition:
  all of them
}

rule JSB_CVE_2012_4177_A {
strings:
	$s1 = "clsid:1c492e6a-2803-5ed7-83e1-1b1d4d41eb39" nocase
	$s2 = "-uplay_dev_mode_auto_play" nocase
	$s3 = "-orbit_exe_path" nocase
condition:
  all of them
}

rule JSB_CVE_2012_4598_A {
strings:
	$s1 = "WScript.Shell" nocase
	$s2 = "MVT.MVTControl.6300.GetObject" nocase
condition:
  all of them
}

rule JSB_CVE_2013_0108_A {
strings:
	$s1 = "clsid:0D080D7D-28D2-4F86-BFA1-D582E5CE4867" nocase
	$s2 = "LaunchInstaller" nocase
condition:
  all of them
}


rule JSB_CVE_2013_1559_A {
strings:
	$s1 = "clsid:A200D7A4-CA91-4165-9885-AB618A39B3F0" nocase
	$s2 = /openWebdav\(".{5,}\.hta/ nocase
condition:
  all of them
}

rule JSB_CVE_2013_4798_A {
strings:
	$s1 = "clsid:8D9E2CC7-D94B-4977-8510-FB49C361A139" nocase
	$s2 = /WriteFileString\(\"LrWeb2MdrvLoader\.dll/ nocase
condition:
  all of them
}

rule JSB_CVE_2014_2364_A {
strings:
	$s1 = "clsid:5CE92A27-9F6A-11D2-9D3D-000001155641" nocase
	$s2 = /\.GetColor\(\".{256,}/ nocase
condition:
  all of them
}

rule JSB_HONEYWELL_TEMA_EXEC_A {
strings:
	$s1 = "Tema_RemoteInstaller.RemoteInstaller.DownloadFromURL" nocase
condition:
  all of them
}

rule JSB_SYNACTIS_CONNECTTOSYNACTIS_BOF_A {
strings:
	$s1 = "clsid:C80CAF1F-C58E-11D5-A093-006097ED77E6" nocase
	$s2 = /ConnectToSynactis\(\".{512,}/ nocase
condition:
  all of them
}

rule JSB_X360_VIDEO_PLAYER_SET_TEXT_BOF_A {
strings:
	$s1 = "clsid:4B3476C6-185A-4D19-BB09-718B565FA67B" nocase
	$s2 = /SetText\(\".{512,}/ nocase
condition:
  all of them
}

rule JSB_CVE_2006_5198_A {
	strings:
		$s = "clsid:A09AE68F-B14D-43ED-B713-BA413F034904" nocase
		$r = /\.CreateNewFolderFromName\("[\w\W]{500}/ nocase
	condition:
		$s and $r
}

rule JSB_CVE_2006_6707_A {
	strings:
		$s = "clsid:3E1DD897-F300-486C-BEAF-711183773554" nocase
		$r = /\.TraceTarget\(/ nocase
	condition:
		$s and $r
}

rule JSB_CVE_2008_3878_A {
    strings:
    $s1 = "SyntaxError: Too many arguments in function call (only 32766 allowed)" nocase
    $s2 = "Ultra.OfficeControl" nocase
    $s3 = "_global.unescape(\"%55%6c%74%72%61%2e%4f%66%66%69%63%65%43%6f%6e%74%72%6f%6c\"" nocase
    condition:
        $s1 or $s2 or $s3
}

rule JSB_CVE_2011_2039_B {
	strings:
		$s = "clsid:55963676-2F5E-4BAF-AC28-CF26AA587566" nocase
	condition:
		$s
}

rule JSB_AVENTAIL_EPI_ACTIVEX_A {
  strings:
    $s = "clsid:2A1BE1E7-C550-4D67-A553-7F2D3A39233D" nocase
    $r = /\.AuthCredential/ nocase
  condition:
    $s and $r
}

rule JSB_CISCO_PLAYERPT_SETSOURCE_A {
  strings:
        $s = "clsid:9E065E4A-BD9D-4547-8F90-985DC62A5591" nocase
        $t = /\.SetSource\s*\(("\w*"\s*,){4}\s*"[^"\)]{100}/ nocase
    condition:
        all of them
}

rule JSB_CVE_2003_1336_A {
  strings:
    $r = /<iframe\s+src\s*=\s*['"]irc:\/\/[^>]{200}/ nocase
  condition:
    $r
}

rule JSB_CVE_2004_0636_A {
  strings:
        $r = /aim\s*:\s*goaway\?message\s*=\s*[\w\W]{1024}/ nocase
    condition:
        $r
}

rule JSB_CVE_2006_2086_A {
  strings:
        $s = "CLSID:E5F5D008-DD2C-4D32-977D-1A0ADF03058B" nocase
        $r = /<\s*PARAM\s*NAME\s*=\s*['"]ProductName['"]\s*VALUE\s*=[^>]{100}/ nocase
    condition:
        all of them
}

rule JSB_CVE_2006_3961_A {
  strings:
        $s = "clsid:9BE8D7B2-329C-442A-A4AC-ABA9D7572602" nocase
        $r = "document.getElementById" nocase
        $t = ".IsAppExpired" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{100}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{100}/ nocase
    condition:
        $s and $r and $t and ($r1 or $r2)
}

rule JSB_CVE_2007_0018_A {
strings:
  $s = "clsid:77829F14-D911-40FF-A2F0-D11DB8D6D0BC" nocase
  $r = /\.SetFormatLikeSample\s*\(/ nocase
condition:
  $s and $r
}

rule JSB_CVE_2007_0325_A {
  strings:
        $s = "clsid:08d75bb0-d2b5-11d1-88fc-0080c859833b" nocase
        $r = "document.getElementById" nocase
        $t = ".CgiOnUpdate" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $r and $t and ($r1 or $r2)
}

rule JSB_CVE_2007_0348_A {
  strings:
        $s = "clsid:B727C217-2022-11D4-B2C6-0050DA1BD906" nocase
        $t = ".ApplicationType" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{260}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{260}/ nocase
    condition:
        $s and $t and ($r1 or $r2)
}

rule JSB_CVE_2007_1689_A {
  strings:
        $s = "clsid:BE39AEFD-5704-4BB5-B1DF-B7992454AB7E" nocase
        $r = "document.getElementById" nocase
        $t = ".Get" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $r and $t and ($r1 or $r2)
}

rule JSB_CVE_2007_2918_A {
  strings:
        $s = "clsid:BF4C7B03-F381-4544-9A33-CB6DAD2A87CD" nocase
        $r = "document.getElementById" nocase
        $t = ".Start" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{100}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{100}/ nocase
    condition:
        $s and $r and $t and ($r1 or $r2)
}

rule JSB_CVE_2007_2987_A {
  strings:
        $s = "clsid:59DBDDA6-9A80-42A4-B824-9BC50CC172F5" nocase
        $t = /\.DownloadFile\s*\([^,]{2,300},\s*[^,]{2,300}\.exe/ nocase
    condition:
        all of them
}

rule JSB_CVE_2007_3147_A {
 strings:
  $s = "clsid:DCE2F8B1-A520-11D4-8FD0-00D0B7730277" nocase
  $t1 = /\.server\s*=[\w\W]{100}/ nocase
  $t2 = /\.send\s*\(\s*\)/ nocase 
condition:
  all of them
}

rule JSB_CVE_2007_3435_A {
strings:
  $s = "clsid:c26d9ca8-6747-11d5-ad4b-c01857c10000" nocase
  $r = /\.BeginPrint\(\s*('([^\']){900,}'|"([^\"]){900,}")\s*\)/ nocase
condition:
  all of them
}

rule JSB_CVE_2007_3605_A {
  strings:
        $s = "clsid:2137278D-EF5C-11D3-96CE-0004AC965257" nocase
        $t = ".PrepareToPostHTML" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $t and ($r1 or $r2)
}

rule JSB_CVE_2007_4515_A {
  strings:
        $s = "clsid:D5184A39-CBDF-4A4F-AC1A-7A45A852C883" nocase
        $t = /\.fvcom\s*\(/ nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $t and ($r1 or $r2)
}

rule JSB_CVE_2007_5107_A {
  strings:
        $s = "clsid:5A074B2B-F830-49DE-A31B-5BB9D7F6B407" nocase
        $t = ".ShortFormat" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $t and ($r1 or $r2)
}

rule JSB_CVE_2007_5601_A {
  strings:
        $s = "clsid:FDC7A535-4070-4B92-A0EA-D9994BCC0DC5" nocase
        $r = "document.getElementById" nocase
        $t = /\.Import\s*\([\w\W]{1,50}\.rm/ nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $r and $t and ($r1 or $r2)
}

rule JSB_CVE_2007_5603_A {
   strings:
        $s = "clsid:6EEFD7B1-B26C-440D-B55A-1EC677189F30" nocase
        $r = "document.getElementById" nocase
        $t = ".AddRouteEntry" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $r and $t and ($r1 or $r2)
}

rule JSB_CVE_2007_5660_B {
   strings:
        $s = "clsid:E9880553-B8A7-4960-A668-95C68BED571E" nocase
        $t = ".DownloadAndExecute" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $t and ($r1 or $r2)
}

rule JSB_CVE_2007_5779_A {
strings:
  $s = "clsid:DC07C721-79E0-4BD4-A89F-C90871946A31" nocase
  $r = "document.getElementById" nocase
  $t = "OpenURL" nocase
  $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
  $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
condition:
  $s and $r and $t and ($r1 or $r2)
}

rule JSB_CVE_2007_6530_A {
   strings:
        $s = "clsid:E87F6C8E-16C0-11D3-BEF7-009027438003" nocase
        $t = ".AddFolder" nocase
        $r1 = /new\s+String\s*\(\s*'[^']{500}/ nocase
        $r2 = /new\s+String\s*\(\s*"[^"]{500}/ nocase
    condition:
        $s and $t and ($r1 or $r2)
}

rule JSB_CVE_2008_0492_A {
   strings:
        $s = "clsid:E87F6C8E-16C0-11D3-BEF7-009027438003" nocase
        $t = ".AddFile" nocase
        $r = /unescape\(['"](%u\w{4}){100}/ nocase
    condition:
        all of them
}

rule JSB_CVE_2008_1724_A {
  strings:
        $r = "CLSID:38681fbd-d4cc-4a59-a527-b3136db711d3" nocase
        $t = /\.TransferFile\s*\((\s*['"]\w+['"]\s*,){3}\s*['"][^'")]{500}/ nocase
    condition:
        all of them
}

rule JSB_CVE_2008_2551_B {
  strings:
        $r = /CLSID:c1b7e532-3ecb-4e9e-bb3a-2951ffe67c61/ nocase
        $t = /<OBJECT[^<>]{1,200}(width|height)\s*=\s*['"][0-9]['"][^<>]{1,200}c1b7e532-3ecb-4e9e-bb3a-2951ffe67c61[\w\W]{1,600}NAME\s*=\s*['"]propDownloadUrl['"]\s*VALUE\s*=\s*['"]http[^'"]*\.exe"[\w\W]{1,200}NAME\s*=\s*['"]propPostDownloadAction['"]\s*VALUE\s*=\s*['"]run['"]/ nocase
    condition:
        all of them
}

rule JSB_CVE_2008_2683_A {
  strings:
        $r = "clsid:79956462-F148-497F-B247-DF35A095F80B" nocase
        $a = "vbscript" nocase
    condition:
        all of them
}

rule JSB_CVE_2008_4385_A {
  strings:
        $s = "clsid:67A5F8DC-1A4B-4D66-9F24-A704AD929EEE" nocase
        $r = /.Init\s*\(\s*[\w\W]{1,300}\.exe/ nocase
    condition:
        all of them
}

rule JSB_CVE_2008_4388_A {
  strings:
        $s = "clsid:3356DB7C-58A7-11D4-AA5C-006097314BF8" nocase
        $r = /.installAppMgr\s*\(\s*[\w\W]{1,300}\.exe/ nocase
    condition:
        all of them
}

rule JSB_CVE_2008_4830_A {
  strings:
        $r = "ActiveXObject" nocase
        $s = "Kweditcontrol.KWedit.1" nocase
        $t = /\.Comp_Download\s*\(['"]\s*http:[^'"]{1,}['"]\s*,\s*['"][^'"]{1,}\.exe/ nocase
    condition:
        all of them
}

rule JSB_CVE_2009_0187_A {
strings:
  $s1 = "clsid:3F1D494B-0CEF-4468-96C9-386E2E4DEC90" nocase
  $s2 = ".download" nocase
condition:
  all of them
}

rule JSB_OSVDB_64839_A {
strings:
  $s1 = "f8d07b72-b4b4-46a0-acc0-c771d4614b82" nocase
  $s2 = ".addattachments" nocase
condition:
  all of them
}

rule JSB_CVE_2009_0323_A {
	strings:
		$s1 = /<bdo dir="\w{1000,}/ nocase
	condition:
		all of them	
}


rule JSB_CVE_2009_1568_A {
strings:
  $s1 = "36723f97-7aa0-11d4-8919-ff2d71d0d32c" nocase
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
  $r = /value\s*=\s*('([^']){900}|"([^"]){900})/ nocase
condition:
  (any of ($t*)) and $s1 and $r
}

rule JSB_CVE_2009_2011_A {
	strings:
		$s = "clsid:0AC2706C-8623-46F8-9EDD-8F71A897FDAE" nocase
		
	condition:
		all of them
}

rule JSB_CVE_2009_3031_A {
strings:
  $s1 = "b44d252d-98fc-4d5c-948c-be868392a004" nocase
  $s2 = ".browseandsavefile" nocase
  //$r = /<script[\s\S]*(?!&lt;script)unescape\(.{2500,}\)/ nocase
  $r = /unescape\(\s*(\'|\")\s*(%u\w{4}){400}/ nocase
condition:
  all of them
}

rule JSB_CVE_2009_4850_A {
	strings:
		$s1 = "clsid:17A54E7D-A9D4-11D8-9552-00E04CB09903" nocase
		$s2 = "SceneURL" nocase
		
	condition:
		all of them
}

rule JSB_CVE_2010_1799_A {
	strings:
		$s1 = "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" nocase
		$s2 = ".smil" nocase
	condition:
		all of them
}

rule JSB_CVE_2010_3747_A {
strings:
  $s = "cfcdaa03-8be4-11cf-b84b-0020afbbccfa" nocase
  $r = /<param[\s\n\r\t]+name\s*=\s*('src'|"src")[\s\n\r\t]+value\s*=\s*('cdda:([^\']){900,}'|"cdda:([^\"]){900,}")/ nocase
condition:
  all of them
}

rule JSB_CVE_2011_1774_A {
	strings:
		$s1 = /extension-element-prefixes=\"sx\"/ nocase
		$s2 = /<xsl:variable name=\"\w{1,}"\s*select=\".{1,}\"\/>/ nocase
	condition:
		all of them
}

rule JSB_CVE_2012_2174_A {
	strings:
		$s1 = /notes:\/\/.{1,}-RPARAMS java -vm.{1,}\.exe/ nocase
	condition:
		all of them
}

rule JSB_CVE_2013_2827_A {
	strings:
		$s1 = "clsid:1A90B808-6EEF-40FF-A94C-D7C43C847A9F"
		$s2 = "ProjectURL"
	condition:
		all of them	
}

rule JSB_GREENDAM_URL_A {
	strings:
		$s1 = /window\.setLocation\(".{2035}\.html/ nocase
	condition:
		all of them	
}

rule JSB_REAL_ARCADE_INSTALLERDLG_A {
strings:
  $s = "clsid:5818813E-D53D-47A5-ABBB-37E2A07056B5" nocase
  $r = ".Exec" nocase
condition:
  all of them
}

rule JSB_EMBED_MOV_A {
strings:
  $s = /embed src=\".{3,}\.mov\"/ nocase
condition:
  all of them
}

rule JSB_FIND_SHELLCODE_A {
strings:
  $s = "FindShellcode" nocase
condition:
  all of them
}

rule JSB_CVE_2006_4777_A {
strings:
  $s1 = "FindShellcode" nocase
  $s2 = "DirectAnimation.PathControl" nocase
condition:
  all of them

}

rule JSB_CVE_2011_0065_A {
strings:
  $s1 = "FindShellcode" nocase
  $s2 = "QueryInterface.onChannelRedirect" nocase
condition:
  all of them
}

rule JSB_CVE_2011_0065_B {
  strings:
    $s1 = "onChannelRedirect" nocase
    $s2 = "0x800000" nocase
    $r = /\.QueryInterface\s*\(Components\.interfaces\.nsIChannelEventSink\s*\)\.onChannelRedirect\s*\(/ nocase 
  condition:
    all of them
}
rule JSB_CVE_2006_4777_B {
  strings:
    $r = /ActiveXObject[\w\W]{0,10}DirectAnimation\.PathControl/ nocase
    $s = ".KeyFrame" nocase
  condition:
    all of them
}

rule JSB_CVE_2007_0038_A {
    strings:
        $r = /style\s*=\s*[\w\W]{100,500}[^\w]cuRsoR[^\w][^'"<{:]{100,500}:[\w\W]{100,500}[^\w]url\s*\([\w\W]{100,500}\.[\w]{3}\s*["|'][\w\W]{100,500}\)\s*;/ nocase
    condition:
        $r
}

rule JSB_CVE_2008_4844_C {
strings:
  $r1 = /<object[\s\n\r\t]+classid\s*=\s*('|")[^\'\"]{1,100}\.dll[^\'\"]{1,200}('|")\s*>/ nocase
  $r2 = /window\.location\s*=\s*window\.location\s*\+\s*['|"]\?\d{10}/ nocase
condition:
  all of them
}

rule JSB_CVE_2010_0483_A {
    strings:
        $s = /<script[\w\W]{1,100}vbscript/ nocase
        $r = /MsgBox[\w\W]{1,100}F1/ nocase
    condition:
        all of them
}

rule JSB_CVE_2012_1876_A {
  strings:
    $r1 = /<table\s{0,10}style\s{0,5}=\s{0,5}['"]table-layout:\s{0,5}fixed/ nocase
    $r2 = /document\.getElementById\([^\(|^\)]+\)[\w\W]{0,100}\.width[\w\W]{0,100}\.span/ nocase
  condition:
    all of them 
}

rule JSB_CVE_2012_4969_A{
strings:
  $s = /document\.execCommand\s*\(\s*"\s*selectAll\s*"\s*\)/ nocase
  $r = "document.write" nocase
  $t = /parent\.arrr(\[\d{1,3}\])?\.src/ nocase
condition:
  all of them  
}

rule JSB_CVE_2013_0074_A {
    strings:
        $r = /<object[\w\W]{1,100}type\s*=\s*['"]application\/x-silverlight-2['"][\w\W]{1,100}<param[\w\W]{1,100}\.xap[\w\W]{1,100}<param[\w\W]{1,100}InitParams['"]\s*value\s*=\s*["|']\s*payload\s*=[\w\W]{100,}/ nocase
    condition:
        $r
}

rule JSB_EK_PAGE_B {
strings:
  $r1 = /Microsoft\.XMLDOM\.loadXML[\w\W]{10,100}res:\/\/c:\\Windows\\System32\\drivers\\ksafebootsafe\.sys/ nocase
  $r2 = /Microsoft\.XMLDOM\.loadXML[\w\W]{10,100}res:\/\/c:\\Windows\\System32\\drivers\\ksafebootsafe64\.sys/ nocase
  $r3 = /Microsoft\.XMLDOM\.loadXML[\w\W]{10,100}res:\/\/c:\\Windows\\System32\\drivers\\kisnetm\.sys/ nocase
  $r4 = /Microsoft\.XMLDOM\.loadXML[\w\W]{10,100}res:\/\/c:\\Windows\\System32\\drivers\\kisnetm64\.sys/ nocase
  $r5 = /Microsoft\.XMLDOM\.loadXML[\w\W]{10,100}res:\/\/c:\\Windows\\System32\\drivers\\360netmon\.sys/ nocase
  $r6 = /Microsoft\.XMLDOM\.loadXML[\w\W]{10,100}res:\/\/c:\\Windows\\System32\\drivers\\BAPIDRV\.sys/ nocase
condition:
  all of them
}

rule JSB_AM_TEAM_IFRAMEMULTIDOT_A {
strings:
  $r = /document\.write\("<iframe src\='http:\/\/([a-z0-9]+\.){4,}[a-z]{3,4}\/'[\w\W]{20,25}><\/iframe>", \)/
condition:
  $r
}

rule JSB_EK_DOCUMENT_SCRIPT_SETATTRIBUTE{
  strings:
    $s = /document\.script\.setattribute\(["']res:\/\// nocase
  condition:
    all of them
}


rule JSB_KAIXIN_EK_A {
  strings:
    $s1 = "woyouyizhixiaomaol" nocase
    $s2 = "20130422.class" nocase
    $s3 = "clsid:8ad9c840-044e-11d1-b3e9-00805f499d93" nocase
  condition:
    all of them 
}


rule JSB_CHECK_ENV_A {
  strings:
    $s1 = "AgControl.AgControl" nocase
    $s2 = "malware.dontneedcoffee.com" nocase
    $s3 = "ShockwaveFlash.ShockwaveFlash" nocase
  condition:
    all of them
}

rule JSB_NUCLEAR_EK_A {
  strings:
    $s1 = "AgControl.AgControl" nocase
    $s2 = "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" nocase
    $s3 = "loopVersion" nocase
    $s4 = "appendChild" nocase
    $r1 = /(\d\d\d?\.){50}/ nocase
  condition:
    all of them and obfuscation >= 1
}

rule JSB_UNKNOWN_EK_A {
  strings:
    $r1 = /ActiveXObject[\w\W]{0,10}ShockwaveFlash.ShockwaveFlash/ nocase
    $r2 = /ActiveXObject[\w\W]{0,10}AgControl.AgControl/ nocase
    $s1 = "clsid:CAFEEFAC-DEC7-0000-0001-ABCDEFFEDCBA" nocase
    $s2 = "jvms.getLength" nocase
  condition:
    all of them
}

rule JSB_DBG_KAIXIN_A {
  strings:
    $s1 = "ReferenceError: deconcept is not defined" nocase
  condition:
    all of them
}

rule JSB_DBG_KAIXIN_B {
  strings:
    $s1 = "ReferenceError: ASzcfs is not defined" nocase
  condition:
    all of them
}

rule JSB_AM_TEAM_LOCREPLACE_A {
strings:
  $r = /Location\.replace\("http:\/\/[a-z0-9]{23}\.[\w]+\.[a-z]+\/watch\.php\?[a-z]+=[a-zA-Z0-9]{44}"/
condition:
  $r
}

rule JSB_AM_TEAM_SHARELOC_A {
strings:
	$r1 = /ActiveXObject[\w\W]{0,10}SharePoint.OpenDocuments/ nocase
	$r2 = /window\.setLocation\("http:\/\/[\d\.:]+\/[a-z0-9]+\/search\?o=[a-zA-Z0-9\+\/=]+&[a-z]=[a-zA-Z0-9]+", \)/
condition:
  all of them
}

rule JSB_AM_TEAM_IFWINDOW_A {
strings:
	$s = "_global.Exception(\"?:"
  $r = /is not defined\?if \([a-z]+\)\{function k\(\)\{var [a-z]=[a-z]\(\),[a-z]=document\["createElement"\]\("script"\);/
condition:
  all of them and obfuscation >= 2
}

rule JSB_AM_TEAM_IFWINDOW_B {
strings:
	$r = /_global\.Exception\("\?: 3: SyntaxError: Unexpected token \{\?window\.[a-z]+=true;functiondect\(\)\{this\.[a-z]+=false;\}functioncheck\(txt\)\{varv1="soft\.\?/
condition:
  $r
}

rule JSB_AM_TEAM_SILVERSLED_A {
strings:
	$s1 = "document.write(\"<body><object"
	$s2 = "type='application/x-silverlight-2'"
	$s3 = "value='shell32=909090909090909090909090909090909090909090909090909090"
condition:
  all of them and obfuscation >= 2
}

rule JSB_VBS_CVE_2014_6332_A {
strings:
  $s1 = "on error resume next" nocase
  $r1 = /\w{1,20}\s*=\s*\w{1,20}\s*\+\s*&h8000000[\w\W]{1,300}redim[\w\W]{1,300}redim[\w\W]{1,300}redim\s*preserve\s*\w{1,20}\s*\(s*\w{1,20}\s*\)/ nocase
condition:
  all of them
}

rule JSB_VBS_CVE_2014_6332_B {
strings:
  $s1 = "on error resume next" nocase
  $r1 = /redim[\w\W]{1,300}redim[\w\W]{1,300}redim\s*Preserve / nocase
  $r2 = /\w{1,20}\s*[\+=]\s*&\s*h\d000000/ nocase
  $r3 = /unescape\(['"][^)]*(%u[\da-fA-F]{4}){5}/ nocase
condition:
  $s1 and $r1 and ($r2 or #r3 >= 5)
}

rule JSB_SIG_FLASHSHELL {
meta:
    author = "Chaoying_Liu"
    sha1 = "a0cd989936e651e810a8f45860caa37f82f22bab"
    date = "2016-09-20"
strings:
	$r1 = /type=['"]application\/x-shockwave-flash['"]/
    $s2 = "exec=9090909090909090909090909090909090909090909090909090909090909090909090EB71"
condition:
    all of them
}

rule JSB_SIG_SILVERSHELL {
meta:
    author = "Chaoying_Liu"
    sha1 = "a0cd989936e651e810a8f45860caa37f82f22bab"
    date = "2016-09-20"
strings:
	$r1 = /type=['"]application\/x-silverlight-2['"]/
    $s2 = "shell32=9090909090909090909090909090909090909090909090909090909090909090909090EB71"
condition:
    all of them
}



rule JSB_VBS_CVE_2016_0189_A_exploit {
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

