package( "java.io" );

//
// redirect call to wrapped InputStream
/*#define REDIRECT_CALL(f, default_retval, ...)   \
    if ( !this.in_ )              {             \
        return default_retval;                  \
    }                                           \
    return this.in_.##f( __VA_ARGS__ )*/
        
java.io.FilterInputStream = (function() {
	function FilterInputStream() {

	}

    // FilterInputStream(InputStream in) 
    FilterInputStream.prototype.iinit__Ljava_io_InputStream2_V = function(in_) {
        // ensure it is an instane of InputStream
        if ( in_ && in_["available__I"] ) {
            this.in_ = in_;
        } else {
            this.in_ = null;
        }
        
    }
    
    // int available()
    FilterInputStream.prototype.available__I = function() {
 //       REDIRECT_CALL( available__I, 0 );
 	this.in_.available__I(0);
    }
    
    // void close()
    FilterInputStream.prototype.close__V = function() {
     //   REDIRECT_CALL( close__V, null );
     this.in_.close__V(null);
    }
    
    // void reset()
    FilterInputStream.prototype.reset__V = function() {
        //REDIRECT_CALL( reset__V, null );
         this.in_.reset__V(null);
    }
    
    // void mark(int readlimit)
    FilterInputStream.prototype.mark__I_V = function( readlimit ) {
        //REDIRECT_CALL( mark__I_V, null, readlimit );
        this.in_.mark__I_V(null, readlimit);
    }
    
    // boolean markSupported()
    FilterInputStream.prototype.markSupported__Z = function() {
        //REDIRECT_CALL( markSupported__Z, false );
        this.in_.markSupported__Z(false);
    }
    
    // int read()
    FilterInputStream.prototype.read__I = function() {
        //REDIRECT_CALL( read__I, -1 );
        this.in_.read__I(-1);
    }
    
    // int read(byte[] b)
    FilterInputStream.prototype.read__3B_I = function( b ) {
        //REDIRECT_CALL( read__3B_I, -1, b );
        this.in_.read__3B_I(-1,b);
    }
    
    //int read(byte[] b, int off,int len)
    FilterInputStream.prototype.read__3B_I_I_I = function( b, off, len ) {
       //REDIRECT_CALL( read__3B_I_I_I, -1, b, off, len );
	this.in_.read__3B_I_I_I(-1,b,off,len);
	   
    }
    
    
    
	return FilterInputStream;
})();
jvm_load_class( "java.io.FilterInputStream" );
