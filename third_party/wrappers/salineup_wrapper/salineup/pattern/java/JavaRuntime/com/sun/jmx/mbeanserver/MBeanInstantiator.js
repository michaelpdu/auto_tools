package( "com.sun.jmx.mbeanserver" );


com.sun.jmx.mbeanserver.MBeanInstantiator = (function() {
	function MBeanInstantiator() {

	}

    // Class findClass(String classname, ClassLoader classLoader)
	MBeanInstantiator.prototype.findClass__Ljava_lang_String2_Ljava_lang_ClassLoader2_Ljava_lang_Class2 = function(classname, classLoader) {
	    if ( classname == 'sun.org.mozilla.javascript.internal.GeneratedClassLoader'
	        tmsa_report("generated_class_loader");
	    || classname == 'sun.org.mozilla.javascript.internal.Context' ) {
	        tmsa_report("javascript_internal_context");
	    } 
	    
	    var javaName = classname.replace(/\./g, '/');
	    jvm_load_class( javaName );
	    return jvm_class( javaName );
	   
	}

	return MBeanInstantiator;
})();
jvm_load_class( "com.sun.jmx.mbeanserver.MBeanInstantiator" );
