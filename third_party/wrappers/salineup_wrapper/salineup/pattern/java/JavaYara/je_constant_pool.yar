/*
    reference: je_scan.ptn
    this file includes all signatures from java constant pool,
    all rules are used for static decision.
    name definition format: 
      i: init,  m: method, c: class, p: param, s: string, r: regex
*/

rule p1_i_hashset
{
    strings:
        $s = "java/util/hashset/<init>" nocase
    condition:
        $s
}

rule p2_m_getmididevice
{
    strings:
        $s = "javax/sound/midi/midisystem/getmididevice" nocase
    condition:
        $s
}

rule p3_m_getenginebyname
{
    strings:
        $s = "javax/script/scriptenginemanager/getenginebyname" nocase
    condition:
        $s
}

rule p4_c_atomicreferencearray
{
    strings:
        $s = "java/util/concurrent/atomic/atomicreferencearray" nocase
    condition:
        $s
}

rule p5_p_classloader
{
    strings:
        $s = "ljava/lang/classloader;" nocase
    condition:
        $s
}

rule p6_s_suntoolkit
{
    strings:
        $s = "sun.awt.suntoolkit" nocase
    condition:
        $s
}

rule p7_m_creatembean
{
    strings:
        $s = "javax/management/remote/rmi/rmiconnectionimpl/creatembean" nocase
    condition:
        $s
}

rule p8_m_querymbeans
{
    strings:
        $s = "javax/management/remote/rmi/rmiconnectionimpl/querymbeans" nocase
    condition:
        $s
}

rule p9_m_writablerastersetpixels
{
    strings:
        $s = "java/awt/image/writableraster/setpixels" nocase
    condition:
        $s
}

rule p10_m_getsoundbank
{
    strings:
        $s = "javax/sound/midi/midisystem/getsoundbank" nocase
    condition:
        $s
}

rule p11_r_exeurl
{
    strings:
        $s = /[\s]*(http[s]{0,1}|ftp|file):\/\/.*\.exe[\s]*/ nocase
    condition:
        $s
}

rule p13_m_exec
{
    strings:
        $s = "java/lang/runtime/exec" nocase
    condition:
        $s
}

rule p14_m_setsecuritymanager
{
    strings:
        $s = "java/lang/system/setsecuritymanager" nocase
    condition:
        $s
}

rule p15_m_doprivileged
{
    strings:
        $s = "java/security/accesscontroller/doprivileged" nocase
    condition:
        $s
}

rule p16_i_fileoutputstream
{
    strings:
        $s = "java/io/fileoutputstream/<init>" nocase
    condition:
        $s
}

rule p17_i_url
{
    strings:
        $s = "java/net/url/<init>" nocase
    condition:
        $s
}

rule p18_i_jlist
{
    strings:
        $s = "javax/swing/jlist/<init>" nocase
    condition:
        $s
}

rule p19_i_objectinputstream
{
    strings:
        $s = "java/io/objectinputstream/<init>" nocase
    condition:
        $s
}

rule p20_m_readobject
{
    strings:
        $s = "java/io/objectinputstream/readobject" nocase
    condition:
        $s
}

rule p21_m_openconnection
{
    strings:
        $s = "java/net/url/openconnection" nocase
    condition:
        $s
}

rule p22_m_getinputstream
{
    strings:
        $s = "java/net/urlconnection/getinputstream" nocase
    condition:
        $s
}

rule p23_m_fileoutputstreamwrite
{
    strings:
        $s = "java/io/fileoutputstream/write" nocase
    condition:
        $s
}

rule p24_m_sequenceropen
{
    strings:
        $s = "javax/sound/midi/sequencer/open" nocase
    condition:
        $s
}

rule p25_m_setsequencer
{
    strings:
        $s = "javax/sound/midi/sequencer/setsequence" nocase
    condition:
        $s
}

rule p26_m_addsequencereventlistener
{
    strings:
        $s = "javax/sound/midi/sequencer/addcontrollereventlistener" nocase
    condition:
        $s
}

