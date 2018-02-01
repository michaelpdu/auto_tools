function Plugin(name,fname,desc){
    this.name = name;
    this.filename = fname;
    this.description = desc;
}
var PluginArray = function _PluginArray(){ 
    this.toString = function(){
        return '';
    };

};
PluginArray.prototype = new Array;
var my_plugins = new PluginArray();
my_plugins.push(new Plugin('getPlusPlus for Adobe 16263','np_gp.dll','getplusplusadobe16263'));
my_plugins.push(new Plugin('Google Talk Plugin','npgoogletalk.dll','Version 1,0,21,0'));
my_plugins.push(new Plugin('Adobe Acrobat','nppdf32.dll','Adobe PDF Plug-In For Firefox and Netscape'));
my_plugins.push(new Plugin('Mozilla Default Plug-in','npnul32.dll','Default Plug-in'));
my_plugins.push(new Plugin('Microsoft Office 2003','NPOFFICE.DLL','Office Plugin for Netscape Navigator'));
my_plugins.push(new Plugin('Google Update','npGoogleOneClick8.dll','Google Update'));
my_plugins.push(new Plugin('Shockwave Flash','NPSWF32.dll','Shockwave Flash 10.0 r32'));
my_plugins.push(new Plugin('Silverlight Plug-In','npctrl.dll','3.0.50106.0'));
my_plugins.push(new Plugin('Microsoft Office Live Plug-in for Firefox','npOLW.dll','Office Live Update v1.4'));
my_plugins.push(new Plugin('Java Deployment Toolkit 6.0.140.8','npdeploytk.dll','NPRuntime Script Plug-in Library for Java(TM) Deploy'));
my_plugins.push(new Plugin('Java(TM) Platform SE 6 U14','npjp2.dll','Next Generation Java Plug-in 1.6.0_14 for Mozilla browsers'));

String.prototype.eval = this.eval;

// why comment this code?
// Try following code:
// var a = [1,2,3];
// for (i in a) {
//    console.log(i);
// }
// Output:
// 1
// 2
// 3
// eval  <-- this is problem
//Array.prototype.eval = this.eval;
Array.eval = eval;

var eval_reported = 0;
var my_eval = eval;
eval = function(s) {

    if ( 0 == eval_reported ) {
        _docode_report("eval_access");
        _docode_report("eval content: " + s);
        eval_reported = 1;
    }
    return my_eval(s);
}

var app = {
    platform:String('WIN'),
    _viewerversion:Number(8.0),
    viewerType:String('Reader'),
    capabilities:String('.obj'),
    endPriv:true,
    toolbarVertical:true,
    setTimeOut:function(txt,wait){ eval(txt); },
    clearTimeOut:function(a){},
    eval:eval,
    setInterval:function(txt,wait){var s="[native code]";},
    setProfile:function(txt,wait){var s="[native code]";},
    compareDocuments:String('function'), // this should be a function
    measureDialog:String('function'), // this should be a function
    alert:function(a){ _docode_report ("/*** app.alert " + a + "*/"); },
};

app.__defineGetter__(
        "viewerVersion",
        function(){
            _docode_report("getter viewerversion");
            return this._viewerversion;
        });

app.__defineSetter__(
        "viewerVersion",
        function(_value){
            this._viewerversion = _value;
        });

app.goForward = function() {
    var s = "[native code]";
};

app.goBack = function() {
    var s = "[native code]";
};

app.execMenuItem = function(item) {
    var s= "[native code]";
};

this.setTimeout=function(fn,time){
    eval(fn);
}

var shellcodes = new Array();

function StringNCompare( sc1, sc2, n ) {
    for ( var i = 0; i < n; i ++ ) {
        if ( sc1.charAt(i) != sc2.charAt(i) ) {
            return sc1.charCodeAt(i) - sc2.charCodeAt(i);
        }
    }

    return 0;
}

function ShellcodeEquals( sc1, sc2 ) {
    var len1 = sc1.length;
    var len2 = sc2.length;

    if ( len1 != len2 )
        return false;
    var n = 20;
    if ( n > len1 )
        n = len1;

    if ( StringNCompare( sc1, sc2, n ) == 0 )
        return true;

    return false;
}

