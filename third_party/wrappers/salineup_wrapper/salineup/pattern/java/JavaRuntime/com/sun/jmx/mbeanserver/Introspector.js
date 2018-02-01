package( "com.sun.jmx.mbeanserver" );


com.sun.jmx.mbeanserver.Introspector = (function() {
	function Introspector() {

	}

    // Object elementFromComplex(Object obj, String name)
	Introspector.elementFromComplex__Ljava_lang_Object2_Ljava_lang_String2_Ljava_lang_Object2 = function(obj, name) {
	    
	    tmsa_report("element_from_complex" );
	    
	    try {
	        // obj is a java.lang.Class
	        if ( name == "declaredMethods" && jvm_class_exists( obj.getName__Ljava_lang_String2() ) ) {
	            return obj.getMethods__3Ljava_lang_reflect_Method2();
	        }
	    } catch ( ex ) {}
	}

	return Introspector;
})();

jvm_load_class( "com.sun.jmx.mbeanserver.Introspector" );