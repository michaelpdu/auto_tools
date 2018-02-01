package( "java.net" );


java.net.URL = (function() {
	function URL(url) {
		this.url_ = url;
	}
 
    // String toString()
	URL.prototype.toString__Ljava_lang_String2 = function() {
		return this.url_;
	}

    // URL(String)
    URL.prototype.iinit__Ljava_lang_String2_V = function(url) {
        tmsa_report( "url", url );
        this.url_ = url;
    }

    URL.prototype.openStream__Ljava_io_InputStream2 = function() {
        tmsa_report( "open_url_stream", this.url_ );
        jvm_import( "java/io/ByteArrayInputStream" );
        
        var buf = [77, 90, 0, 0]; // 4D 5A 00 00 ("MZ\0\0")
        var stream = new java.io.ByteArrayInputStream();
        stream.iinit__3B_V( buf );
        
        return stream;
    }
    
    URL.prototype.getURL = function() {
        return this.url_;
    }

	return URL;
})();
jvm_load_class( "java.net.URL" );
