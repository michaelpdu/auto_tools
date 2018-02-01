package( "java.awt.image" );

java.awt.image.DataBufferByte = (function() {
	function DataBufferByte() {
	    this.bufferLength = 0;
	}
	
	DataBufferByte.prototype.iinit__I_V = function(len) {
	     this.bufferLength = len;
	    
	}
	
	
 

	return DataBufferByte;
})();
jvm_load_class( "java.awt.image.DataBufferByte" );