rule p29_m_gc
{
    strings:
        $s = "java/lang/runtime/gc" nocase
    condition:
        $s
}

rule p30_r_heapsprayshellcode
{
    strings:
        $s = /[\s\S]*\\u[\da-fA-F]{3,4}\\u[\da-fA-F]{3,4}[\s\S]*/ nocase
    condition:
        $s
}

rule p31_r_dotexe
{
    strings:
        $s = /[\s\S]*.exe/ nocase
    condition:
        $s
}

rule p32_i_thread
{
    strings:
        $s = "java/lang/thread/<init>" nocase
    condition:
        $s
}

rule p33_s_fakeoraclejava
{
    strings:
        $s = "oracle java" nocase
    condition:
        $s
}

rule p34_i_applet
{
    strings:
        $s = "java/applet/applet/<init>" nocase
    condition:
        $s
}

rule p35_m_currentthread
{
    strings:
        $s = "java/lang/thread/currentthread" nocase
    condition:
        $s
}

rule p36_s_setsecuritymanager
{
    strings:
        $s = "setsecuritymanager" nocase
    condition:
        $s
}

rule p37_i_expression
{
    strings:
        $s = "java/beans/expression/<init>" nocase
    condition:
        $s
}

rule p38_m_addcomponent
{
    strings:
        $s = "add(ljava/awt/component;)ljava/awt/component;" nocase
    condition:
        $s
}

rule p39_m_scriptengineeval
{
    strings:
        $s = "javax/script/scriptengine/eval" nocase
    condition:
        $s
}

rule p41_m_parseint
{
    strings:
        $s = "java/lang/integer/parseint" nocase
    condition:
        $s
}

rule p42_m_intbufferput
{
    strings:
        $s = "java/nio/intbuffer/put" nocase
    condition:
        $s
}

rule p44_m_getclass
{
    strings:
        $s = "java/lang/object/getclass" nocase
    condition:
        $s
}

rule p45_m_getclassloader
{
    strings:
        $s = "java/lang/class/getclassloader" nocase
    condition:
        $s
}

rule p48_i_statement
{
    strings:
        $s = "java/beans/statement/<init>" nocase
    condition:
        $s
}

rule p49_i_accesscontrolcontext
{
    strings:
        $s = "java/security/accesscontrolcontext/<init>" nocase
    condition:
        $s
}

rule p50_i_allpermission
{
    strings:
        $s = "java/security/allpermission/<init>" nocase
    condition:
        $s
}

rule p51_i_permission
{
    strings:
        $s = "java/security/permission/<init>" nocase
    condition:
        $s
}

rule p52_i_protectiondomain
{
    strings:
        $s = "java/security/protectiondomain/<init>" nocase
    condition:
        $s
}

rule p53_p_threadsleep
{
    strings:
        $s = "java/lang/thread/sleep(j)v" nocase
    condition:
        $s
}

rule p54_s_tmpdir
{
    strings:
        $s = "java.io.tmpdir" nocase
    condition:
        $s
}

rule p55_s_acc
{
    strings:
        $s = "acc" nocase
    condition:
        $s
}

rule p56_s_getfield
{
    strings:
        $s = "getfield" nocase
    condition:
        $s
}

rule p57_s_osname
{
    strings:
        $s = "os.name" nocase
    condition:
        $s
}

rule p58_s_window
{
    strings:
        $s = "window" nocase
    condition:
        $s
}

rule p59_s_system
{
    strings:
        $s = "system" nocase
    condition:
        $s
}

rule p61_r_aced00057372
{
    strings:
        $s = /[\s\S]*ced[\s\S]{3}57372[\s\S]*/ nocase
    condition:
        $s
}

rule p62_s_bitcoin
{
    strings:
        $s = "bitcoin" nocase
    condition:
        $s
}

