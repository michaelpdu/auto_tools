package( "java.lang" );


java.lang.Double = (function() {
	function Double(d) {
		this.doubleVal_ = d;
	}

	return Double;
})();

jvm_load_class( "java.lang.Double" );