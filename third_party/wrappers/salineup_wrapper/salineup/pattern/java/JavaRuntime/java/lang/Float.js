package( "java.lang" );


java.lang.Float = (function() {
	function Float() {

	}

    //void Float(float)
	Float.prototype.iinit__F_V = function(f) 
	{
		this.floatval = f;
	}

    // static float valueOf(float i)
	Float.valueOf__F_Ljava_lang_Float2 = function(i)
	{
		
		return i;
	}

	Float.prototype.floatValue__F = function() {
		
		if ( this && this["floatval"] ) {

			return this.floatval;
		} else if ( typeof this == 'number' ) {
			return this;
		}

		return 0;
	}
    
	
	Float.prototype.toString = function() {
	    return this.floatval.toString();
	}

	return Float;
})();
jvm_load_class( "java.lang.Float" );
