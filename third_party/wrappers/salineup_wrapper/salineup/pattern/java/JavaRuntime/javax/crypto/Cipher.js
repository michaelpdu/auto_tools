package( "javax.crypto" );


javax.crypto.Cipher = (function() {


    function cast_ubyte( b ) {
	    return (b >= 0) ? (b & 0xff) : (256 + (b % 256) );
    }

    function toWordArray( bytes ) {
	    var words = [];

	    for ( var i = 0; i < bytes.length; i += 4 ) {
		    var word = 0;
		    word |= cast_ubyte( bytes[i] );
		    word <<= 8;
		    word |= cast_ubyte( bytes[i + 1] );
		    word <<= 8;
		    word |= cast_ubyte( bytes[i + 2] );
		    word <<= 8;
		    word |= cast_ubyte( bytes[i + 3] );
    		

		    words[i / 4] = word;
	    }

	    return new CryptoJS.lib.WordArray.init( words, bytes.length );
    }

    function wordArrayToByteArray( wordArray ) {
	    var words = wordArray.words;
	    var bytes = new Array( wordArray.sigBytes );
	    for ( var i = 0; i < words.length; ++ i ) {
		    var word = words[i];
		    bytes[i * 4] = cast_byte( (word >> 24) & 0xff ); 
		    bytes[i * 4 + 1] = cast_byte( (word >> 16) & 0xff ); 
		    bytes[i * 4 + 2] = cast_byte( (word >> 8 ) & 0xff ); 
		    bytes[i * 4 + 3] = cast_byte( (word) & 0xff ); 
	    }

	    return bytes;
    }
    
        

	function Cipher() {
	    this.input_ = [];
	}
    
    Cipher.crytoJsPath = path_module.join( jvm_get_third_party_path(), "crypto-js" );
    
    
    
    
    (function CipherGlobalInitialize(){
        ExternalModule.loadModule( "aes.js", path_module.join( Cipher.crytoJsPath, "rollups/aes.js" ) );
        ExternalModule.loadModule( "mode-cfb.js", path_module.join( Cipher.crytoJsPath, "components/mode-cfb.js" ) );
        ExternalModule.loadModule( "mode-ecb.js", path_module.join( Cipher.crytoJsPath, "components/mode-ecb.js" ) );
        ExternalModule.loadModule( "pad-nopadding.js", path_module.join( Cipher.crytoJsPath, "components/pad-nopadding.js" ) );
    }) ();
    
    
    
    // Cipher getInstance(String transform)
    Cipher.getInstance__Ljava_lang_String2_Ljavax_crypto_Cipher2 = function( transform ) {
        
        var newCipher = new Cipher();
        newCipher.setTransform( transform );
          
        return newCipher;
    }
    
    //  void init(int opmode, Key key, AlgorithmParameterSpec params) 
    Cipher.prototype.init__I_Ljava_security_Key2_Ljava_security_spec_AlgorithmParameterSpec2_V = function(opmode, key, params) {
        this.init( opmode, key, params );
    }
    
    
    // byte[] doFinal(byte[] input)
    Cipher.prototype.doFinal__3B_3B = function( input ) {
        this.input_ = input;
        return this.doFinal();
    }
    
    Cipher.prototype.init = function( opmode, key, params ) {
        this.opmode_ = opmode;
        this.key_ = key;
        this.params_ = params;
    }
    
    Cipher.prototype.setTransform = function( transform ) {
        //"algorithm/mode/padding" or
        //"algorithm"
        
        this.transform_ = transform;
        var arr = transform.split( "/" );
        
        this.algorithm_ = arr[0];
        if ( 3 == arr.length ) {
            this.mode_ = arr[1];
            this.padding_ = arr[2];
        }

    }
    
    Cipher.prototype.doFinal = function() {
        var algorithm = this.algorithm_? this.algorithm_ : this.key_.getAlgorithm__Ljava_lang_String2();
        
        switch ( algorithm ) {
            case "AES": return this.doFinalAES();
        }
    }
    
    // AES
    
    Cipher.AESInitialize = function() {
        ExternalModule.loadModule( "aes.js", path_module.join( Cipher.crytoJsPath, "rollups/aes.js" ) );
    }
    
    Cipher.prototype.doFinalAES = function() {
       
        Cipher.AESInitialize();
        
    
        var mode, padding;
        var key  = toWordArray( this.key_.getEncoded__3B() );
        var iv   = toWordArray( this.params_.getIV__3B() );
        
        
        var words = toWordArray( this.input_ );
           
        var encrypted = {};
        encrypted.key = key;
        encrypted.iv = iv;
        encrypted.ciphertext = words;

     
        mode = Cipher.modeStringToMode( this.mode_ ); 
        padding = Cipher.paddingStringToPadding( this.padding_ );
        
       
        var decrypted = CryptoJS.AES.decrypt( encrypted, key, {iv:iv, mode:mode, padding:padding} );
        
        bytes = wordArrayToByteArray( decrypted );
        
        return bytes;
       
    }
    
    
    var modeNameMap = {
        "CBC" : CryptoJS.mode.CBC,
        "ECB" : CryptoJS.mode.ECB
    };
    
    
    
    var paddingNameMap = {
        "NoPadding": CryptoJS.pad.NoPadding
        
    };
    
    Cipher.modeStringToMode = function( modeString ) {
        if ( !modeString ) return null;
        
        return modeNameMap[modeString];
    }
    
    Cipher.paddingStringToPadding = function( paddingString ) {
        if ( !paddingString ) return null;
        
        return paddingNameMap[paddingString];
    }
   
    
	
	return Cipher;
})();

jvm_load_class( "javax.crypto.Cipher" );
