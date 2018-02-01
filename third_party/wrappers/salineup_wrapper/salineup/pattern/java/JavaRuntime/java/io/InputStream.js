package( "java.io" );


java.io.InputStream = (function() {
	function InputStream() {

	}

    InputStream.prototype.init__V = function() {
    
    }
    
    // int available()
    InputStream.prototype.available__I = function() {
        return 0;
    }
    
    // void close()
    InputStream.prototype.close__V = function() {
    }
    
    // void reset()
    InputStream.prototype.reset__V = function() {
    }
    
    // void mark(int readlimit)
    InputStream.prototype.mark__I_V = function( readlimit ) {
    }
    
    // boolean markSupported()
    InputStream.prototype.markSupported__Z = function() {
    }
    
    // int read()
    InputStream.prototype.read__I = function() {
        return -1;
    }
    
    // int read(byte[] b)
    InputStream.prototype.read__3B_I = function( b ) {
        return -1;
    }
    
    //int read(byte[] b, int off,int len)
    InputStream.prototype.read__3B_I_I_I = function( b, off, len ) {
        return -1;
    }
    
    
    
	return InputStream;
})();
jvm_load_class( "java.io.InputStream" );
