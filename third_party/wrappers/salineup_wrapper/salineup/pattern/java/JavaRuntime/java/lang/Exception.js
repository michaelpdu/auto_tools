package("java.lang");


java.lang.Exception = (function () {
    function Exception() {


    }

    Exception.prototype.iinit__V = function () {

    }


    Exception.prototype.getStackTrace__3Ljava_lang_StackTraceElement2 = function () {
        return g_callstacks;
    }

    return Exception;
})();
jvm_load_class("java.lang.Exception");