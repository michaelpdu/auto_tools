/*
    reference: je_decision.ptn
    this file defines java static decision rules by referring private rules of je_scan.yar
*/


//Java Static CVE Rule


rule JAVA_STATIC_CVE_2009_3867_A
{
    strings:
        $s1 = "p10_m_getsoundbank"
        $s2 = "p41_m_parseint"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2009_3867_B
{
    strings:
        $s1 = "p10_m_getsoundbank"
        $s2 = "p42_m_intbufferput"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2009_3867_C
{
    strings:
        $s1 = "p10_m_getsoundbank"
        $s2 = "p53_p_threadsleep"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2009_3867_D
{
    strings:
        $s1 = "p17_i_url"
        $s2 = "p42_m_intbufferput"
        $s3 = "p63_i_stringbuilder"
        $s4 = "p215_i_javafxtruecolor"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2009_3869_A
{
    strings:
        $s1 = "p42_m_intbufferput"
        $s2 = "p90_i_filteredimagesource"
        $s3 = "p103_m_imageconsumersetpixels"
        $s4 = "p113_m_setcolormodel"
        $s5 = "p114_m_setdimensions"
        $s6 = "p224_m_mediatrackeraddimage"
        $s7 = "p225_m_mediatrackerremoveimage"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2010_0094_A
{
    strings:
        $s1 = "p7_m_creatembean"
        $s2 = "p8_m_querymbeans"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2010_0094_B
{
    strings:
        $s1 = "p16_i_fileoutputstream"
        $s2 = "p8_m_querymbeans"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2010_0094_C
{
    strings:
        $s1 = "p7_m_creatembean"
        $s2 = "p50_i_allpermission"
        $s3 = "p81_s_defineclass"
        $s4 = "p104_c_classloader"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2010_0094_D
{
    strings:
        $s1 = "p8_m_querymbeans"
        $s2 = "p15_m_doprivileged"
        $s3 = "p50_i_allpermission"
        $s4 = "p52_i_protectiondomain"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2010_0840_A
{
    strings:
        $s1 = "p1_i_hashset"
        $s2 = "p18_i_jlist"
        $s3 = "p38_m_addcomponent"
        $s4 = "p36_s_setsecuritymanager"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2010_0842_A
{
    strings:
        $s1 = "p2_m_getmididevice"
        $s2 = "p24_m_sequenceropen"
        $s3 = "p25_m_setsequencer"
        $s4 = "p26_m_addsequencereventlistener"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2010_3563_A
{
    strings:
        $s1 = "p91_i_url"
        $s2 = "p92_m_servicemanagerlookup"
        $s3 = "p93_s_policy"
        $s4 = "p94_s_basicservice"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2010_4452_A
{
    strings:
        $s1 = "p81_s_defineclass"
        $s2 = "p52_i_protectiondomain"
        $s3 = "p95_i_protectiondomain"
        $s4 = "p96_i_urlclassloader"
        $s5 = "p97_m_methodinvoke"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2011_3544_A
{
    strings:
        $s1 = "p3_m_getenginebyname"
        $s2 = "p18_i_jlist"
        $s3 = "p39_m_scriptengineeval"
        $s4 = "p38_m_addcomponent"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2011_3544_B
{
    strings:
        $s1 = "p64_m_getenginebyextension"
        $s2 = "p18_i_jlist"
        $s3 = "p39_m_scriptengineeval"
        $s4 = "p38_m_addcomponent"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2011_3544_C
{
    strings:
        $s1 = "p1_i_hashset"
        $s2 = "p18_i_jlist"
        $s3 = "p38_m_addcomponent"
        $s4 = "p37_i_expression"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2011_3544_D
{
    strings:
        $s1 = "p1_i_hashset"
        $s2 = "p18_i_jlist"
        $s3 = "p37_i_expression"
        $s4 = "p30_r_heapsprayshellcode"
        $s5 = "p44_m_getclass"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2011_3544_E
{
    strings:
        $s2 = "p18_i_jlist"
        $s3 = "p38_m_addcomponent"
        $s4 = "p97_m_methodinvoke"
        $s5 = "p98_m_classforname"
        $s6 = "p106_c_url"
        $s7 = "p156_c_scriptengine"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2012_0507_A
{
    strings:
        $s1 = "p4_c_atomicreferencearray"
        $s2 = "p20_m_readobject"
        $s3 = "p44_m_getclass"
        $s4 = "p45_m_getclassloader"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2012_0507_B
{
    strings:
        $s1 = "p4_c_atomicreferencearray"
        $s2 = "p20_m_readobject"
        $s3 = "p44_m_getclass"
        $s4 = "p104_c_classloader"
        $s5 = "p97_m_methodinvoke"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2012_0507_C
{
    strings:
        $s1 = "p20_m_readobject"
        $s2 = "p44_m_getclass"
        $s3 = "p104_c_classloader"
        $s4 = "p97_m_methodinvoke"
        $s5 = "p132_m_concat"
        $s6 = "p98_m_classforname"
        $s7 = "p144_m_getconstructor"
        $s8 = "p145_m_constructornewinstance"
        $s9 = "p146_m_arraynewinstance"
        $s10 = "p133_m_getmethod"
        $s11 = "p105_c_protectiondomain"
        $s12 = "p81_s_defineclass"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2012_0507_D
{
    strings:
        $s1 = "p20_m_readobject"
        $s2 = "p104_c_classloader"
        $s3 = "p97_m_methodinvoke"
        $s4 = "p147_c_certificate"
        $s5 = "p148_s_hw"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2012_0507_E
{
    strings:
        $s1 = "p4_c_atomicreferencearray"
        $s2 = "p13_m_exec"
        $s3 = "p101_m_getresourceasstream"
        $s4 = "p110_m_fieldset"
        $s5 = "p111_m_getsecuritymanager"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2012_0507_F
{
    strings:
        $s1 = "p4_c_atomicreferencearray"
        $s2 = "p20_m_readobject"
        $s3 = "p45_m_getclassloader"
        $s4 = "p128_m_getparameter"
        $s5 = "p147_c_certificate"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2012_4681_A
{
    strings:
        $s1 = "p6_s_suntoolkit"
        $s2 = "p13_m_exec"
        $s3 = "p37_i_expression"
        $s4 = "p110_m_fieldset"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2012_5076_A
{
    strings:
        $s1 = "p14_m_setsecuritymanager"
        $s2 = "p15_m_doprivileged"
        $s3 = "p98_m_classforname"
        $s4 = "p99_m_cnfgetmessage"
        $s5 = "p100_i_noclassdeffounderror"
        $s6 = "p101_m_getresourceasstream"
        $s7 = "p102_m_genericconstructorcreate"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2012_5076_B
{
    strings:
        $s1 = "p13_m_exec"
        $s2 = "p23_m_fileoutputstreamwrite"
        $s3 = "p97_m_methodinvoke"
        $s4 = "p102_m_genericconstructorcreate"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2012_5076_C
{
    strings:
        $s1 = "p14_m_setsecuritymanager"
        $s2 = "p15_m_doprivileged"
        $s3 = "p101_m_getresourceasstream"
        $s4 = "p102_m_genericconstructorcreate"
        $s5 = "p145_m_constructornewinstance"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_0422_A
{
    strings:
        $s1 = "p78_s_context"
        $s2 = "p79_s_generatedclassloader"
        $s3 = "p80_s_createclassloader"
        $s4 = "p81_s_defineclass"
        $s5 = "p82_s_newinstance"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_0422_B
{
    strings:
        $s1 = "p128_m_getparameter"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p131_m_jmbnewmbeanserver"
        $s4 = "p44_m_getclass"
        $s5 = "p132_m_concat"
        $s6 = "p133_m_getmethod"
        $s7 = "p134_m_findclass"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_0422_C
{
    strings:
        $s1 = "p101_m_getresourceasstream"
        $s2 = "p131_m_jmbnewmbeanserver"
        $s3 = "p14_m_setsecuritymanager"
        $s4 = "p134_m_findclass"
        $s5 = "p104_c_classloader"
        $s6 = "p135_m_getmbeaninstantiator"
        $s7 = "p136_m_findvirtual"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_0422_D
{
    strings:
        $s1 = "p104_c_classloader"
        $s2 = "p106_c_url"
        $s3 = "p134_m_findclass"
        $s4 = "p178_c_serializable"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_0422_E
{
    strings:
        $s1 = "p44_m_getclass"
        $s2 = "p20_m_readobject"
        $s3 = "p131_m_jmbnewmbeanserver"
        $s4 = "p134_m_findclass"
        $s5 = "p135_m_getmbeaninstantiator"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_0422_F
{
    strings:
        $s1 = "p97_m_methodinvoke"
        $s2 = "p104_c_classloader"
        $s3 = "p135_m_getmbeaninstantiator"
        $s4 = "p136_m_findvirtual"
        $s5 = "p152_m_jmnewmbeanserver"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_0431_A
{
    strings:
        $s1 = "p78_s_context"
        $s2 = "p79_s_generatedclassloader"
        $s3 = "p83_s_elementfromcomplex"
        $s4 = "p84_s_mbeaninstantiator"
        $s5 = "p85_s_enter"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_0431_B
{
    strings:
        $s1 = "p135_m_getmbeaninstantiator"
        $s2 = "p150_m_classnewinstance"
        $s3 = "p13_m_exec"
        $s4 = "p151_m_elementfromcomplex"
        $s5 = "p152_m_jmnewmbeanserver"
        $s6 = "p80_s_createclassloader"
        $s7 = "p81_s_defineclass"
        $s8 = "p98_m_classforname"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_0431_C
{
    strings:
        $s1 = "p44_m_getclass"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p106_c_url"
        $s4 = "p151_m_elementfromcomplex"
        $s5 = "p152_m_jmnewmbeanserver"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_1493_A
{
    strings:
        $s1 = "p29_m_gc"
        $s2 = "p86_s_specificoffset"
        $s3 = "p87_c_bufferedimage"
        $s4 = "p88_c_colorspace"
        $s5 = "p89_r_colormodel"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_1493_B
{
    strings:
        $s1 = "p29_m_gc"
        $s2 = "p86_s_specificoffset"
        $s3 = "p87_c_bufferedimage"
        $s4 = "p31_r_dotexe"
        $s5 = "p168_c_componentsamplemodel"
        $s6 = "p169_c_colorconvertop"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_1493_C
{
    strings:
        $s1 = "p86_s_specificoffset"
        $s2 = "p87_c_bufferedimage"
        $s3 = "p88_c_colorspace"
        $s4 = "p89_r_colormodel"
        $s5 = "p97_m_methodinvoke"
        $s6 = "p98_m_classforname"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_1493_D
{
    strings:
        $s1 = "p86_s_specificoffset"
        $s2 = "p87_c_bufferedimage"
        $s3 = "p89_r_colormodel"
        $s4 = "p98_m_classforname"
        $s5 = "p111_m_getsecuritymanager"
        $s6 = "p145_m_constructornewinstance"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_1493_E
{
    strings:
        $s1 = "p21_m_openconnection"
        $s2 = "p22_m_getinputstream"
        $s3 = "p87_c_bufferedimage"
        $s4 = "p88_c_colorspace"
        $s5 = "p89_r_colormodel"
        $s6 = "p214_p_colormodelandsamplemodel"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_1493_F
{
    strings:
        $s1 = "p87_c_bufferedimage"
        $s2 = "p88_c_colorspace"
        $s3 = "p89_r_colormodel"
        $s4 = "p104_c_classloader"
        $s5 = "p214_p_colormodelandsamplemodel"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_1493_G
{
    strings:
        $s1 = "p86_s_specificoffset"
        $s2 = "p88_c_colorspace"
        $s3 = "p89_r_colormodel"
        $s4 = "p97_m_methodinvoke"
        $s5 = "p106_c_url"
        $s6 = "p169_c_colorconvertop"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_1493_H
{
    strings:
        $s1 = "p13_m_exec"
        $s2 = "p29_m_gc"
        $s3 = "p87_c_bufferedimage"
        $s4 = "p88_c_colorspace"
        $s5 = "p89_r_colormodel"
        $s6 = "p169_c_colorconvertop"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_1493_I
{
    strings:
        $s1 = "p13_m_exec"
        $s2 = "p86_s_specificoffset"
        $s3 = "p87_c_bufferedimage"
        $s4 = "p88_c_colorspace"
        $s5 = "p89_r_colormodel"
        $s6 = "p104_c_classloader"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2423_A
{
    strings:
        $s1 = "p107_m_fieldget"
        $s2 = "p108_m_invokeexact"
        $s3 = "p109_c_doubletype"
        $s4 = "p110_m_fieldset"
        $s5 = "p111_m_getsecuritymanager"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2423_B
{
    strings:
        $s1 = "p107_m_fieldget"
        $s2 = "p108_m_invokeexact"
        $s3 = "p109_c_doubletype"
        $s4 = "p110_m_fieldset"
        $s5 = "p216_m_findstaticsetter"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2423_C
{
    strings:
        $s1 = "p111_m_getsecuritymanager"
        $s2 = "p216_m_findstaticsetter"
        $s3 = "p221_s_disablesecuritymanager"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2460_A
{
    strings:
        $s1 = "p97_m_methodinvoke"
        $s2 = "p98_m_classforname"
        $s3 = "p209_m_invocationhandlerinvoke"
        $s4 = "p210_c_tracingprovider"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2460_B
{
    strings:
        $s1 = "p97_m_methodinvoke"
        $s2 = "p98_m_classforname"
        $s3 = "p144_m_getconstructor"
        $s4 = "p145_m_constructornewinstance"
        $s5 = "p150_m_classnewinstance"
        $s6 = "p210_c_tracingprovider"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2460_C
{
    strings:
        $s1 = "p78_s_context"
        $s2 = "p79_s_generatedclassloader"
        $s3 = "p81_s_defineclass"
        $s4 = "p111_m_getsecuritymanager"
        $s5 = "p136_m_findvirtual"
        $s6 = "p209_m_invocationhandlerinvoke"
        $s7 = "p210_c_tracingprovider"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2463_A
{
    strings:
        $s1 = "p48_i_statement"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p217_r_writableraster"
        $s4 = "p218_r_alphacomposite"
        $s5 = "p219_r_samplemodel"
        $s6 = "p220_r_compositecontext"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2463_B
{
    strings:
        $s1 = "p107_m_fieldget"
        $s2 = "p145_m_constructornewinstance"
        $s3 = "p217_r_writableraster"
        $s4 = "p218_r_alphacomposite"
        $s5 = "p219_r_samplemodel"
        $s6 = "p220_r_compositecontext"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2465_A
{
    strings:
        $s1 = "p87_c_bufferedimage"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p104_c_classloader"
        $s4 = "p205_i_componentcolormodel"
        $s5 = "p206_i_icccolorspace"
        $s6 = "p207_s_iscompatibleraster"
        $s7 = "p208_i_affinetransformop"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2465_B
{
    strings:
        $s1 = "p96_i_urlclassloader"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p98_m_classforname"
        $s4 = "p205_i_componentcolormodel"
        $s5 = "p206_i_icccolorspace"
        $s6 = "p207_s_iscompatibleraster"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2465_C
{
    strings:
        $s1 = "p48_i_statement"
        $s2 = "p87_c_bufferedimage"
        $s3 = "p97_m_methodinvoke"
        $s4 = "p211_m_createwritableraster"
        $s5 = "p212_m_lookupopfilter"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2465_D
{
    strings:
        $s1 = "p48_i_statement"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p205_i_componentcolormodel"
        $s4 = "p206_i_icccolorspace"
        $s5 = "p207_s_iscompatibleraster"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2013_2465_E
{
    strings:
        $s1 = "p89_r_colormodel"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p98_m_classforname"
        $s4 = "p110_m_fieldset"
        $s5 = "p145_m_constructornewinstance"
        $s6 = "p211_m_createwritableraster"
        $s7 = "p213_m_getdeclaredconstructor"
    condition:
        all of them
}



//--------------------Java Static Generic Rule--------------------

//type confusion rules
rule JAVA_STATIC_HEU_TYPECONFUSION_A
{
    strings:
        $s1 = "p5_p_classloader"
        $s2 = "p81_s_defineclass"
        $s3 = "p44_m_getclass"
        $s4 = "p45_m_getclassloader"
        $s5 = "p52_i_protectiondomain"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_TYPECONFUSION_B
{
    strings:
        $s1 = "p5_p_classloader"
        $s2 = "p81_s_defineclass"
        $s3 = "p44_m_getclass"
        $s4 = "p45_m_getclassloader"
        $s5 = "p145_m_constructornewinstance"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_TYPECONFUSION_C
{
    strings:
        $s1 = "p5_p_classloader"
        $s2 = "p81_s_defineclass"
        $s3 = "p44_m_getclass"
        $s4 = "p45_m_getclassloader"
        $s5 = "p105_c_protectiondomain"
    condition:
        all of them
}


//suspicious securitymanager rules
rule JAVA_STATIC_HEU_SECURITYMANAGER_A
{
    strings:
        $s1 = "p36_s_setsecuritymanager"
        $s2 = "p39_m_scriptengineeval"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_SECURITYMANAGER_B
{
    strings:
        $s1 = "p23_m_fileoutputstreamwrite"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p98_m_classforname"
        $s4 = "p106_c_url"
        $s5 = "p111_m_getsecuritymanager"
        $s6 = "p145_m_constructornewinstance"
        $s7 = "p147_c_certificate"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_SECURITYMANAGER_C
{
    strings:
        $s1 = "p48_i_statement"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p98_m_classforname"
        $s4 = "p106_c_url"
        $s5 = "p111_m_getsecuritymanager"
        $s6 = "p145_m_constructornewinstance"
        $s7 = "p147_c_certificate"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_SECURITYMANAGER_D
{
    strings:
        $s1 = "p45_m_getclassloader"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p98_m_classforname"
        $s4 = "p104_c_classloader"
        $s5 = "p111_m_getsecuritymanager"
        $s6 = "p145_m_constructornewinstance"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_SECURITYMANAGER_E
{
    strings:
        $s1 = "p13_m_exec"
        $s2 = "p45_m_getclassloader"
        $s3 = "p97_m_methodinvoke"
        $s4 = "p104_c_classloader"
        $s5 = "p110_m_fieldset"
        $s6 = "p111_m_getsecuritymanager"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_SECURITYMANAGER_F
{
    strings:
        $s1 = "p14_m_setsecuritymanager"
        $s2 = "p15_m_doprivileged"
        $s3 = "p44_m_getclass"
        $s4 = "p45_m_getclassloader"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_SECURITYMANAGER_G
{
    strings:
        $s1 = "p21_m_openconnection"
        $s2 = "p13_m_exec"
        $s3 = "p14_m_setsecuritymanager"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_SECURITYMANAGER_H
{
    strings:
        $s1 = "p155_m_scripteval"
        $s2 = "p156_c_scriptengine"
        $s3 = "p157_r_setsecuritymanager"
        $s4 = "p13_m_exec"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_SECURITYMANAGER_I
{
    strings:
        $s1 = "p13_m_exec"
        $s2 = "p14_m_setsecuritymanager"
        $s3 = "p23_m_fileoutputstreamwrite"
    condition:
        all of them
}


//generic exec rules
rule JAVA_STATIC_HEU_EXEC_A
{
    strings:
        $s1 = "p21_m_openconnection"
        $s2 = "p13_m_exec"
        $s3 = "p51_i_permission"
        $s4 = "p52_i_protectiondomain"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_EXEC_B
{
    strings:
        $s1 = "p106_c_url"
        $s2 = "p16_i_fileoutputstream"
        $s3 = "p17_i_url"
        $s4 = "p13_m_exec"
        $s5 = "p116_m_reverse"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_EXEC_C
{
    strings:
        $s1 = "p106_c_url"
        $s2 = "p17_i_url"
        $s3 = "p16_i_fileoutputstream"
        $s4 = "p13_m_exec"
        $s5 = "p117_m_charat"
        $s6 = "p124_m_createdbyfoxxy"
        $s7 = "p125_m_substring"
        $s8 = "p126_i_random"
        $s9 = "p127_m_replaceall"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_EXEC_D
{
    strings:
        $s1 = "p106_c_url"
        $s2 = "p17_i_url"
        $s3 = "p21_m_openconnection"
        $s4 = "p16_i_fileoutputstream"
        $s5 = "p23_m_fileoutputstreamwrite"
        $s6 = "p13_m_exec"
        $s7 = "p33_s_fakeoraclejava"
        $s8 = "p128_m_getparameter"
        $s9 = "p129_m_getproperty"
    condition:
        all of them
}


rule JAVA_STATIC_HEU_EXEC_E
{
    strings:
        $s1 = "p16_i_fileoutputstream"
        $s2 = "p13_m_exec"
        $s3 = "p31_r_dotexe"
        $s4 = "p166_c_permissiondataset"
        $s5 = "p167_s_setfullytrusted"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_EXEC_F
{
    strings:
        $s1 = "p147_c_certificate"
        $s2 = "p50_i_allpermission"
        $s3 = "p174_s_fuckkasp11111"
        $s4 = "p13_m_exec"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_EXEC_G
{
    strings:
        $s1 = "p13_m_exec"
        $s2 = "p21_m_openconnection"
        $s3 = "p98_m_classforname"
        $s4 = "p101_m_getresourceasstream"
        $s5 = "p104_c_classloader"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_EXEC_H
{
    strings:
        $s1 = "p13_m_exec"
        $s2 = "p21_m_openconnection"
        $s3 = "p44_m_getclass"
        $s4 = "p45_m_getclassloader"
        $s5 = "p101_m_getresourceasstream"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_EXEC_I
{
    strings:
        $s1 = "p13_m_exec"
        $s2 = "p21_m_openconnection"
        $s3 = "p23_m_fileoutputstreamwrite"
        $s4 = "p136_m_findvirtual"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_EXEC_J
{
    strings:
        $s1 = "p13_m_exec"
        $s2 = "p37_i_expression"
        $s3 = "p98_m_classforname"
        $s4 = "p106_c_url"
        $s5 = "p147_c_certificate"
    condition:
        all of them
}


//generic url rules
rule JAVA_STATIC_HEU_URL_A
{
    strings:
        $s1 = "p50_i_allpermission"
        $s2 = "p52_i_protectiondomain"
        $s3 = "p97_m_methodinvoke"
        $s4 = "p105_c_protectiondomain"
        $s5 = "p106_c_url"
        $s6 = "p147_c_certificate"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_URL_B
{
    strings:
        $s1 = "p17_i_url"
        $s2 = "p21_m_openconnection"
        $s3 = "p23_m_fileoutputstreamwrite"
        $s4 = "p97_m_methodinvoke"
        $s5 = "p98_m_classforname"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_URL_C
{
    strings:
        $s1 = "p21_m_openconnection"
        $s2 = "p23_m_fileoutputstreamwrite"
        $s3 = "p50_i_allpermission"
        $s4 = "p52_i_protectiondomain"
        $s5 = "p178_c_serializable"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_URL_D
{
    strings:
        $s1 = "p81_s_defineclass"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p104_c_classloader"
        $s4 = "p106_c_url"
        $s5 = "p174_s_fuckkasp11111"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_URL_E
{
    strings:
        $s1 = "p16_i_fileoutputstream"
        $s2 = "p17_i_url"
        $s3 = "p44_m_getclass"
        $s4 = "p97_m_methodinvoke"
        $s5 = "p108_m_invokeexact"
        $s6 = "p133_m_getmethod"
        $s7 = "p223_c_integertype"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_URL_F
{
    strings:
        $s1 = "p17_i_url"
        $s2 = "p44_m_getclass"
        $s3 = "p50_i_allpermission"
        $s4 = "p97_m_methodinvoke"
        $s5 = "p98_m_classforname"
        $s6 = "p147_c_certificate"
    condition:
        all of them
}


//suspicious classloader rules
rule JAVA_STATIC_HEU_CLASSLOADER_A
{
    strings:
        $s1 = "p126_i_random"
        $s2 = "p45_m_getclassloader"
        $s3 = "p142_i_bytearrayoutputstream"
        $s4 = "p101_m_getresourceasstream"
        $s5 = "p111_m_getsecuritymanager"
        $s6 = "p63_i_stringbuilder"
        $s7 = "p163_s_defineandcreate"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_CLASSLOADER_B
{
    strings:
        $s1 = "p128_m_getparameter"
        $s2 = "p45_m_getclassloader"
        $s3 = "p44_m_getclass"
        $s4 = "p106_c_url"
        $s5 = "p23_m_fileoutputstreamwrite"
        $s6 = "p21_m_openconnection"
        $s7 = "p97_m_methodinvoke"
        $s8 = "p105_c_protectiondomain"
        $s9 = "p147_c_certificate"
        $s10 = "p52_i_protectiondomain"
        $s11 = "p50_i_allpermission"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_CLASSLOADER_C
{
    strings:
        $s1 = "p5_p_classloader"
        $s2 = "p44_m_getclass"
        $s3 = "p45_m_getclassloader"
        $s4 = "p97_m_methodinvoke"
        $s5 = "p104_c_classloader"
        $s6 = "p110_m_fieldset"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_CLASSLOADER_D
{
    strings:
        $s1 = "p97_m_methodinvoke"
        $s2 = "p98_m_classforname"
        $s3 = "p104_c_classloader"
        $s4 = "p150_m_classnewinstance"
        $s5 = "p167_s_setfullytrusted"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_CLASSLOADER_E
{
    strings:
        $s1 = "p21_m_openconnection"
        $s2 = "p44_m_getclass"
        $s3 = "p45_m_getclassloader"
        $s4 = "p50_i_allpermission"
        $s5 = "p150_m_classnewinstance"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_CLASSLOADER_F
{
    strings:
        $s1 = "p5_p_classloader"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p98_m_classforname"
        $s4 = "p145_m_constructornewinstance"
        $s5 = "p150_m_classnewinstance"
        $s6 = "p222_c_privilegedexceptionaction"
        $s7 = "p223_c_integertype"
    condition:
        all of them
}

//suspicious defineclass rules
rule JAVA_STATIC_HEU_DEFINECLASS_A
{
    strings:
        $s1 = "p104_c_classloader"
        $s2 = "p125_m_substring"
        $s3 = "p50_i_allpermission"
        $s4 = "p52_i_protectiondomain"
        $s5 = "p81_s_defineclass"
        $s6 = "p106_c_url"
        $s7 = "p21_m_openconnection"
        $s8 = "p126_i_random"
        $s9 = "p82_s_newinstance"
        $s10 = "p32_i_thread"
    condition:
        all of them
}


rule JAVA_STATIC_HEU_DEFINECLASS_B
{
    strings:
        $s1 = "p104_c_classloader"
        $s2 = "p147_c_certificate"
        $s3 = "p144_m_getconstructor"
        $s4 = "p105_c_protectiondomain"
        $s5 = "p81_s_defineclass"
        $s6 = "p145_m_constructornewinstance"
        $s7 = "p101_m_getresourceasstream"
        $s8 = "p128_m_getparameter"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_DEFINECLASS_C
{
    strings:
        $s1 = "p31_r_dotexe"
        $s2 = "p147_c_certificate"
        $s3 = "p105_c_protectiondomain"
        $s4 = "p81_s_defineclass"
        $s5 = "p82_s_newinstance"
        $s6 = "p15_m_doprivileged"
        $s7 = "p14_m_setsecuritymanager"
        $s8 = "p23_m_fileoutputstreamwrite"
        $s9 = "p36_s_setsecuritymanager"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_DEFINECLASS_D
{
    strings:
        $s1 = "p44_m_getclass"
        $s2 = "p81_s_defineclass"
        $s3 = "p104_c_classloader"
        $s4 = "p105_c_protectiondomain"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_DEFINECLASS_E
{
    strings:
        $s1 = "p81_s_defineclass"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p98_m_classforname"
        $s4 = "p105_c_protectiondomain"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_DEFINECLASS_F
{
    strings:
        $s1 = "p81_s_defineclass"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p98_m_classforname"
        $s4 = "p104_c_classloader"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_DEFINECLASS_G
{
    strings:
        $s1 = "p37_i_expression"
        $s2 = "p49_i_accesscontrolcontext"
        $s3 = "p50_i_allpermission"
        $s4 = "p52_i_protectiondomain"
        $s5 = "p81_s_defineclass"
    condition:
        all of them
}


//metasploit rules
rule JAVA_STATIC_HEU_METASPLOIT_A
{
    strings:
        $s1 = "p13_m_exec"
        $s2 = "p31_r_dotexe"
        $s3 = "p173_s_metasploitpayload"
    condition:
        all of them
}


//regex rules
rule JAVA_STATIC_HEU_REGEX_A
{
    strings:
        $s1 = "p90_i_filteredimagesource"
        $s2 = "p114_m_setdimensions"
        $s3 = "p113_m_setcolormodel"
        $s4 = "p103_m_imageconsumersetpixels"
        $s5 = "p112_c_indexcolormodel"
        $s6 = "p164_m_compile"
        $s7 = "p165_m_matcher"
    condition:
        all of them
}


//suspicious accesscontrolcontext rules
rule JAVA_STATIC_HEU_ACC_A
{
    strings:
        $s1 = "p37_i_expression"
        $s2 = "p98_m_classforname"
        $s3 = "p150_m_classnewinstance"
        $s4 = "p97_m_methodinvoke"
        $s5 = "p147_c_certificate"
        $s6 = "p105_c_protectiondomain"
        $s7 = "p52_i_protectiondomain"
        $s8 = "p49_i_accesscontrolcontext"
        $s9 = "p145_m_constructornewinstance"
        $s10 = "p82_s_newinstance"
    condition:
        all of them
}

rule JAVA_STATIC_HEU_ACC_B
{
    strings:
        $s1 = "p48_i_statement"
        $s2 = "p49_i_accesscontrolcontext"
    condition:
        all of them
}

//suspicious signature rules
rule JAVA_STATIC_SIG_STRING_A
{
    strings:
        $s1 = "p61_r_aced00057372"
    condition:
        all of them
}

rule JAVA_STATIC_SIG_STRING_B
{
    strings:
        $s1 = "p71_s_specific1"
        $s2 = "p72_s_specific2"
    condition:
        all of them
}

rule JAVA_STATIC_SIG_STRING_C
{
    strings:
        $s1 = "p73_s_specific3"
        $s2 = "p74_s_specific4"
    condition:
        all of them
}

rule JAVA_STATIC_SIG_STRING_D
{
    strings:
        $s1 = "p75_s_specific5"
        $s2 = "p76_s_specific6"
        $s3 = "p77_s_specific7"
    condition:
        all of them
}

rule JAVA_STATIC_SIG_STRING_E
{
    strings:
        $s1 = "p158_s_deserialization1"
        $s2 = "p159_s_deserialization2"
        $s3 = "p160_s_deserialization3"
        $s4 = "p161_s_deserialization4"
    condition:
        all of them
}

rule JAVA_STATIC_SIG_STRING_F
{
    strings:
        $s1 = "p142_i_bytearrayoutputstream"
        $s2 = "p26_m_addsequencereventlistener"
        $s3 = "p170_s_foxjava"
        $s4 = "p171_s_gutjava"
        $s5 = "p172_s_vatjava"
    condition:
        all of them
}

rule JAVA_STATIC_SIG_HW_A
{
    strings:
        $s1 = "p44_m_getclass"
        $s2 = "p63_i_stringbuilder"
        $s3 = "p98_m_classforname"
        $s4 = "p127_m_replaceall"
        $s5 = "p132_m_concat"
        $s6 = "p148_s_hw"
        $s7 = "p162_s_codehex"
    condition:
        all of them
}

rule JAVA_STATIC_SIG_HW_B
{
    strings:
        $s1 = "p148_s_hw"
        $s2 = "p132_m_concat"
        $s3 = "p175_s_n2n2n2n3c"
        $s4 = "p176_s_n2n2n2n3a"
        $s5 = "p177_s_n2n2n2n3d"
        $s6 = "p178_c_serializable"
    condition:
        all of them
}

rule JAVA_STATIC_SIG_HW_C
{
    strings:
        $s1 = "p20_m_readobject"
        $s2 = "p97_m_methodinvoke"
        $s3 = "p106_c_url"
        $s4 = "p127_m_replaceall"
        $s5 = "p139_s_mac"
        $s6 = "p147_c_certificate"
        $s7 = "p148_s_hw"
    condition:
        all of them
}

rule JAVA_STATIC_CVE_2007_2175_A 
{
	strings:
		$s1 = "p226_m_quicktimetoqtpointer"
		$s2 = "p57_s_osname"
		$s3 = "p58_s_window"
		$s4 = "p59_s_system"
	condition:
        all of them
}


