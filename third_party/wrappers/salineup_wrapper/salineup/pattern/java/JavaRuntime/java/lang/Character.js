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
jvm_load_class( "java.lang.Character" );
