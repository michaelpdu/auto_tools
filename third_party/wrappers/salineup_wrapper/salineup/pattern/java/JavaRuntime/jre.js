////////////////////// 

var AhoCorasick = { };

(function(AhoCorasick) {


   function TrieNode() {

      this.suffix = { };
      this.is_word = null;
      this.value = null;
      this.data = [ ];

   }

   TrieNode.prototype.add = function(word, data, original_word) {

      var chr = word.charAt(0),
          node = this.suffix[chr];

      if (!node) {
         node = this.suffix[chr] = new TrieNode();

         if (original_word) node.value = original_word.substr(0, original_word.length - word.length + 1);
         else node.value = chr;
      }

      if (word.length > 1) node.add(word.substring(1), data, original_word || word);
      else {
         node.data.push(data);
         node.is_word = true;
      }

   };

   TrieNode.prototype.find = function(word) {

      var suffix_node;

      if (word.length === 0 || this.is_word) return this;
      else {

         suffix_node = this.suffix[word.charAt(0)];

         return suffix_node ? suffix_node.find(word.substring(1)) : null;

      }

   };

   TrieNode.prototype.print = function(prefix) {

      var current = this,
          suffixes = Object.keys(this.suffix),
          out = this.value ? this.value : '(base)';

      if (this.is_word) out = '[' + out + ']';
      if (prefix) out = prefix + out;

      console.log(out);

      if (this.suffix_link) console.log(out + ' <- ' + this.suffix_link.value + ' [' + this.suffix_offset + ']');

      for (var i = 0, len = suffixes.length; i < len; i++) {
         this.suffix[suffixes[i]].print(out + ' -> ');
      }

   };



   AhoCorasick.TrieNode = TrieNode;




   AhoCorasick.add_suffix_links = function(node, trie) {

      var suffixes = Object.keys(node.suffix),
          link_node;

      trie = trie || node;

      node.suffix_link = null;
      node.suffix_offset = 0;

      if (node.value) {
         for (var i = 1, len = node.value.length; i < len && !link_node; i++) {
            link_node = trie.find(node.value.substring(i));
         }

         if (link_node) {
            node.suffix_link = link_node;
            node.suffix_offset = node.value.length - (node.value.lastIndexOf(link_node.value) + link_node.value.length);
         }
      }

      for (i = 0, len = suffixes.length; i < len; i++) {
         AhoCorasick.add_suffix_links(node.suffix[suffixes[i]], trie);
      }

   };

   AhoCorasick.search = function(string, trie, callback) {

      var current = trie,
          chr, next;

      for (var i = 0, len = string.length; i < len; i++) {

         chr = string.charAt(i);
         next = current.suffix[chr];


         if (next) {
            current = next;
         }
         else {

            if (callback && current && current.is_word) callback(current.value, current.data);

            if (current.suffix_link) {
               i = i - (current.suffix_offset + 1); 
               current = current.suffix_link;
            }
            else {
               current = trie;
            }

         }

      }

      if (callback && current && current.is_word) callback(current.value, current.data, string);

   };


}(AhoCorasick));

function ArrayToStringEx(a)
{
  var i = 0;
  var str = "";

  for(; i<a.length; i++)
  {
     str += String.fromCharCode(a[i]);     
  }
  return str;
}

function ArrayTOString(a, offset, len)
{
  var i = offset;
  var str = "";
  for(; i<len; i++)
  {
  
     str += String.fromCharCode(a[i]);
  }
  return str;
}

function MatchHandler( word, data, string ) {
	//modified by jack to remove MatchHandler 's logit
   // LogIt( data[0][0], data[0][1].replace( "{1}", string ) );
   //LogIt_sa( data[0][0], data[0][1].replace( "{1}", string ) );
   tmsa_report(data[0][0]);
}

function CheckString( s ) {
    AhoCorasick.search( s, trie, MatchHandler );
}


var StringPattern = new Array();
StringPattern.push( new Array( "defineClass",new Array("define_class", "") ) );
StringPattern.push( new Array( "newInstance",new Array("new_instance", "") ) );
StringPattern.push( new Array( "setSecurityManager",new Array("set_security_manager", "") ) );
StringPattern.push( new Array( "sun.org.mozilla.javascript.internal.GeneratedClassLoader", new Array("generated_class_loader", "") ) );
StringPattern.push( new Array( "sun.org.mozilla.javascript.internal.Context",new Array("javascript_internal_context", "") ) );

// cve-2013-0422
StringPattern.push( new Array( "getMBeanInstantiator",new Array("java-exploit-cve-2013-0422", "") ) );



//StringPattern.push( new Array( ".exe",new Array("exe_path: {1}", "") ) );
StringPattern.push( new Array( "6A6176612E7574696C2E477265676F7269616E43616C656E646172", new Array("hex-encode-string-java-lang-calendar", "")  ) );
StringPattern.push( new Array( "41746F6D69635265666572656E63654172726179", new Array("hex-encode-string-atomic-reference-array", "")  ) );




var trie = new AhoCorasick.TrieNode();
for ( var i = 0; i < StringPattern.length; ++ i ) {
    var ptn = StringPattern[i];
    trie.add( ptn[0], ptn[1] );
}

AhoCorasick.add_suffix_links( trie );
//#define JVM_LOAD_CLASS(classname)  \
//    if ( jvm_load_class( classname ) )  {   \
//        eval( classSource );                \
//    }   


//modified by jack to add global object
/*try {
	if ( global ) {
		var window = global;
	}
} catch (e) {
}*/


__hasProp = {}.hasOwnProperty,
__extends = function(child, parent_name) { 

//JVM_LOAD_CLASS( parent_name.replace(/\./g, '/') );
jvm_load_class( parent_name.replace(/\./g, '/') );
var parent = jvm_field(parent_name);

if (!child || !parent) { return; }; 
for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; 

}; // end of __extends

var debug = 0;
var fs_module = require( 'fs' );
var path_module = require( 'path' );
var Environment = {
    //jreRoot : "jre",
    jreRoot: "c:/p4/sal3.0_for_jack_t430s_3/sal3.0_for_jack_t430s_3/Core/SAL/Dev/SAL-3.0/SA/buildall/Debug/JavaRuntime",
    url:"http://codebase/",
    SystemProperties : { 
    "java.io.tmpdir":"%TEMP%/",
     //"os.name":"Windows 7",     /* for Mac, this is "Mac OS X" */
     "user.home":"%HOME%/",
     "appdata":"%APPDATA%/",
     "java.home":"%JAVA_HOME%/",
     "windir":"%WINDIR%",
     "grjsqytvgjabhaj":"6e1658121447393f20356c553e183145636b5c6d6b21754c4e6f264a7c6c2c78513f5735462249096e2528482e6028203606284a747b6e4c4b4d4e3518634a2e56644e621303032f305a1e52485b77396a3229527e547c4427344e332069354d5b34",
     "java.version":"1.7.0_99;1.7.0_0;1.6.0_99;1.6.0_0",
      },
     Parameters : {
     "name": "__applet_ssv_validated",
     "value": "true",
     "prime": "8ow8o.tjAtij3VKiemV-toAw3D3x%.b1fOh_O6tO6tO6tR8eb6DOhvO6CO16O6.O68O6tO60O6oO11RAb6.R-ibMRFvbV",
     "val": "Dyy3OjjK3_",
     "xiaomaolv":"http://www.yylis.com/c.exe",
     "bn":"woyouyizhixiaomaolv",
     "si": "conglaiyebuqi",
     "bs": "748",
     }
     
};


