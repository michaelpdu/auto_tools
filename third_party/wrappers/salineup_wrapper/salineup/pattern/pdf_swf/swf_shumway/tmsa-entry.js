var swfController = new SWFController(timeline, /*pauseExecution*/false);
var TelemetryService = {
  reportTelemetry: function (data) { }
};

// avm2 must be global.
var avm2;
var sysMode = EXECUTION_MODE.INTERPRET
var appMode = EXECUTION_MODE.INTERPRET
var inputData;

function emulateFlash(avm2) {
  TMSA_TIME_BEG("Prepare SWF content");
  var arr = [];
  var size = inputData.length;
  for (var i = 0; i < size; ++i) {
    var c = inputData.charCodeAt(i);
    arr.push(c & 0xFF);
    //arr.push((c >>> 8) & 0xFF);
  }
  TMSA_TIME_END("Prepare SWF content");

  SWF.embed(new Uint8Array(arr).buffer, document, /*document.getElementById('stage')*/{}, {
    onComplete: swfController.completeCallback.bind(swfController),
    onBeforeFrame: swfController.beforeFrameCallback.bind(swfController),
    onAfterFrame: swfController.afterFrameCallback.bind(swfController),
    onStageInitialized: swfController.stageInitializedCallback.bind(swfController),
    url: "http://www.sina.com/1.swf",
    loaderURL: "http://www.sina.com/1.html",
    movieParams: {'info':45334566354465, 'exec':"aaaaaaaa", 'EXEC':"aaaaaaaa"},
  });

  // call all event handlers
  //for (var i = 0;i < eventHandlers.length; ++i) {
  //  print("call event handler:" + i);
  //  try {
  //    eventHandlers[i]();
  //  } catch (e) {
  //    print(getStackTrace());
  //  }
  //}
}

function createShumwayAVM2(sysMode, appMode, next) {
  print("enter into createShumwayAVM2");
  avm2 = new AVM2(sysMode, appMode, null);

  TMSA_TIME_BEG("Execute builtin.abc");
  avm2.loadedAbcs = {};
  avm2.builtinsLoaded = false;
  avm2.systemDomain.onMessage.register("classCreated", Stubs.onClassCreated);
  avm2.systemDomain.executeAbc(new AbcFile(buildinUint8Arr, "builtin.abc"));
  avm2.builtinsLoaded = true;
  TMSA_TIME_END("Execute builtin.abc");

  next(avm2);
}

function emulate_flash_file(flashData) {
  inputData = HexDecode(flashData);
  createShumwayAVM2(sysMode, appMode, emulateFlash);
  // TODO: ADD BY MICHAEL
  // This function should be triggered by timer, but sal doesn't implement timer correctly
  if (!useTimerTrigger) {
    handleMicrotasksQueue();
  }
}

