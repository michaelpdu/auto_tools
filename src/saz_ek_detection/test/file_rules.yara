
rule test_file{
    strings:
        $r3 = {69 3E 35 07 03 0F 53 C6 45 83 F9}
    condition:
        $r3
}