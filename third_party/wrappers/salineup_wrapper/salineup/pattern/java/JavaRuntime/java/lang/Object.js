package( "java.lang" );


java.lang.Object = (function() {
	function MyObject() {

	}

	MyObject.prototype.iinit__V = function() {}

    // Class getClass()
    MyObject.prototype.getClass__Ljava_lang_Class2 = function() {
        // this is already a java.lang.Class ?
        if ( this.jsClass_ ) return this; 
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
jvm_load_class( "java.lang.Object" );
