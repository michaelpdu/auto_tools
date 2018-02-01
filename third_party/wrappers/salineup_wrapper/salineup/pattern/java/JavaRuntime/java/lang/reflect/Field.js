package( "java.lang.reflect" );


jjava.lang.reflect.Field = (function() {

    //modified by jack for reflect
    function Field() {
         this.name = "";
         this.type = "";
       
    }
    
    	
	// void set(Object obj, Object value)
	Field.prototype.set__Ljava_lang_Object2_Ljava_lang_Object2_V = function(obj, value) {
	    if ( value instanceof java.security.AccessControlContext ) {
	        tmsa_report( "java-exploit-cve-2012-4681" );
	    }
	}
	
	//modified by jack for reflect	
	Field.prototype.getType__Ljava_lang_Class2 = function(){
	    if (!this.name || !this.type)
	        return null
	
	    var cls = new java.lang.Class(this.name, this.type);
	    return cls; 
	}
	
	Field.prototype.getName__Ljava_lang_String2 = function(){
	
	   return this.name;
	
	}
	
	return Field;
})();
jvm_load_class( "java.lang.reflect.Field" );