rule p63_i_stringbuilder
{
    strings:
        $s = "java/lang/stringbuilder/<init>" nocase
    condition:
        $s
}

rule p64_m_getenginebyextension
{
    strings:
        $s = "javax/script/scriptenginemanager/getenginebyextension" nocase
    condition:
        $s
}

rule p65_m_blacklist1
{
    strings:
        $s = "tevufcp(ljava/lang/object;)lcagessaggarsagaze/ill" nocase
    condition:
        $s
}

rule p66_m_blacklist2
{
    strings:
        $s = "ilap(ljava/lang/object;)lvialslwei/asylums" nocase
    condition:
        $s
}

rule p67_m_blacklist3
{
    strings:
        $s = "hajepkf(ljava/net/url;[ljava/security/cert/certificate;ljava/security/permissions;)" nocase
    condition:
        $s
}

rule p68_m_blacklist4
{
    strings:
        $s = "googlea(lgooglea/googlea;)lgooglea/googled" nocase
    condition:
        $s
}

rule p69_s_hipcrime
{
    strings:
        $s = "hipcrime's newsbuster" nocase
    condition:
        $s
}

rule p70_m_blacklist5
{
    strings:
        $s = "npjelvytye(ljava/lang/class;iljavax/swing/jlist;iljava/lang/class;ljavax/swing/jlist;ljava/lang/string;ljava/lang/object;)" nocase
    condition:
        $s
}

rule p71_s_specific1
{
    strings:
        $s = "mail2news@basement.replay.com" nocase
    condition:
        $s
}

rule p72_s_specific2
{
    strings:
        $s = "winter.news.erols.com" nocase
    condition:
        $s
}

rule p73_s_specific3
{
    strings:
        $s = "#s26, #praha2k, #poc, #globalized" nocase
    condition:
        $s
}

rule p74_s_specific4
{
    strings:
        $s = "imf.org, worldbank.org, bis.org (bank for international settlements), fsforum.org" nocase
    condition:
        $s
}

rule p75_s_specific5
{
    strings:
        $s = "borg spam assimilators" nocase
    condition:
        $s
}

rule p76_s_specific6
{
    strings:
        $s = "bustersentence()ljava/lang/string" nocase
    condition:
        $s
}

rule p77_s_specific7
{
    strings:
        $s = "henrietta k. thomas" nocase
    condition:
        $s
}

rule p78_s_context
{
    strings:
        $s = "sun.org.mozilla.javascript.internal.context" nocase
    condition:
        $s
}

rule p79_s_generatedclassloader
{
    strings:
        $s = "sun.org.mozilla.javascript.internal.generatedclassloader" nocase
    condition:
        $s
}

rule p80_s_createclassloader
{
    strings:
        $s = "createclassloader" nocase
    condition:
        $s
}

rule p81_s_defineclass
{
    strings:
        $s = "defineclass" nocase
    condition:
        $s
}

rule p82_s_newinstance
{
    strings:
        $s = "newinstance()" nocase
    condition:
        $s
}

rule p83_s_elementfromcomplex
{
    strings:
        $s = "introspector.elementfromcomplex" nocase
    condition:
        $s
}

rule p84_s_mbeaninstantiator
{
    strings:
        $s = "com.sun.jmx.mbeanserver.mbeaninstantiator" nocase
    condition:
        $s
}

rule p85_s_enter
{
    strings:
        $s = "enter" nocase
    condition:
        $s
}

rule p86_s_specificoffset
{
    strings:
        $s = "50000000" nocase
    condition:
        $s
}

rule p87_c_bufferedimage
{
    strings:
        $s = "java/awt/image/bufferedimage" nocase
    condition:
        $s
}

rule p88_c_colorspace
{
    strings:
        $s = "java/awt/color/colorspace" nocase
    condition:
        $s
}

rule p89_r_colormodel
{
    strings:
        $s = /(l)?java\/awt\/image\/colormodel/ nocase
    condition:
        $s
}

