rule RIG_URL_A {
  strings:
    $r1 = /http:\/\/[\w-]+\.[\w-]+\.[\w-]+\/\?[\w-]+=.*/ nocase
    $r2 = /http:\/\/[\w-]+\.[\w-]+\.[\w-]+\/index\.php\?[\w-]+=.*/ nocase
  condition:
    all of them
}


rule Sundown_URL_A {
  strings:
    $r1 = /http:\/\/[\w-]+\.[\w-]+\.[\w-]+\/index\.php\?[\w-]+=.*/ nocase
    $r2 = /http:\/\/[\w-]+\.[\w-]+\.[\w-]+\/\?[\w-]+=.*/ nocase
  condition:
    $r1 and not $r2
}
rule Sundown_URL_B {
    strings:
        $r1 = /http:\/\/[\w-\.]+(?::\d+)?\/new\/e\/[\d\w]+\.swf/
        $r2 = /http:\/\/[\w-\.]+(?::\d+)?\/new\/e\/[\d\w]+\.html/
    condition:
        all of them
}
rule Sundown_URL_C {
    strings:
        $r1 = /http:\/\/[\w-\.]+(?::\d+)?(?:\/[\w\d-]+)+\.swf/ 
        $r2 = /http:\/\/[\w-\.]+(?::\d+)?(?:\/[\w\d-]+)+\/street\d\.php/
    condition:
        all of them
}
rule Sundown_URL_D {
    strings:
        $r1 = /http:\/\/[\w-\.]+(?::\d+)?\/ASD\/private(?:\/[\w\d-]+)+\.swf/
        $r2 = /http:\/\/[\w-\.]+(?::\d+)?\/ASD\/private(?:\/[\w\d-]+)+\.php/
    condition:
        all of them
}
//rule Neutrino_URL_A {
//  strings:
//    $r1 = /http:\/\/\w+\.\w+\.\w+:([\d\w]+\/)+/ nocase 
//    $r2 = /http:\/\/\w+\.\w+\.\w+(\/[\d\w-]+)+/ nocase
//  condition:
//    any of them
//}

rule KaiXin_URL_A {
  strings:
    $s1 = "/swfobject.js" nocase
    $s2 = "/index.htm" nocase
    $s3 = "/main.htm" nocase
    $s4 = "/win.htm" nocase
  condition:
    2 of them
}
