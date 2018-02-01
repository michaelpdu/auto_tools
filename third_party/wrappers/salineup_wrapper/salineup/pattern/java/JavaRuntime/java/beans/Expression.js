package( "java.beans" );


java.beans.Expression = (function() {
	function Expression() {

	}

    // Expression(Object target, String methodName, Object[] parameters)
    Expression.prototype.iinit__Ljava_lang_Object2_Ljava_lang_String2_3Ljava_lang_Object2_V = function(target, methodName, parameters) {
        this.target_ = target;
        this.methodName_ = methodName;
        this.parameters_ = parameters;
        this.value_ = null;
    }
    
    Expression.prototype.execute__V = function() {
        var klass;
        if ( this.target_ instanceof java.lang.Class ) {
            klass = this.target_;
        } else {
            klass = this.target_.getClass();
        }
        
        var m = klass.getMethod( this.methodName_, this.parameters_ );
        this.value_ = m.apply( this.target_, this.parameters_ );
    }
    
    Expression.prototype.getValue__Ljava_lang_Object2 = function() {
        return this.value_;
    }

	return Expression;
})();
jvm_load_class( "java.beans.Expression" );
