package( "java.awt.image" );

java.awt.image.MultiPixelPackedSampleModel = (function() {
	function MultiPixelPackedSampleModel() {
	    this.dataBitOffset = 0;
	}
	
	
	
	// MultiPixelPackedSampleModel(int dataType, int w, int h, int numberOfBits, int scanlineStride, int dataBitOffset) 
	MultiPixelPackedSampleModel.prototype.iinit__I_I_I_I_I_I_V = function(dataType, w, h, numberOfBits, scanlineStride, dataBitOffset) {
	     tmsa_report("MultiPixelPackedSampleModel.prototype.iinit");
	     this.dataBitOffset = dataBitOffset;
	    
	}
	
	
 

	return MultiPixelPackedSampleModel;
})();
jvm_load_class( "java.awt.image.MultiPixelPackedSampleModel" );
