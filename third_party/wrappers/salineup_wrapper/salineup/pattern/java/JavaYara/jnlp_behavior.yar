/*
    this file defines java jnlp rules
*/

//------------------Java JNLP CVE Rule-------------------

rule JAVA_JNLP_CVE_2012_0500_A
{
    strings:
        $s = "java-jnlp-exploit-cve-2012-0500" nocase
    condition:
        $s
}

rule JAVA_JNLP_CVE_2012_1533_A
{
    strings:
        $s = "java-jnlp-exploit-cve-2012-1533" nocase
    condition:
        $s
}
