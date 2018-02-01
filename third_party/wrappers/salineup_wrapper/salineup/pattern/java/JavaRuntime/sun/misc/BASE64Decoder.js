package( "sun.misc" );

var keyStr = "ABCDEFGHIJKLMNOP" +
            "QRSTUVWXYZabcdef" +
            "ghijklmnopqrstuv" +
            "wxyz0123456789+/" +
            "=";
            
function decode64( input ) {
   var output = [];
   var chr1, chr2, chr3 = "";
   var enc1, enc2, enc3, enc4 = "";
   var i = 0;
   var index = 0;

   // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
   input = input.replace( /[^A-Za-z0-9\+\/\=]/g, "" );

   do {
      enc1 = keyStr.indexOf( input.charAt( i ++ ) );
      enc2 = keyStr.indexOf( input.charAt( i ++ ) );
      enc3 = keyStr.indexOf( input.charAt( i ++ ) );
      enc4 = keyStr.indexOf( input.charAt( i ++ ) );

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output[index ++] = chr1;

      if (enc3 != 64) {
         output[index ++] = chr2;
      }
      if (enc4 != 64) {
         output[index ++] = chr3;
      }

      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";

   } while (i < input.length);

   return output;
}


sun.misc.BASE64Decoder = (function() {

    

	function BASE64Decoder() {
	}
	
	

	// byte[] decodeBuffer(String s)
	BASE64Decoder.prototype.decodeBuffer__Ljava_lang_String2_3B = function( s ) {
	    return decode64( s );
	}
	
	return BASE64Decoder;
})();
jvm_load_class( "sun.misc.BASE64Decoder" );