rule p90_i_filteredimagesource
{
    strings:
        $s = "java/awt/image/filteredimagesource/<init>(ljava/awt/image/imageproducer;ljava/awt/image/imagefilter;)v" nocase
    condition:
        $s
}

rule p91_i_url
{
    strings:
        $s = "java/net/url/<init>(ljava/lang/string;)v" nocase
    condition:
        $s
}

rule p92_m_servicemanagerlookup
{
    strings:
        $s = "javax/jnlp/servicemanager/lookup(ljava/lang/string;)ljava/lang/object;" nocase
    condition:
        $s
}

rule p93_s_policy
{
    strings:
        $s = "-j-djava.security.policy=" nocase
    condition:
        $s
}

rule p94_s_basicservice
{
    strings:
        $s = "javax.jnlp.basicservice" nocase
    condition:
        $s
}

rule p95_i_protectiondomain
{
    strings:
        $s = "java/security/protectiondomain/<init>(ljava/security/codesource;ljava/security/permissioncollection;)v" nocase
    condition:
        $s
}

rule p96_i_urlclassloader
{
    strings:
        $s = "java/net/urlclassloader/<init>([ljava/net/url;)v" nocase
    condition:
        $s
}

rule p97_m_methodinvoke
{
    strings:
        $s = "java/lang/reflect/method/invoke(ljava/lang/object;[ljava/lang/object;)ljava/lang/object;" nocase
    condition:
        $s
}

rule p98_m_classforname
{
    strings:
        $s = "java/lang/class/forname(ljava/lang/string;)ljava/lang/class;" nocase
    condition:
        $s
}

rule p99_m_cnfgetmessage
{
    strings:
        $s = "java/lang/classnotfoundexception/getmessage()ljava/lang/string;" nocase
    condition:
        $s
}

rule p100_i_noclassdeffounderror
{
    strings:
        $s = "java/lang/noclassdeffounderror/<init>(ljava/lang/string;)v" nocase
    condition:
        $s
}

rule p101_m_getresourceasstream
{
    strings:
        $s = "java/lang/class/getresourceasstream(ljava/lang/string;)ljava/io/inputstream;" nocase
    condition:
        $s
}

rule p102_m_genericconstructorcreate
{
    strings:
        $s = "com/sun/org/glassfish/gmbal/util/genericconstructor/create([ljava/lang/object;)ljava/lang/object;" nocase
    condition:
        $s
}

rule p103_m_imageconsumersetpixels
{
    strings:
        $s = "java/awt/image/imageconsumer/setpixels(iiiiljava/awt/image/colormodel;[bii)v" nocase
    condition:
        $s
}

rule p104_c_classloader
{
    strings:
        $s = "java/lang/classloader" nocase
    condition:
        $s
}

rule p105_c_protectiondomain
{
    strings:
        $s = "java/security/protectiondomain" nocase
    condition:
        $s
}

rule p106_c_url
{
    strings:
        $s = "java/net/url" nocase
    condition:
        $s
}

rule p107_m_fieldget
{
    strings:
        $s = "java/lang/reflect/field/get" nocase
    condition:
        $s
}

rule p108_m_invokeexact
{
    strings:
        $s = "java/lang/invoke/methodhandle/invokeexact" nocase
    condition:
        $s
}

rule p109_c_doubletype
{
    strings:
        $s = "java/lang/double/type" nocase
    condition:
        $s
}

rule p110_m_fieldset
{
    strings:
        $s = "java/lang/reflect/field/set" nocase
    condition:
        $s
}

rule p111_m_getsecuritymanager
{
    strings:
        $s = "java/lang/system/getsecuritymanager" nocase
    condition:
        $s
}

rule p112_c_indexcolormodel
{
    strings:
        $s = "java/awt/image/indexcolormodel" nocase
    condition:
        $s
}

rule p113_m_setcolormodel
{
    strings:
        $s = "java/awt/image/imageconsumer/setcolormodel" nocase
    condition:
        $s
}

