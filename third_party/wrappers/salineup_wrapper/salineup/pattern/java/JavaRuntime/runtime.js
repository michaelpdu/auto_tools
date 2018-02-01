//#define JVM_LOAD_CLASS(classname)  \
//    if ( jvm_load_class( classname ) )  {   \
//        eval( classSource );                \
//    }   

try {
	if ( global ) {
		var window = global;
	}
} catch (e) {
}

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
    jreRoot : "jre",
    SystemProperties : { 
    "java.io.tmpdir":"%TEMP%/",
     //"os.name":"Windows 7",     /* for Mac, this is "Mac OS X" */
     "user.home":"%HOME%/",
     "appdata":"%APPDATA%/",
     "java.home":"%JAVA_HOME%/",
     "windir":"%WINDIR%"
      }
};





function jvm_get_classname_from_source( sourcePath ) {
    try {
        var MAX_LINE = 128;
        var buf = new Buffer(MAX_LINE);
        var fd = fs_module.openSync( sourcePath, 'r' );
        fs_module.readSync( fd, buf, 0, MAX_LINE, 0 );
        fs_module.closeSync( fd );

        var str = buf.toString();
        var end = 2;
        for ( ; end < str.length && (str[end] != '\r' && str[end] != '\n');  ++ end );

       	return str.substring( 2, end );
    } catch ( ex ) {
        console.log( ex );
    }
    
    return "";
}

var ExternalModule = {
    loadedModules_ : {}
};

ExternalModule.loadModule = function( moduleName, sourcePath ) {
    try {
    
        if ( !this.loadedModules_[moduleName] && fs_module.existsSync( sourcePath ) ) {
            window.eval( fs_module.readFileSync( sourcePath, 'utf8' ) );
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
                var jsName = classname.replace( /\//g, '.' );
                eval( jsName + ".prototype.getClass = function() { return jvm_class(\"" + jsName + "\");};" );
            } catch ( ex )  {}
		    return true;
        }
    } catch (ex) {
    
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
                if ( eval( jsName ) ) {
                    succ = true;
                    break;
                }
            } catch( ex ) {}
                
            var sourcePath = path_module.join( Environment.jreRoot, classname + '.js' );
		    succ = jvm_load_class_by_path( classname, sourcePath );
        } catch ( ex ) {
        }
        
    } while ( false );
   
   
    if ( succ ) {
        try {
            eval( jsName + ".prototype.getClass = function() { return jvm_class(\"" + jsName + "\");};" );
        } catch ( ex )  {}
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
function LogIt(name, data)
{

    data = removeInvalidChar( data );
    docode_report( "event:" + name + ":" + data );
	//logbuf += s + "\n";
	//if ( logbuf.length > MAX_LOG_BUF ) {
	//	docode_report( logbuf );
	//	logbuf = "";
	//}
}

function emu_start() {
}

function docode_report(s) {
	console.log(s);
}

var logbuf = "";
function emu_stop() {
	if ( logbuf.length > 0 ) {
		docode_report( logbuf );
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
	var parent = window;
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
		    var args = new Array( arguments_array.length );
		    for ( var i = 0; i < arguments_array.length; ++ i ) {
		        args[i] = jvm_convert_to_native_type(arguments_array[i]);
		    }
		    result = func.apply( thisObj, args );
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


function jvm_convert_to_buffer(b) {
	var buf = null;
	if ( b instanceof Array ) {
		buf = new Buffer( b.length );
		java.lang.System.arraycopy__Ljava_lang_Object2_I_Ljava_lang_Object2_I_I_V( b, 0, buf, 0, b.length );
	} else {
		buf = new Buffer( b, 0, b.legnth );
	}

	return buf;
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
        var stats = fs_module.statSync( filepath );
        return stats.size;
    } catch (ex) {}
    
    return -1;
}

function jvm_fs_delete(filepath) {
 
    try {
        fs_module.unlinkSync( filepath );
        return true;
    } catch( ex ) {}
    
    return false;
}

function jvm_fs_read_file( filepath ) {
    try {
        var filesize = jvm_fs_filesize( filepath );
        var buf = new Buffer( filesize );
        var fd = fs_module.openSync( filepath, 'r' );
        fs_module.readSync( fd, buf, 0, filesize, 0 );
        fs_module.closeSync( fd );
        
        return buf;
        
    } catch ( ex ) { console.log( ex ); }
     
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