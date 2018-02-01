package( "java.awt.image" );

java.awt.image.Raster = (function() {
	function Raster() {

	}
	
	
	
	// createWritableRaster(SampleModel sm, DataBuffer db, Point location)
	Raster.createWritableRaster__Ljava_awt_image_SampleModel2_Ljava_awt_image_DataBuffer2_Ljava_awt_Point2_Ljava_awt_image_WritableRaster2 = function(sm, db, location) {
	
	   tmsa_report("Raster.createWritableRaster");
	   
	    if (sm.dataBitOffset == 0)
	        return null;
	        
	     
	     if (sm.dataBitOffset > db.bufferLength)
	        tmsa_report("java-exploit-cve-2013-2465" );
	        

	     var result = null;
	     result = jvm_new("java.awt.image.WritableRaster");	     
	     result.dst_buffer_ = db;
	    
	     return result;
	}
	 

	return Raster;
})();
jvm_load_class( "java.awt.image.Raster" );
