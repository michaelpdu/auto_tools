function MatchHandler( word, data, string ) {
    LogIt( data[0][0], data[0][1].replace( "{1}", string ) );
}

function CheckString( s ) {
    AhoCorasick.search( s, trie, MatchHandler );
}


var StringPattern = new Array();
StringPattern.push( new Array( "defineClass",new Array("define_class", "") ) );
StringPattern.push( new Array( "newInstance",new Array("new_instance", "") ) );
StringPattern.push( new Array( "setSecurityManager",new Array("set_security_manager", "") ) );
StringPattern.push( new Array( "sun.org.mozilla.javascript.internal.GeneratedClassLoader", new Array("generated_class_loader", "") ) );
StringPattern.push( new Array( "sun.org.mozilla.javascript.internal.Context",new Array("javascript_internal_context", "") ) );

// cve-2013-0422
StringPattern.push( new Array( "getMBeanInstantiator",new Array("java-exploit-cve-2013-0422", "") ) );



//StringPattern.push( new Array( ".exe",new Array("exe_path: {1}", "") ) );
StringPattern.push( new Array( "6A6176612E7574696C2E477265676F7269616E43616C656E646172", new Array("hex-encode-string-java-lang-calendar", "")  ) );
StringPattern.push( new Array( "41746F6D69635265666572656E63654172726179", new Array("hex-encode-string-atomic-reference-array", "")  ) );




var trie = new AhoCorasick.TrieNode();
for ( var i = 0; i < StringPattern.length; ++ i ) {
    var ptn = StringPattern[i];
    trie.add( ptn[0], ptn[1] );
}

AhoCorasick.add_suffix_links( trie );