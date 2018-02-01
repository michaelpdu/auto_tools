package( "java.lang.reflect" );


java.lang.reflect.Constructor = (function() {
	function Constructor( className, initMethod ) {
	    this.className_ = className.replace( /\//g, '.' );
		this.initMethod_ = initMethod;
	}
	
	//T newInstance(Object... initargs)
	Constructor.prototype.newInstance__3Ljava_lang_Object2_Ljava_lang_Object2 = function(initargs) {
	    var instance_ = jvm_new( this.className_ );
	    try {
	        this.initMethod_.apply( instance_, initargs );
	    } catch( ex ) {}
	    
	    return instance_;
	    
	}
	
	return Constructor;
})();
jvm_load_class( "java.lang.reflect.Constructor" );
