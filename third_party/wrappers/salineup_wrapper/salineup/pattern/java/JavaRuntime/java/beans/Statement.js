package( "java.beans" );


java.beans.Statement = (function() {
	function Statement() {

	}

    // Statement(Object target, String methodName, Object[] parameters)
    Statement.prototype.iinit__Ljava_lang_Object2_Ljava_lang_String2_3Ljava_lang_Object2_V = function(target, methodName, parameters) {
        this.target_ = target;
        this.methodName_ = methodName;
        this.parameters_ = parameters;
    }
    
    Statement.prototype.execute__V = function() {
        var klass;
        if ( this.target_ instanceof java.lang.Class ) {
            klass = this.target_;
        } else {
            klass = this.target_.getClass();
        }
        
        var m = klass.getMethod( this.methodName_, this.parameters_ );
        m.apply( this.target_, this.parameters_ );
    }

	return Statement;
})();
jvm_load_class( "java.beans.Statement" );
