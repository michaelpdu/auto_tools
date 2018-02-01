package( "java.awt.image" );

java.awt.image.WritableRaster = (function() {
	function WritableRaster() {
	    this.dst_buffer_ = null;
	}
	

	return WritableRaster;
})();
jvm_load_class( "java.awt.image.WritableRaster" );