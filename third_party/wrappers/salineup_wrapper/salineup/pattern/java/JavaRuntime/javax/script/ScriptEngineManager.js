package( "javax.script" );


javax.script.ScriptEngineManager = (function() {
	function ScriptEngineManager() {
	}

    ScriptEngineManager.prototype.iinit__V = function() {
    }

	ScriptEngineManager.prototype.getEngineByName__Ljava_lang_String2_Ljavax_script_ScriptEngine2 = function( name ) { 

        jvm_load_class( "javax/script/ScriptEngine" );
	    var instance = jvm_new( "javax.script.ScriptEngine" ); 
	    return instance;
	}
	

	
	return ScriptEngineManager;
})();
jvm_load_class( "javax.script.ScriptEngineManager" );
