package( "java.io" );

        
java.io.File = (function() {

	function File() {
        this.name_ = null;
	}
    
    // File(String name)
    File.prototype.iinit__Ljava_lang_String2_V = function( name ) {
        tmsa_report( "file", name );
        this.name_ = name;
    }
    
    // bool exists(name)
    File.prototype.exists__Z = function() {
        return fs_module.existsSync( this.name_ );
    }
    
    // We need to define File.separatorChar in a getter function
    // Because the OS type will only available at runtime
    //
    File .__defineGetter__(
            "separatorChar",
            function(){
	            return (java.lang.System.GetOSName().indexOf( "Windows" ) >= 0) ? "\\" : "/";
            });
                
	return File;
})();

jvm_load_class( "java.io.File" );
