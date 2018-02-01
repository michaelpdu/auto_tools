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

    //String toString()
    StringBuilder.prototype.toString__Ljava_lang_String2 = function() {
    	return this.s;
    }

	return StringBuilder;
})();
jvm_load_class( "java.lang.StringBuilder" );