rule p114_m_setdimensions
{
    strings:
        $s = "java/awt/image/imageconsumer/setdimensions" nocase
    condition:
        $s
}

/*
rule p115_m_imageconsumersetpixels
{
    strings:
        $s = "java/awt/image/imageconsumer/setpixels" nocase
    condition:
        $s
}
*/

rule p116_m_reverse
{
    strings:
        $s = "reverse()ljava/lang/stringbuffer" nocase
    condition:
        $s
}

rule p117_m_charat
{
    strings:
        $s = "java/lang/string/charat" nocase
    condition:
        $s
}

rule p118_i_canvas
{
    strings:
        $s = "java/awt/canvas/<init>" nocase
    condition:
        $s
}

rule p119_i_dimension
{
    strings:
        $s = "java/awt/dimension/<init>" nocase
    condition:
        $s
}

rule p120_i_color
{
    strings:
        $s = "java/awt/color/<init>" nocase
    condition:
        $s
}

rule p121_m_tolowercase
{
    strings:
        $s = "tolowercase()ljava/lang/string" nocase
    condition:
        $s
}

rule p122_m_touppercase
{
    strings:
        $s = "touppercase()ljava/lang/string" nocase
    condition:
        $s
}

rule p123_m_getcodebase
{
    strings:
        $s = "java/applet/applet/getcodebase()ljava/net/url" nocase
    condition:
        $s
}

rule p124_m_createdbyfoxxy
{
    strings:
        $s = "java/createdbyfoxxy(ljava/lang/string;)ljava/lang/stringbuilder" nocase
    condition:
        $s
}

rule p125_m_substring
{
    strings:
        $s = "java/lang/string/substring" nocase
    condition:
        $s
}

rule p126_i_random
{
    strings:
        $s = "java/util/random/<init>" nocase
    condition:
        $s
}

rule p127_m_replaceall
{
    strings:
        $s = "java/lang/string/replaceall(ljava/lang/string;ljava/lang/string;)ljava/lang/string" nocase
    condition:
        $s
}

rule p128_m_getparameter
{
    strings:
        $s = "getparameter(ljava/lang/string;)ljava/lang/string;" nocase
    condition:
        $s
}

rule p129_m_getproperty
{
    strings:
        $s = "getproperty(ljava/lang/string;)ljava/lang/string;" nocase
    condition:
        $s
}

rule p130_m_indexof
{
    strings:
        $s = "indexof(ljava/lang/string;)i" nocase
    condition:
        $s
}

rule p131_m_jmbnewmbeanserver
{
    strings:
        $s = "com/sun/jmx/mbeanserver/jmxmbeanserverbuilder/newmbeanserver" nocase
    condition:
        $s
}

rule p132_m_concat
{
    strings:
        $s = "java/lang/string/concat(ljava/lang/string;)ljava/lang/string" nocase
    condition:
        $s
}

rule p133_m_getmethod
{
    strings:
        $s = "java/lang/class/getmethod(ljava/lang/string;[ljava/lang/class;)ljava/lang/reflect/method" nocase
    condition:
        $s
}

rule p134_m_findclass
{
    strings:
        $s = "com/sun/jmx/mbeanserver/mbeaninstantiator/findclass" nocase
    condition:
        $s
}

rule p135_m_getmbeaninstantiator
{
    strings:
        $s = "com/sun/jmx/mbeanserver/jmxmbeanserver/getmbeaninstantiator" nocase
    condition:
        $s
}

rule p136_m_findvirtual
{
    strings:
        $s = "java/lang/invoke/methodhandles$lookup/findvirtual" nocase
    condition:
        $s
}

rule p137_s_linux
{
    strings:
        $s = "linux" nocase
    condition:
        $s
}

rule p138_s_unix
{
    strings:
        $s = "unix" nocase
    condition:
        $s
}

rule p139_s_mac
{
    strings:
        $s = "mac" nocase
    condition:
        $s
}