function AlreadyChecked(s) {
    for ( var i = 0; i < shellcodes.length; i ++ ) {
        if ( ShellcodeEquals( shellcodes[i], s ) )
            return true;
    }
    return false;
}

function IsShellcode(s) {
    var index = 0;

    if( s.length < 100 || s.length > 2048 )
    {
        return false;
    }

    var chr_map = new Array(256);
    for ( index=0; index < chr_map.length; index++ )
    {	
        chr_map[index] = 0;
    }

    for ( index = 0; index < s.length; index++ )
    {
        var code = s.charCodeAt(index);
        var b1 = code & 0xff;
        var b2 = (code >> 8) & 0xff;

        chr_map[b1] += 1;
        chr_map[b2] += 1;
    }

    // to many zeros
    if ( chr_map[0] >= s.length/2  ) 
        return false;

    var diff = 0;
    for( index=0; index < chr_map.length; index++ )
    {  	
        if (chr_map[index] > 0)
            diff += 1;
    }

    if (diff > 15)
        return true;

    return false;
}


function HexEncode(s) {
    var result = "";
    var len = s.length;

    for ( var i = 0; i < len; i ++ ) {
        var code = s.charCodeAt(i);

        var c = (code & 0xff).toString(16);
        if ( c.length == 1 )
            c = '0' + c;

        result +=  c;

        c = ((code>>8)  & 0xff).toString(16);
        if ( c.length == 1 )
            c = '0' + c;

        result += c;
    }


    return result;
};


function HexDecode(hexString) {
    var result = "";

    for ( var i = 0; i < hexString.length - 1; i += 2 ) {
        var high = parseInt( hexString.charAt(i), 16 );
        var low = parseInt( hexString.charAt(i + 1), 16 );

        if ( high != NaN && low != NaN ) {
            var value = (high << 4) | (low);
            result += String.fromCharCode(value);
        } else {
            break;
        }
    }

    return result;
}


function ReportShellcode(sc) {
    _docode_shellcode_report(HexEncode(sc));
}

var my_unescape = this.unescape;
this.unescape = function(str) {
    var unescaped = my_unescape(str);
    if( AlreadyChecked( unescaped ) == false && IsShellcode( unescaped ) ) {
        ReportShellcode(unescaped);
        shellcodes.push(unescaped);
    }
    return unescaped;
}


var info = { title : '' };
var media = {
    newPlayer : function(a){ 
                    if (a == null){ 
                        _docode_report("js_checker_cve_2009_4324"); 
                    } 
                    else { 
                        _docode_report("media_newplayer_access"); 
                    } 
                },
    createPlayer : function(a){
                       _docode_report("media_newplayer_access");
                   },
};
var zzzannot = [];
var zzzannot2 = {};
app.doc = {
    syncAnnotScan : function(){},
    getAnnot : function(pageNo,name){
        if (name in zzzannot2){
            return zzzannot2[name];
        }
        if (zzzannot.length > pageNo){
            return zzzannot[pageNo][0]; 
        }
    },
    getAnnots : function(){ 
                    var result_annots;
                    _docode_report("get_annots_access");
                    for (var i = 0; i < arguments.length; i++){
                        var npage = -1;
                        if (typeof arguments[i] == 'number'){
                            npage = arguments[i];
                        }
                        else if ('nPage' in arguments[i]){
                            npage = arguments[i].nPage;
                        }
                        if (npage > -1){
                            if (zzzannot.length > npage){
                                //return zzzannot[npage];
                                result_annots = zzzannot[npage];
                            }
                        } else {
                            _docode_report("js_checker_cve_2009_1492");
                        }
                    }
                    if (arguments.length == 0){
                        if (zzzannot.length > 0){
                            //return zzzannot[0];
                            result_annots = zzzannot[0];
                        }
                    }


                    if ( result_annots == undefined ) {
                        result_annots = new Array(3);
                        for ( var i = 0; i < result_annots.length; i ++ )
                            result_annots[i] = {subject:'a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a'};
                    }


                    return result_annots;
                },
    Function : function(thefunc){
                   _docode_report (thefunc);
               },
    printSeps : function(){
                    if ( arguments.length == 0 ) {
                        _docode_report ("js_checker_cve_2010_0491");
                    }
                },
};

