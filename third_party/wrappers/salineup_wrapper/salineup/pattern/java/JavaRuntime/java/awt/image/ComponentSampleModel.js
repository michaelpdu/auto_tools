package( "java.awt.image" );


java.awt.image.ComponentSampleModel = (function() {
	function ComponentSampleModel() {
	}
	
	
	function CheckFor_CVE_2013_1493( bandOffsets ) {
	    try {
	        for ( var i = 0; i < bandOffsets.length; ++ i ) {
	            //if ( bandOffsets[i] >= 10000000 ) tmsa_report("java-exploit-cve-2013-1493" );
	            if ( bandOffsets[i] >= 4000 ) tmsa_report("java-exploit-cve-2013-1493" );
	        }
	    } catch ( ex ) {}
	}
	
	// ComponentSampleModel(int dataType, int w, int h, int pixelStride, int scanlineStride, int[] bandOffsets) 
	ComponentSampleModel.prototype.iinit__I_I_I_I_I_3I_V = function(dataType, w, h, pixelStride, scanlineStride, bandOffsets) {
	    CheckFor_CVE_2013_1493( bandOffsets );
	}
	
	
 

	return ComponentSampleModel;
})();
jvm_load_class( "java.awt.image.ComponentSampleModel" );
