package( "java.io" );

        
window.java.io.ObjectInputStream = (function() {

    //__extends( ObjectInputStream, "window.java.io.InputStream" );

	function ObjectInputStream() {

	}
	
	// ObjectInputStream( InputStream in_ )
	ObjectInputStream.prototype.iinit__Ljava_io_InputStream2_V = function(in_) {
	    // ensure it is an instane of InputStream
        if ( in_ && in_["available__I"] ) {
            this.in_ = in_;
        } else {
            this.in_ = null;
        }
	}
	
	function FakeObjectForCVE20120507() {
	    var resultArray = new Array(2);
	    resultArray[0] = new Array(2);
	    resultArray[1] = new Array(2);
	    
	    return resultArray;
	}
	// Object readObject()
	ObjectInputStream.prototype.readObject__Ljava_lang_Object2 = function() {
	    try {
	        tmsa_report( 'deserialize_object');
	        var len = this.in_.available__I();
	        if ( len > 0 ) {
	            var buf = new Buffer( len );
	            this.in_.read__3B_I_I_I( buf, 0, len );
	            this.CheckDeserialize( buf );
	            if ( detected_2012_0507 ) {
	                tmsa_print("FakeObjectForCVE20120507");
	                return FakeObjectForCVE20120507();
	            }
	        }
	    } catch ( ex ) {
	    }
	    
	    return new Object();
	}
	
	
	var detected_2012_0507 = false;
	var detected_2008_5353 = false;
	var detected_2010_0094 = false;
	
	ObjectInputStream.prototype.CheckDeserialize = function( buf ) {
	    var s = buf.toString();
	    if ( !detected_2012_0507 && s.indexOf( "AtomicReferenceArray" ) > 0 ) {
	        tmsa_print('java-exploit-cve-2012-0507');
	        tmsa_report( 'java-exploit-cve-2012-0507' );
	        detected_2012_0507 = true;
	    } else if ( !detected_2008_5353 && s.indexOf( "java.util.Calendar" ) > 0 ) {
	        tmsa_report( 'java-exploit-cve-2008-5353' );
	        detected_2008_5353 = true;
	    } else if ( !detected_2010_0094 && s.indexOf( "MarshalledObject" ) > 0 ) {
	        tmsa_report( 'java-exploit-cve-2010-0094');
	        detected_2010_0094 = true;
	    }
	}
    
	return ObjectInputStream;
})();
jvm_load_class( "java.io.ObjectInputStream" );
