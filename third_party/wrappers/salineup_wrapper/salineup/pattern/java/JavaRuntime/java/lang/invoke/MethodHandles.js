package( "java.lang.invoke" );


java.lang.invoke.MethodHandles = (function() {
	function MethodHandles() {
	}

    // static Lookup publicLookup()
    MethodHandles.publicLookup__Ljava_lang_invoke_MethodHandles$Lookup2 = function() {
        tmsa_report("method_handles_public_lookup");
    }
    
    // Lookup lookup()
    MethodHandles.lookup__Ljava_lang_invoke_MethodHandles$Lookup2 = function() {
        return new java.lang.invoke.MethodHandles$Lookup();
    }
    
	return MethodHandles;
})();

jvm_load_class( "java.lang.invoke.MethodHandles$Lookup" );
jvm_load_class( "java.lang.invoke.MethodHandles" );