rule p140_m_startswith
{
    strings:
        $s = "startswith(ljava/lang/string;)z" nocase
    condition:
        $s
}

rule p141_m_getdocumentbase
{
    strings:
        $s = "java/applet/applet/getdocumentbase()ljava/net/url" nocase
    condition:
        $s
}

rule p142_i_bytearrayoutputstream
{
    strings:
        $s = "java/io/bytearrayoutputstream/<init>" nocase
    condition:
        $s
}

rule p143_m_getappletcontext
{
    strings:
        $s = "getappletcontext()ljava/applet/appletcontext" nocase
    condition:
        $s
}

rule p144_m_getconstructor
{
    strings:
        $s = "java/lang/class/getconstructor" nocase
    condition:
        $s
}

rule p145_m_constructornewinstance
{
    strings:
        $s = "java/lang/reflect/constructor/newinstance" nocase
    condition:
        $s
}

rule p146_m_arraynewinstance
{
    strings:
        $s = "java/lang/reflect/array/newinstance" nocase
    condition:
        $s
}

rule p147_c_certificate
{
    strings:
        $s = "java/security/cert/certificate" nocase
    condition:
        $s
}

rule p148_s_hw
{
    strings:
        $s = "hw" nocase
    condition:
        $s
}

rule p149_m_getbeaninfo
{
    strings:
        $s = "java/beans/introspector/getbeaninfo" nocase
    condition:
        $s
}

rule p150_m_classnewinstance
{
    strings:
        $s = "java/lang/class/newinstance" nocase
    condition:
        $s
}

rule p151_m_elementfromcomplex
{
    strings:
        $s = "com/sun/jmx/mbeanserver/introspector/elementfromcomplex" nocase
    condition:
        $s
}

rule p152_m_jmnewmbeanserver
{
    strings:
        $s = "com/sun/jmx/mbeanserver/jmxmbeanserver/newmbeanserver" nocase
    condition:
        $s
}

rule p153_c_memoryimagesource
{
    strings:
        $s = "java/awt/image/memoryimagesource" nocase
    condition:
        $s
}

/*
rule p154_c_protectiondomain
{
    strings:
        $s = "java/security/protectiondomain" nocase
    condition:
        $s
}
*/

rule p155_m_scripteval
{
    strings:
        $s = "eval(ljava/lang/string;)ljava/lang/object" nocase
    condition:
        $s
}

rule p156_c_scriptengine
{
    strings:
        $s = "javax/script/scriptengine" nocase
    condition:
        $s
}

rule p157_r_setsecuritymanager
{
    strings:
        $s = /[\s\S]*java\.lang\.system\.setsecuritymanager\(null\)/ nocase
    condition:
        $s
}

rule p158_s_deserialization1
{
    strings:
        $s = "aced0005757200135b4c6a6176612e6c616e672e4f62" nocase
    condition:
        $s
}

rule p159_s_deserialization2
{
    strings:
        $s = "6a6563743b90ce589f1073296c020000787000000002" nocase
    condition:
        $s
}

rule p160_s_deserialization3
{
    strings:
        $s = "757200095b4c612e48656c703bfe2c941188b6e5ff02" nocase
    condition:
        $s
}

rule p161_s_deserialization4
{
    strings:
        $s = "000078700000000170737200306a6176612e7574696c" nocase
    condition:
        $s
}

rule p162_s_codehex
{
    strings:
        $s = "codehex" nocase
    condition:
        $s
}

rule p163_s_defineandcreate
{
    strings:
        $s = "defineandcreate" nocase
    condition:
        $s
}

rule p164_m_compile
{
    strings:
        $s = "java/util/regex/pattern/compile" nocase
    condition:
        $s
}

rule p165_m_matcher
{
    strings:
        $s = "java/util/regex/pattern/matcher" nocase
    condition:
        $s
}

rule p166_c_permissiondataset
{
    strings:
        $s = "com/ms/security/permissiondataset" nocase
    condition:
        $s
}

