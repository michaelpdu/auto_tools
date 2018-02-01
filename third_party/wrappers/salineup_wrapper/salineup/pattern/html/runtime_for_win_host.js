// This is JS Runtime file for Windows Host in SA engine, Copyright @ TrendMicro
// Author: Michael Du
// Date: 2016/10/27

if ("undefined" == typeof(hasTMSAWinHostRuntime)){
//including guard
//avoid loading JS Runtime twice in fragment mode
//otherwise, "new ActivexObject" will be called recursively. The call stack size will exceed the maximum value that lead to detection drop
hasTMSAWinHostRuntime = true

// Following variables and functions have been defined in global runtime.js, such as:
// noActiveXObject and oriActiveXObject

// In SAL, core engine has implements some objects, such as:
// WScript.Shell, Scripting.FileSystemObject and MSXML2.ServerXMLHTTP, etc.
// When script triggers this object, runtime should call core engine implements.
var oriWScriptShell = undefined;
var oriFileSystem = undefined;
var oriServerXMLHTTP = undefined;
if (!noActiveXObject) {
  print("find ActiveXObject in current context, backup original WScript.Shell, Scripting.FileSystemObject and MSXML2.ServerXMLHTTP");
  oriWScriptShell = new oriActiveXObject("WScript.Shell");
  oriFileSystem = new oriActiveXObject("Scripting.FileSystemObject");
  oriServerXMLHTTP = new oriActiveXObject("MSXML2.ServerXMLHTTP");
} else {
  print("cannot find ActiveXObject in current context");
}


// https://msdn.microsoft.com/en-us/library/efy5bay1(v=vs.94).aspx
if (typeof ScriptEngine == "undefined") {
  window.ScriptEngine = function() {
    report("[Window Global] Call ScriptEngine()");
    return "JScript.Encode";
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getYear
Date.prototype.getYear = function() {
  return this.getFullYear();
}

Date.prototype.getUTCMilliseconds = function() {
  return Math.floor((Math.random() * 1000));
}

// https://msdn.microsoft.com/en-us/library/aa242724(v=vs.60).aspx
function TmsaTextStream(name) {
  this.name_ = name;
  this.content_ = "";
  this.Line = "";
  this.atendofstream = true;
}

TmsaTextStream.prototype = {
  get Column(){
    // https://msdn.microsoft.com/en-us/library/ddz9scc8(v=vs.84).aspx
    // Column must large than 0
    report("[Text.Stream] get Column property");
    return 1;
  }
}

TmsaTextStream.prototype.WriteLine = function(line) {
  report("[Text.Stream] write line, value = " + line);
  this.content_ += line;
}
TmsaTextStream.prototype.WRITELine = function(line) {
  this.WriteLine(line)
}
TmsaTextStream.prototype.Write = function(content) {
  report("[Text.Stream] write, value = " + content);
  this.content_ = content;
}
TmsaTextStream.prototype.write = function(content) {
  this.Write(content)
}
TmsaTextStream.prototype.Close = function() {
  report("[Text.Stream] close");
}
TmsaTextStream.prototype.close = function() {
  this.Close();
}
// TmsaTextStream.prototype.read = function() {
//   report("[Text.Stream] read, content = " + this.content_);
//   return this.content_;
// }
TmsaTextStream.prototype.ReadAll = function() {
  report("[Text.Stream] ReadAll, content = " + this.content_);
  return this.content_;
}
TmsaTextStream.prototype.ReadLine = function() {
  report("[Text.Stream] ReadLine, content = " + this.content_);
  return this.content_;
}
TmsaTextStream.prototype.GetName = function() {
  report("[Text.Stream] GetName, name = " + this.name_);
  return this.name_;
}

function TMSAString(data) {
  this.dumpReadCharCode = false;
  this.data = data;
  if (data.length != 0) {
    this.length = this.data.length;
  } else {
    this.length = 10000;
  }
  this.countCharCodeAt = 0;
}
TMSAString.prototype.valueOf = function() {
  return this.data;
}
TMSAString.prototype.toString = function() {
  return this.data;
}
TMSAString.prototype.charCodeAt = function(index) {
  if (this.length == 10000 && this.dumpReadCharCode == false) {
    if (this.countCharCodeAt++ > 10) {
      this.dumpReadCharCode = true;
      var msg = "stop accessing fake response body in loop";
      report(msg);
      throw msg;
    } else {
      report("[TMSAString] call charCodeAt, return fake value (A), index = " + index);
    }
    return 'A';
  }
  return this.data[index];
}
TMSAString.prototype.fromCharCode = function(num) {
  return String.fromCharCode(num);
}
TMSAString.prototype.substr = function(a,b) {  //absinthe
  return this.data.substr(a,b);  //absinthe
}  //absinthe

// https://msdn.microsoft.com/en-us/library/1ft05taf(v=vs.84).aspx
function TmsaFile(path) {
  this.path = path;
  this.shortpath = path;
}
TmsaFile.prototype = {
  // properties
  get Path(){
    report("[File] get Path property");
    return this.path;
  }, 
  // methods
  OpenAsTextStream: function(iomode, format) {
    report("[File] OpenAsTextStream");
    return new TmsaTextStream(this.path);
  },
  openastextstream: function(iomode, format) {
    return this.OpenAsTextStream(iomode, format)
  }
}

// https://msdn.microsoft.com/en-us/library/1c87day3(v=vs.84).aspx
function TmsaFolder(path) {
  this.path = path;
}
TmsaFolder.prototype = {
  // properties
  get Path(){
    report("[Folder] get Path property");
    return this.path;
  }, 
  // methods
  CopyHere: function(items, option) {
    report("[Folder] call CopyHere");
  }, 
  Items: function() {
    report("[Folder] call Items");
    return "";
  },
  CreateTextFile: function(filename, overwrite, unicode) {
    report("[Folder] CreateTextFile, filename = " + filename);
    return new TmsaTextStream(filename);
  },
}

// 
var tmsaNewAddedFiles = {
  filelist: [],
  add: function(filename) {
    this.filelist.push(filename);
  },
  remove: function(filename) {
    for (index in this.filelist) {
      if (this.filelist[index].GetName().indexOf(filename) != -1) {
        this.filelist.splice(index,1);
      }
    }
  },
  find: function(filename) {
    for (index in this.filelist) {
      if (this.filelist[index].GetName().indexOf(filename) != -1) {
        return this.filelist[index];
      }
    }
    return undefined;
  },
};

// --------------- for wscript -----------------------
// NOTE:
// In tmsa.dll, it has hooked ExpandEnvironmentStrings and run in WScript.Shell
// So we need to hook WScript.Shell in JS-Runtime, NOT to reimplement it.
//
// https://msdn.microsoft.com/en-us/library/98591fh7(v=vs.84).aspx
var WshSysEnv = function(name) {
  var ret_val = undefined;
  switch (name.toUpperCase()) {
    case 'COMSPEC':
      ret_val = '%SystemRoot%\\system32\\cmd.exe';
      break;
    case 'PROCESSOR_ARCHITECTURE':
      ret_val = 'x86';
      break;
    default:  //absinthe
      ret_val = name.toUpperCase();  //absinthe
      break;  //absinthe
  }
  return ret_val;
}

function TmsaWshShortcut(path) {
    this.place = path;
    this.TargetPath = '';
    this.WindowStyle = 1;
    this.FullName = path;
}

var tmsaScriptShell = {
  run : function() {
    report("[WScript.Shell] Run!");
    if (undefined != oriWScriptShell) {
      oriWScriptShell.run();
    }
  },
  run : function(cmd, style, wait_on_return) {
    report("[WScript.Shell] Run! CMD: " + cmd + ", Window Style: " + style + ", Wait on return: " + wait_on_return);
    if (undefined != oriWScriptShell) {
      oriWScriptShell.run(cmd, style, wait_on_return);
    }
    if (-1 != cmd.indexOf(".js") && !inBrowser) {
      file = tmsaNewAddedFiles.find(cmd);
      jsGlobal.eval(file.ReadAll());
    }
  },
  Run : function(cmd, style, wait_on_return) {
    this.run(cmd, style, wait_on_return);
  },
  ExpandEnvironmentStrings : function(path) {
    report("[WScript.Shell] ExpandEnvironmentStrings, path = " + path);
    if (undefined != oriWScriptShell) {
      return oriWScriptShell.ExpandEnvironmentStrings(path);
    } else {
      return path;
    }
  },
  expandEnvironmentStrings : function(path) {
    return this.ExpandEnvironmentStrings(path);
  },
  expandenvironmentstrings : function(path) {  //absinthe
    return this.ExpandEnvironmentStrings(path); //absinthe
  },  //absinthe
  // https://msdn.microsoft.com/en-us/library/0ea7b5xe(v=vs.84).aspx
  SpecialFolders: function(objWshSpecialFolders) {
    var ret_val = '';
    switch (objWshSpecialFolders.toLowerCase()) {
      case "desktop":
      {
        ret_val = 'c:\\users\\admin\\desktop\\';
        break;
      }
      default:
        break;
    }
    return ret_val;
  },
  // https://msdn.microsoft.com/en-us/library/fd7hxfdd(v=vs.84).aspx
  Environment: function(type) {
    var ret_val = undefined;
    switch (type.toUpperCase()) {
      case 'SYSTEM':
        ret_val = WshSysEnv;
        break;
      case 'PROCESS':
        ret_val = WshSysEnv;
        break;
      default:  //absinthe
        ret_val = WshSysEnv;  //absinthe
        break;  //absinthe
    }
    return ret_val;
  },
  // https://msdn.microsoft.com/en-us/library/x05fawxd(v=vs.84).aspx
  RegRead: function(key) {
    report("[WScript.Shell] RegRead, key = " + key);
    if (-1 != key.indexOf('ProgramFilesDir')) {
      return 'C:\\Program Files (x86)';
    } else {
      return '';
    }
  }, 
  // https://msdn.microsoft.com/en-us/library/ateytk4a(v=vs.84).aspx
  Exec: function(command) {
    report("[WScript.Shell] Exec! CMD: " + command);
  },
  exec: function(command) {
    this.Exec(command);
  },
  // https://msdn.microsoft.com/en-us/library/xsy6k3ys(v=vs.84).aspx
  CreateShortcut: function(path) {
    report("[WScript.Shell] CreateShortcut, path = " + path);
    return new TmsaWshShortcut(path);
  },
};

// https://msdn.microsoft.com/en-us/library/windows/desktop/bb774094(v=vs.85).aspx
var tmsaShellApp = {
  NameSpace: function(dir) {
    report("[Shell.Application] call NameSpace, dir = " + dir);
    return new TmsaFolder(dir);
  },
  ShellExecute: function(file, args, dir, operation, show) {
    args = args.replace('^', '');
    report("[Shell.Application] ShellExecute, file = " + file + ", args = " + args + ", dir = " + dir + ", operation = " + operation + ", show = " + show);
  }
};

// https://msdn.microsoft.com/en-us/library/ms535874(v=vs.85).aspx
var tmsaXMLHttp = {
  // workaround for event callback
  onreadystatechange_callback: undefined,
  trigger_callback : function() {
    if (undefined != this.onreadystatechange_callback) {
      report("[XMLHttpRequest] trigger onreadystatechange callback.");
      this.onreadystatechange_callback();
    }
  },
  // public functions
  open : function(method, url, async, username, password) {
    report("[XMLHttpRequest] open HTTP request, method = " + method + ", URL = " + url);
  },
  opEn : function(method, url, async, username, password) {
    this.open(method, url, async, username, password);
  },
  send : function() {
    report("[XMLHttpRequest] send HTTP request");
    this.trigger_callback();
  },
  // https://msdn.microsoft.com/en-us/library/ms536752(v=vs.85).aspx
  setRequestHeader : function(header, value) {
    report("[XMLHttpRequest] set request header, header = " + header + ", value = " + value);
  },
  SetRequestHeader : function(header, value) {
    this.setRequestHeader(header, value);
  },
  // properties
  get status() {
    report("[XMLHttpRequest] get HTTP status, return 200");
    return 200;
  },
  get Status() {
    return this.status;
  },
  get responseBody() {
    report("[XMLHttpRequest] get HTTP Response Body");
    return new TMSAString("fake_response_body_content");
  },
  get ResponseBody() {
    return this.responseBody;
  },
  set onreadystatechange(callback) {
    report("[XMLHttpRequest] set callback of onreadystatechange");
    this.onreadystatechange_callback = callback;
  },
  get readyState() {
    return 4;
  },
  get readystate() {  //absinthe
    return this.readyState;  //absinthe
  },    //absinthe
  get ReadyState() {
    return this.readyState;
  },
  get responseText(){  //absinthe
    return this.responseBody //absinthe
  }, //absinthe
};

// https://msdn.microsoft.com/en-us/library/windows/desktop/aa384106(v=vs.85).aspx
var tmsaWinHttp = tmsaXMLHttp;

// https://msdn.microsoft.com/en-us/library/ms766431(v=vs.85).aspx
var tmsaServerXMLHTTP = {
  open : function(method, url, async, username, password) {
    report("[ServerXMLHTTP] open HTTP request, method = " + method + ", URL = " + url);
    if (!noActiveXObject) {
      oriServerXMLHTTP.open(method, url, async, username, password);
    }
  },
  send : function() {
    report("[ServerXMLHTTP] send HTTP request");
    if (!noActiveXObject) {
      oriServerXMLHTTP.send();
    }
  }, 
  get status() {
    report("[ServerXMLHTTP] get HTTP status, return 200");
    return 200;
  },
};

// https://msdn.microsoft.com/en-us/library/ms675032(v=vs.85).aspx
var tmsaADODB = {
  filename: "",
  open : function() {
    report("[ADODB.Stream] open stream");
  },
  Open: function() {
    this.open();
  },
  write : function(args) {
    report("[ADODB.Stream] write content, " + args);
  },
  Write: function(args) {
    this.write(args);
  },
  WriteText: function(args) {  //absinthe
    this.write(args);  //absinthe
  },  //absinthe
  get size() {
    report("[ADODB.Stream] get content size, fake size = 2000");
    return 900000;
  },
  saveToFile : function(file_name, save_options) {
    this.SaveToFile(file_name, save_options);
  },
  savetofile : function(file_name, save_options) {  //absinthe
    this.SaveToFile(file_name, save_options);   //absinthe
  },   //absinthe
  SaveToFile : function(file_name, save_options) {
    report("[ADODB.Stream] save to file, path = " + file_name);
    tmsaNewAddedFiles.add(new TmsaTextStream(file_name));
  },
  close : function() {
    report("[ADODB.Stream] close stream");
  }, 
  Close: function() {
    this.close();
  },
  set type(val) {
    report("[ADODB.Stream] set type, value = " + val);
  },
  set position(val) {
    report("[ADODB.Stream] set position, value = " + val);
  }, 
  LoadFromFile: function(filename) {
    report("[ADODB.Stream] Load contents of existing file, filename: " + filename);
    this.filename = filename;
  },
  loadFromFile: function(filename) {
    this.LoadFromFileFileName(filename);
  },
  //ReadText: function(numchars) {
  //  return "fake_response_body_content";
  //},
  //readText: function(numchars) {
  //  return this.ReadText(numchars);
  //},
  get ReadText() {
    var file = tmsaNewAddedFiles.find(this.filename);
    return new TMSAString(file.ReadAll());
  },
};

// https://msdn.microsoft.com/en-us/library/6tkce7xa(v=vs.84).aspx
var tmsaFileSystem = {
  // Adds a new folder to a Folders collection.
  Add: function(foldername) {
    report("[FileSystemObject] Add folder, " + foldername);
    if (oriFileSystem != undefined) {
      oriFileSystem.Add(foldername);
    }
  },
  BuildPath: function(path, name) {  //absinthe
    return path + name;  //absinthe
  },  //absinthe
  FolderExists: function(folderspec) {
    report("[FileSystemObject] Folder exists, " + folderspec)
    return true;
  },
  CreateFolder: function(foldername) {
    report("[FileSystemObject] Create folder, " + foldername);
    if (oriFileSystem != undefined) {
      oriFileSystem.CreateFolder(foldername);
    }
  },
  FileExists: function(filespec) {
    report("[FileSystemObject] File exists: " + filespec);
    if (oriFileSystem != undefined) {
      oriFileSystem.FileExists(filespec);
    }
    if (-1 != filespec.indexOf('\\system.ini')) {
      return true;
    } else {
      return undefined != tmsaNewAddedFiles.find(filespec);
    }
  },
  CreateTextFile: function(filename, overwrite, unicode) {
    report("[FileSystemObject] Create text file, filename: " + filename);
    if (oriFileSystem != undefined) {
      oriFileSystem.CreateTextFile(filename, overwrite, unicode);
    }
    var text = new TmsaTextStream(filename);
    tmsaNewAddedFiles.add(text);
    return text;
  },
  createtextfile: function(filename, overwrite, unicode) {
    return this.CreateTextFile(filename, overwrite, unicode);
  },
  OpenTextFile: function(filename, iomode, create, format) {
    report("[FileSystemObject] Open text file, filename: " + filename);
    if (oriFileSystem != undefined) {
      oriFileSystem.OpenTextFile(filename, iomode, create, format);
    }
    var text = new TmsaTextStream(filename);
    if (-1 != filename.indexOf('\\system.ini')) {
      text.Write('; for 16-bit app support');
    }
    tmsaNewAddedFiles.add(text);
    return text;
  },
  OPENTextFile: function(filename, iomode, create, format) {
    return this.OpenTextFile(filename, iomode, create, format);
  },
  GetSpecialFolder: function(folderspec) {
    report("[FileSystemObject] Return special folder object specified: " + folderspec);
    if (oriFileSystem != undefined) {
      oriFileSystem.GetSpecialFolder(folderspec);
    }
    var specfolder = "";
    switch (folderspec) {
      case 0:
        specfolder = "C:\\Windows";
        break;
      case 1:
        specfolder = "C:\\Windows\\System32";
        break;
      case 2:
        specfolder = "%TEMP%";
        break;
    }
    return specfolder;
  },
  getspecialfolder: function(folderspec) {  //absinthe
    return this.GetSpecialFolder(folderspec);  //absinthe
  },   //absinthe
  GetParentFolderName: function(path) {
    report("[FileSystemObject] Return parent folder name for: " + path);
    var path_arr = path.split('\\');
    path_arr.pop();
    return path_arr.join('\\');
  },
  GetTempName: function() {
    report("[FileSystemObject] Returns a randomly generated temporary file or folder name");
    if (oriFileSystem != undefined) {
      oriFileSystem.GetTempName();
    }
    return "random_temp_filename";
  },
  GetFolder: function(folderspec) {
    report("[FileSystemObject] GetFolder, folderspec = " + folderspec);
    return new TmsaFolder(folderspec);
  },
  getFolder: function(folderspec) {
    return this.GetFolder(folderspec);
  },
  GetFile: function(filespec) {
    report("[FileSystemObject] GetFile, filespec = " + filespec);
    return new TmsaFile(filespec);
  },
  getFile: function(filespec) {
    return this.GetFile(filespec);
  },
  getfile: function(filespec) {  //absinthe
    return this.GetFile(filespec);  //absinthe
  },  //absinthe
  DeleteFile: function(filespec, force) {
    report("[FileSystemObject] Deletes a specified file, " + filespec);
    if (oriFileSystem != undefined) {
      oriFileSystem.DeleteFile(filespec, force);
    }
    tmsaNewAddedFiles.remove(new TmsaTextStream(filespec));
  },
  deleteFile: function(filespec, force) {
    this.DeleteFile(filespec, force);
  },
  CopyFile: function(filespec,destfile) {
    report("[FileSystemObject] CopyFile from " + filespec + " to " + destfile);
  },
}

// https://msdn.microsoft.com/en-us/library/x4k5wbx4(v=vs.84).aspx
var tmsaDictionaryObject = {
  items: {},
  add: function(key, item) {
    this.items[key] = item;
  },
  Add: function(key, item) {
    this.items[key] = item;
  },
  Item: function(key) {
    return this.items[key];
  },
}

// https://msdn.microsoft.com/en-us/library/yab2dx62(v=vs.84).aspx
// http://stackoverflow.com/questions/19234417/jscript-vbscript-typename-function-for-activexobjects
var tmsaVBScriptRegExp = {

}

// https://msdn.microsoft.com/en-us/library/s6wt333f(v=vs.84).aspx
var tmsaWScriptNetwork = {
  get ComputerName() {
    return "FakeComputerName";
  },
  get computerName() {
    return this.ComputerName;
  },
  get UserDomain() {
    return "FakeSA";
  },
  get UserName() {
    return "AdminTest";
  },
  EnumPrinterConnections: function() {
    var FEPC=new Object();
    FEPC.Item=function(number){
      return "FakeEnumPrinterConnections_"+number;
    };
    FEPC.Count=function(){
      return 0;
    };
    return FEPC;
  },
  EnumNetworkDrives: function() {
    var FEND=new Object();
    FEND.Item=function(number){
      return "FakeEnumNetworkDrives_"+number;
    };
    FEND.Count=function(){
      return 0;
    };
    return FEND;
  },
}

// https://msdn.microsoft.com/en-us/library/d6y04sbb(v=vs.84).aspx
var tmsaWshNamed = {
  get Length() {
    return 0;
  },
  get length() {
    return this.Length;
  },
}

// https://msdn.microsoft.com/en-us/library/ss1ysb2a(v=vs.84).aspx
var tmsaWshArguments = {
  get Length() {
    return 0;
  },
  get length() {
    return this.Length;
  },
  get Named() {
    return tmsaWshNamed;
  },   
  get Unnamed() {    //absinthe
    return tmsaWshNamed;    //absinthe
  }   //absinthe
}



// this ActiveXObject function will be triggered in runtime.js:ActiveXObject
// so name is not undefined
winHostActiveXObject = function (name) {
  report("Create ActiveXObject: "+name);
  lowerName = name.toLowerCase();
  switch (lowerName) {
    case "wscript.shell":
      report("[ActiveXObject] create WScript.Shell");
      return tmsaScriptShell;
    case "shell.application":
      report("[ActiveXObject] create Shell.Application");
      return tmsaShellApp;
    case "adodb.stream":
      report("[ActiveXObject] create ADODB.Stream");
      return tmsaADODB;
    case "scripting.filesystemobject":
      return tmsaFileSystem;
    case "scripting.dictionary":
      return tmsaDictionaryObject;
    case "vbscript.regexp":
      return tmsaVBScriptRegExp;
    case "wscript.network":
      return tmsaWScriptNetwork;
    default:
      if (-1 != lowerName.indexOf("msxml2.xmlhttp")) {
        report("[ActiveXObject] create MSXML2.XMLHTTP");
        return tmsaXMLHttp;
      } else if (-1 != lowerName.indexOf("microsoft.xmlhttp")) {  //absinthe
        report("[ActiveXObject] create microsoft.xmlhttp");  //absinthe
        return tmsaWinHttp;  //absinthe
      } else if (-1 != lowerName.indexOf("winhttp.winhttprequest")) {
        report("[ActiveXObject] create WinHttp.WinHttpRequest");
        return tmsaWinHttp;
      } else if (-1 != lowerName.indexOf("msxml2.serverxmlhttp")) {
        report("[ActiveXObject] create MSXML2.ServerXMLHTTP");
        return tmsaServerXMLHTTP;
      } else {
        return undefined;
      }
  }
};

// https://msdn.microsoft.com/en-us/library/at5ydy31(v=vs.84).aspx
sleep_count = 0;
WScript.Sleep = function(milliseconds) {
  report("[WScript] sleep, milliseconds = " + milliseconds);
  if (sleep_count > 10) {
    report("[WScript] Sleep count > 10");
    throw "Sleep count > 10";
  }
  sleep_count++;
};
WScript.sleep = function(milliseconds) {
  this.Sleep(milliseconds);
};
WScript.sLeEP = function(milliseconds) {
  this.Sleep(milliseconds);
};
WScript.SleEp = function(milliseconds) {
  this.Sleep(milliseconds);
};
WScript.Quit = function(errorcode) {
  report("[WScript] quit! errorcode = " + errorcode);
};
WScript.quit = function(errorcode) {  //absinthe
  this.Quit(errorcode);  //absinthe
};  //absinthe
WScript.toString = function() {
  return "Windows Script Host";
};
WScript.Echo = function(args) {
  report("[WScript.Echo] " + args);
};
WScript.echo = function(args) {
  this.Echo(args);
};
WSH = WScript;
wscript = WScript  //absinthe
if (!WScript.hasOwnProperty('Version')) {
  Object.defineProperty(WScript, 'Version', {
    get: function() {
      // make sure length of version is greater than 0
      return "5.8.9600.17415";
    }
  });
}
if (!WScript.hasOwnProperty('ScriptFullName')) {
  Object.defineProperty(WScript, 'ScriptFullName', {
    get: function() {
      return "fake_full_path_of_running_script_name";
    }
  });
}
if (!WScript.hasOwnProperty('Arguments')) {
  Object.defineProperty(WScript, 'Arguments', {
    get: function() {
      return tmsaWshArguments;
    }
  });
}
if (!WScript.hasOwnProperty('StdErr')) {
  Object.defineProperty(WScript, 'StdErr', {
    get: function() {
      report("[WScript] get StdErr property");
      return new TmsaTextStream("StdErr");
    }
  });
}
if (!WScript.hasOwnProperty('StdIn')) {
  Object.defineProperty(WScript, 'StdIn', {
    get: function() {
      report("[WScript] get StdIn property");
      return new TmsaTextStream("StdIn");
    }
  });
}
if (!WScript.hasOwnProperty('StdOut')) {
  Object.defineProperty(WScript, 'StdOut', {
    get: function() {
      report("[WScript] get StdOut property");
      return new TmsaTextStream("StdOut");
    }
  });
}
if (!WScript.hasOwnProperty('Path')) {
  Object.defineProperty(WScript, 'Path', {
    get: function() {
      report("[WScript] get Path property");
      return "C:\\Windows\\System32";
    }
  });
}

} // end of including guard





function left(str, lngLen) {
    if (lngLen > 0) {
        return str.substring(0, lngLen)
    } else {
        return null
    }
}
function right(str, lngLen) {
    if (str.length - lngLen >= 0 && str.length >= 0 && str.length - lngLen <= str.length) {
        return str.substring(str.length - lngLen, str.length)
    } else {
        return null
    }
}
function mid(str, starnum, endnum) {
    if (str.length >= 0) {
        return str.substr(starnum, endnum)
    } else {
        return null
    }
}
function midb(str, starnum, endnum) {
    if (str.length >= 0) {
        return str.substr(starnum, endnum)
    } else {
        return null
    }
}
function asc(str){
    return str.charCodeAt(0)
}
function ascb(str){
    return str.charCodeAt(0)
}
function getref(func){
    return eval(func)
}
function lcase(str){
    return str.toLowerCase()
}
function ucase(str){
    return str.toUpperCase( )
}
function rnd(){
    return Math.random()
}
function len(object){
    return object.length
}
function lenb(object){
    return object.length
}
function chr(number){
    return String.fromCharCode(number)
}
function cstr(number){
    return String(cstr)
}
function lbound(array){
    return 0
}
function ubound(array){
    return array.length - 1
}
function chrw(number){
    return String.fromCharCode(number)
}
function ascw(str){
    return str.charCodeAt(0)
}
function instrrev(str1,str2){
    return str1.lastIndexOf(str2) 
}
function space(object){
    return ' '.repeat(object)
}
function split(str1,str2){
    return str1.split(str2)
}
function cdbl(number){
    return parseFloat(number)
}
function int(str){
    return Math.floor(str)
} 
function cint(str){
    return Math.round(str)
}
function isarray(object){
    return Object.prototype.toString.call(object) === '[object Array]'; 
}
function array(object){
    
}
function createobject(str){
    return new ActiveXObject(str)
}