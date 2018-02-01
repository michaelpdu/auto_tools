var Shumway;
(function (Shumway) {
    /* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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
    ///<reference path='references.ts' />
    (function (Metrics) {
        var Timer = (function () {
            function Timer(parent, name) {
                this._parent = parent;
                this._timers = Shumway.ObjectUtilities.createMap();
                this._name = name;
                this._begin = 0;
                this._last = 0;
                this._total = 0;
                this._count = 0;
            }
            Timer.time = function (name, fn) {
                Timer.start(name);
                fn();
                Timer.stop();
            };
            Timer.start = function (name) {
                print("Start: "+name);
                Timer._top = Timer._top._timers[name] || (Timer._top._timers[name] = new Timer(Timer._top, name));
                Timer._top.start();
                var tmp = Timer._flat._timers[name] || (Timer._flat._timers[name] = new Timer(Timer._flat, name));
                tmp.start();
                Timer._flatStack.push(tmp);
            };
            Timer.stop = function () {
                print("Stop: "+Timer._top._name);
                Timer._top.stop();
                Timer._top = Timer._top._parent;
                Timer._flatStack.pop().stop();
            };
            Timer.stopStart = function (name) {
                Timer.stop();
                Timer.start(name);
            };
            Timer.prototype.start = function () {
                this._begin = Shumway.getTicks();
            };
            Timer.prototype.stop = function () {
                this._last = Shumway.getTicks() - this._begin;
                this._total += this._last;
                this._count += 1;
            };
            Timer.prototype.toJSON = function () {
                return { name: this._name, total: this._total, timers: this._timers };
            };
            Timer.prototype.trace = function (writer) {
                writer.enter(this._name + ": " + this._total.toFixed(2) + " ms" + ", count: " + this._count + ", average: " + (this._total / this._count).toFixed(2) + " ms");
                for (var name in this._timers) {
                    this._timers[name].trace(writer);
                }
                writer.outdent();
            };
            Timer.trace = function (writer) {
                Timer._base.trace(writer);
                Timer._flat.trace(writer);
            };
            Timer._base = new Timer(null, "Total");
            Timer._top = Timer._base;
            Timer._flat = new Timer(null, "Flat");
            Timer._flatStack = [];
            return Timer;
        })();
        Metrics.Timer = Timer;

        /**
        * Quick way to count named events.
        */
        var Counter = (function () {
            function Counter(enabled) {
                this._enabled = enabled;
                this.clear();
            }
            Counter.prototype.setEnabled = function (enabled) {
                this._enabled = enabled;
            };
            Counter.prototype.clear = function () {
                this._counts = Shumway.ObjectUtilities.createMap();
            };
            Counter.prototype.toJSON = function () {
                return { counts: this._counts };
            };
            Counter.prototype.count = function (name, increment) {
                if (typeof increment === "undefined") { increment = 1; }
                if (!this._enabled) {
                    return;
                }
                if (this._counts[name] === undefined) {
                    this._counts[name] = 0;
                }
                this._counts[name] += increment;
                return this._counts[name];
            };
            Counter.prototype.trace = function (writer) {
                for (var name in this._counts) {
                    writer.writeLn(name + ": " + this._counts[name]);
                }
            };
            Counter.prototype.traceSorted = function (writer) {
                var pairs = [];
                for (var name in this._counts) {
                    pairs.push([name, this._counts[name]]);
                }
                pairs.sort(function (a, b) {
                    return b[1] - a[1];
                });
                pairs.forEach(function (pair) {
                    writer.writeLn(pair[0] + ": " + pair[1]);
                });
            };
            return Counter;
        })();
        Metrics.Counter = Counter;

        var Average = (function () {
            function Average(max) {
                this._samples = new Float64Array(max);
                this._count = 0;
                this._index = 0;
            }
            Average.prototype.push = function (sample) {
                if (this._count < this._samples.length) {
                    this._count++;
                }
                this._index++;
                this._samples[this._index % this._samples.length] = sample;
            };
            Average.prototype.average = function () {
                var sum = 0;
                for (var i = 0; i < this._count; i++) {
                    sum += this._samples[i];
                }
                return sum / this._count;
            };
            return Average;
        })();
        Metrics.Average = Average;
    })(Shumway.Metrics || (Shumway.Metrics = {}));
    var Metrics = Shumway.Metrics;
})(Shumway || (Shumway = {}));

var Timer = Shumway.Metrics.Timer;
var Counter = new Shumway.Metrics.Counter(true);
