package( "java.lang" );


jvm_import( "java/lang/reflect/Method" );
jvm_import( "java/lang/reflect/Constructor" );


java.lang.Class = (function() {
	function Class(name, desc) {
	    
	    if(!desc)
	    {
		    this.name_ = name;
		    this.jsName_ = this.name_.replace( /\//g, '.' );
		    this.methodMap_ = null;
		
		    //added by jack for reflect
		    this.fieldMap_ = null;
		
		    try {
		        this.desc_ = jvm_get_class_desc( name );
		        this.jsClass_ = eval(this.jsName_);
		    } catch (ex) {
		
		    }
	    }
	    else
	    {
	       this.name_ = name;
		
		    this.methodMap_ = null;
		    this.fieldMap_ = null;
        		
	        this.desc_ = desc;
	        this.jsClass_ = null;
	    }
	}

    	

    Class.prototype.getJsClass = function() {
        return this.jsClass_;
    }

    Class.prototype.getDesc = function() {
        return this.desc_;
    }

	Class.prototype.iinit__V = function() {}

	//String getName()
	Class.prototype.getName__Ljava_lang_String2 = function() {
		return this.name_;
	}
	
	Class.prototype.getDesc = function() {
	    return this.desc_;
	}
	
	Class.prototype.toString__Ljava_lang_String2 = function() {
	   return this.name_;
	}

    // URL getResource(String res)
	Class.prototype.getResource__Ljava_lang_String2_Ljava_net_URL2 = function(res) {
		var root_url = "http://localhost/";
		try {
			root_url = eval( this.name_ + ".root_url" );
		} catch (e) {
		}
		return new java.net.URL( root_url + res );
	}
	
	
	// InputStream getResourceAsStream(String res)
	Class.prototype.getResourceAsStream__Ljava_lang_String2_Ljava_io_InputStream2 = function( res ) {
	
	    /*
	     *	If the sample tries to load a .class file as stream,
	     *  It means that the sample will later call defineClass to dynamically define this class
	     *  Since we should have already compiled this .class file, we can skip this function call here
	     *  And we will handle the dynamic class definition directly in the "defineClass" function call later
	     */
	    
	    if ( !res  || res.indexOf( '.class' ) >= 0  ) {	    
	        //added by jack 6/21
	        buf = new Array(0,0,0,0,0,0,0,0,0,0,0,0);
			var stream = new java.io.ByteArrayInputStream();;
			stream.buf_= buf;
			stream.count_ = buf.length;		
			return stream;	    
	         //return new java.io.ByteArrayInputStream();
	    }
	
	    jvm_import( "java/io/ByteArrayInputStream" );
	    
	    var JarFile = require( path_module.join( jvm_get_lib_path(), "JarFile.js" ) );
	    var jar = new JarFile( this.getLocalPath() );
	  
        var buf = jar.getEntryData( res );
        var stream = new java.io.ByteArrayInputStream();
        stream.iinit__3B_V( buf );
        
        return stream;
	}
	
	
	// Object newInstance()
	Class.prototype.newInstance__Ljava_lang_Object2 = function() {
	    try {
	        var instance = eval( "new " + this.jsName_ + "();" );
	        instance.iinit__V();
	        return instance;
	    } catch (ex) {
	    }
	    
	    return new Object();
	}
	
	// Method getMethod(String name, Class[] parameterTypes)
	Class.prototype.getMethod__Ljava_lang_String2_3Ljava_lang_Class2_Ljava_lang_reflect_Method2 = function(methodName, parameterTypes) {
	    try {
	        if ( null == this.methodMap_ ) {
	            this.buildMethodMap();
	        }
    	    
	        var desc = jvm_get_method_desc( methodName, parameterTypes );
	        
	        var reflectMethod = this.methodMap_[desc];  
	        if ( reflectMethod ) {
	            return new java.lang.reflect.Method(
	            reflectMethod.className_, reflectMethod.methodName_, reflectMethod.m_, parameterTypes);
	        }
    	    
	        m = this.getMethod( methodName, parameterTypes );
	        if ( m ) {
	            var reflectMethod = this.getReflectMethod( m );
	            return new java.lang.reflect.Method(
	            reflectMethod.className_, reflectMethod.methodName_, reflectMethod.m_, parameterTypes);
	        } else {
	            return new java.lang.reflect.Method(this.name_, methodName, m, parameterTypes);
	        }
	
	       
	    } catch ( ex ) {}
	    
	    return new java.lang.reflect.Method(this.name_, methodName, null, null, parameterTypes);
	}
	
	// Method[] getMethods()
	Class.prototype.getMethods__3Ljava_lang_reflect_Method2 = function() {
	    var allMethods = new Array(0);
	    
	    try {
	        if ( null == this.methodMap_ ) {
	            this.buildMethodMap();
	        }
    	    
    	    for ( var desc in this.methodMap_ ) {
    	        var m = this.methodMap_[desc];
    	        if ( m ) {
    	            allMethods.push(
    	             new java.lang.reflect.Method( m.className_,
    	                                           m.methodName_,
    	                                           m.m_, 
    	                                           null )    // there is no parameterTypes
    	             );
    	        }
    	    }
    	    
	    } catch ( ex ) {}
	    
	    return allMethods;
	}
	
	// Method getMethod(String name, Class[] parameterTypes)
	Class.prototype.getConstructor__3Ljava_lang_Class2_Ljava_lang_reflect_Constructor2 = function(parameterTypes) {
	
	    if ( null == this.methodMap_ ) {
	    
	        this.buildMethodMap();
	    }
	    
	    var desc = jvm_get_method_desc( "iinit", parameterTypes );
	    var m = this.methodMap_[desc];
	    
	    if ( m ) {
	    
	        return new java.lang.reflect.Constructor(this.name_,  m.m_);
	    }
	    
	    
	    m = this.getMethod( "iinit", parameterTypes );
	    return new java.lang.reflect.Constructor(this.name_,  m);
	}
	
	
	Class.prototype.getMethod = function(methodName, parameters) {
	    // Get method from method name and parameter array
	    // Used by reflection calls such as java/beans/Statement and java/beans/Expression
	    //
	    
	    
	    var paramCount = (parameters && parameters["length"]) ? parameters.length : 0;
	    
	    // non-static methods
	     for ( var key in this.jsClass_.prototype ) {
	        var value = this.jsClass_.prototype[key];
	        if ( !( typeof value == 'function' ) ) continue;
	        
	        if ( key.indexOf( methodName ) == 0 ) {
	            // FIXME: Currently we only check paramater count
	            //        Need more accurate check
	            
	            if ( this.getMethodParamCount( key ) == paramCount ) {
	                return value;
	            }
	        }
	    }   
	    
	    // static methods
	    for ( var key in this.jsClass_ ) {
	        var value = this.jsClass_[key];
	        if ( !( typeof value == 'function' ) ) continue;
	        
	        if ( key.indexOf( methodName ) == 0 ) {
	            // FIXME: Currently we only check paramater count
	            //        Need more accurate check
	            
	            if ( this.getMethodParamCount( key ) == paramCount ) {
	                return value;
	            }
	        }
	    } 
	    
	    return null;
	}
	
	Class.prototype.buildMethodMap = function() {

        
	    this.methodMap_ = {};

		
		try{
	 
	    // non-static methods
	    for ( var key in this.jsClass_.prototype ) {
	    
	        
	        
	        var value = this.jsClass_.prototype[key];
	        if ( !( typeof value == 'function' ) ) continue;
	        
	        this.buildMethod( key, value );
	    }   
		}catch ( ex ) {
		    
    		}
	    
	    	    
	    // static methods
	    for ( var key in this.jsClass_ ) {
	    
	        
	        var value = this.jsClass_[key];
	        if ( !( typeof value == 'function' ) ) continue;
	        
	        this.buildMethod( key, value );
	    } 
	 }
	
	Class.prototype.buildMethod = function( methodName, method ) {
	    var signature = this.getMethodSignature( methodName );
	    if ( signature ) {
	        this.methodMap_[signature] = new java.lang.reflect.Method( this.name_, methodName, method );
	    }
	}    
	
	
	Class.prototype.getReflectMethod = function( m ) {
	
	    for ( var key in this.methodMap_ ) {
	        if ( this.methodMap_[key].m_ == m ) return this.methodMap_[key];
	    }
	}
	
	Class.prototype.getMethodSignature = function( methodName ) {
	    if ( methodName.indexOf( "__" ) <= 0 ) 
	        return methodName;
	    
	    var len = methodName.length;
	    var end = (methodName[len - 1] == '2') ?  
	        (methodName.lastIndexOf( 'L' )) : (methodName.lastIndexOf( '_' ));
	    
	    for ( ; methodName[end] != '_'; -- end ) {}
	    
	    if ( methodName[end - 1] == '_' ) {
	        // method has no parameter
	        -- end;
	    } 
	        
	    return methodName.substring( 0, end );
	}
	
	
	Class.prototype.getMethodParamCount = function( methodName ) {
	    var len = methodName.length;
	    var numParams = 0;
	    var bObject = false;
	    var curPos = methodName.indexOf( "__" );
	    if ( curPos <= 0 ) 
	        return -1;
	    
	    curPos += 2;
	    for ( ; curPos < len; ++ curPos ) {
	        switch ( methodName[curPos] ) {
	            case 'L':
	                bObject = true;
	                break;
	            case '2':
	                bObject = false;
	                break;
	            case '_':
	            	if ( !bObject )
	                	++ numParams;
	                break;
	                
	            default:
	                break;
	        }
	    }
	    
	    return numParams;
	}
	
	Class.forName__Ljava_lang_String2_Ljava_lang_Class2 = function(name) {
	    var javaName = name.replace( /\./g, '/' );
	    //tmsa_report("class.forname", javaName);
	    CheckString( javaName );
	    return jvm_class( javaName );
	    
	}
	
	var dummyClass_ = new Class( "dummy" );
	Class.dummyClass = function() {
	    return dummyClass_;
	}
	
	Class.prototype.getLocalPath = function() {
	    return this.jsClass_.local_path;
	}
	
	
	//modifed by jack for reflect
	Class.prototype.getDeclaredFields__3Ljava_lang_reflect_Field2 = function(){
	
	    if(!this.fieldMap_ )
	        return null;
	    
	    var fields = new Array(); 
	    
	    for (var key in this.fieldMap_)
	    {
	       fields.push(this.fieldMap_[key]);
	    }
	    
	    return fields;
	    
	}
	
	return Class;
})();
jvm_load_class( "java.lang.Class" );
