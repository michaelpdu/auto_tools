//var eventHandlers = [];

// Add some restriction to recursion depth of recusive functions.
// Change history: 2015/08/05 from 500 to 1000
var max_recursion_depth = 1000;

// recursion depth count for fn() in swf_shumway/src/avm2/runtime.js
var fn_recursion_depth_count = 0;

// recursion depth count for schedule() in swf_shumway/src/avm2/compiler/c4/ir.js
var schedule_recursion_depth_count = 0;

// native promise is builtin function in browser
var useNativePromise = false;

// microtasks are triggered by timer
// SAL doesn't implement setTimeout/setInterval correctly,so microtasks handler will be triggered after emulate_flash_file
var useTimerTrigger = false;

// SAL doesn't support XHR, so fake XHR will be called in Shumway solution.
var useFakeXHR = true;
var xhrQueue = [];

// use native arraybuffer in SAL
var useNativeArrayBuffer = false;

// enable interruption, cpu will breakout if find heap spray
//var enableInterruption = false; 

// find real abc code in swf
var globalRealAbc = false;
var g_domainMemory = null;
// enable output compiled code
var enableOutputCompiledCode = true;

// enable output opcode
var enableTraceOpcode = false;

// print line into log
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
Object.defineProperty(jsGlobal, '__line', {
  get: function(){
    return __stack[2].getLineNumber();
  }
});
Object.defineProperty(jsGlobal, '__function', {
  get: function(){
    return __stack[2].getMethodName();
  }
});
