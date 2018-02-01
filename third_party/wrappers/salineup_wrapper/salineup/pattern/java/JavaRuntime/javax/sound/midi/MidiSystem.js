package( "javax.sound.midi" );


javax.sound.midi.MidiSystem = (function() {
	function MidiSystem() {
	}

    
	// Soundbank getSoundbank( URL url )
	MidiSystem.getSoundbank__Ljava_net_URL2_Ljavax_sound_midi_Soundbank2 = function( soundURL ) {
	
		var url = soundURL.getURL();
		if ( url.length > 256 ) {
		    var pos = url.indexOf( ":" );
		    if ( pos >= 0 ) {
		    	pos += 6;
		    	var repeatCount = 0;
		    	var c = url[pos];
		        for ( ; pos < url.length ; ++ pos ) {
		            if ( url[pos] == c && repeatCount ++ > 100 ) {
		                tmsa_report("java-exploit-cve-2009-3867" );
		                break;
		            }
		        }
		    }
		}
	}

	
	return MidiSystem;
})();
jvm_load_class( "javax.sound.midi" );
