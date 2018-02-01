rule SPEC_CVE_2015_0313_A
{
    strings:
        $s1 = "Worker.current.isPrimordial"
        $s2 = "Worker.current.createMessageChannel"
        $s3 = "setSharedProperty"
        $s4 = "clear()"
        $s5 = "avm2.intrinsics.memory"
    condition:
        all of them
}

rule DBG_XTIME_A
{
    strings:
        $s1 = "Xtime"
    condition:
        all of them
}

rule DBG_LOADER_A
{
    strings:
        $s1 = "flash.system.LoaderContext"
        $s2 = "flash.display.Loader"
    condition:
        all of them
}

rule TEST_A
{
    strings:
        $s1 = "public"
    condition:
        all of them
}

rule TEST_B
{
    strings:
        $s1 = "return"
    condition:
        all of them
}