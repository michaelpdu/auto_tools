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

    //String toString()
    StringBuffer.prototype.toString__Ljava_lang_String2 = function() {
    	return this.s;
    }

	return StringBuffer;
})();
jvm_load_class( "java.lang.StringBuffer" );
