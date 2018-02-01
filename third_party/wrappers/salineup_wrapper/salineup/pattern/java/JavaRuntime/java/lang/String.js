
package( "java.lang" );

function IsNativeString(s) {
  return (typeof s == 'string');
}

function GetString(s) {
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
    this.s = (new Buffer(b)).toString();
    CheckString(this.s);
  }
  
  // String(byte[], int off, int len)
  MyString.prototype.iinit__3B_I_I_V = function(b, off, len) {
    this.s = (new Buffer(b.slice(off, len))).toString();
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
        
        do {
            result = result.replace( pattern, replacement );
        } while ( replaceAll && result.indexOf( pattern ) >= 0 );
        
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
  // bool endsWith(s)
  MyString.prototype.endsWith__Ljava_lang_String2_Z = function(suffix) {
  
    var str = GetString( this );
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  return MyString;

})();
jvm_load_class( "java.lang.String" );
