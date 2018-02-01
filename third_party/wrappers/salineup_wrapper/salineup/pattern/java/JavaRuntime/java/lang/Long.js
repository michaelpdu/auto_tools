package( "java.lang" );


java.lang.Long = (function() {
	function Long() {

	}

    //void Long(long)
	Long.prototype.iinit__J_V = function(l) 
	{
		this.longval = l;
	}

    // static Long valueOf(Long i)
	Long.valueOf__J_Ljava_lang_Long2 = function(l)
	{
		
		return l;
	}    
	
	Long.prototype.longValue__J = function() {
		
		if ( this && this["longval"] ) {

			return this.longval;
		} else if ( typeof this == 'number' ) {
			return this;
		}

		return 0;
	}
	
	// String toHexString(long i)
	Long.toHexString__J_Ljava_lang_String2 = function( i ) {
	    return i.toString( 16 );
	}
	
	Long.prototype.toString = function() {
	    return this.longval.toString();
	}

	return Long;
})();
jvm_load_class( "java.lang.Long" );
