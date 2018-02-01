var playerglobal;
var playerglobalLoadedPromise;
var SHUMWAY_ROOT = "./";

if (inBrowser) {
  var requiredConsoleFunctions = ["profile", "profileEnd", "markTimeline", "time", "timeEnd"];
  for (var i = 0; i < requiredConsoleFunctions.length; i++) {
    if (!(requiredConsoleFunctions[i] in console))
      console[requiredConsoleFunctions[i]] = function () {};
  }
}
if (typeof performance === 'undefined') {
  window.performance = { now: Date.now };
}
window.print = function (msg) {
  if (inBrowser) {
    //console.log.apply(console, arguments);
    console.log(msg, __function, __line);
  } else {
    tmsa_log(0,"Shumway",msg,__function,__line);
  }
};
var webShell = true;
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return unescape(pair[1]);
    }
  }
  return undefined;
}

// disable output eval content
eval("var tmsa_eval_not_output;");

// breakout
function breakout(msg) {
  if (enableInterruption) {
    throw new Error(msg);
  }
}

var fakeConsoleOutput = function (msg) {}
var LoggerLever = {
  OFF: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  TRACE: 4
};
//typedef enum {
//	TM_SA_LOG_OFF                    = 6,
//	TM_SA_LOG_FATAL                  = 5,
//	TM_SA_LOG_ERROR                  = 4,
//	TM_SA_LOG_WARN                   = 3,
//	TM_SA_LOG_INFO                   = 2,
//	TM_SA_LOG_DEBUG                  = 1,
//	TM_SA_LOG_TRACE                  = 0,
//	TM_SA_LOG_ALL                    = TM_SA_LOG_TRACE
//} TM_SA_LOG_LEVEL;

var TMSA_BEH = inBrowser ? function (msg) {console.info(msg);} : _docode_report;
var TMSA_TRACE = TMSA_INFO = TMSA_WARN = TMSA_ERROR = null;
var setTmsaLogger = function (level) {
  if (inBrowser) {
    TMSA_TRACE = (level >= 4) ? function (msg) {console.log(msg);} : fakeConsoleOutput;
    TMSA_INFO  = (level >= 3) ? function (msg) {console.info(msg);} : fakeConsoleOutput;
    TMSA_WARN  = (level >= 2) ? function (msg) {console.warn(msg);} : fakeConsoleOutput;
    TMSA_ERROR = (level >= 1) ? function (msg) {console.error(msg);} : fakeConsoleOutput;
    TMSA_SWF_REPORT = function (msg) {console.info('Find embedded swf');console.info(msg);}
  } else {
    TMSA_TRACE = (level >= 4) ? function (msg) {_docode_report(msg);} : fakeConsoleOutput;
    TMSA_INFO  = (level >= 3) ? function (msg) {_docode_report(msg);} : fakeConsoleOutput;
    TMSA_WARN  = (level >= 2) ? function (msg) {_docode_report(msg);} : fakeConsoleOutput;
    TMSA_ERROR = (level >= 1) ? function (msg) {_docode_report(msg);} : fakeConsoleOutput;
    TMSA_SWF_REPORT = function (msg) {_docode_report('Find embedded swf');_docode_swf_report(msg);}
  }
}
var TMSA_TIME_BEG = function (msg) {
  if (inBrowser) console.time(msg);
}
var TMSA_TIME_END = function (msg) {
  if (inBrowser) console.timeEnd(msg);
}
setTmsaLogger(LoggerLever.TRACE);

function BytecodeToUint8Arr(code) {
  var len = code.length/2;
  var bytesArr = new Uint8Array(len);
  var i = 0, val = 0;
  while (i < len) {
    val = parseInt(code.substr(i*2,2),16);
    bytesArr[i] = val;
    i++;
  }
  return bytesArr;
}

