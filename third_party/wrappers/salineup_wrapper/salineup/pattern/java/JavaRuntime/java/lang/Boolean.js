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
jvm_load_class( "java.lang.Boolean" );
