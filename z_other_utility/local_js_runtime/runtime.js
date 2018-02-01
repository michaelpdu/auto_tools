// This is JS Runtime file in SA engine, Copyright @ TrendMicro
// Author: Michael Du
// Date: 2016/07/21

///** @const */ var inBrowser = typeof console != "undefined";

if ("undefined" == typeof(hasTMSARuntime)){
//including guard
//avoid loading JS Runtime twice in fragment mode
//otherwise, "new ActivexObject" will be called recursively. The call stack size will exceed the maximum value that lead to detection drop
hasTMSARuntime = true

// check if current context is browser or SAL
var inBrowser = (console !== null);
// prepare jsGlobal variable
var jsGlobal = (function () {
    return this || (1, eval)('this');
})();
// check environment
// if it's IE or SAL, noActiveXObject == false
// if it's Chrome or other non-IE browser, noActiveXObject == true
var noActiveXObject = ("undefined" == typeof(ActiveXObject));

// print line number and function name into log
if (!jsGlobal.hasOwnProperty('__stack')) {
  Object.defineProperty(jsGlobal, '__stack', {
    get: function(){
      var orig = Error.prepareStackTrace;
      Error.prepareStackTrace = function(_, stack){ return stack; };
      var err = new Error;
      Error.captureStackTrace(err, arguments.callee);
      var stack = err.stack;
      Error.prepareStackTrace = orig;
      return stack;
    }
  });
}
if (!jsGlobal.hasOwnProperty('__line')) {
  Object.defineProperty(jsGlobal, '__line', {
    get: function(){
      return __stack[2].getLineNumber();
    }
  });
}
if (!jsGlobal.hasOwnProperty('__function')) {
  Object.defineProperty(jsGlobal, '__function', {
    get: function(){
      return __stack[2].getMethodName();
    }
  });
}

window.print = function (msg) {
  if (inBrowser) {
    console.log(msg, __function, __line);
  } else {
    tmsa_log(0, "JS Runtime", msg, __function, __line);
  }
};

window.report = function (msg) {
  if (inBrowser) {
    console.log(msg, __function, __line);
  } else {
    _docode_report(0, "JS Runtime", msg, __function, __line);
  }
};

// compatible for old engine which doesn't implement SUPPORT_JS_RANSOMWARE_DETECT
if (typeof SUPPORT_JS_RANSOMWARE_DETECT == "undefined") {
  SUPPORT_JS_RANSOMWARE_DETECT = false;
}
// print external variables
print("Support JS ransomware detection: " + SUPPORT_JS_RANSOMWARE_DETECT);

// backup original ActiveXObject
var oriActiveXObject = undefined;
if (!noActiveXObject) {
  print("find ActiveXObject in current context, backup original ActiveXObject");
  oriActiveXObject = ActiveXObject;
} else {
  print("cannot find ActiveXObject in current context");
}

// Ultra.OfficeControl CVE-2008-3878
var tmsaUltraOfficeControl = {
  HttpUpload : function(url, file, postdata) {
    report("[Ultra.OfficeControl] HttpUpload, url.len: " + url.length + " file.len: " + file.length + " postdata.len: " + postdata.length);
  }
}

// hook ActiveXObject
ActiveXObject = function (name) {
  if (typeof(name) == "undefined") {
      throw ("Argument not optional");
  }
  report("Create ActiveXObject: "+name);
  lowerName = name.toLowerCase();
  if (lowerName.indexOf("kaspersky") >= 0 || lowerName == "") {
       throw "Can not Create ActiveX for " + name;
       return undefined;
  }
  if (SUPPORT_JS_RANSOMWARE_DETECT && typeof winHostActiveXObject != 'undefined') {
    var winHostObj = winHostActiveXObject(name);
    if (typeof winHostObj != 'undefined') {
      return winHostObj;
    }
  }
  switch (lowerName) {
    case "ultra.officecontrol": //CVE-2008-3878
      return tmsaUltraOfficeControl;
    default:
      {
        if (!noActiveXObject) {
          return new oriActiveXObject(name);
        } else {
          throw "Cannot find ActiveXObject: " + name;
        }
      }
  }
};

// https://msdn.microsoft.com/en-us/library/at5ydy31(v=vs.84).aspx
var WScript = {
  CreateObject : function(name) {
    report("[WScript] create object, name = " + name);
    //lowerName = name.toLowerCase();
    //if (!noActiveXObject && lowerName == "wscript.shell") {
    //  return new oriActiveXObject(name);
    //} else {
      return ActiveXObject(name);
    //}
  }
};

/*
//for debug
//add swfobject.js runtime for Kaixin EK: 0a2f3127f02dca609ca694773089fe689bb3c653
if (!deconcept) {
    var deconcept = { 
        SWFObjectUtil: {
            getPlayerVersion: function() { 
              print("[SWF object]get flash player version"); 
              return {major:12, minor:0, rev:0};
            }
        }
    }
}
*/

//add IE runtime for Magnitude EK: 3dea414094ad055fcfc016d465af84ac719e1c7a
// Chaoying: CVE-2013-2551
document.namespaces = { 
    add: function (_name, _urn, _url) {
        report("[document.namespaces.add] URN:"+_urn+", URL:"+_url+", Name:"+_name);
    }
};

//Chaoying_Liu, add IE runtime for CVE-2015-2419: 59a748fe5097051f47bcce9ef67a65f65b9fcfbd
function ScriptEngineBuildVersion() {
    report("call TMSA ScriptEngineBuildVersion()");
    return 17905;
}

function ScriptEngineMajorVersion() {
    report("call TMSA ScriptEngineMajorVersion()");
    return 11;
}
function ScriptEngineMinorVersion() {
    report("call TMSA ScriptEngineMinorVersion()");
    return 3;
}

//Chaoying_Liu
//hook execute of VBScript for CVE-2014-6332, 73e3326f389c34256d717bb88a45f0742c1195bd
function execute(string) {
    report("[execute of VBScript], param:" + string)
    return ;
}

//Chaoying_Liu
//hook strreverse of VBScript for CVE-2014-6332, e53585e95f151f9e8f4f522c156510d6ab414e07
function StrReverse(string) {
    result = string.split("").reverse().join("")
    report("[StrReverse of VBScript], return:" + result)
    return result;
}  
function strreverse(string) { 
    return StrReverse(string); 
}

//Nico_Jiang
//hook execScript for vbScript for CVE-2016-0189,sha1 = "292DEA1C7DA35677734F2B426A552BB0FBE8225F"
function execScript(code,Language)
{
    report("[execScript of VBScript], param:" + code)
}  

}//end of including guard