rule p167_s_setfullytrusted
{
    strings:
        $s = "setfullytrusted" nocase
    condition:
        $s
}

rule p168_c_componentsamplemodel
{
    strings:
        $s = "java/awt/image/componentsamplemodel" nocase
    condition:
        $s
}

rule p169_c_colorconvertop
{
    strings:
        $s = "java/awt/image/colorconvertop" nocase
    condition:
        $s
}

rule p170_s_foxjava
{
    strings:
        $s = "fox.java" nocase
    condition:
        $s
}

rule p171_s_gutjava
{
    strings:
        $s = "gut.java" nocase
    condition:
        $s
}

rule p172_s_vatjava
{
    strings:
        $s = "vat.java" nocase
    condition:
        $s
}

rule p173_s_metasploitpayload
{
    strings:
        $s = "metasploit.payload" nocase
    condition:
        $s
}

rule p174_s_fuckkasp11111
{
    strings:
        $s = "fuckkasp11111" nocase
    condition:
        $s
}

rule p175_s_n2n2n2n3c
{
    strings:
        $s = "n2n2n2n3c" nocase
    condition:
        $s
}

rule p176_s_n2n2n2n3a
{
    strings:
        $s = "n2n2n2n3a" nocase
    condition:
        $s
}

rule p177_s_n2n2n2n3d
{
    strings:
        $s = "n2n2n2n3d" nocase
    condition:
        $s
}

rule p178_c_serializable
{
    strings:
        $s = "java/io/serializable" nocase
    condition:
        $s
}

