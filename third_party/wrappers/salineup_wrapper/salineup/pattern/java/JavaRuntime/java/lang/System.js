package( "java.lang" );


java.lang.System = (function() {
	function System() {
	}

    
    // String getProperty(String prop)
	System.getProperty__Ljava_lang_String2_Ljava_lang_String2 = function(prop) {
	    try {
	    
	        prop = prop.toLowerCase();
	    
	        tmsa_report("get_system_property", prop);
	        
	        if ( prop == "os.name" ) {
	            return System.GetOSName();
	        } else if ( prop == "file.separator" ) {
	            jvm_import( "java/io/File" );
	            return java.io.File.separatorChar;
	        }
	        
	        if ( Environment.SystemProperties[prop] ) {
	            return Environment.SystemProperties[prop];
	        } else {
	            return "%system_property_" + prop + "%";
	        }
	    } catch (ex) {
	    }
	    
	    return "";
	}
	
	// String getenv(String prop)
	System.getenv__Ljava_lang_String2_Ljava_lang_String2 = System.getProperty__Ljava_lang_String2_Ljava_lang_String2;

    // void arraycopy( Object src, int srcPos, Object dest, int destPos, int length )
    System.arraycopy__Ljava_lang_Object2_I_Ljava_lang_Object2_I_I_V = function(src, srcPos, dest, destPos, length) {
        for ( var i = 0; i < length; ++ i ) {
            dest[destPos ++] = src[srcPos ++];
        }
    }

    // setSecurityManager(SecurityManager)
    System.setSecurityManager__Ljava_lang_SecurityManager2_V = function( securityManager ) {
        tmsa_report( "set_security_manager", securityManager );
    }
    
    // SecurityManager getSecurityManager()
    var reportedGetSecurityManager = false;
    System.getSecurityManager__Ljava_lang_SecurityManager2 = function() {
        if ( !reportedGetSecurityManager ) {
            tmsa_report( "get_security_manager", "" );
            reportedGetSecurityManager = true;
        }
        
        return {};
    }
    
    
    System.GetOSName = function() {
        
        var osName = Environment.SystemProperties["os.name"];
        
        if ( !osName ) {
            //
	        // The "macosx" folder is created by docode if needed
	        var macIndicatorDir = path_module.join( Environment.workDir, "macosx" );
	        if ( jvm_fs_exists( macIndicatorDir ) ) {
	            osName = "Mac OS X";
	        } else {
	            osName = "Windows 7";
	        }
	        
	        Environment.SystemProperties["os.name"] = osName;
        }
        
	    
	    return osName;
    }
    
    
	return System;
})();

jvm_load_class( "java.lang.System" );