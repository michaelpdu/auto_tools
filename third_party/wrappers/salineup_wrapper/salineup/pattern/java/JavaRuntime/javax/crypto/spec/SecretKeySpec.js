package( "javax.crypto.spec" );


javax.crypto.spec.SecretKeySpec  = (function() {

    function SecretKeySpec() {
    }

    // SecretKeySpec(byte[] key, String algorithm) 
    SecretKeySpec.prototype.iinit__3B_Ljava_lang_String2_V = function( key, algorithm ) {
        this.key_ = key;
        this.algorithm_ = algorithm;
       
    }
    
    // byte[] getEncoded()
    SecretKeySpec.prototype.getEncoded__3B = function() {
        return this.key_;
    }
    
    // String getAlgorithm()
    SecretKeySpec.prototype.getAlgorithm__Ljava_lang_String2 = function() {
        return this.algorithm_;
    }

	return SecretKeySpec;
})();