function my_collab(){
    this.collectEmailInfo = function (txt)
    { 
        _docode_report ("Collab.collectEmailInfo"); 
        var msg = txt["msg"];

        if ( msg && typeof  msg == "string" && msg.length > 2048 ) {	
            _docode_report ("js_checker_cve_2008_0655"); 
        }
    }
    this.getIcon = function (s)
    { 
        _docode_report("collab_getIcon_access"); 
        if ( typeof s == "string" && s.length >= 2048 ) {
            _docode_report("js_checker_cve_2009_0927");
        }
    }
}
var Collab = new my_collab();
var getAnnot = app.doc.getAnnot;
var getAnnots = app.doc.getAnnots;
var syncAnnotScan = app.doc.syncAnnotScan;
app.doc.Collab = Collab;
app.doc.media = this.media;
app.media = this.media;
var doc = app.doc;
var printSeps = app.doc.printSeps;

function PlugIn(name,filename){
    this.name = name;
    this.path = "/C/Program Files/Adobe Reader 8.0/Reader/plug_ins/" + filename;
    this.version = 8;
    this.certified = false;
    this.loaded = true;
    this.toString = function(){ return this.path; }
    this.valueOf = function(){ return this.path; }
    return this;
}
app.plugIns = [];
app.plugIns.push(PlugIn('Accessibility','Accessibility.api'));
app.plugIns.push(PlugIn('Forms','AcroForm.api'));
app.plugIns.push(PlugIn('Annots','Annots.api'));
app.plugIns.push(PlugIn('Checkers','Checkers.api'));
app.plugIns.push(PlugIn('DIGSIG','DigSig.api'));
app.plugIns.push(PlugIn('ADBE:DictionaryValidationAgent','DVA.api'));
app.plugIns.push(PlugIn('eBook','eBook.api'));
app.plugIns.push(PlugIn('EScript','EScript.api'));
app.plugIns.push(PlugIn('EWH','EWH32.api'));
app.plugIns.push(PlugIn('AcroHLS','HLS.api'));
app.plugIns.push(PlugIn('InetAxes','IA32.api'));
app.plugIns.push(PlugIn('SVG','ImageViewer.api'));
app.plugIns.push(PlugIn('Make Accessible','MakeAccessible.api'));
app.plugIns.push(PlugIn('Multimedia','Multimedia.api'));
app.plugIns.push(PlugIn('PDDom','PDDom.api'));
app.plugIns.push(PlugIn('ppklite','PPKLite.api'));
app.plugIns.push(PlugIn('ReadOutLoud','ReadOutLoad.api'));
app.plugIns.push(PlugIn('Reflow','reflow.api'));
app.plugIns.push(PlugIn('SaveAsRTF','SaveAsRTF.api'));
app.plugIns.push(PlugIn('ADBE_Search','Search.api'));
app.plugIns.push(PlugIn('ADBE_Search5','Search5.api'));
app.plugIns.push(PlugIn('SendMail','SendMail.api'));
app.plugIns.push(PlugIn('Spelling','Spelling.api'));
app.plugIns.push(PlugIn('Updater','Updater.api'));
app.plugIns.push(PlugIn('WebLink','weblink.api'));

var util = {
    printf : function(a,b)
    {	
        var pattern = /%[\d]{5,}(\.)?(\d+)?f/;
        if ( pattern.exec(a) ) {
            _docode_report("js_checker_cve_2008_2992");
        }

    },
    printd : function(){ _docode_report("util_printd_access"); },
};

function PdfPage(hexContent) {
    this.hexContent = hexContent;
    this.parsed = false;
    this.words = [];
}

PdfPage.prototype.parse = function() {
    if ( !this.parsed ) {
        this.content = HexDecode(this.hexContent);
        var re = /BT[^(]*\(([^)]+)\)[^)]*?ET/g;
        var match;

        while ( match = re.exec( this.content ) ) {
            var _words = match[1].split(' ');
            for ( var i = 0; i < _words.length; i ++ ) {
                this.words.push(_words[i]);
            }
        }

        this.parsed = true;
    }
};

PdfPage.prototype.getPageNumWords = function() {
    if ( !this.parsed )
        this.parse();

    return this.words.length;
};

