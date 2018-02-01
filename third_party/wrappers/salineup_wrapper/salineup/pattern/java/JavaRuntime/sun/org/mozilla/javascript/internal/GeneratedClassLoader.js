package("sun.org.mozilla.javascript.internal");


sun.org.mozilla.javascript.internal.GeneratedClassLoader = (function() {
	function GeneratedClassLoader() {

	}
	
	// Class defineClass(java.lang.String name, byte[] data) 
	GeneratedClassLoader.prototype.defineClass__Ljava_lang_String2_3B = function(name, data) {
	    return new java.lang.ClassLoader().defineClass__Ljava_lang_String2_3B_I_I_Ljava_security_ProtectionDomain2_Ljava_lang_Class2(
	        name, data, 0, data.length, null );
	}

	return GeneratedClassLoader;
})();

jvm_load_class( "sun.org.mozilla.javascript.internal.GeneratedClassLoader" );