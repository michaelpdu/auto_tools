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
///<reference path='avm2/references.ts' />
var Shumway;
(function (Shumway) {
    (function (Settings) {
        var ROOT = "Shumway Options";

        Settings.shumwayOptions = new Shumway.Options.OptionSet(ROOT, load());

        function isStorageSupported() {
            //try  {
            //    return window && "localStorage" in window && window["localStorage"] !== null;
            //} catch (e) {
            //    return false;
            //}
            return false;
        }
        Settings.isStorageSupported = isStorageSupported;

        function load(key) {
            if (typeof key === "undefined") { key = ROOT; }
            var settings = {};
            if (isStorageSupported()) {
                var lsValue = window.localStorage[key];
                if (lsValue) {
                    try  {
                        settings = JSON.parse(lsValue);
                    } catch (e) {
                    }
                }
            }
            return settings;
        }
        Settings.load = load;

        function save(settings, key) {
            if (typeof settings === "undefined") { settings = null; }
            if (typeof key === "undefined") { key = ROOT; }
            if (isStorageSupported()) {
                try  {
                    window.localStorage[key] = JSON.stringify(settings ? settings : Settings.shumwayOptions.getSettings());
                } catch (e) {
                }
            }
        }
        Settings.save = save;
    })(Shumway.Settings || (Shumway.Settings = {}));
    var Settings = Shumway.Settings;
})(Shumway || (Shumway = {}));

var shumwayOptions = Shumway.Settings.shumwayOptions;
