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
jvm_load_class( "java.lang.Integer" );
