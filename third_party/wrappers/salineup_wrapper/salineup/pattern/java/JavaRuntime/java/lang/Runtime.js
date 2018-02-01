package( "java.lang" );


java.lang.Runtime = (function() {
	function Runtime() {
	}

    //   Process exec(String command) 
	Runtime.prototype.exec__Ljava_lang_String2_Ljava_lang_Process2 = function( cmd ) 
	{
		tmsa_report( "exec", cmd );
	}
	
	// Process exec(String cmdArray) 
	Runtime.prototype.exec__3Ljava_lang_String2_Ljava_lang_Process2 = function( cmdArray ) {
	    tmsa_report( "exec", cmdArray.join(" ") );
	}

    // Runtime getRuntime()
    Runtime.getRuntime__Ljava_lang_Runtime2 = function() {
        return new Runtime();
    }
	

	return Runtime;
})();
jvm_load_class( "java.lang.Runtime" );
