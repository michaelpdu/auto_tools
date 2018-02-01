package( "java.util" );


java.util.Random = (function() {
	function Random() {
	}
	
	
	// int nextInt()
	Random.prototype.nextInt__I = function() {
	    return Math.floor( ( Math.random() * 1234567 ) + 1 ); 
	}
	
	// int nextInt(int n)
	Random.prototype.nextInt__I_I = function( n ) {
	    return Math.floor( ( Math.random() * n ) + 1 ); 
	}

	return Random;
})();