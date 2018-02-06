
rule Micro{
    strings:
        $r1 = "http://crl3.digicert.com/DigiCertGlobalRootCA.crl"
        $r2 = "http://crl3.digicert.com/ssca-sha2-g4.crl"
    condition:
        $r1 and $r2
}

rule big_m{
    strings:
        $r2 = "http://crl3.digicert.com/DigiCertGlobalRootCA.crl"
    condition:
        $r2
}