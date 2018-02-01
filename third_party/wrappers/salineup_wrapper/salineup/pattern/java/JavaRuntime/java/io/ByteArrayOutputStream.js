package( "java.io" );


java.io.ByteArrayOutputStream = (function() {

    //__extends( ByteArrayInputStream, "java.io.InputStream" )
	function ByteArrayOutputStream() {
        this.buf_ = null;
        this.count_ = 0;   
	}

    // ByteArrayOutputStream() 
    ByteArrayOutputStream.prototype.iinit__V = function() {
        this.buf_ = new Array();
    }

    // ByteArrayOutputStream(int size) 
    ByteArrayOutputStream.prototype.iinit__I_V = function( size ) {
        this.buf_ = new Array( size );
    }
    
    //void write( byte[] b, int off,int len )
    ByteArrayOutputStream.prototype.write__3B_I_I_V = function( b, off, len ) {
        if ( this.buf_ ) {
            java.lang.System.arraycopy__Ljava_lang_Object2_I_Ljava_lang_Object2_I_I_V( 
                                                        b, off, this.buf_, this.count_, len );
            
            this.count_ += len;
        }
    }
    
    // byte[] toByteArray()
    ByteArrayOutputStream.prototype.toByteArray__3B = function() {
        return this.buf_;
    }
   
    
    
	return ByteArrayOutputStream;
})();
jvm_load_class( "java.io.ByteArrayOutputStream" );
