rule Neutrino_Content_A {
  strings:
    $s1 = "d27cdb6e-ae6d-11cf-96b8-444553540000" nocase
    $s2 = "allowScriptAccess" nocase
    $s3 = /allowScriptAccess="sameDomain"/ nocase
  condition:
    all of them
}

rule KaiXin_Content_A {
  strings:
    $s1 = "deconcept.SWFObjectUtil" nocase
    $s2 = "VBScript" nocase
  condition:
    any of them
}