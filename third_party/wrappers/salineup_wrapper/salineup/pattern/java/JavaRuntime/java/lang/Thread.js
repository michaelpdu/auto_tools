package( "java.lang" );

java.lang.Thread = (function() {



	function Thread() {
	
	   this.target = null;

	}
	
	//Thread(Runnable target)
	Thread.prototype.iinit__Ljava_lang_Runnable2_V = function(target){
	    this.target = target;
	}
	
	//Thread(Runnable target, String name)
	Thread.prototype.iinit__Ljava_lang_Runnable2_Ljava_lang_String2_V = function(target, name){
	    this.target = target;
	    this.name = name;
	}
	
	
	Thread.prototype.iinit__V = function(){
	     this.target = null;
	}
	
	
	
	//start()
	Thread.prototype.start__V = function() {
	
	    if(this.target!=null)
	        this.target.run__V();
	    else
	        //jvm_call( "java.lang.Thread.prototype.iinit__V", "", _s0, []);
	        this.run__V();
	}
	
	//run()
	Thread.prototype.run__V = function() {
	    this.target.run__V();
	}
    
	return Thread;
})();



jvm_load_class( "java.lang.Thread" );