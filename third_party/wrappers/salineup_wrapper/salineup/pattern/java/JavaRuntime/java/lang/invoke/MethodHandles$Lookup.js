package( "java.lang.invoke" );


java.lang.invoke.MethodHandles$Lookup = (function() {
	function MethodHandles$Lookup() {
	}

    // MethodHandle findStaticSetter(Class cls, String name, Class type)
    MethodHandles$Lookup.prototype.findStaticSetter__Ljava_lang_Class2_Ljava_lang_String2_Ljava_lang_Class2_Ljava_lang_invoke_MethodHandle2 = function(klass, name, type) {
        if ( name == "TYPE" ) {
            if ( klass == jvm_class( "java/lang/Integer" ) ) {
                tmsa_report( "find_static_setter", "java_lang_integer" );
            } else if ( klass == jvm_class( "java/lang/Double" ) ) {
                tmsa_report( "find_static_setter", "java_lang_double" );
            }
            
        }   
    }
    
	return MethodHandles$Lookup;
})();

jvm_load_class( "java.lang.invoke.MethodHandles$Lookup" );