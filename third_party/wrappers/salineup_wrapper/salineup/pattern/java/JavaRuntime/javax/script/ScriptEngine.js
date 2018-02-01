package( "javax.script" );


javax.script.ScriptEngine = (function() {
	function ScriptEngine() {
	}

	// Object eval( string expr, Bindings bindings )
	ScriptEngine.prototype.eval__Ljava_lang_String2_Ljavax_script_Bindings2_Ljava_lang_Object2 = function( expr, bindings ) {  
		ScriptEngine.CheckFor_CVE_2011_3544( expr );
	}
	
	// Object eval()
	ScriptEngine.prototype.eval__Ljava_lang_String2_Ljava_lang_Object2 = function( expr ) {
	    ScriptEngine.CheckFor_CVE_2011_3544( expr );
	}
	
	ScriptEngine.CheckFor_CVE_2011_3544 = function( expr )
	{
	    if ( expr.indexOf( "toString" ) >= 0 || expr.indexOf( "setSecurityManager" ) >= 0 || expr.indexOf( "new Error" ) >= 0 ) {
		    tmsa_report( "java-exploit-cve-2011-3544");
		}
	}

	
	return ScriptEngine;
})();
jvm_load_class( "javax.script.ScriptEngine" );
