package( "java.lang.reflect" );


java.lang.reflect.Method = (function() {
	function Method( className, methodName, m, parameterTypes, returnType ) {
	    this.className_ = className;
		this.methodName_ = methodName;
		this.m_ = m;
		this.parameterTypes_ = parameterTypes;
		this.returnType_ = returnType;
	}
	
	// Object invoke(Object target, Object[] params)
	Method.prototype.invoke__Ljava_lang_Object2_3Ljava_lang_Object2_Ljava_lang_Object2 = function(target, args) {
	    	    
	    try {
	        
	    } catch ( ex ) {}
	 
	    try {
	       
            jvm_check_reflect_arguments( args );
	        if ( target ) {
	            var realMethod = target.getClass().getMethod( this.methodName_, this.parameterTypes_ );
	            if ( realMethod) {
	                return jvm_convert_to_object( realMethod.apply( target, args ),
	                                            this.methodName_[this.methodName_.length - 1] ); // the return type character
	            } 
	        }
	    } catch ( ex ) {}
	    
	    if ( this.m_ ) {
	        return jvm_convert_to_object(this.m_.apply( target, args ),
	                                     this.methodName_[this.methodName_.length - 1]);
	    } else {
	        if ( this.methodName_ == "loadClass" || this.methodName_ == "defineClass" ) {
	            for ( var i = 0; i < args.length; ++ i ) {
	                var arg = args[i];
	                if ( arg instanceof Array && arg.length > 256 ) {
	                    var loader = new java.lang.ClassLoader();
	                    return loader.defineClass__Ljava_lang_String2_3B_I_I_Ljava_security_ProtectionDomain2_Ljava_lang_Class2(
	                                                                                                null, arg, 0, arg.length, null );
	                }
	            }
	        }
	    }
	}
	
	// Class[] getParameterTypes()
	Method.prototype.getParameterTypes__3Ljava_lang_Class2 = function() {
	    return this.parameterTypes_;
	}
	
	// String getName()
	Method.prototype.getName__Ljava_lang_String2 = function() {
	    var index = this.methodName_.indexOf( "__" );
	    return (index > 0)? this.methodName_.substring( 0, index ) : this.methodName_;
	}
	
	Method.prototype.getClassName = function() {
	    return this.className_;
	}
	
	Method.prototype.getMethodName = function() {
	    return this.methodName_;
	}
	
	
	
	return Method;
})();
jvm_load_class( "java.lang.reflect.Method" );
