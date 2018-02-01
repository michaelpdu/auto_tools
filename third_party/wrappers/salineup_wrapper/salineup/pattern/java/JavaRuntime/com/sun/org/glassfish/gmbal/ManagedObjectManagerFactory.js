package( "com.sun.org.glassfish.gmbal" );


com.sun.org.glassfish.gmbal.ManagedObjectManagerFactory = (function() {
	function ManagedObjectManagerFactory() {
	}

    // getMethod(java.lang.Class<?> cls, java.lang.String name, java.lang.Class<?>... types)
    ManagedObjectManagerFactory.getMethod__Ljava_lang_Class2_Ljava_lang_String2_3Ljava_lang_Class2_Ljava_lang_reflect_Method2 = function(cls, name, types) {
        if ( name == "loadClass" ) {
            tmsa_report("java-exploit-cve-2012-5076");
        }
        
        if ( !cls ) cls = java.lang.Class.dummyClass();
        
        return cls.getMethod__Ljava_lang_String2_3Ljava_lang_Class2_Ljava_lang_reflect_Method2(name, types);     
    }

	
	return ManagedObjectManagerFactory;
})();
jvm_load_class( "com.sun.org.glassfish.gmbal.ManagedObjectManagerFactory" );
