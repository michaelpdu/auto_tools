var app = {
    platform: String('WIN'),
    _viewerversion: Number(8.0),
    viewerType: String('Reader'),
    viewerVariation: String('Reader'),
    capabilities: String('.obj'),
    language: String('en'),
    endPriv: true,
    toolbarVertical: true,
    toolbarHorizontal: true,
    focusRect: true,
    formsVersion: Number(8.0), // Must meet: formsVersion.toString()[0] returns "7" or "8".
    thermometer: true,
    isValidSaveLocation: true,
    printerNames: Array(),
    setTimeOut: function(txt, wait) {
        eval(txt);
    },
    clearTimeOut: function(a) {},
    eval: eval,
    openInPlace: true,
    setInterval: function(txt, wait) {
        var s = "[native code]";
    },
    setProfile: function(txt, wait) {
        var s = "[native code]";
    },
    compareDocuments: String('function'), // this should be a function
    measureDialog: String('function'), // this should be a function
    alert: function(a) {
        _docode_report("/*** app.alert " + a + "*/");
    },
};

app.__defineGetter__(
    "viewerVersion",
    function() {
        _docode_report("getter viewerversion");
        return this._viewerversion;
    });

app.__defineSetter__(
    "viewerVersion",
    function(_value) {
        this._viewerversion = _value;
    });

app.beep = function(nType) {
    return undefined;
}

app.popUpMenu = function() {
    var s = "[native code]";
};

app.endPriv = function() {
    var s = "[native code]";
};

app.setProfile = function() {
    var s = "[native code]";
};

app.getPath = function() {
    var s = "[native code]";
};

app.hideMenuItem = function() {
    var s = "[native code]";
};

app.DisablePermEnforcement = function() {
    var s = "[native code]";
};

app.addSubMenu = function() {
    var s = "[native code]";
};

app.goForward = function() {
    var s = "[native code]";
};

app.goBack = function() {
    var s = "[native code]";
};

app.execMenuItem = function(item) {
    var s = "[native code]";
};

app.newDoc = function(item) {
    var s = "[native code]";
};

app.openDoc = function(item) {
    var s = "[native code]";
};

app.addMenuItem = function(item) {
    // check keyword "addMenuItem"
    var s = "[native code]";
};

app.listMenuItems = function(itme) {
    // return value includes keyword "cName"
    var s = "[native code]";
    return "*cName*oChi*";
};

app.getString = function() {};

app.mailMsg = function() {};

app.response = function() {};

app.removeToolButton = function() {}

app.launchURL = function() {}

app.listToolbarButtons = function(item) {
    // contain "cName
    return ["*cName*"];
};

app.setTimeOut = function(code, millisec) {
    _docode_report("call app.setTimeOut");
    setTimeout(code, millisec);
}

app.doc = {
    syncAnnotScan: function() {},
    getAnnot: function(pageNo, name) {
        if (name in zzzannot2) {
            return zzzannot2[name];
        }
        if (zzzannot.length > pageNo) {
            return zzzannot[pageNo][0];
        }
    },
    getAnnots: function() {
        var result_annots;
        _docode_report("get_annots_access");
        for (var i = 0; i < arguments.length; i++) {
            var npage = -1;
            if (typeof arguments[i] == 'number') {
                npage = arguments[i];
            } else if ('nPage' in arguments[i]) {
                npage = arguments[i].nPage;
            }
            if (npage > -1) {
                if (zzzannot.length > npage) {
                    //return zzzannot[npage];
                    result_annots = zzzannot[npage];
                }
            } else {
                _docode_report("js_checker_cve_2009_1492");
            }
        }
        if (arguments.length == 0) {
            if (zzzannot.length > 0) {
                //return zzzannot[0];
                result_annots = zzzannot[0];
            }
        }


        if (result_annots == undefined) {
            result_annots = new Array(3);
            for (var i = 0; i < result_annots.length; i++)
                result_annots[i] = {
                    subject: 'a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a'
                };
        }


        return result_annots;
    },
    Function: function(thefunc) {
        _docode_report(thefunc);
    },
    printSeps: function() {
        if (arguments.length == 0) {
            _docode_report("js_checker_cve_2010_0491");
        }
    },
};