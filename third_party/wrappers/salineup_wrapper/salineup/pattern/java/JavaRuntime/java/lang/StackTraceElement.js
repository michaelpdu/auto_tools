package("java.lang");


java.lang.StackTraceElement = (function () {
    function StackTraceElement() {
        

    }

    //   String getClassName() 
    StackTraceElement.prototype.getClassName__Ljava_lang_String2 = function () {
        return this.classname_;

    }

    // String getMethodName() 
    StackTraceElement.prototype.getMethodName__Ljava_lang_String2 = function () {

        return this.mehodname_;

    }

    StackTraceElement.prototype.setClassName = function (classname) {
        this.classname_ = classname;
    }

    StackTraceElement.prototype.setMethodName = function (methodname) {
        this.mehodname_ = methodname;
    }


    return StackTraceElement;
})();
jvm_load_class("java.lang.StackTraceElement");