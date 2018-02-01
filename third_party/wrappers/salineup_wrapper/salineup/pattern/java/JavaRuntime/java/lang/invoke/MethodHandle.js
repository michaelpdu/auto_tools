package( "java.lang.invoke" );


java.lang.invoke.MethodHandle = (function() {
	function MethodHandle() {
	}

    // invokeWithArguments(List<?> arguments)
    MethodHandle.prototype.invokeWithArguments__3Ljava_lang_Object2_Ljava_lang_Object2 = function(args) {
        jvm_check_reflect_arguments( args );
        
        for ( var i = 0; i < args.length; ++ i ) {
            var arg = args[i];
            
            // check whether the argument is a byte array with class binary
            
            if ( arg && arg["length"] && arg.length > 1024 
            && arg[0] == -54 &&  arg[1] == -2 && arg[2] == -70 && arg[3] == -66  ) 
            {
           
                var klass = 
                java.lang.ClassLoader.prototype.defineClass__Ljava_lang_String2_3B_I_I_Ljava_security_ProtectionDomain2_Ljava_lang_Class2.apply( null, [null, arg, 0, arg.length, null] );
                
                return klass;
            }
            
        }
    }

	return MethodHandle;
})();
jvm_load_class( "java.lang.invoke.MethodHandle" );
