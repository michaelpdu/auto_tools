package( "java.io" );


java.io.ByteArrayInputStream = (function() {

    //__extends( ByteArrayInputStream, "java.io.InputStream" );
	function ByteArrayInputStream() {
        this.buf_ = null;
        this.count_ = 0;
        this.pos_ = 0;
        this.mark_ = 0;
	}

    // ByteArrayInputStream(byte[] buf) 
    ByteArrayInputStream.prototype.iinit__3B_V = function( buf ) {
        if ( buf ) {
            this.iinit__3B_I_I_V( buf, 0, buf.length );
        }
    }
    
    // ByteArrayInputStream(byte[] buf, int offset, int length) 
    ByteArrayInputStream.prototype.iinit__3B_I_I_V = function( buf, offset, length ) {
        try {
            this.buf_ = buf.slice( offset, offset + length );
            this.count_ = length;
            this.pos_ = 0;
            this.mark_ = 0;
        } catch ( ex ) {
            this.buf_ = null;
            this.count_ = this.pos_ = this.mark_ = 0;
        }
    }
    
    // long skip(long n)
    ByteArrayInputStream.prototype.skip__J_V = function(n) {
        if ( !this.buf_ || this.pos_ > this.count_ )
            return -1;
            
        var k = this.count_ - this.pos_;
        var bytesToSkip = (k < n)? k : n;
        this.pos_ += bytesToSkip;
        
        return bytesToSkip;
    }
    
    
    // int available()
    ByteArrayInputStream.prototype.available__I = function() {
        if ( !this.buf_ || this.pos_ >= this.count_ )
            return -1;
            
        return (this.count_ - this.pos_);
    }
    
    // void close()
    ByteArrayInputStream.prototype.close__V = function() {
        this.buf_ = null;
    }
    
    // void reset()
    ByteArrayInputStream.prototype.reset__V = function() {
        this.pos_ = this.mark_;
    }
    
    // void mark(int readlimit)
    ByteArrayInputStream.prototype.mark__I_V = function( readlimit ) {
        this.mark_ = readlimit;
    }
    
    // boolean markSupported()
    ByteArrayInputStream.prototype.markSupported__Z = function() {
        return true;
    }
    
    // int read()
    ByteArrayInputStream.prototype.read__I = function() {
        if ( !this.buf_ || this.pos_ >= this.count_ )
            return -1;
            
        return this.buf_[this.pos_ ++];
    }
    
    
    //int read(byte[] b, int off,int len)
    ByteArrayInputStream.prototype.read__3B_I_I_I = function( b, off, len ) {
        if ( !this.buf_ || this.pos_ >= this.count_ )
            return -1;
            
        var k = this.count_ - this.pos_;
        var bytesToRead = (k < len)? k : len;
        
        java.lang.System.arraycopy__Ljava_lang_Object2_I_Ljava_lang_Object2_I_I_V( 
            this.buf_, this.pos_, b, off, bytesToRead );
            
        this.pos_ += bytesToRead;
        return bytesToRead;
    }
    
    //int read(byte[] b)
    ByteArrayInputStream.prototype.read__3B_I = function( b ) { 
        return this.read__3B_I_I_I( b, 0, b.length );
    }
    
    
	return ByteArrayInputStream;
})();
jvm_load_class( "java.io.ByteArrayInputStream" );
