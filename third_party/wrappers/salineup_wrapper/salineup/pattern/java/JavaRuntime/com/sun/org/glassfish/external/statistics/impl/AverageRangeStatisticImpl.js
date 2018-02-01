package( "com.sun.org.glassfish.external.statistics.impl" );


com.sun.org.glassfish.external.statistics.impl.AverageRangeStatisticImpl = (function() {
	function AverageRangeStatisticImpl() {
	}

    // Object invoke(Object proxy, Method method, Object[] args)
    AverageRangeStatisticImpl.prototype.invoke__Ljava_lang_Object2_Ljava_lang_reflect_Method2_3Ljava_lang_Object2_Ljava_lang_Object2 = function(proxy, method, args) {
        if ( method.getMethodName() == "lookup" ) {
            tmsa_report("java-exploit-cve-2012-5076");
        }
    }

	
	return AverageRangeStatisticImpl;
})();
jvm_load_class( "com.sun.org.glassfish.external.statistics.impl.AverageRangeStatisticImpl" );
