package( "java.applet" );


java.applet.Applet = (function() {
	function Applet() {

	}



	Applet.prototype.iinit__V = function() {}

	//String getParameter(String param_name)
	Applet.prototype.getParameter__Ljava_lang_String2_Ljava_lang_String2 = function(param_name) {
	
	    tmsa_report( "get_parameter");
	
	    if ( Environment.Parameters[param_name] )
	        return Environment.Parameters[param_name];
	        
		return "param[" + param_name + "]";
	}
	// URL getCodeBase()
	Applet.prototype.getCodeBase__Ljava_net_URL2 = function() {
	    tmsa_report("jacktest", "getCodeBase");
	    return new java.net.URL( "http://codebase/" );
	}

	return Applet;
})();
jvm_load_class( "java.applet.Applet" );
