package( "java.security" );


java.security.AllPermission = (function() {
	function AllPermission() {
	}

    AllPermission.prototype.iinit__V = function() {
        tmsa_report( "all_permission");
    }

	return AllPermission;
})();