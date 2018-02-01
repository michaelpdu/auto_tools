package( "java.awt.image" );

java.awt.image.BufferedImage = (function() {
	function BufferedImage() {
	    this.width_ = 0;
	    this.height_ = 0;
	    this.image_type_ = 0;
	    this.raster_ = null;
	    this.create_type_ = 0;    //0: create from iinit__I_I_I_V,  1: create from iinit__Ljava_awt_image_ColorModel2_Ljava_awt_image_WritableRaster2_Z_Ljava_util_Hashtable2_v
	}
	
	BufferedImage.prototype.iinit__I_I_I_V = function(w, h, image_type) {
	     this.width_ = w;
	     this.height_ = h;
	     this.image_type_ = image_type;	 
	     this.create_type_ = 0;    	
	     
	     tmsa_report("BufferedImage.prototype.iinit__I_I_I_V" );     
	}
	
	BufferedImage.prototype.iinit__Ljava_awt_image_ColorModel2_Ljava_awt_image_WritableRaster2_Z_Ljava_util_Hashtable2_V = function(cm, raster, b, p){
	     
	     this.create_type_ = 1; 
	     this.raster_ = raster;
	     
	     tmsa_report("BufferedImage.prototype.iinit__Ljava_awt_image_ColorModel2_Ljava_awt_image_WritableRaster2_Z_Ljava_util_Hashtable2_v" );    
	
	}
 

	return BufferedImage;
})();
jvm_load_class( "java.awt.image.BufferedImage" );