decodeBase64 = function(param1){
     var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
     var _loc6_ = 0;
     var _loc7_ = 0;
     var _loc2_ = '';
     var _loc3_ = new Array(4);
     var _loc4_ = new Array(3);
     var _loc5_ = 0;
     while(_loc5_ < param1.length){
        _loc6_ = 0;
        while(_loc6_ < 4 && (_loc5_ + _loc6_ < param1.length)){
           _loc3_[_loc6_] = BASE64_CHARS.indexOf(param1.charAt(_loc5_ + _loc6_));
           _loc6_++;
        }
        _loc4_[0] = (_loc3_[0] << 2) + ((_loc3_[1] & 48) >> 4);
        _loc4_[1] = ((_loc3_[1] & 15) << 4) + ((_loc3_[2] & 60) >> 2);
        _loc4_[2] = ((_loc3_[2] & 3) << 6) + _loc3_[3];
        _loc7_ = 0;
        while(_loc7_ < _loc4_.length){
           if(_loc3_[_loc7_ + 1] == 64){
              break;
           }

           if (_loc4_[_loc7_] < 16){
               _loc2_ += '0';
           }
           
           _loc2_ += (_loc4_[_loc7_]).toString(16);   
           _loc7_++;
        }
        _loc5_ = _loc5_ + 4;
     }
     return _loc2_;
}

TMSA_TIME_BEG("Prepare buildin & playerglobal abc");
var buildinUint8Arr = BytecodeToUint8Arr(buildinByteCode);
var playerglobalUint8Arr = BytecodeToUint8Arr(playerglobalByteCode);
TMSA_TIME_END("Prepare buildin & playerglobal abc");

// convert Uint8Array to string
function uint8arr2str(arr) {
  var out = "";
  for (var i=0; i<arr.length; ++i) {
    out = out + arr[i].toString() + " ";
  }
  return out;
}