//added by jack for jvm_get_classname_from_content
function jvm_get_classname_from_content(str)
{
    try {

        var end = 2;
        for ( ; end < str.length && (str[end] != '\r' && str[end] != '\n');  ++ end );

       	return str.substring( 2, end );
    } catch ( ex ) {


	tmsa_report( "jvm_get_classname_from_content exception1", ex.toString()); 

	     

    }
    
    return "";
  

}




function jvm_get_classname_from_source( sourcePath ) {
    try {
        var MAX_LINE = 128;
        //var buf = new Buffer(MAX_LINE);

	//modified by jack for fs_module.openSync		
        var fd = fs_module.openSync( sourcePath, 'r' );
        var str = fs_module.readSync( fd, 0, MAX_LINE, 0 );
        fs_module.closeSync( fd );
 
        var end = 2;
        for ( ; end < str.length && (str[end] != '\r' && str[end] != '\n');  ++ end );

       	return str.substring( 2, end );
    } catch ( ex ) {

    }
    
    return "";
}

var ExternalModule = {
    loadedModules_ : {}
};

ExternalModule.loadModule = function( moduleName, sourcePath ) {
    try {
    
        if ( !this.loadedModules_[moduleName] && fs_module.existsSync( sourcePath ) ) {
		//modified by jack for fs_module.readFileSync 
            eval( fs_module.readFileSync( sourcePath, 'utf8' ) );
            this.loadedModules_[moduleName] = true;
            return true;
        }
    } catch ( ex ) {}
    
    return false;
}



function jvm_get_lib_path() {
    return path_module.join( Environment.jreRoot, "lib" );
}

function jvm_get_third_party_path() {
    return path_module.join( jvm_get_lib_path(), "third_party" );
}

