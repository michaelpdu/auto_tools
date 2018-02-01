package( "java.lang" );




java.lang.ClassLoader = (function() {
	function ClassLoader() {
	}

    // Class defineClass(String name,
    //                   byte[] b,
    //                   int off,
    //                   int len,
    //                   ProtectionDomain protectionDomain)
	ClassLoader.prototype.defineClass__Ljava_lang_String2_3B_I_I_Ljava_security_ProtectionDomain2_Ljava_lang_Class2 = function(name, b, off, len, protectionDomain) {
	   var klass = null;
	  

	    if ( (!jvm_class_exists(name)) && b && off >= 0 && len >= 0 ) {
	        //  The class data is dynamic generated
	        

	        var path_module = require( "path" );
	        var util_module = require( "util" );
	        var fs_module = require( "fs" );
	        
	       
	        var classname = name ? name : "dynamic_class";
	        
	        var tmpClassPath = path_module.join( Environment.workDir, classname + '.class' );
	        var tmpSourcePath = path_module.join( Environment.workDir, classname + '.js' );
	        if ( jvm_fs_exists( tmpSourcePath ) ) {
	            jvm_fs_delete( tmpSourcePath );
	        }
	     
	        var buf = ( b instanceof Buffer )? b : jvm_convert_to_buffer(b);
	        
	        var fd = fs_module.openSync( tmpClassPath, "w" );
	        fs_module.writeSync( fd, buf, off, len );
	        fs_module.closeSync( fd );


	        
	        var cmd = util_module.format( "\"%s\" -i \"%s\" -o \"%s\"", Environment.decompilerPath, tmpClassPath, tmpSourcePath  );
	        
	        var exec = require('child_process').exec;
	        var child = exec( cmd, {timeout: 2000}, 
	        function (error, stdout, stderr) { console.log(stderr); } );
	        
	        
	        //
	        // Wait until decompile finished
	        var cnt = 3;
	        var sleepSeconds = 3;
	        var sleepInterval = 0.1;
	        var lastSize = 0;
	        
	        while ( sleepSeconds > 0 ) {
	            var curSize = jvm_fs_filesize( tmpSourcePath );
	            if ( curSize > 0 ) {
	                if ( lastSize > 0 && lastSize == curSize && !(--cnt) ) {
	                    // If the file size does not change in (sleepInterval * cnt) seconds
	                    // We think the decompile step is finished
	                    break;
	                }
	                
	                lastSize = curSize;
	            }
	            
	            jvm_sleep( sleepInterval );
	            sleepSeconds -= sleepInterval;
	        }
	        
	        //if ( !name || name.toString().length == 0 ) {
	            classname = jvm_get_classname_from_source( tmpSourcePath );
	        //}
	        
	        jvm_load_class_by_path( classname, tmpSourcePath );
	        klass = jvm_class( classname );
	       
	    }

	    tmsa_report( "define_class", klass.getName__Ljava_lang_String2() );

	    return klass;
	}

	return ClassLoader;
})();
jvm_load_class( "java.lang.ClassLoader" );
