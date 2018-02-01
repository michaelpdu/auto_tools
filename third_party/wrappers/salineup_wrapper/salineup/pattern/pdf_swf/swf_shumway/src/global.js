/*
* Copyright 2013 Mozilla Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var jsGlobal = (function () {
    return this || (1, eval)('this');
})();

///** @const */ var inBrowser = typeof console != "undefined";
var inBrowser = (console !== null);
/** @const */ var release = true;
/** @const */ var debug = !release;

if (!jsGlobal.performance) {
    jsGlobal.performance = {};
}

if (!jsGlobal.performance.now) {
    jsGlobal.performance.now = Date.now;
}

function log(message) {
    var optionalParams = [];
    for (var _i = 0; _i < (arguments.length - 1); _i++) {
        optionalParams[_i] = arguments[_i + 1];
    }
    jsGlobal.print(message);
}

function warn(message) {
    var optionalParams = [];
    for (var _i = 0; _i < (arguments.length - 1); _i++) {
        optionalParams[_i] = arguments[_i + 1];
    }
    if (inBrowser) {
        console.warn(message);
    } else {
        jsGlobal.print(message);
    }
}