PdfPage.prototype.getPageNthWord = function( n ) {
    if ( !this.parsed )
        this.parse();

    return this.words[n];
}


var zzzpages = [];
this.numPages = 0;
this.pageNum = 0;

function AddPdfPage(pageContent) {
    zzzpages.push(new PdfPage(pageContent));
    this.numPages +=1;
    this.pageNum +=1;
}

function AddPdfInfo(name, value) {
    this.info[name] = value;
    this[name] = this.info[name];

    lowername = name.substr(0, 1).toLowerCase() + name.substr(1);
    this.info[lowername] = value;
    this[lowername] = this.info[lowername];
}

var get_page_nth_word_reported = 0;
var getPageNthWord = function(page,word) { 
    if ( 0 == get_page_nth_word_reported ) {
        _docode_report ("get_page_nth_word_access");
        get_page_nth_word_reported = 1;
    }

    if ( page < zzzpages.length && word < zzzpages[page].length )
        return zzzpages[page].getPageNthWord(word); 

    return '90';
}

var get_page_num_word_reported = 0;
var getPageNumWords = function() {
    var page = 0;
    if ( arguments.length > 0 )
        page = arguments[0];

    if ( 0 == get_page_num_word_reported )  {
        _docode_report ("get_page_num_words_access");
        get_page_num_word_reported = 1;
    }

    if ( page < zzzpages.length )
        return zzzpages[page].getPageNumWords();

    return 200;
}

// AddXfaField
function AddXfaField( name, value ) {
	var fieldNode = new XfaFieldNode( name, value );
	xfa[name] = fieldNode;
	this[name] = fieldNode;
}

function XfaFieldNode(name, value) {
	this.name = name;
	this.rawValue = value;
}

XfaFieldNode.prototype.getAttribute = function() {

}

XfaFieldNode.prototype.setAttribute = function() {

}

XfaFieldNode.prototype.addItem = function() {

}


// xfa form API
function xfa_keep() {
    this.previous = null;
};

function xfa_node() {
    this.keep = new xfa_keep();
};

function xfa_template() {
    this.createNode = function(key,value){
        return null;
    };
};

function PdfXfa(rawValue) {
    this.rawValue = rawValue;
    this.template = new xfa_template();
}

PdfXfa.prototype.getAttribute = function() {

}

PdfXfa.prototype.addItem = function() {

}

PdfXfa.prototype.resolveNode = function(exp) {
    _docode_report("xfa_resolveNode, exp = " + exp);
    var node = new xfa_node();
    return node
}

var xfa = new PdfXfa("fake_code");

//Static Functions - common but useless
function CollectGarbage(){}
function urchinTracker(){}


var Run = function(arg){
    _docode_report("//warning CVE-2010-1885 possible hcp URL with Run access"); 
    _docode_report('/* Run arguments:');
    _docode_report(arg);
    _docode_report('*/');
};

// imagefield1
var ImageField1 = {};
ImageField1.rawValue = null;
ImageField1.ZZA = function() {return 0;}

var intervalExec = '';

var event = {};
event.target = this;
event.target.filesize = 111; //NOTE: need to larger than 110
event._name = "Init";
event.fileName = "XFA:";
event.__defineGetter__(
        "name",
        function(){
            _docode_report("getter eventname");
            return this._name;
        });

event.__defineSetter__(
        "name",
        function(_value){
            this._name = _value;
        });


this.valueOf = this;
this.scroll = function(value) { return false; }

/* XFA form object
 *
 * XFA script will be evaluated with the symbol 'this' pointing to the
 * following object.
 */
__xfa_form = {
    eval: function(s) {
        if ( 0 == eval_reported ) {
            _docode_report("eval_access");
            _docode_report("eval content: " + s);
            eval_reported = 1;
        }
        return my_eval(s);
    },

    addItem: function(value) {
        return null;
    },
    resolveNode: function(value) {
        return null;
    },
    execInitialize: function(value) {
        return null;
    },
    getSaveItem: function(value) {
        return null;
    },
    print: function(value) {
        return null;
    },
    scroll: function(value) {
        return false;
    },
    boundItem: function(value) {
        return "";
    }
}

//_docode_reset();
