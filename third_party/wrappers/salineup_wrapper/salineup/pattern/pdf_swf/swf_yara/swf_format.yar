rule SWF_CVE_2007_0071 {
  strings:
    $s = "swf_parser_cve_2007_0071"
  condition:
    $s
}

rule SWF_CVE_2011_0611 {
  strings:
    $s = "swf_parser_cve_2011_0611"
  condition:
    $s
}


rule SWF_FORMAT_HEU_PE_IN_BINARY_DATA {
  strings:
    $s = "Find PE in binary data"
  condition:
    $s
}

rule SWF_FORMAT_HEU_SWF_IN_BINARY_DATA {
  strings:
    $s = "Find SWF in binary data"
  condition:
    $s
}

rule SWF_FORMAT_HEU_SUSPICIOUS_CODE_IN_BINARY_DATA {
  strings:
    $s = "Find suspicious code in binary data"
  condition:
    $s
}

rule SWF_FORMAT_EOE_HIDDEN_IFRAME {
  strings:
    $s1 = "EndOfEnd"
    $s2 = /iframe\s+src.+?(width|height)[\s\S]{1,5}0/
  condition:
    $s1 and $s2
}

rule SWF_FORMAT_EOE_OUTER_JAVASCRIPT {
  strings:
    $s1 = "EndOfEnd"
    $s2 = /script\s+src/
  condition:
    $s1 and $s2
}

rule SWF_DEBUG_SMALL_SIZE_ABC_CODE {
  strings:
    $s = "ABC code size is small"
  condition:
    $s
}

rule SWF_CVE_2012_1535 {
  strings:
    $s = "pspop_checker_cve_2012_1535"
  condition:
    $s
}

rule SWF_FORMAT_CVE_2014_0515 {
  strings:
	$s = /meta\s*"defaultValue",[\s,\d\.]*\de-\d+,[\s\d\.]*\de-\d+/
  condition:
    $s
}