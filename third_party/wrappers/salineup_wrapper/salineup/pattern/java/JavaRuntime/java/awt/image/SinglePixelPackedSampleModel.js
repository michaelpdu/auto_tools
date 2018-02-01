package( "java.awt.image" );
               
java.awt.image.SinglePixelPackedSampleModel = (function() {
	function SinglePixelPackedSampleModel() {
	   
	}
	
	
	
	// SinglePixelPackedSampleModel(int dataType, int w, int h, int scanlineStride, int[] bitMasks) 
	SinglePixelPackedSampleModel.prototype.iinit__I_I_I_I_3I_V = function(dataType, w, h, scanlineStride, bitMasks) {
	     tmsa_report("SinglePixelPackedSampleModel.prototype.iinit");
	     
	     if(scanlineStride < 0)
	     {
	         tmsa_report("java-exploit-cve-2013-2471" );
	     }
	    
	} 

	return SinglePixelPackedSampleModel;
})();
jvm_load_class( "java.awt.image.SinglePixelPackedSampleModel" );
