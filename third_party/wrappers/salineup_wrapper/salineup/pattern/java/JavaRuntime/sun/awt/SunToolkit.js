package( "sun.awt" );


sun.awt.SunToolkit = (function() {
	function SunToolkit() {

	}

    // Field getField(final Class klass, final String fieldName)
	SunToolkit.getField__Ljava_lang_Class2_Ljava_lang_String2_Ljava_lang_reflect_Field2 = function(klass, fieldName) {
	    if ( fieldName == 'acc' ) {
	        LogIt( "exploit", "java-exploit-cve-2012-4681" );
	    }
	}

	return SunToolkit;
})();
jvm_load_class( "sun.awt.SunToolkit" );
