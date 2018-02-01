/*
    reference: je_dynamic.ptn
    this file defines java dynamic rules
*/

//------------------Java Dynamic CVE Rule-------------------

rule JAVA_DYN_CVE_2008_5353_A
{
    strings:
        $s = "java-exploit-cve-2008-5353" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_CVE_2009_3867_A
{
    strings:
        $s = "java-exploit-cve-2009-3867" nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2010_0094_A
{
    strings:
        $s = "java-exploit-cve-2010-0094" nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2011_3544_A
{
    strings:
        $s = "java-exploit-cve-2011-3544" nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2012_0507_A
{
    strings:
        $s = "java-exploit-cve-2012-0507" nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2012_0507_B
{
    strings:
        $s1 = "deserialize_object(" nocase
        $r1 = /class\.forname\([\w\W]{0,10}java\/util\/concurrent\/atomic\/atomicreferencearray/ nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_CVE_2012_0507_C
{
    strings:
        $s1 = "deserialize_object(" nocase
        $r1 = /jvm_call exception2\([\w\W]{0,500}java\.util\.concurrent\.atomic\.atomicreferencearray/ nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2012_1723_A
{
    strings:
        $s = "java-exploit-cve-2012-1723" nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2012_4681_A
{
    strings:
        $s = "java-exploit-cve-2012-4681" nocase
    condition:
        all of them
}


rule JAVA_DYN_CVE_2012_5076_A
{
    strings:
        $s = "java-exploit-cve-2012-5076" nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2013_0422_A
{
    strings:
        $s = "java-exploit-cve-2013-0422" nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2013_1493_A
{
    strings:
        $s = "java-exploit-cve-2013-1493" nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2013_2423_A
{
    strings:
        $s1 = "find_static_setter" nocase
        $s2 = "java_lang_double" nocase
        $s3 = "java_lang_integer" nocase
        $s4 = "get_security_manager(" nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2013_2423_B
{
    strings:
        $s1 = "find_static_setter" nocase
        $s2 = "java_lang_double" nocase
        $s3 = "java_lang_integer" nocase
        $r1 = /class\.forname\([\w\W]{0,10}java\/lang\/runtime/ nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2013_2423_C
{
    strings:
        $r1 = /find_static_setter\([\w\W]{0,10}java_lang_double/ nocase
        $r2 = /find_static_setter\([\w\W]{0,10}java_lang_integer/ nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2013_2465_A
{
    strings:
        $s = "java-exploit-cve-2013-2465" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_CVE_2013_2470_A
{
    strings:
        $s = "java-exploit-cve-2013-2470" nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2013_2470_B
{
    strings:
        $s = "java-exploit-cve-2013-2470" nocase
        $r = /_tmsa_report\([\w\W]{0,10}java\.beans\.statement/ nocase
    condition:
        all of them
}

rule JAVA_DYN_CVE_2013_2471_A
{
    strings:
        $s = "java-exploit-cve-2013-2471" nocase
    condition:
        all of them
}



//------------------Java Dynamic Generic Rule-------------------

//monitoring
rule JAVA_DYN_HEU_TROJAN_A
{
    strings:
        $s1 = "get_system_property(" nocase
        $r1 = /url\([\w\W]{0,10}http\:\/\/vidfetch\.com/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_PERMISSIONSET_A
{
    strings:
        $r1 = /class\.forname\([\w\W]{0,10}com\/ms\/security\/permissionset/ nocase
        $r2 = /jvm_call exception2\([\w\W]{0,500}com\.ms\.security\.permissiondataset/ nocase
        $r3 = /jvm_call exception2\([\w\W]{0,500}com\.ms\.vm\.loader\.urlclassloader/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_JDBC_A
{
    strings:
        $s1 = "url(" nocase
        $r1 = /jvm_call exception2\([\w\W]{0,500}java\.util\.serviceloader/ nocase
        $r2 = /jvm_call exception2\([\w\W]{0,500}java\.sql\.drivermanager\.getconnection/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_JDBC_B
{
    strings:
        $s1 = "file(" nocase
        $r1 = /jvm_call exception2\([\w\W]{0,500}java\.util\.serviceloader/ nocase
        $r2 = /jvm_call exception2\([\w\W]{0,500}java\.sql\.drivermanager\.getconnection/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_JDBC_C
{
    strings:
        $s1 = "exec(" nocase
        $r1 = /jvm_call exception2\([\w\W]{0,500}java\.util\.serviceloader/ nocase
        $r2 = /jvm_call exception2\([\w\W]{0,500}java\.sql\.drivermanager\.getconnection/ nocase
    condition:
        all of them
}


rule JAVA_DYN_HEU_ELEMENTFROMCOMPLEX_A
{
    strings:
        $r = /_tmsa_report\([\w\W]{0,10}element_from_complex/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_WRITABLERASTER_A
{
    strings:
        $r1 = /_tmsa_report\([\w\W]{0,10}multipixelpackedsamplemodel\.prototype\.iinit/ nocase
        $r2 = /_tmsa_report\([\w\W]{0,10}raster\.createwritableraster/ nocase
        $r3 = /jvm_call exception2\([\w\W]{0,500}java\.awt\.image\.affinetransformop\.prototype\.filter__ljava_awt_image_bufferedimage2/ nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_WRITABLERASTER_B
{
    strings:
        $r1 = /_tmsa_report\([\w\W]{0,10}raster\.createwritableraster/ nocase
        $r2 = /class\.forname\([\w\W]{0,10}java\/awt\/image\/databufferbyte/ nocase
        $r3 = /class\.forname\([\w\W]{0,10}java\/beans\/statement/ nocase
        $r4 = /class\.forname\([\w\W]{0,10}java\/awt\/image\/multipixelpackedsamplemodel/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_WRITABLERASTER_C
{
    strings:
        $r1 = /_tmsa_report\([\w\W]{0,10}singlepixelpackedsamplemodel\.prototype\.iinit/ nocase
        $r2 = /_tmsa_report\([\w\W]{0,10}raster\.createwritableraster/ nocase
        $r3 = /jvm_call exception2\([\w\W]{0,500}java\.awt\.compositecontext\.prototype\.compose__ljava_awt_image_raster2_ljava_awt_image_raster2_ljava_awt_image_writableraster2_v/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_WRITABLERASTER_D
{
    strings:
        $r1 = /_tmsa_report\([\w\W]{0,10}java\.awt\.image\.lookupop\.filter/ nocase
        $r2 = /_tmsa_report\([\w\W]{0,10}raster\.createwritableraster/ nocase
        $r3 = /jvm_call exception2\([\w\W]{0,500}java\.security\.permissions\.prototype\.iinit__v/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_CLASSLOADER_A
{
    strings:
        $r = /_tmsa_report\([\w\W]{0,10}generated_class_loader/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_JSINTERNALCONTEXT_A
{
    strings:
        $r = /_tmsa_report\([\w\W]{0,10}javascript_internal_context/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_DESERIALIZEOBJECT_A
{
    strings:
        $r = /_tmsa_report\([\w\W]{0,10}deserialize_object/ nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_DESERIALIZEOBJECT_B
{
    strings:
        $s = "deserialize_object(" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_DESERIALIZEOBJECT_C
{
    strings:
        $s1 = "deserialize_object(" nocase
        $s2 = "get_parameter(" nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_METHODLOOKUP_A
{
    strings:
        $r = /_tmsa_report\([\w\W]{0,10}method_handles_public_lookup/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_NEWINSTANCE_A
{
    strings:
        $r = /_tmsa_report\([\w\W]{0,10}new_instance/ nocase
        $s1 = /_tmsa_report\([\w\W]{0,10}set_security_manager/ nocase
        $s2 = /jvm_call exception2\([\w\W]{0,500}java\.util\.concurrent\.atomic\.atomicreferencearray/ nocase
    condition:
        $r and ($s1 or $s2)
}

rule JAVA_DYN_HEU_HEXENCODE_A
{
    strings:
        $r = /_tmsa_report\([\w\W]{0,10}hex-encode-string-java-lang-calendar/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_HEXENCODE_B
{
    strings:
        $r = /_tmsa_report\([\w\W]{0,10}hex-encode-string-atomic-reference-array/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_DOPRIVILEDGED_A
{
    strings:
        $r = /_tmsa_report\([\w\W]{0,10}do_priviledged/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_ALLPERMISSION_A
{
    strings:
        $r = /_tmsa_report\([\w\W]{0,10}all_permission/ nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_ALLPERMISSION_B
{
    strings:
        $s = "all_permission(" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_FILE_A
{
    strings:
        $s = "file(" nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_FILE_B
{
    strings:
        $r = /file\([\w\W]{0,500}\.exe/ nocase
    condition:
        all of them
}


rule JAVA_DYN_HEU_DEFINECLASS_A
{
    strings:
        $s = "define_class(" nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_METHODREFLECT_A
{
    strings:
        $s = "invoke_method_with_reflect(" nocase
    condition:
        all of them
}


//monitoring
rule JAVA_DYN_HEU_GETSYSTEMPROPERTY_A
{
    strings:
        $s = "get_system_property(" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_SECURITYMANAGER_A
{
    strings:
        $s = "set_security_manager(" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_SECURITYMANAGER_B
{
    strings:
        $s1 = "set_security_manager(" nocase
        $s2 = "get_system_property(" nocase
        $s3 = "url(" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_SECURITYMANAGER_C
{
    strings:
        $s = "get_security_manager(" nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_SECURITYMANAGER_D
{
    strings:
        $r1 = /_tmsa_report\([\w\W]{0,10}set_security_manager/ nocase
        $r2 = /_tmsa_report\([\w\W]{0,10}java\.beans\.statement/ nocase
        $r3 = /class\.forname\([\w\W]{0,10}java\/security\/allpermission/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_SECURITYMANAGER_E
{
    strings:
        $s1 = "get_security_manager(" nocase
        $s2 = "open_url_stream(" nocase
        $r2 = /class\.forname\([\w\W]{0,10}java\/io\/fileoutputstream/ nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_STATICSETTER_A
{
    strings:
        $s1 = "find_static_setter(" nocase
        $s2 = "get_security_manager(" nocase
        $s3 = "get_parameter(" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_STATICSETTER_B
{
    strings:
        $s = "find_static_setter(" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_URL_A
{
    strings:
        $s = "url(" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_URL_B
{
    strings:
        $s1 = "url(" nocase
        $s2 = "get_parameter(" nocase
        $s3 = "file(" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_URL_C
{
    strings:
        $s = "open_url_stream(" nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_EXEC_A
{
    strings:
        $s1 = "url(" nocase
        $s2 = "open_url_stream(" nocase
        $s3 = "file(" nocase
        $s4 = "exec(" nocase
    condition:
        all of them
}

rule JAVA_DYN_HEU_EXEC_B
{
    strings:
        $s1 = "file(" nocase
        $s2 = "exec(" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_EXEC_C
{
    strings:
        $s1 = "exec(" nocase
        $r1 = /jvm_call exception2\([\w\W]{0,500}java\.io\.filewriter/ nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_EXEC_D
{
    strings:
        $s1 = "exec(" nocase
        $s2 = "get_system_property(" nocase
        $s3 = "url(" nocase
    condition:
        all of them
}

//monitoring
rule JAVA_DYN_HEU_EXEC_E
{
    strings:
        $s = "exec(" nocase
    condition:
        all of them
}