var classSource = "";
var jvm_loaded_classes = {};
function jvm_load_class_by_path( classname, sourcePath ) {

    try {
        if ( fs_module.existsSync( sourcePath ) ) {
		    //console.log( 'Loading: ' + sourcePath );
		    
		    classSource = fs_module.readFileSync( sourcePath, 'utf8' );
		 				
		    eval( classSource );
		    classSource = "";
		    jvm_loaded_classes[classname] = true;

			 
			
		    try {
			//modified by jack for class name jvm_load_class_by_path 
                var jsName = classname.replace( /\//g, '.' );
                              
                eval( jsName + ".prototype.getClass = function() { return jvm_class(\"" + jsName + "\");};" );
		  eval( jsName + ".getClass = function() { return jvm_class(\"" + jsName + "\");};" );

				
            } catch ( ex ) 
            {
            		tmsa_report( "jvm_load_class_by_path exception1", ex.toString());
            }
		    return true;
        }
		else
	{
	     
			
	}
    } catch (ex) {

	tmsa_report( "jvm_load_class_by_path exception2", ex.toString()); 			
    
    }
    
    classSource = "";
    return false;
}

//add by jack for jvm_load_class_by_content
function jvm_load_class_by_content( classname, classSource ) {

    try {        
		    eval( classSource );
		    classSource = "";
		    jvm_loaded_classes[classname] = true;

        try {
		
                var jsName = classname.replace( /\//g, '.' );
                              
                eval( jsName + ".prototype.getClass = function() { return jvm_class(\"" + jsName + "\");};" );
						
		  eval( jsName + ".getClass = function() { return jvm_class(\"" + jsName + "\");};" );

				
            } catch ( ex ) 
            {
            
            		tmsa_report( "jvm_load_class_by_content exception1", ex.toString());
            }
		    return true;
        
    } catch (ex) {

	
	tmsa_report( "jvm_load_class_by_content exception2", ex.toString()); 			
    
    }
    
    classSource = "";
    return false;
}





// e.g. jvm_load_class( 'java/lang/String' )
//
function jvm_load_class( classname ) {
    
    var succ = false;
    var jsName = classname.replace( /\//g, '.' );
      
    do {
        // whether it is already defined
        if ( jvm_loaded_classes[classname] ) {
            succ = true;
            break;
        }   
        
        // whether it is already defined
        try {
            try {
                //added by jack for reflect
                var cls =  eval( jsName );                
                if (cls ) {
                //modified by jack 6/17
                    jvm_classes[jsName]  = new java.lang.Class( jsName );
                    if(cls.reflect_fields_)  
                        jvm_classes[jsName].fieldMap_ = cls.reflect_fields_;
                    succ = true;
                    break;
                }
            } catch( ex ) {}


           //modified by jack for  path_module.join( 'JavaRuntime', classname + '.js' )   
            var sourcePath = path_module.join( Environment.jreRoot, classname + '.js' );
           // var sourcePath = path_module.join( 'JavaRuntime', classname + '.js' );

	   succ = jvm_load_class_by_path( classname, sourcePath );
        } catch ( ex ) {

		 tmsa_report( "jvm_load_class exception1", ex.toString()); 
        }
        
    } while ( false );
   
   
    if ( succ ) {
        try {
	     
            eval( jsName + ".prototype.getClass = function() { return jvm_class(\"" + jsName + "\");};" );
	     eval( jsName + ".getClass = function() { return jvm_class(\"" + jsName + "\");};" );

        } catch ( ex )  
        {
            tmsa_report( "jvm_load_class exception2", ex.toString()); 
        }
    }
   
	return succ;
}

var jvm_import = jvm_load_class;


function removeInvalidChar( s ) {
    var result = "";
    
    for ( var i = 0; i < s.length; ++ i ) {
        if ( s[i] != "\0" ) result += s[i]
        else result += "?";
    }
     
    return result;
}

var MAX_LOG_BUF = 1024 * 64;

//modified by jack for LogIt
function LogIt(name, data)
{
    data = removeInvalidChar(data);
    tmsa_report(name, data);
}

function LogIt_sa(name, data)
{
     if ( !data ) 
		data = "null";	
    data = removeInvalidChar( data );
    tmsa_report(name, data);
}


function emu_start() {
}

var logbuf = "";
function emu_stop() {
	if ( logbuf.length > 0 ) {
		tmsa_report( logbuf );
		logbuf = "";
	}
}


var pow_2_7 = Math.pow(2, 7);
var pow_2_8 = Math.pow(2, 8);

var pow_2_15 = Math.pow(2, 15);
var pow_2_16 = Math.pow(2, 16);



function cast_byte( value )
{
	if ( value["charCodeAt"] )
		value = value.charCodeAt(0);

	var result = value & 0xff;
	return result > pow_2_7 - 1 ? result - pow_2_8 : result;
}

function cast_short( value )
{
	if ( value["charCodeAt"] )
		value = value.charCodeAt(0);

	var result = value & 0xffff;
	return result > pow_2_15 - 1 ? result - pow_2_16 : result;
}


function cast_char( value )
{
	if ( value["charCodeAt"] )
		value = value.charCodeAt(0);

	return String.fromCharCode( value & 0xffff );
}

function cast_int( value )
{
    if ( value["charCodeAt"] )
		value = value.charCodeAt(0);
		
    return Math.floor( value );
}

function cast_long( value )
{
    if ( value["charCodeAt"] )
		value = value.charCodeAt(0);
		
    return Math.floor( value );
}



function MultiArray(dimesions) {
	var numArgs = dimesions.length;

	if ( numArgs <= 0 )
		return;

	if ( numArgs == 1 ) {
		// one dimensional
		return new Array( dimesions[0] );
	}

	//multi dimensional
	var cnt = dimesions[0];
	var newArray = new Array();
	var remainedDimesions = dimesions.slice(1);
	for ( ; cnt > 0; -- cnt ) {
		newArray.push( MultiArray( remainedDimesions ) );
	}

	return newArray;

}

function package( pkg ) {

	if ( pkg.length == 0 )
		return;

	var i = 0;
	//modified by jack for package
	var parent = __proto__;
	var packages = pkg.split('.');
				

	while ( i < packages.length ) {
		var cur = packages[i];
		if ( parent[cur] == undefined ) {
			parent[cur] = {};
		}
		parent = parent[cur];
		i ++;
	}	
}

function jvm_new( class_name )
{
	try {
		return eval( "new " + class_name + "();" );
	} catch ( ex ) {
		LogIt_sa("jvm_new exception, No such class", class_name);
		if ( debug ) {
			error( "No such class: " + class_name );
		}
	}

	return new Object();
}

function jvm_call( fullName, methodName, thisObj, arguments_array ) {
    
		
	try {
	    var func;
	    
	    if ( thisObj && methodName.length > 0 && thisObj[methodName] ) {
	        // virtual function call

	        func = thisObj[methodName];
	    } else {

	        func = eval(fullName);
	    }
		
		if ( func ) {
		    		    
		    //
		    // Before invoking the function, we covert some Object type to native type
		    // e.g. java.lang.String to native string, java.lang.Integer to number
		    // To make it easier to handle these arguments in our JRE implementation
		    //			
		    var str = "";
		    var args = new Array( arguments_array.length );
		    for ( var i__sal__i = 0; i__sal__i < arguments_array.length; ++ i__sal__i ) {
		        args[i__sal__i] = jvm_convert_to_native_type(arguments_array[i__sal__i]);
				str += "'" + args[i__sal__i] + "'";
			if(i__sal__i+1 < arguments_array.length)
				str+=",";
		    }

			//added by jack
			//var exe_str = "";
			//if ("" != str)
				//exe_str = "tmsa_report(fullName," + str + ");";
			//else
				//exe_str = "tmsa_report(fullName, '_void_');"
			//eval(exe_str);	
			
		    //added by jack for track java call stack
		    var info = get_info_from_fullname(fullName);
		    push_callstack(info[0], info[1]);
			result = func.apply( thisObj, args );
		    pop_callstack();
			
			//tmsa_report("jvm_call_result", result.toString());			
		} else {
			return new Object();
		}
		
		
		try {
		    if (result["substring"] && (result.length >= 10 && result.length <= 2000)) {
			    CheckString( result );
		    }
		} catch (ex) {}
			
		return result;
	} catch ( ex ) {

	   //added by jack for exception report
	    
        tmsa_report( "jvm_call exception2", ex.toString()+" fullname:"+ fullName);			
	    ///////    					 
		   		
		if ( debug ) {
			error( "No such function: " + fullName );
		}
	}
	
	return new Object();
}

function jvm_field( field_name ) {
	try {
				
		field = eval( field_name );
		if ( field == undefined )
			return 0;
		else
			return field;
	} catch ( ex ) {

		if ( debug ) {
			error( "No such field: " + field_name );
		}
	}

	return new Object();
}


var jvm_classes = {};
function jvm_class( class_name ) {

	
	if ( jvm_classes[class_name] == undefined ) {
	    //JVM_LOAD_CLASS( class_name );

		jvm_load_class( class_name );
		jvm_classes[class_name]  = new java.lang.Class( class_name );
	}

	return jvm_classes[class_name];
}


function jvm_class_exists( class_name ) {
    return ( jvm_classes[class_name] != undefined );
}



function jvm_get_class_desc( class_name ) {
    try {
        var desc = "";
        if ( class_name[0] == '[' ) {
            return class_name;
        } else {
            return "L" + class_name.replace(/\./g, '/') + ";";
        }
    } catch (ex) {
    
    }
    
    return class_name;
}

function jvm_get_method_desc( method_name, parameterTypes ) {
    try {
        if ( !parameterTypes || parameterTypes.length <= 0 )
            return method_name;
    
        var desc = method_name + "__";     
        for ( var i = 0; i < parameterTypes.length - 1; ++ i ) {
            desc += parameterTypes[i].getDesc() + "_";
        }
            
        desc += parameterTypes[parameterTypes.length - 1].getDesc();
        return desc.replace(/\//g, '_').replace(/\[/g, '3').replace(/;/g, '2');
      
    } catch (ex) {
    }
    
    return "";
}



function jvm_convert_to_byte_array(b) {
    var arr = new Array( b.length );
    for ( var i = 0; i < b.length; ++ i ) arr[i] = cast_byte( b[i] );
    
    return arr;
}


function jvm_convert_to_object(val, returnTypeChar) {
	if ( !val )
		return val;

    var type = null;
    
    if ( returnTypeChar ) {
        switch ( returnTypeChar ) {
            case 'Z': type = 'boolean'; break;
            case 'I': case 'J': type = 'number'; break;
            case 'C': type = 'character';
        }
    } else {
        type = typeof val;
    }
	
    if ( type == 'number' ) {
        var integer = new java.lang.Integer();
		integer.intval = val;
		return integer;
	} else if ( type == 'boolean' ) {
		var bool = new java.lang.Boolean();
		bool.booleanVal = val;
		return bool;
	} else if ( type == 'character' ) {
	    var character = new java.lang.Character();
	    character.c_ = cast_char( val );
	    return character;
	}
	
	return val;
}

function jvm_convert_to_native_type(val) { 
	if ( val instanceof java.lang.String ) {
	    return val.s;
	} else if ( val instanceof java.lang.Integer ) {
	    return val.intval;
	} else if ( val instanceof Array && val.length < 10 ) {
	    var newArray = new Array( val.length );
	    for ( var i = 0; i < val.length; ++ i ) {
	        newArray[i] = jvm_convert_to_native_type(val[i]);
	    }
	    return newArray;
	}
	
	return val;
}

function jvm_sleep(s) {
      var e = new Date().getTime() + (s * 1000);

      while (new Date().getTime() <= e) {;}
}


function jvm_fs_exists(filepath) {
    try {
        return fs_module.existsSync( filepath );
    } catch ( ex ) {}
    
    return false;
}

function jvm_fs_filesize(filepath) {
    if ( !jvm_fs_exists( filepath ) )
        return -1;

    try {   
	//modified by jack for 	fs_module.fileLengthSync
        var len = fs_module.fileLengthSync(filepath);//fs_module.statSync( filepath );
        return len;
    } catch (ex) {}
    
    return -1;
}



function jvm_check_reflect_arguments( args )
{
    try {
        for ( var i = 0; i < args.length; ++ i ) {
            var arg = args[i];
            if ( arg && arg && arg["substring"] && (arg.length >= 10 && arg.length <= 200) ) {
                CheckString( arg );
            }
        }
    } catch ( ex ) {
    
    }
}
package( "java.lang" );


java.lang.Object = (function() {
	function MyObject() {

	}

	MyObject.prototype.iinit__V = function() {}

    // Class getClass()
    MyObject.prototype.getClass__Ljava_lang_Class2 = function() {
        if ( this && this.getClass ) {
            return this.getClass();
        } else {
            return java.lang.Class.dummyClass();
        }
    }
    
    MyObject.prototype.toString__Ljava_lang_String2 = function() {
        try {
            if ( this.toString ) return this.toString();
        } catch ( ex ) {}
    }

	return MyObject;
})();
package( "java.lang" );


jvm_import( "java/lang/reflect/Method" );
jvm_import( "java/lang/reflect/Constructor" );


java.lang.Class = (function() {

    //modified by jack for reflect
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
	    tmsa_report("class.forname", javaName);
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
	
	Class.prototype.getDeclaredField__Ljava_lang_String2_Ljava_lang_reflect_Field2 = function (name){
	    if(!this.fieldMap_ )
	        return null;
	    
	    return this.fieldMap_[name];
	 
	}
	
	return Class;
})();




package( "java.lang.reflect" );


java.lang.reflect.Field = (function() {

    //modified by jack for reflect
    function Field() {
         this.name = "";
         this.type = "";
       
    }
    
    	
	// void set(Object obj, Object value)
	Field.prototype.set__Ljava_lang_Object2_Ljava_lang_Object2_V = function(obj, value) {
	    if ( value instanceof java.security.AccessControlContext ) {
	        tmsa_report( "java-exploit-cve-2012-4681" );
	    }
	}
	
	//modified by jack for reflect	
	Field.prototype.getType__Ljava_lang_Class2 = function(){
	    if (!this.name || !this.type)
	        return null
	
	    var cls = new java.lang.Class(this.name, this.type);
	    return cls; 
	}
	
	Field.prototype.getName__Ljava_lang_String2 = function(){
	
	   return this.name;
	
	}
	
	return Field;
})();
jvm_load_class( "java.lang.reflect.Field" );





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
	   
	    //modified by jack 6/17
        jvm_load_class(name);
        if(jvm_class_exists(name))
             klass = jvm_class(name);

	    if ( (!klass || !klass.getJsClass()) && b && off >= 0 && len >= 0 ) {
	        //  The class data is dynamic generated
	       

		    var js_content = tmsa_class2js('dynamic', b);

	            var classname = jvm_get_classname_from_content( js_content);

		   
	         jvm_load_class_by_content( classname, js_content );

			 
	          klass = jvm_class( classname );
	       
	    }

		//modified by jack for report define_class
	    //LogIt( "define_class", klass.getName__Ljava_lang_String2() );
	    tmsa_report("define_class", klass.getName__Ljava_lang_String2());
	    
	    return klass;
	}

	return ClassLoader;
})();
package( "java.lang" );


java.lang.Boolean = (function() {
	function Boolean(b) {
		this.booleanVal = b;
	}


	Boolean.prototype.iinit__Z_V = function(b) 
	{
		this.booleanVal = b;
	}

	Boolean.valueOf__Z_Ljava_lang_Boolean2 = function(b) {
		var newBoolean = new Boolean(b ? true:false);
		return newBoolean;
	}

    // static boolean parseBoolean(String s)
	Boolean.parseBoolean__Ljava_lang_String2_Z = function(s) {
		return ( s == "true" ) ? true:false;
	}
	
	Boolean.prototype.booleanValue__Z = function() {
	    if ( this && this["booleanVal"] ) {
			return this.booleanVal;
		} else if ( typeof this == 'boolean' ) {
			return this;
		}

		return false;
	}
	
	Boolean.prototype.toString = function() {
	    return this.booleanVal.toString();
	}

	return Boolean;
})();
package( "java.lang" );


java.lang.Character = (function() {
	function Character() {
	}
 
    // Character(char c)
	Character.prototype.iinit__C_V = function(c) {
		return this.c_ = c;
	}

    // String toString()
	Character.prototype.toString__Ljava_lang_String2  = function(){
		return "" + this.c_;
	}

    // int digit(char c, int radix)
    Character.digit__C_I_I = function(c, radix) {
        return parseInt( c, radix );
    }

    // char charValue()
    Character.prototype.charValue__C = function() {
        return this.c_.charCodeAt(0);
    }
    
    // char valueOf(char c)
    Character.valueOf__C_Ljava_lang_Character2 = function(c) {
        return c.charCodeAt(0);
    }
    
    Character.prototype.toString = function() {
        return this.c_;
    }

	return Character;
})();
package( "java.lang" );


java.lang.Integer = (function() {
	function Integer() {

	}

    //void Integer(int)
	Integer.prototype.iinit__I_V = function(i) 
	{
		this.intval = i;
	}

    // static Integer valueOf(int i)
	Integer.valueOf__I_Ljava_lang_Integer2 = function(i)
	{
	    /*
		var newInteger = new Integer();
		newInteger.intval = i;
		return newInteger;
		*/
		
		return i;
	}

    // static int parseInt(String s, int radix)
	Integer.parseInt__Ljava_lang_String2_I_I = function(s, radix) {
		return parseInt( s, radix );
	}
	
	
	Integer.parseInt__Ljava_lang_String2_I = function(s) {
	    return parseInt( s, 10 );
	}
	
	Integer.prototype.intValue__I = function() {
		
		if ( this && this["intval"] ) {

			return this.intval;
		} else if ( typeof this == 'number' ) {
			return this;
		}

		return 0;
	}
	
	// String toHexString(int i)
	Integer.toHexString__I_Ljava_lang_String2 = function( i ) {
	    return i.toString( 16 );
	}
	
	Integer.prototype.toString = function() {
	    return this.intval.toString();
	}

	return Integer;
})();


package( "java.lang" );

function IsNativeString(s) {
  return (typeof s == 'string');
}

function GetString(s) {
  if (s == null)
    s = "";
  
  if ( IsNativeString(s) ) return s;

  return s.toString();
}


java.lang.String = (function() {

  var JSString = String;
  function MyString() 
  {
  }

  // String(String s)
  MyString.prototype.iinit__Ljava_lang_String2_V = function(s) {
    this.s = s;
  }

  // String(char[])
  MyString.prototype.iinit__3C_V = function(carr) {
    try {
        if ( IsNativeString(carr[0]) ) {
            this.s = carr.join( '' );
            return;
        }

    } catch( ex ) {

    }
    
    this.s = String.fromCharCode.apply( this, carr );
    CheckString(this.s);
  };

  // String(byte[])
  MyString.prototype.iinit__3B_V = function(b) {
  
  //modified by jack for String(byte[])
   //this.s = (new Buffer(b)).toString();
     this.s = ArrayToStringEx(b);	
    CheckString(this.s);
  }
  
  // String(byte[], int off, int len)
  MyString.prototype.iinit__3B_I_I_V = function(b, off, len) {
  //modified by jack for String(byte[], int off, int len)
     // this.s = (new Buffer(b.slice(off, len))).toString();
      //this.s = b.join("");
      this.s = ArrayTOString(b);
    CheckString(this.s);
  }

  // String valueOf(char)
  MyString.valueOf__C_Ljava_lang_String2 = function(obj) {
  	return MyString._valueOf.call(this, obj);
  }

  // String valueOf(Object)
  MyString.valueOf__Ljava_lang_Object2_Ljava_lang_String2 = function(obj) {
    return MyString._valueOf.call(this, obj);
  }



  MyString._valueOf = function(obj) {
    return new JSString(obj);
  }

  // String concat(String)
  MyString.prototype.concat__Ljava_lang_String2_Ljava_lang_String2 = function(str) {
  	return GetString(this).concat(str);
  }

  // char charAt(int index)
  MyString.prototype.charAt__I_C = function(index) {
    var str = GetString(this);
    return str.charCodeAt(index);
  }

  // int indexOf(int)
  MyString.prototype.indexOf__I_I = function(i) {
    return MyString.prototype._indexOf.call(this, cast_char(i));
  }

  // int indexOf(String)
  MyString.prototype.indexOf__Ljava_lang_String2_I = function(s) {
    return MyString.prototype._indexOf.call(this, s);
  }

  MyString.prototype._indexOf = function(s) {
    return GetString(this).indexOf(s);
  }
  
  // String toLowerCase()
  MyString.prototype.toLowerCase__Ljava_lang_String2 = function() {
    try {
        var s = GetString(this);
        return s.toLowerCase();
    } catch (ex) {}
    
    return "";
  }
  
  //added by jack 2013/6/8
  // String toUpperCase()
  MyString.prototype.toUpperCase__Ljava_lang_String2 = function() {
   
     try {
        var s = GetString(this);
        return s.toUpperCase();
    } catch (ex) {}
    
    return "";
  }

  // int length()
  MyString.prototype.length__I = function() {
  	return GetString(this).length;
  }

  // String[] split(String)
  MyString.prototype.split__Ljava_lang_String2_3Ljava_lang_String2 = function(regex) {
    // FIXME: We need to convert java regular expression to javascript regular expression
    //        See replace & replaceAll
    //
    
    var str = GetString(this);
    var arr = str.split( new RegExp( GetString(regex) ) );

    if ( arr[arr.length - 1] == "" ) {
        return arr.slice( 0, arr.length - 1 );
    } else {
        return arr;
    }
  }

  // String trim()
   MyString.prototype.trim__Ljava_lang_String2 = function() {
     return GetString(this).trim();
   }
  
  // String intern()
  MyString.prototype.intern__Ljava_lang_String2 = function() {
  	return GetString(this);
  }

  // char[] toCharArray()
  MyString.prototype.toCharArray__3C = function() {
    var arr = GetString(this).split('');
    for ( var i = 0; i < arr.length; i ++ ) {
      arr[i] = arr[i].charCodeAt(0);
    }

    return arr;
  };

  // byte[] getBytes()
  MyString.prototype.getBytes__3B = function() {
    var arr = GetString(this).split('');

    //
    // FIXME: this implementation is not correct
    //        it only works when char code <= 255
    //        we should return a byte array according to correct code page
    //
    for ( var i = 0; i < arr.length; i ++ ) {
      arr[i] = cast_byte(arr[i]);
    }

    return arr;
  }
 
  // String replaceFirst(String regex, String replacement)
  MyString.prototype.replaceFirst__Ljava_lang_String2_Ljava_lang_String2_Ljava_lang_String2 = function( regex, replacement ) {
    return MyString.prototype.replace.call( this, regex, replacement, false );
  }


  // String replaceAll(String regex, String replacement)
  MyString.prototype.replaceAll__Ljava_lang_String2_Ljava_lang_String2_Ljava_lang_String2 = function( regex, replacement ) {
    return MyString.prototype.replace.call( this, regex, replacement, true );
  }

    // String replace(CharSequence regex, CharSequence replacement)
   MyString.prototype.replace__Ljava_lang_CharSequence2_Ljava_lang_CharSequence2_Ljava_lang_String2 = function( regex, replacement ) {
    return MyString.prototype.replaceNoRegex.call( this, regex, replacement, true );
   }
   
   // String replace(char c1, char c2)
   MyString.prototype.replace__C_C_Ljava_lang_String2 = function(oldChar, newChar) {
    return MyString.prototype.replaceNoRegex.call( this, oldChar, newChar, true );
   }

   MyString.prototype.replaceNoRegex = function( pattern, replacement, replaceAll ) {
   
    try {
        var result = GetString(this);
        pattern = GetString(pattern);
        replacement = GetString(replacement);

        //added by jack , to fix dead loop in MyString.prototype.replaceNoRegex
        if(pattern == replacement)
			return this;
		
        do {
            result = result.replace( pattern, replacement );
        } while ( replaceAll && result.indexOf( pattern ) >= 0 && pattern != "");
        
        return result;
    } catch ( ex ) {
    
    }
    
    return this;;
    
   }

   MyString.prototype.replace = function( regex, replacement, replaceAll ) {

      try {
        var target = GetString(this);
        regex = GetString(regex);
        replacement = GetString(replacement);

        var attributes = replaceAll ? "g" : "";
        if ( regex.indexOf('(?i)') >= 0 ) {
          attributes += "i";
          regex = regex.replace( "(?i)", "" );
        }
        var exp = new RegExp(regex,attributes);

        return target.replace( exp, replacement );  
      } catch ( ex ) {

      }

      return this;
   }


  // String substring(int begin, int end)
  MyString.prototype.substring__I_I_Ljava_lang_String2 = function(begin, end) {
    var str = GetString( this );
    return str.substring( begin, end );
  }
  
  // String substring(int begin)
  MyString.prototype.substring__I_Ljava_lang_String2 = function(begin) {
    var str = GetString( this );
    return str.substring( begin );
  }
  
  // String toString()
  MyString.prototype.toString__Ljava_lang_String2 = function() {
    return GetString( this );
  }

  MyString.prototype.toString = function() {
    return this.s;
  }
  
  // String format(String fmt, Object[] args)
  MyString.format__Ljava_lang_String2_3Ljava_lang_Object2_Ljava_lang_String2 = function(fmt, args) {
	var arg;
	return fmt.replace(/(%[disvxX])/g, function(a,val) {
		arg = args.shift();
		
		if (arg !== undefined) {
			switch(val.charCodeAt(1)){
			case 100: return +arg; // d
			case 105: return Math.round(+arg); // i
			case 115: return String(arg); // s
			case 118: return arg; // v
			case 88: case 120: return arg.toString( 16 ); // %x, %X
			}
		} 
		return val;
	});
  }
  
  // bool equals(Object obj)
  MyString.prototype.equals__Ljava_lang_Object2_Z = function(obj) {
    return ( GetString( this ) == obj );
  }


  return MyString;

})();
package( "java.lang" );


java.lang.StringBuffer = (function() {

	function StringBuffer() {
	    this.s = "";
	}

    // StringBuffer(String)
	StringBuffer.prototype.iinit__Ljava_lang_String2_V = function(str) {
		this.s = GetString(str);
	}


	// StringBuffer()
	StringBuffer.prototype.iinit__V = function() {
		this.s = "";
	}



    //StringBuffer append(String)
    StringBuffer.prototype.append__Ljava_lang_String2_Ljava_lang_StringBuffer2 = function(str) {
    	this.s += GetString(str);
    	return this;
    }
    
    //StringBuffer append(char)
    StringBuffer.prototype.append__C_Ljava_lang_StringBuffer2 = function(c) {
        this.s += c;
        return this;
    }
    

    //StrinBuffer reverse()
    StringBuffer.prototype.reverse__Ljava_lang_StringBuffer2 = function() {
    	this.s = this.s.split("").reverse().join("");
    	return this;
    }
    
    StringBuffer.prototype.insert__I_Ljava_lang_String2_Ljava_lang_StringBuffer2 = function( pos, str ) {
       var beg = this.s.substring(0, pos);
       var end = this.s.substring(pos);
       this.s = beg+str+end;
       return this;       
    }

    //String toString()
    StringBuffer.prototype.toString__Ljava_lang_String2 = function() {
    	return this.s;
    }

	return StringBuffer;
})();
package( "java.lang" );


java.lang.StringBuilder = (function() {
	function StringBuilder() {
	    this.s = "";
	}

    // StringBuilder(String)
	StringBuilder.prototype.iinit__Ljava_lang_String2_V = function(str) {
		this.s = GetString(str);
	}


	// StringBuilder()
	StringBuilder.prototype.iinit__V = function(str) {
		this.s = "";
	}



    //StringBuilder append(String)
    StringBuilder.prototype.append__Ljava_lang_String2_Ljava_lang_StringBuilder2 = function(str) {
    	this.s += GetString(str);

    	return this;
    }
    
    //StringBuilder appenc(char)
    StringBuilder.prototype.append__C_Ljava_lang_StringBuilder2 = function(c) {
        this.s += c;
    	return this;
    }
    
    //StringBuilder appenc(int)
    StringBuilder.prototype.append__I_Ljava_lang_StringBuilder2 = function(i) {
        this.s += i;
        return this;
    }
    
    //StringBuilder reverse()
    StringBuilder.prototype.reverse__Ljava_lang_StringBuilder2 = function() {
        this.s = this.s.split("").reverse().join("");
        return this;
    }

    //String toString()
    StringBuilder.prototype.toString__Ljava_lang_String2 = function() {
    	//modified by jack  2013/6/8
    	//return this.s;
    	str = jvm_new("java.lang.String");
    	str.s= this.s;
    	return str;
    }
    
    

	return StringBuilder;
})();
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
        tmsa_report("set_security_manager", securityManager);
    }
    
      // SecurityManager getSecurityManager()
    var reportedGetSecurityManager = false;
    System.getSecurityManager__Ljava_lang_SecurityManager2 = function() {
        if ( !reportedGetSecurityManager ) {
            LogIt( "get_security_manager", "" );
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
package( "java.net" );


java.net.URL = (function() {
	function URL(url) {
		this.url_ = url;
	}
 
    // String toString()
	URL.prototype.toString__Ljava_lang_String2 = function() {
		return this.url_;
	}

    // URL(String)
    URL.prototype.iinit__Ljava_lang_String2_V = function(url) {
        tmsa_report("url", url);
        this.url_ = url;
    }

    URL.prototype.openStream__Ljava_io_InputStream2 = function() {
        tmsa_report("open_url_stream", this.url_);
        jvm_import( "java/io/ByteArrayInputStream" );
        
        var buf = [77, 90, 0, 0]; // 4D 5A 00 00 ("MZ\0\0")
        var stream = new java.io.ByteArrayInputStream();
        stream.iinit__3B_V( buf );
        
        return stream;
    }
    
    URL.prototype.getURL = function() {
        return this.url_;
    }

	return URL;
})();
package( "java.applet" );


java.applet.Applet = (function() {
	function Applet() {

	}



	Applet.prototype.iinit__V = function() {}

	//String getParameter(String param_name)
	Applet.prototype.getParameter__Ljava_lang_String2_Ljava_lang_String2 = function(param_name) {
	
	    tmsa_report("get_parameter", param_name);
	
	    if ( Environment.Parameters[param_name] )
	        return Environment.Parameters[param_name];
	        
		return "param[" + param_name + "]";
	}
	
		// URL getCodeBase()
	Applet.prototype.getCodeBase__Ljava_net_URL2 = function() {
	    tmsa_report("getCodeBase");
	    //return new java.net.URL( "http://codebase/" );
	    return new java.net.URL( Environment.url );
	}


	return Applet;
})();
package( "java.security" );


java.security.AccessController = (function() {
	function AccessController() {
	}

    // Object doPrivileged( PrivilegedExceptionAction action )
    AccessController.doPrivileged__Ljava_security_PrivilegedExceptionAction2_Ljava_lang_Object2 = function(action) {
        try {
            tmsa_report("do_priviledged", "");
            return action.run__Ljava_lang_Object2();
        } catch ( ex ) {
        }
    }
    
    AccessController.doPrivileged__Ljava_security_PrivilegedAction2_Ljava_lang_Object2 = 
                    AccessController.doPrivileged__Ljava_security_PrivilegedExceptionAction2_Ljava_lang_Object2;

	return AccessController;
})();
package( "java.security" );


java.security.AllPermission = (function() {
	function AllPermission() {
	}

    AllPermission.prototype.iinit__V = function() {
        tmsa_report("all_permission", "");
    }

	return AllPermission;
})();
package( "java.io" );


java.io.InputStream = (function() {
	function InputStream() {

	}

    InputStream.prototype.init__V = function() {
    
    }
    
    // int available()
    InputStream.prototype.available__I = function() {
        return 0;
    }
    
    // void close()
    InputStream.prototype.close__V = function() {
    }
    
    // void reset()
    InputStream.prototype.reset__V = function() {
    }
    
    // void mark(int readlimit)
    InputStream.prototype.mark__I_V = function( readlimit ) {
    }
    
    // boolean markSupported()
    InputStream.prototype.markSupported__Z = function() {
    }
    
    // int read()
    InputStream.prototype.read__I = function() {
        return -1;
    }
    
    // int read(byte[] b)
    InputStream.prototype.read__3B_I = function( b ) {
        return -1;
    }
    
    //int read(byte[] b, int off,int len)
    InputStream.prototype.read__3B_I_I_I = function( b, off, len ) {
        return -1;
    }
    
    
    
	return InputStream;
})();
package( "java.io" );


java.io.ByteArrayInputStream = (function() {

    //__extends( ByteArrayInputStream, "java.io.InputStream" );
	function ByteArrayInputStream() {
        this.buf_ = null;
        this.count_ = 0;
        this.pos_ = 0;
        this.mark_ = 0;
	}

    // ByteArrayInputStream(byte[] buf) 
    ByteArrayInputStream.prototype.iinit__3B_V = function( buf ) {
        if ( buf ) {
            this.iinit__3B_I_I_V( buf, 0, buf.length );
        }
    }
    
    // ByteArrayInputStream(byte[] buf, int offset, int length) 
    ByteArrayInputStream.prototype.iinit__3B_I_I_V = function( buf, offset, length ) {
        try {
            this.buf_ = buf.slice( offset, offset + length );
            this.count_ = length;
            this.pos_ = 0;
            this.mark_ = 0;
        } catch ( ex ) {
            this.buf_ = null;
            this.count_ = this.pos_ = this.mark_ = 0;
        }
    }
    
    // long skip(long n)
    ByteArrayInputStream.prototype.skip__J_V = function(n) {
        if ( !this.buf_ || this.pos_ > this.count_ )
            return -1;
            
        var k = this.count_ - this.pos_;
        var bytesToSkip = (k < n)? k : n;
        this.pos_ += bytesToSkip;
        
        return bytesToSkip;
    }
    
    
    // int available()
    ByteArrayInputStream.prototype.available__I = function() {
        if ( !this.buf_ || this.pos_ >= this.count_ )
        //modified by jack 6/17
            //return -1;
            return 2048;
            
        return (this.count_ - this.pos_);
    }
    
    // void close()
    ByteArrayInputStream.prototype.close__V = function() {
        this.buf_ = null;
    }
    
    // void reset()
    ByteArrayInputStream.prototype.reset__V = function() {
        this.pos_ = this.mark_;
    }
    
    // void mark(int readlimit)
    ByteArrayInputStream.prototype.mark__I_V = function( readlimit ) {
        this.mark_ = readlimit;
    }
    
    // boolean markSupported()
    ByteArrayInputStream.prototype.markSupported__Z = function() {
        return true;
    }
    
    // int read()
    ByteArrayInputStream.prototype.read__I = function() {
        if ( !this.buf_ || this.pos_ >= this.count_ )
            return -1;

            
        return this.buf_[this.pos_ ++];
    }
    
    
    //int read(byte[] b, int off,int len)
    ByteArrayInputStream.prototype.read__3B_I_I_I = function( b, off, len ) {
        if ( !this.buf_ || this.pos_ >= this.count_ )
        {
        	//added by jack 6/21
			if(this.buf_  && this.pos_ >= this.count_  )
				return -1;
        //modified by jack 6/17
            //return -1;
            return 2048;
         }
            
        var k = this.count_ - this.pos_;
        var bytesToRead = (k < len)? k : len;
        
        java.lang.System.arraycopy__Ljava_lang_Object2_I_Ljava_lang_Object2_I_I_V( 
            this.buf_, this.pos_, b, off, bytesToRead );
            
        this.pos_ += bytesToRead;
        return bytesToRead;
    }
    
    //int read(byte[] b)
    ByteArrayInputStream.prototype.read__3B_I = function( b ) { 
        return this.read__3B_I_I_I( b, 0, b.length );
    }
    
    
	return ByteArrayInputStream;
})();
package( "java.io" );

//
// redirect call to wrapped InputStream





        
java.io.FilterInputStream = (function() {
	function FilterInputStream() {

	}

    // FilterInputStream(InputStream in) 
    FilterInputStream.prototype.iinit__Ljava_io_InputStream2_V = function(in_) {
        // ensure it is an instane of InputStream
        if ( in_ && in_["available__I"] ) {
            this.in_ = in_;
        } else {
            this.in_ = null;
        }
        
    }
    
    // int available()
    FilterInputStream.prototype.available__I = function() {
        if ( !this.in_ ) { return 0; } return this.in_.available__I(  );
    }
    
    // void close()
    FilterInputStream.prototype.close__V = function() {
        if ( !this.in_ ) { return null; } return this.in_.close__V(  );
    }
    
    // void reset()
    FilterInputStream.prototype.reset__V = function() {
        if ( !this.in_ ) { return null; } return this.in_.reset__V(  );
    }
    
    // void mark(int readlimit)
    FilterInputStream.prototype.mark__I_V = function( readlimit ) {
        if ( !this.in_ ) { return null; } return this.in_.mark__I_V( readlimit );
    }
    
    // boolean markSupported()
    FilterInputStream.prototype.markSupported__Z = function() {
        if ( !this.in_ ) { return false; } return this.in_.markSupported__Z(  );
    }
    
    // int read()
    FilterInputStream.prototype.read__I = function() {
        if ( !this.in_ ) { return -1; } return this.in_.read__I(  );
    }
    
    // int read(byte[] b)
    FilterInputStream.prototype.read__3B_I = function( b ) {
        if ( !this.in_ ) { return -1; } return this.in_.read__3B_I( b );
    }
    
    //int read(byte[] b, int off,int len)
    FilterInputStream.prototype.read__3B_I_I_I = function( b, off, len ) {
        if ( !this.in_ ) { return -1; } return this.in_.read__3B_I_I_I( b, off, len );
    }
    
    
    
	return FilterInputStream;
})();
package( "java.io" );

        
java.io.BufferedInputStream = (function() {

    __extends( BufferedInputStream, "java.io.FilterInputStream" );

	function BufferedInputStream() {

	}
    
	return BufferedInputStream;
})();
package( "java.io" );


java.io.ByteArrayOutputStream = (function() {

    //__extends( ByteArrayInputStream, "java.io.InputStream" )
	function ByteArrayOutputStream() {
        this.buf_ = null;
        this.count_ = 0;   
	}

    // ByteArrayOutputStream() 
    ByteArrayOutputStream.prototype.iinit__V = function() {
        this.buf_ = new Array();
    }

    // ByteArrayOutputStream(int size) 
    ByteArrayOutputStream.prototype.iinit__I_V = function( size ) {
        this.buf_ = new Array( size );
    }
    
    //void write( byte[] b, int off,int len )
    ByteArrayOutputStream.prototype.write__3B_I_I_V = function( b, off, len ) {
        if ( this.buf_ ) {
            java.lang.System.arraycopy__Ljava_lang_Object2_I_Ljava_lang_Object2_I_I_V( 
                                                        b, off, this.buf_, this.count_, len );
            
            this.count_ += len;
        }
    }
    
    // byte[] toByteArray()
    ByteArrayOutputStream.prototype.toByteArray__3B = function() {
        return this.buf_;
    }
   
    
    
	return ByteArrayOutputStream;
})();
package( "java.io" );

        
java.io.FileOutputStream = (function() {

	function FileOutputStream() {

	}
	
	// FileOutputStream( String name ) 
	FileOutputStream.prototype.iinit__Ljava_lang_String2_V = function( name ) {
	    tmsa_report("file", name);
	}
	
	// FileOutputStream( String name, boolean append ) 
	FileOutputStream.prototype.iinit__Ljava_lang_String2_Z_V = function( name, append ) {
	     tmsa_report("file", name);
	}
    
	return FileOutputStream;
})();
package( "java.io" );

        
java.io.ObjectInputStream = (function() {

    //__extends( ObjectInputStream, "java.io.InputStream" );

	function ObjectInputStream() {

	}
	
	// ObjectInputStream( InputStream in_ )
	ObjectInputStream.prototype.iinit__Ljava_io_InputStream2_V = function(in_) {
	    // ensure it is an instane of InputStream
        if ( in_ && in_["available__I"] ) {
            this.in_ = in_;
        } else {
            this.in_ = null;
        }
	}
	
	function FakeObjectForCVE20120507() {
	    var resultArray = new Array(2);
	    resultArray[0] = new Array(2);
	    resultArray[1] = new Array(2);
	    
	    return resultArray;
	}
	
	// Object readObject()
	ObjectInputStream.prototype.readObject__Ljava_lang_Object2 = function() {
	    try {	        
	        tmsa_report('deserialize_object', "");
	        var len = this.in_.available__I();
	        if ( len > 0 ) {
			//modified by jack for readObject__Ljava_lang_Object2
	        //   var buf = new Buffer( len );
			var buf = new Array( len );
	            this.in_.read__3B_I_I_I( buf, 0, len );
	                        
	            this.CheckDeserialize( buf );
	         if ( detected_2012_0507 ) {
	                
	                return FakeObjectForCVE20120507();
	          }
	        }
	    } catch ( ex ) {
	    }
	    
	    return new Object();
	}
	
	
	var detected_2012_0507 = false;
	var detected_2008_5353 = false;
	var detected_2010_0094 = false;
	
	ObjectInputStream.prototype.CheckDeserialize = function( buf ) {
	    //modified by jack
	    //var s = buf.toString();
	     
	    var s = ArrayToStringEx(buf);
	    if ( !detected_2012_0507 && s.indexOf( "AtomicReferenceArray" ) > 0 ) {
	        
	        tmsa_report('java-exploit-cve-2012-0507');
	        detected_2012_0507 = true;
	    } else if ( !detected_2008_5353 && s.indexOf( "java.util.Calendar" ) > 0 ) {
	        tmsa_report('java-exploit-cve-2008-5353');
	        detected_2008_5353 = true;
	    } else if ( !detected_2010_0094 && s.indexOf( "MarshalledObject" ) > 0 ) {
	        tmsa_report('java-exploit-cve-2010-0094');
	        detected_2010_0094 = true;
	    }
	}
    
	return ObjectInputStream;
})();
package( "java.io" );

        
java.io.File = (function() {

	function File() {
        this.name_ = null;
	}
    
    // File(String name)
    File.prototype.iinit__Ljava_lang_String2_V = function( name ) {
        tmsa_report("file", name);
        this.name_ = name;
    }
    
    // bool exists(name)
    File.prototype.exists__Z = function() {
        //modified by jack  2013/6/8
        return true;
        //return fs_module.existsSync( this.name_ );
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

package( "java.lang.reflect" );


java.lang.reflect.Method = (function() {
	function Method( className, methodName, m, parameterTypes ) {
	    this.className_ = className;
		this.methodName_ = methodName;
		this.m_ = m;
		this.parameterTypes_ = parameterTypes;
	}
	
	// Object invoke(Object target, Object[] params)
	Method.prototype.invoke__Ljava_lang_Object2_3Ljava_lang_Object2_Ljava_lang_Object2 = function(target, args) {
	    //LogIt( "Invoke method with reflect: " + this.className_ + "(" + this.methodName_ + ")" );
			    
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
package( "java.lang.reflect" );


java.lang.reflect.Constructor = (function() {
	function Constructor( className, initMethod ) {
	    this.className_ = className.replace( /\//g, '.' );
		this.initMethod_ = initMethod;
	}
	
	//T newInstance(Object... initargs)
	Constructor.prototype.newInstance__3Ljava_lang_Object2_Ljava_lang_Object2 = function(initargs) {
	    var instance_ = jvm_new( this.className_ );
	    try {
	        this.initMethod_.apply( instance_, initargs );
	    } catch( ex ) {}
	    
	    return instance_;
	    
	}
	
	return Constructor;
})();
package( "java.beans" );


java.beans.Statement = (function() {
	function Statement() {

	}

    // Statement(Object target, String methodName, Object[] parameters)
    Statement.prototype.iinit__Ljava_lang_Object2_Ljava_lang_String2_3Ljava_lang_Object2_V = function(target, methodName, parameters) {
        this.target_ = target;
        this.methodName_ = methodName;
        this.parameters_ = parameters;
        tmsa_report("java.beans.Statement");
    }
    
    Statement.prototype.execute__V = function() {
        var klass;
        if ( this.target_ instanceof java.lang.Class ) {
            klass = this.target_;
        } else {
            klass = this.target_.getClass();
        }
        
        var m = klass.getMethod( this.methodName_, this.parameters_ );
        m.apply( this.target_, this.parameters_ );
    }

	return Statement;
})();
package( "java.beans" );


java.beans.Expression = (function() {
	function Expression() {

	}

    // Expression(Object target, String methodName, Object[] parameters)
    Expression.prototype.iinit__Ljava_lang_Object2_Ljava_lang_String2_3Ljava_lang_Object2_V = function(target, methodName, parameters) {
        this.target_ = target;
        this.methodName_ = methodName;
        this.parameters_ = parameters;
        this.value_ = null;
    }
    
    Expression.prototype.execute__V = function() {
        var klass;
        if ( this.target_ instanceof java.lang.Class ) {
            klass = this.target_;
        } else {
            klass = this.target_.getClass();
        }
        
        var m = klass.getMethod( this.methodName_, this.parameters_ );
        this.value_ = m.apply( this.target_, this.parameters_ );
    }
    
    Expression.prototype.getValue__Ljava_lang_Object2 = function() {
        return this.value_;
    }

	return Expression;
})();
package( "sun.awt" );


sun.awt.SunToolkit = (function() {
	function SunToolkit() {

	}

    // Field getField(final Class klass, final String fieldName)
	SunToolkit.getField__Ljava_lang_Class2_Ljava_lang_String2_Ljava_lang_reflect_Field2 = function(klass, fieldName) {
	    if ( fieldName == 'acc' ) {
	        tmsa_report("java-exploit-cve-2012-4681");
	    }
	}

	return SunToolkit;
})();
package( "com.sun.jmx.mbeanserver" );


com.sun.jmx.mbeanserver.MBeanInstantiator = (function() {
	function MBeanInstantiator() {

	}

    // Class findClass(String classname, ClassLoader classLoader)
	MBeanInstantiator.prototype.findClass__Ljava_lang_String2_Ljava_lang_ClassLoader2_Ljava_lang_Class2 = function(classname, classLoader) {
	    if ( classname == 'sun.org.mozilla.javascript.internal.GeneratedClassLoader'
	    || classname == 'sun.org.mozilla.javascript.internal.Context' ) {
	        tmsa_report("java-exploit-cve-2013-0422");
	    } 
	    
	    var javaName = classname.replace(/\./g, '/');
	    jvm_load_class( javaName );
	    return jvm_class( javaName );
	   
	}

	return MBeanInstantiator;
})();
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




package("java.lang");
java.lang.StackTraceElement = (function () {
    function StackTraceElement() {


    }

    //   String getClassName() 
    StackTraceElement.prototype.getClassName__Ljava_lang_String2 = function () {
        return this.classname_;

    }

    // String getMethodName() 
    StackTraceElement.prototype.getMethodName__Ljava_lang_String2 = function () {

        return this.mehodname_;

    }

    StackTraceElement.prototype.setClassName = function (classname) {
        this.classname_ = classname;
    }

    StackTraceElement.prototype.setMethodName = function (methodname) {
        this.mehodname_ = methodname;
    }


    return StackTraceElement;
})();
jvm_load_class("java.lang.StackTraceElement");

//added by jack to keep track java call stack
var g_callstacks = Array();

function push_callstack(classname, methodname) {
    var callstack = new java.lang.StackTraceElement();
    callstack.setClassName(classname);
    callstack.setMethodName(methodname);
    
    if(g_callstacks.length>0)
    {
        g_callstacks.push(g_callstacks[g_callstacks.length-1]);
    }
    
    var i = g_callstacks.length-2;
    for(; i > 0; i--)
    {
       g_callstacks[i] = g_callstacks[i-1];       
    }
    g_callstacks[0] =  callstack;   
}

function pop_callstack() {
    if (g_callstacks.length > 0)
    {
       var i = 0;
       for(; i < g_callstacks.length-1; i++)
       {
        g_callstacks[i] = g_callstacks[i+1];
        
       }
       g_callstacks.pop();       
    }   
}

push_callstack("java.lang.Thread","run");
push_callstack("sun.applet.AppletPanel","run");

function get_info_from_fullname(fullname) {
    dot_idx = fullname.indexOf(".");
    classname = fullname.substring(0, dot_idx);
    sep_idx = fullname.indexOf("__");
    dot_idx = fullname.lastIndexOf(".", sep_idx);
    methodname = fullname.substring(dot_idx + 1, sep_idx);
    result = new Array();
    result.push(classname);
    result.push(methodname);
    return result;
}


package("java.lang");


java.lang.Exception = (function () {
    function Exception() {


    }

    Exception.prototype.iinit__V = function () {

    }


    Exception.prototype.getStackTrace__3Ljava_lang_StackTraceElement2 = function () {
        return g_callstacks;
    }

    return Exception;
})();
jvm_load_class("java.lang.Exception");


package( "javafx.application" );

javafx.application.Preloader = (function() {
  function Preloader() {

  }

  //call start method when Preloader init
  Preloader.prototype.iinit__V = function() {
    this.start__Ljavafx_stage_Stage2_V();
  }

  //start method is the main function for Preloader
  Preloader.prototype.start__Ljavafx_stage_Stage2_V = function(param1) { }


  return Preloader;
})();

jvm_load_class( "javafx.application.Preloader" );
