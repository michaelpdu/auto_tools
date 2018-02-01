package( "java.io" );

        
java.io.FileOutputStream = (function() {

	function FileOutputStream() {

	}
	
	// FileOutputStream( String name ) 
	FileOutputStream.prototype.iinit__Ljava_lang_String2_V = function( name ) {
	    tmsa_report( "file", name );
	}
	
	// FileOutputStream( String name, boolean append ) 
	FileOutputStream.prototype.iinit__Ljava_lang_String2_Z_V = function( name, append ) {
	    tmsa_report( "file", name );
	}
    
	return FileOutputStream;
})();
jvm_load_class( "java.io.FileOutputStream" );
