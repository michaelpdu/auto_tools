// Pre-definitions for AVM2
var inBrowser = (typeof console !== "undefined" && console !== null);
if (inBrowser) {
    _docode_report = function (msg) {
        console.log(msg);
    }
    _docode_shellcode_report = function (msg) {
        console.log(msg);
    }
}

var getStackTrace = function() {
  var obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
};

function LOG_DEBUG(s) {
    //_docode_report("[DEBUG] : " + s);
}

function LOG_INFO(s) {
    _docode_report("[INFO] : " + s);
}

function LOG_ERROR(s) {
    _docode_report(getStackTrace());
    _docode_report("[error]: " + s);
}

function AVM_REPORT(s) {
    _docode_report(s);
}

function SHELLCODE_REPORT(s) {
    _docode_report(s);
}

function SWF_REPORT(s) {
    LOG_INFO("find_embedded_flash");
    _docode_swf_report(s);
}

function print(s) {
    DOCODE_AVM_DEBUG("   ###### " + s);
}

var useHexEncodeData = false;

var app = {
};