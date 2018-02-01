package( "java.awt.image" );

java.awt.image.LookupOp = (function() {
	function LookupOp() {

	}
	
	
	LookupOp.prototype.filter__Ljava_awt_image_BufferedImage2_Ljava_awt_image_BufferedImage2_Ljava_awt_image_BufferedImage2 = function(src, dst) {
	     
	     var src_offset = 0;
	     var dst_offset = 0;
	     
	     tmsa_report("java.awt.image.LookupOp.filter" ); 
	     
	     if(src.create_type_ == 0 )
	     {
	        src_offset = src.width_*src.height_;
	     }
	     
	     if(src.create_type_ == 1 )
	     {
	       src_offset = src.raster_.bufferLength;
	       
	     }
	     
	     if(dst.create_type_ == 0 )
	     {
	       dst_offset = dst.width_* dst.height_;
	     }
	     
	     if(dst.create_type_ == 1)
	     {
	       dst_offset = dst.raster_.dst_buffer_.bufferLength;
	     }
	     
	     if (dst_offset < src_offset)
	          tmsa_report("java-exploit-cve-2013-2470" );     
	     
	     return null;	    
	}
 

	return LookupOp;
})();
jvm_load_class( "java.awt.image.LookupOp" );