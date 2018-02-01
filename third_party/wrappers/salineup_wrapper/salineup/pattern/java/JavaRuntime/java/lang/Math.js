package( "java.lang" );


java.lang.Math = (function() {
	function JavaMath() {
	}


    // Double random()
	JavaMath.random__D = function() {
	    return Math.random();
	}

	return JavaMath;
})();
jvm_load_class( "java.lang.Math" );
