var FrameCounter = new Shumway.Metrics.Counter(true);
var CanvasCounter = new Shumway.Metrics.Counter(true);

var avm2Options = shumwayOptions.register(new OptionSet("AVM2"));
var sysCompiler = avm2Options.register(new Option("sysCompiler", "sysCompiler", "boolean", true, "system compiler/interpreter (requires restart)"));
var appCompiler = avm2Options.register(new Option("appCompiler", "appCompiler", "boolean", true, "application compiler/interpreter (requires restart)"));

var nativeCreateElement = document.createElement;
document.createElement = function (x) {
  Counter.count("createElement: " + x);
  return nativeCreateElement.call(document, x);
}