//
function HexDecode(hexString) {
    var result = "";
    if (null == hexString || "" == hexString)
        return result;
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

// 
var getStackTrace = function() {
  var obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
};

//
function handleXHRQueue() {
  print("XHR queue length = "+xhrQueue.length);
  for (var i = 0; i < xhrQueue.length; ++i) {
    try {
      var xhr = xhrQueue[i];
      xhr.onreadystatechange();
    } catch (e) {
      print(e.message);
      print(e.stack);
    }
  }
}

// Static Analyzer
function StaticAnalyzer() {
    this.validMethodCnt = 0;
}

StaticAnalyzer.checkMethodInfoCount = function(count){
    if (false == g_staticAnalyzerEnable) {
        return;
    }
    if (count == 0) {
        var msg = "method info count is 0";
        TMSA_INFO(msg);
    }
	
    if (count > 400) {
        var msg = "method info count larger than 400";
        print(msg);
        TMSA_INFO(msg);
        if (normal_filter_enable == true) {
            breakout(msg);
        }
    }
}
StaticAnalyzer.checkValidMethodInfoCount = function(){
    if (false == g_staticAnalyzerEnable) {
        return;
    }
    this.validMethodCnt++;
    if (this.validMethodCnt > 40) {
        var msg = "valid method info count larger than 40";
        print(msg);
        TMSA_INFO(msg);
        if (normal_filter_enable == true) {
            //breakout(msg);
        }
    }
}
StaticAnalyzer.checkClassInfoCount = function(count){
    if (false == g_staticAnalyzerEnable) {
        return;
    }

    if (count > 40) {
        var msg = "class info count larger than 40";
        print(msg);
        TMSA_INFO(msg);
        if (normal_filter_enable == true) {
            breakout(msg);
        }
    }
    else if (count <10){
        var msg = "class info count smaller than 10";
        TMSA_INFO(msg);
    }
}
StaticAnalyzer.checkHexNumberString = function(hex) {
    if (false == g_staticAnalyzerEnable) {
        return;
    }
    switch (hex.toUpperCase())
    {
        case '41414140':
        case '41414141':
        case '41414142':
        case '41414143':
        case '41414146':
        case '41414171':
        case '41414184':
        case '90909090':
        case '9090E58B':
        case '0C0C0C0C':
        case '100000':
        case 'AABBC000':
        case 'FFEEDD0F':
        case 'FFEEDD00':
        case '7FFFFFFC':
        case 'FACE0000':
        case '7FFF0000':
        case 'BAADF00D':
        {
            var msg = 'Find suspicious number, val='+hex;
            TMSA_INFO(msg);
            print(msg);
            break;
        }
        default:
            break;
    }
}

StaticAnalyzer.CalculateHexRateInString = function (s) {
    if (false == g_staticAnalyzerEnable) {
        return;
    }

    var lengthToCheck = s.length ;
    var stringCount = 0;

    for (var i = 0; i < lengthToCheck; i++) {

        if (isNaN(parseInt(s.charAt(i), 16)))
        {
            stringCount++;
        }
    }
    var hexRate = (lengthToCheck-stringCount)/lengthToCheck;
    if (hexRate > 0.9){
        TMSA_INFO("hex rate in string ="+hexRate);
    }

}

StaticAnalyzer.analyzeConstantPool = function(constantPool) {
    if (false == g_staticAnalyzerEnable) {
        return;
    }

    Timer.start("enter into StaticAnalyzer.analyzeConstantPool");
    var retval = false;
    var ints = constantPool.getMsgArray('ints');
    var uints = constantPool.getMsgArray('uints');
    var doubles = constantPool.getMsgArray('doubles');
    var strings = constantPool.getMsgArray('strings');
    var multinames = constantPool.getMsgArray('multinames');

    var ints_size = ints.length;
    print('size of ints:'+ints_size);
    var uints_size = uints.length;
    print('size of uints:'+uints_size);
    var doubles_size = doubles.length;
    print('size of doubles:'+doubles_size);
    var strings_size = strings.length;
    print('size of strings:'+strings_size);
    print('size of multinames:'+multinames.length);

    // process constant numbers
    for (var i = 0; i < ints_size; ++i) {
        var cur_int = ints[i];
        var cur_int_hex = cur_int.toString(16);
        print("int["+i+"] = "+cur_int+', -> '+cur_int_hex);
        StaticAnalyzer.checkHexNumberString(cur_int_hex);
    }
    for (var i = 0; i < uints_size; ++i) {
        var cur_uint = uints[i];
        var cur_uint_hex = cur_uint.toString(16);
        print("uint["+i+"] = "+cur_uint+', -> '+cur_uint_hex);
        StaticAnalyzer.checkHexNumberString(cur_uint_hex);
    }
    for (var i = 0; i < doubles_size; ++i) {
        var cur_double = doubles[i];
        var cur_double_hex = cur_double.toString(16);
        print("double["+i+"] = "+cur_double+', -> '+cur_double_hex);
        StaticAnalyzer.checkHexNumberString(cur_double_hex);
    }

    // process constant strings
    for (var i = 0; i < strings_size; ++i) {
        var cur_string = strings[i];
        print('string['+i+'] = '+cur_string);
        if (cur_string.indexOf("435753") == 0 || cur_string.indexOf("465753") == 0) {
            if (cur_string.length > 800) {
                TMSA_SWF_REPORT(cur_string);
            }
        }
		if (cur_string ==="http://edpn.ebay.com"){
			TMSA_INFO("http://edpn.ebay.com");
		}
		if (cur_string ==="germanwing Headline Box Construction Kit"){
			TMSA_INFO("germanwing Headline Box Construction Kit");
		}
        if (cur_string === "(?i)()()(?-i)||||||||||||||||||||||") {
            TMSA_INFO('signiture_cve_2013_0634');
            print('Find signiture of CVE-2013-0634');
            retval = true;
        }
		if (cur_string === "LocalConnection") {
            TMSA_INFO('Find LocalConnection in constant string');
        }
		if (cur_string === "payload") {
            TMSA_INFO('Find payload in constant string');
        }
        if (-1 != cur_string.indexOf("document.createElement(\'script\')")) {
            TMSA_INFO('try to create script element in html');
            print('try to create script element in html');
        }
        if (cur_string.length > 3000 && -1 == cur_string.indexOf("\<\?xml version=")) {
            TMSA_INFO('Find big size string, length = '+cur_string.length);
            if ((cur_string.charAt(0) === 'Q') && (cur_string.charAt(1) === '1') && (cur_string.charAt(2) === 'd') && (cur_string.charAt(3) === 'T')){
                var swf_bin_string = decodeBase64(cur_string);
                TMSA_SWF_REPORT(swf_bin_string);
	        }
            StaticAnalyzer.CalculateHexRateInString(cur_string);
        }
        if (-1 != cur_string.search(/win \d{0,3},\d{0,3},\d{0,3},\d{0,3}/i)) {
            TMSA_INFO('Find check flash version in constant string, version='+cur_string);
        }
        if (-1 != cur_string.search(/windows (xp|vista|7|8|server)/i)) {
            TMSA_INFO('Find check os version in constant string, os='+cur_string);
        }

        if (-1 != cur_string.search(/createElement\(\"iframe\"\)[\w\W]{1,50}style\.visibility\s*=\s*\"hidden\"/)) {
            TMSA_INFO('Find create hidden iframe jscode, js='+cur_string);
        }
		
        if (-1 != cur_string.search(/\\[3-9][3-9]\)+\{0,\d*\}/)) {
            TMSA_INFO("const string regexp[" + cur_string + "]");
        }
		
	if (-1 != cur_string.indexOf("(?")) {
            check_CVE_2014_0498(cur_string);
        }
		
        if (-1 != cur_string.indexOf('createElement("script")')) {
            TMSA_INFO('Find create script jscode, js=' + cur_string);
        }

        if (-1 != cur_string.indexOf("systemMemoryCall")) {
            TMSA_INFO('Find systemMemoryCall in constant string');
        }

        if (-1 != cur_string.indexOf("rtmp://")) {
            TMSA_INFO('Find rtmp in constant string');
        }

    }

    Timer.stop();
    return retval;
}

//
function ByteArrayMonitor() {
    this.map = {};
    this.bytesLength = 0;
    this.writeByteInAS3 = false;
    this.writeByteCounter = 0;
    this.writeUnsignedIntCounter = 0;
    this.writeIntCounter = 0;
    this.writeBytesCounter = 0;
    this.indexSetCounter = 0;
	
	this.outputWriteByteCounter = false;
	this.outputWriteUnsignedIntCounter = false;
	this.outputMaxRepeatedElementWriteUnsignedInt = false;
	this.outputWriteIntCounter = false;
	this.outputMaxRepeatedElementWriteInt = false;
	this.outputWriteBytesCounter = false;
	this.outputByteArrayLength = false;
	this.outputIndexSetCounter = false;
}
ByteArrayMonitor.prototype.writeByte = function (val) {
    if (this.map[val] === undefined) {
        this.map[val] = 1;
    } else {
        this.map[val] += 1;
    }
    if (this.writeByteInAS3){
        this.writeByteCounter += 1;
        this.bytesLength++;
        this.writeByteInAS3 = false;
    }
    if (!this.outputWriteByteCounter && this.writeByteCounter > 1024) {
        var msg = "[Heap Spray] ByteArray writeByteCounter is larger than 1024";
        TMSA_INFO(msg);
		this.outputWriteByteCounter = true;
        breakout(msg);
    }
    // Note: fix FA issue
    //for (var elem in this.map) {
    //    if (this.map[elem] >= 128) {
    //        var msg = "[Heap Spray] ByteArray maximum repeated element, count = " + this.map[elem].toString();
    //        TMSA_INFO(msg);
    //        print(msg);
    //        breakout(msg);
    //    }
    //}
}
ByteArrayMonitor.prototype.writeUnsignedInt = function (val) {
    if (this.map[val] === undefined) {
        this.map[val] = 1;
    } else {
        this.map[val] += 1;
    }
    this.writeUnsignedIntCounter += 1;
    if (!this.outputWriteUnsignedIntCounter && this.writeUnsignedIntCounter > 1024) {
        var msg = "[Heap Spray] ByteArray writeUnsignedIntCounter is larger than 1024";
        TMSA_INFO(msg);
		this.outputWriteUnsignedIntCounter = true;
        breakout(msg);
    }

}
ByteArrayMonitor.prototype.writeInt = function (val) {
    if (this.map[val] === undefined) {
        this.map[val] = 1;
    } else {
        this.map[val] += 1;
    }
    this.writeIntCounter += 1;
    if (!this.outputWriteIntCounter && this.writeIntCounter > 1024) {
        var msg = "[Heap Spray] ByteArray writeIntCounter is larger than 1024";
        TMSA_INFO(msg);
		this.outputWriteIntCounter = true;
        breakout(msg);
    }
}
ByteArrayMonitor.prototype.writeBytes = function (val) {
    this.writeBytesCounter += 1;
    this.bytesLength += val.length;
    if (!this.outputWriteBytesCounter && this.writeBytesCounter > 256) {
        var msg = "[Heap Spray] ByteArray writeBytesCounter is larger than 256";
        TMSA_INFO(msg);
		this.outputWriteBytesCounter = true;
        breakout(msg);
    }
    if (!this.outputByteArrayLength && this.bytesLength > 1024) {
        var msg = "[Heap Spray] ByteArray length is larger than 1024";
        TMSA_INFO(msg);
		this.outputByteArrayLength = true;
        breakout(msg);
    }
}
ByteArrayMonitor.prototype.indexSetter = function () {
    this.indexSetCounter += 1;
    if (!this.outputIndexSetCounter && this.indexSetCounter > 256) {
        var msg = "[Heap Spray] ByteArray indexSetCounter is larger than 256";
        TMSA_INFO(msg);
		this.outputIndexSetCounter = true;
        //breakout(msg);
    }
}

ByteArrayMonitor.prototype.readUTFBytes = function (val) {
    if (-1 != val.search(/createElement\(\'iframe\'\)[\w\W]{1,200}visibility:hidden/i))
    {
        var msg = "Create hidden iframe in binary";
        TMSA_INFO(msg);
    }
    if (-1 != val.search(/createElement\(\'script\'\)/i))
    {
    	var msg = "Create script element in binary";
        TMSA_INFO(msg);
    }
    if (-1 != val.search(/eval/i))
    {
        var msg = "Call ExternalInterface->eval in binary";
        TMSA_INFO(msg);
    }
}
function VectorMonitor() {
    this.size = 0;
    this.map = {};
    this.setNumericPropertyCounter = 0;
    this.pushObjectCounter = 0;
}
VectorMonitor.prototype.setNumericProperty = function (val) {
    var key = typeof val;
    if (key == 'number') key = val;
    else if (key == 'object') this.pushObjectCounter += 1;
    if (this.map[key] === undefined) {
        this.map[key] = 1;
    } else {
        this.map[key] += 1;
    }
    if (this.pushObjectCounter > 128) {
        var msg = "[Heap Spray] Vector push object larger than 128";
        TMSA_INFO(msg);
        breakout(msg);
    }
}

function StringAppendMonitor() {

}
StringAppendMonitor.prototype.checkStringLength = function (left, right) {
    if (globalRealAbc == true && (isString(right.value) || isString(left.value))) {
        var stringTemp = left.value + right.value;
        if (-1 != stringTemp.search(/\\[3-9][3-9]\)+\{0,\d*\}/)) {
            TMSA_INFO("string append regexp[" + stringTemp + "]");
        }
	if (-1 != stringTemp.indexOf("(?")) {
            check_CVE_2014_0498(stringTemp);
        }
        if (stringTemp.length > 2048) {
            var msg = "[Long string in string append]";
            StaticAnalyzer.CalculateHexRateInString(stringTemp);
            TMSA_INFO(msg);
            breakout(msg);
        }
        if (stringTemp.length > 1024 * 2){
            if (stringTemp.indexOf("435753") == 0 || stringTemp.indexOf("465753") == 0 || stringTemp.indexOf("5A5753") == 0) {
                TMSA_SWF_REPORT(stringTemp);
            }
        } 
       
    }
}

function ArrayMonitor() {
    this.pushTimes = 0;
    this.indexSetTimes = 0;
}

ArrayMonitor.prototype.pushHook = function (multiname, object) {
    var namespace = multiname.namespaces[0];
	var isArray = object instanceof Array;
    if ( (globalRealAbc == true) && (multiname.name == "push")
	    && (-1 != namespace.uri.indexOf("builtin")) 
		&& isArray )
    {   
        if (object.length > 0 && object[object.length - 1] == null){
            return; 
        }
        
        this.pushTimes++;
        if (this.pushTimes > 200)
        {
            var msg = "[heap spray]Array push";
            TMSA_INFO(msg);
            breakout(msg);
        }
    }
}

ArrayMonitor.prototype.indexSetter = function () {

    if (globalRealAbc == true) {
        this.indexSetTimes++;
    }
    if (this.indexSetTimes > 1000)
    {
        var msg = "[heap spray]Array index set";
        TMSA_INFO(msg);
        breakout(msg);
    }
    
}

function OpCodeMonitor() {
    this.setNumbericPropertyTimes = 0;
}

OpCodeMonitor.prototype.setNumbericProperty = function () {
    if (globalRealAbc == true) {
        this.setNumbericPropertyTimes++;
    }

    if (this.setNumbericPropertyTimes > 2000) {
        var msg = "Find set numberic property too many times";
        TMSA_INFO(msg);
        breakout(msg);
    }
}

function check_CVE_2014_0498(pattern) {
    var index = pattern.search(/\(\?[1-9]\)\{\d+[,\d]*\}/);
    if (-1 == index) {
        return;
    }
    var sub_str = pattern.substr(index);
    var count_char = sub_str.charAt(2);
    var count = parseInt(count_char);
	
	
    var sub_str_prev = pattern.substr(0, index);
    var prev_count = 0;
    for (var i = 0; i < sub_str_prev.length; ++i) {
        if (sub_str_prev.charAt(i) == '(') {
            prev_count++;
        }
    }
	
    if (prev_count >= count) {
        return;
    }
	
    var after_count = 0;
    var after_index = sub_str.indexOf('}');
    var after_sub_str = sub_str.substr(after_index + 1);
    for (var i = 0; i < after_sub_str.length; ++i) {
        if (after_sub_str.charAt(i) == '(') {
            after_count++;
        }
    }
	
    if (after_count >= (count - prev_count)) {
        print("Found CVE_2014_0498");
        TMSA_INFO("Found CVE_2014_0498");
    }
    return;
}
function bin2hex(bArray) {
    var map = [];
    map[0] = '0';map[1] = '1';map[2] = '2';map[3] = '3';map[4] = '4';map[5] = '5';map[6] = '6';map[7] = '7';map[8] = '8';map[9] = '9';
    map[10] = 'A';map[11] = 'B';map[12] = 'C';map[13] = 'D';map[14] = 'E';map[15] = 'F';
    var old_pos = bArray.position;
    var str = "";
    while (bArray.position < bArray.length) {
        var oneByte = bArray.readUnsignedByte();
        var high = oneByte & 0xf0;
        high = high >> 4
        var low = oneByte & 0x0f;
        str += map[high];
        str += map[low];
    }
    bArray.position = old_pos;
    return str;
}
function checkEmbedSwf(aByteArray) {
    
    if (aByteArray.length - aByteArray.position < 3){
        print("It's not a flash format.")
        return;
    }
    
    var old_pos = aByteArray.position;
    var header = '';
    var oneByte = aByteArray.readUnsignedByte();
    header += oneByte;
    var oneByte = aByteArray.readUnsignedByte();
    header += oneByte;
    var oneByte = aByteArray.readUnsignedByte();
    header += oneByte;
    aByteArray.position = old_pos;
    
    if (-1 != header.indexOf("708783") || -1 != header.indexOf("678783")
        || -1 != header.indexOf("908783")) {
        TMSA_SWF_REPORT(bin2hex(aByteArray))
    }
}

function SwfInArrayExtractor() {
    this.arrayObjectName = "";
    this.xorFactor = 0;
    this.arrayContainsSwf = [];
    this.slots = [];
    this.variableSlotMap = [];
}
SwfInArrayExtractor.prototype.findAndConstructArray = function (line) {
    
    if (this.arrayObjectName.length == 0) {
        return;
    }
    if (this.arrayContainsSwf.length != 0) {
        return;
    }
    var temp_str = this.arrayObjectName + ".instanceConstructor";
    var begin = line.indexOf(temp_str);
    if (-1 == begin) {
        return;
    }
    begin += temp_str.length + 1;
    var end = line.lastIndexOf(")");
    
    var arrayParaString = line.substring(begin, end);
    
    var arrayParameters = arrayParaString.split(", ");
    
    var length = arrayParameters.length;
    if (length < 10) {
        print("too little parameters in array!");
        return;
    }
    for (var i = 0; i < arrayParameters.length; ++i) {
        var parameter = parseInt(arrayParameters[i]);
        if (parameter == NaN) {
            print("Can not convert parameter to int, " + arrayParameters[i]);
            this.arrayContainsSwf = [];
        }
        this.arrayContainsSwf.push(parameter);
    }
}

SwfInArrayExtractor.prototype.findArrayObjectName = function (line) {
    if (this.arrayContainsSwf.length != 0) {
        return;
    }
  
    if (-1 != line.indexOf("asGetProperty") && -1 != line.indexOf("'Array'")) {
        var begin = line.indexOf("v");
        var end = line.indexOf("=");
        end--;
        this.arrayObjectName = line.substring(begin, end);
    }
}

SwfInArrayExtractor.prototype.parseGetSlots = function (line) {
    var index = line.indexOf("asGetSlot");
    if (-1 == index) {
        return;
    }
    
    var begin = line.indexOf(", ", index);
    if (-1 == begin) {
        return;
    }
    
    begin += 2;
    var end = line.indexOf(")", begin);
    if (-1 == end) {
        return;
    }
    
    var slot_index_str = line.substring(begin, end);
    var slot_index = parseInt(slot_index_str);
    if (isNaN(slot_index)) {
        return;
    }
    
    begin = line.indexOf("  v");
    if (-1 == begin) {
        return;
    }
    begin += 2;
    end = line.indexOf(" =", begin);
    if (-1 == end) {
        return;
    }
    
    var varName = line.substring(begin, end);
    print("Get slot, slot index is " + slot_index + ", variable name is " + varName);
    this.variableSlotMap[varName] = slot_index;
}
SwfInArrayExtractor.prototype.parseSetSlots = function (line) {
    var index = line.indexOf("asSetSlot");
    if (-1 == index) {
        return;
    }
    
    var begin = line.indexOf(", ", index);
    if (-1 == begin) {
        return;
    }
    
    begin += 2;
    var end = line.indexOf(", ", begin);
    if (-1 == end) {
        return;
    }
    var slot_index_str = line.substring(begin, end);
    
    begin = end + 2;
    end = line.indexOf(")", begin);
    if (-1 == end) {
        return;
    }
    var slot_value = line.substring(begin, end);
    
    var slot_index = parseInt(slot_index_str);
    if (isNaN(slot_index)) {
        return;
    }
    print("Set slot, slot index is " + slot_index + ", slot value is " + slot_value);
    this.slots[slot_index] = slot_value;
}
SwfInArrayExtractor.prototype.findXorFactor = function (line) {
    if (0 != this.xorFactor) {
        return;
    }
    
    var begin = line.indexOf("^");
    if (-1 == begin) {
        return;
    }
    
    begin += 2;
    var xorFactorStr = line.substring(begin);
    this.xorFactor = parseInt(xorFactorStr);
    if (isNaN(this.xorFactor)) {
        print("Can not convert parameter to int, " + xorFactorStr);
        this.xorFactor = 0;
        var slot_index = this.variableSlotMap[xorFactorStr];
        if (slot_index && typeof(slot_index) == "number") {
            var slot_value_str = this.slots[slot_index];
            this.xorFactor = parseInt(slot_value_str);
            if (isNaN(this.xorFactor)) {
                print("Can not convert parameter to int, " + slot_value_str);
                this.xorFactor = 0;
            }
        }
    }
}

SwfInArrayExtractor.prototype.decodeSwfToByteArray = function () {
    if (this.arrayContainsSwf.length == 0 || 0 == this.xorFactor || isNaN(this.xorFactor)) {
        return false;
    }
    var swfByteArray = new ByteArray();
    swfByteArray.le = true;
    var length = this.arrayContainsSwf.length;
    for (var i = 0; i < length; ++i) {
        swfByteArray.writeUnsignedIntInner(this.arrayContainsSwf[i] ^ this.xorFactor);
    }
    swfByteArray.position = 0;
    checkEmbedSwf(swfByteArray);
    return true;
}

SwfInArrayExtractor.prototype.reset = function () {
    this.arrayObjectName = "";
    this.xorFactor = 0;
    this.arrayContainsSwf = [];
    this.slots = [];
    this.variableSlotMap = [];
}

SwfInArrayExtractor.prototype.extractAndDecodeSwfInArray = function(decomplied_methond) {
    if (-1 == decomplied_methond.indexOf("^") || -1 == decomplied_methond.indexOf("'writeUnsignedInt'")) {
        return;
    }
    var lines = decomplied_methond.split("\n");
    
    if (0 == lines.length) {
        return;
    }
    
    try {
        for (var i = 0; i < lines.length; ++i) {
            var line = lines[i];
            this.parseSetSlots(line);
            this.parseGetSlots(line);
            this.findArrayObjectName(line);
            this.findAndConstructArray(line);
            this.findXorFactor(line);
        }
    } catch (e) {
        print(e.message);
    }
    
    this.decodeSwfToByteArray();
    this.reset();
}

var controller = {
    byteArrayMonitor : new ByteArrayMonitor(),
    arrayMonitor : new ArrayMonitor(),
    vectorMonitor : new VectorMonitor(),
    stringAppendMonitor : new StringAppendMonitor(),
    opcodeMonitor : new OpCodeMonitor(),
    swfInArrayExtractor : new SwfInArrayExtractor(),
}

controller.asCallProperty = function(namespace, name, args) {
    if (typeof args != 'object') return;
    name = name.toLowerCase();
    if (('hex2bin' == name || 'hextobin' == name) && typeof args[0] == 'string') {
        var str = args[0];
        if (str.length > 1024 * 2) {
            if (str.indexOf("435753") == 0 || str.indexOf("465753") == 0) {
                TMSA_SWF_REPORT(str);
            }
        }
    } else if ('loadbytes' == name) {
        // TODO
    }
    
}

function tmsaTrackOpCode(op) {
    if (!enableTraceOpcode) {
	    return;
	}
    var op_code_str = TMSA_OP_MAP[op];
    if (op_code_str) {
        print("opcode is [" + op_code_str + "]");
    } else {
        print("opcode is not in TMSA OP MAP, " + op);
    }
}

function tmsaVerifyMultiname(name) {
    if (globalRealAbc && String(Number(name)) === name) {
        return "$_tmsa_" + name;
    }
    return name;
}