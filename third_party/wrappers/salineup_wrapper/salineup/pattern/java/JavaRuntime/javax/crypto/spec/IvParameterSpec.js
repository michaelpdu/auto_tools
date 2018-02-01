package( "javax.crypto.spec" );


javax.crypto.spec.IvParameterSpec = (function() {

    function IvParameterSpec() {
    }

    // SecretKeySpec(byte[] key, String algorithm) 
    IvParameterSpec.prototype.iinit__3B_V = function( iv ) {
        this.iv_ = iv;
    }
    
    // byte[] getIV
    IvParameterSpec.prototype.getIV__3B = function() {
        return this.iv_;
    }

	return IvParameterSpec;
})();

