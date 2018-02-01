rule SWF_BYTECODE_CVE_2009_1862 {
  strings:
    $s = {a2 30 60 01 02 02 02 02}
  condition:
    $s
}