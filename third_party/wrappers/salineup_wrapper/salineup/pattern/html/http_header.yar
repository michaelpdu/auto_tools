rule Neutrino_Exploit_Kit_A {
  strings:
    $s = /url:\S*\/\d{5}\/[a-zA-Z]+\/\d{5}\/[a-zA-Z]+\/.+\//
    $r = "wrs_category:[93]"
    $err = "wrs_category:[-1]"
  condition:
    $s and ($r or $err)
}

rule Angler_Exploit_Kit_A {
  strings:
    $s = /url:\S*\/[\w\-]{25,}\/\?[a-zA-Z]{10,}=\d{15,20}/
  condition:
    $s
}

rule Magnitude_Exploit_Kit_A {
  strings:
    $s = /url:\S*\/\?[a-f0-9]{34,38}/
    $r = "wrs_category:[93]" 
    $err = "wrs_category:[-1]"
  condition:
    $s and ($r or $err)
}

rule Rig_Exploit_Kit_A {
  strings:
    $s = /url:\S*\/\?\w{15}=[\w\-]{100,}/
  condition:
    $s
}