rule p200_r_staticmainmethod
{
    strings:
        $s = /public static main\(\[Ljava\/lang\/String;\)[\s\S]*/ nocase
    condition:
        $s
}

rule p201_r_appletinit
{
    strings:
        $s = /java\/applet\/Applet\/<init>[\s\S]*/ nocase
    condition:
        $s
}

rule p202_s_linecount
{
    strings:
        $s = "*" nocase
    condition:
        $s
}

rule p203_s_methodcount
{
    strings:
        $s = "*" nocase
    condition:
        $s
}

rule p204_s_readablecount
{
    strings:
        $s = ">" nocase
    condition:
        $s
}

rule p205_i_componentcolormodel
{
    strings:
        $s = "java/awt/image/componentcolormodel/<init>(ljava/awt/color/colorspace;[izzii)v" nocase
    condition:
        $s
}

rule p206_i_icccolorspace
{
    strings:
        $s = "java/awt/color/icc_colorspace/<init>(ljava/awt/color/icc_profile;)v" nocase
    condition:
        $s
}

rule p207_s_iscompatibleraster
{
    strings:
        $s = "iscompatibleraster" nocase
    condition:
        $s
}

rule p208_i_affinetransformop
{
    strings:
        $s = "java/awt/image/affinetransformop/<init>(ljava/awt/geom/affinetransform;ljava/awt/renderinghints;)v" nocase
    condition:
        $s
}

rule p209_m_invocationhandlerinvoke
{
    strings:
        $s = "java/lang/reflect/invocationhandler/invoke(ljava/lang/object;ljava/lang/reflect/method;[ljava/lang/object;)ljava/lang/object;" nocase
    condition:
        $s
}

rule p210_c_tracingprovider
{
    strings:
        $s = "com/sun/tracing/provider" nocase
    condition:
        $s
}

rule p211_m_createwritableraster
{
    strings:
        $s = "java/awt/image/raster/createwritableraster" nocase
    condition:
        $s
}

rule p212_m_lookupopfilter
{
    strings:
        $s = "java/awt/image/lookupop/filter(ljava/awt/image/bufferedimage;ljava/awt/image/bufferedimage;)ljava/awt/image/bufferedimage;" nocase
    condition:
        $s
}

rule p213_m_getdeclaredconstructor
{
    strings:
        $s = "java/lang/class/getdeclaredconstructor([ljava/lang/class;)ljava/lang/reflect/constructor;" nocase
    condition:
        $s
}

rule p214_p_colormodelandsamplemodel
{
    strings:
        $s = "(iiiiljava/awt/image/colormodel;ljava/awt/image/samplemodel;)v" nocase
    condition:
        $s
}

rule p215_i_javafxtruecolor
{
    strings:
        $s = "javafxtruecolor/init(ljava/net/url;)v" nocase
    condition:
        $s
}

rule p216_m_findstaticsetter
{
    strings:
        $s = "java/lang/invoke/methodhandles$lookup/findstaticsetter(ljava/lang/class;ljava/lang/string;ljava/lang/class;)ljava/lang/invoke/methodhandle;" nocase
    condition:
        $s
}

rule p217_r_writableraster
{
    strings:
        $s = /j.{0,5}a.{0,5}v.{0,5}a.{0,5}\..{0,5}a.{0,5}w.{0,5}t.{0,5}\..{0,5}i.{0,5}m.{0,5}a.{0,5}g.{0,5}e.{0,5}\..{0,5}w.{0,5}r.{0,5}i.{0,5}t.{0,5}a.{0,5}b.{0,5}l.{0,5}e.{0,5}r.{0,5}a.{0,5}s.{0,5}t.{0,5}e.{0,5}r/ nocase
    condition:
        $s
}

rule p218_r_alphacomposite
{
    strings:
        $s = /j.{0,5}a.{0,5}v.{0,5}a.{0,5}\..{0,5}a.{0,5}w.{0,5}t.{0,5}\..{0,5}a.{0,5}l.{0,5}p.{0,5}h.{0,5}a.{0,5}c.{0,5}o.{0,5}m.{0,5}p.{0,5}o.{0,5}s.{0,5}i.{0,5}t.{0,5}e/ nocase
    condition:
        $s
}

rule p219_r_samplemodel
{
    strings:
        $s = /j.{0,5}a.{0,5}v.{0,5}a.{0,5}\..{0,5}a.{0,5}w.{0,5}t.{0,5}\..{0,5}i.{0,5}m.{0,5}a.{0,5}g.{0,5}e.{0,5}\..{0,5}s.{0,5}a.{0,5}m.{0,5}p.{0,5}l.{0,5}e.{0,5}m.{0,5}o.{0,5}d.{0,5}e.{0,5}l/ nocase
    condition:
        $s
}

rule p220_r_compositecontext
{
    strings:
        $s = /j.{0,5}a.{0,5}v.{0,5}a.{0,5}\..{0,5}a.{0,5}w.{0,5}t.{0,5}\..{0,5}c.{0,5}o.{0,5}m.{0,5}p.{0,5}o.{0,5}s.{0,5}i.{0,5}t.{0,5}e.{0,5}c.{0,5}o.{0,5}n.{0,5}t.{0,5}e.{0,5}x.{0,5}t/ nocase
    condition:
        $s
}

rule p221_s_disablesecuritymanager
{
    strings:
        $s = "disablesecuritymanager" nocase
    condition:
        $s
}

rule p222_c_privilegedexceptionaction
{
    strings:
        $s = "java/security/privilegedexceptionaction" nocase
    condition:
        $s
}

rule p223_c_integertype
{
    strings:
        $s = "java/lang/integer/type" nocase
    condition:
        $s
}

rule p224_m_mediatrackeraddimage
{
    strings:
        $s = "java/awt/mediatracker/addimage(ljava/awt/image;i)v" nocase
    condition:
        $s
}

rule p225_m_mediatrackerremoveimage
{
    strings:
        $s = "java/awt/mediatracker/removeimage(ljava/awt/image;)v" nocase
    condition:
        $s
}

rule p226_m_quicktimetoqtpointer
{
	strings:
		$s1 = "quicktime/util/qthandle/toqtpointer()lquicktime/util/qtpointerref;" nocase
	condition:
		all of them
}

