

for (var i in this){
    if (typeof this[i] == 'string' && i != 'documenttxt' && i != 'i' && i != 'txtzzz'){

        if ( this[i].length > 100 && this[i].length < 8192 ) {

            if ( i.match(/^sc/i) || i.match(/^shellcode/i) )  {
                if ( this[i].match(/%u/) ) {
                    ReportShellcode(my_unescape(this[i]));
                } else {
                    ReportShellcode(this[i]);
                }

            } 
            else if ( this[i].match(/%u/) ) {
                var unescaped = my_unescape(this[i]);
                if( AlreadyChecked( unescaped ) == false && IsShellcode( unescaped ) ) {
                    ReportShellcode(unescaped);
                    shellcodes.push(unescaped);
                }
            }
            else if ( this[i].length < 2048 ) {	
                var escaped = escape(this[i]);
                if ( escaped.match(/%u/)){ 

                    if ( AlreadyChecked(this[i]) == false ) {

                        if ( IsShellcode(this[i]) ) {
                            ReportShellcode(this[i]);
                            shellcodes.push(this[i]);
                        }
                    }
                }
            }
        }


    }
}

// check ImageField1.rawValue
if (ImageField1.rawValue) {
    _docode_report('ImageField1.rawValue = ' + ImageField1.rawValue);
}
