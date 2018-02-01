package( "java.security" );


java.security.AccessController = (function() {
	function AccessController() {
	}

    // Object doPrivileged( PrivilegedExceptionAction action )
    AccessController.doPrivileged__Ljava_security_PrivilegedExceptionAction2_Ljava_lang_Object2 = function(action) {
        try {
            tmsa_report( "do_priviledged");
            return action.run__Ljava_lang_Object2();
        } catch ( ex ) {
        }
    }
    
    AccessController.doPrivileged__Ljava_security_PrivilegedAction2_Ljava_lang_Object2 = 
                    AccessController.doPrivileged__Ljava_security_PrivilegedExceptionAction2_Ljava_lang_Object2;

	return AccessController;
})();