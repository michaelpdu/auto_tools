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
var Shumway;
(function (Shumway) {
    (function (AVM2) {
        (function (Runtime) {
            var Multiname = Shumway.AVM2.ABC.Multiname;
            var Namespace = Shumway.AVM2.ABC.Namespace;
            var ClassInfo = Shumway.AVM2.ABC.ClassInfo;
            var InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
            var Trait = Shumway.AVM2.ABC.Trait;
            var IndentingWriter = Shumway.IndentingWriter;
            var createMap = Shumway.ObjectUtilities.createMap;

            var defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
            var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
            var defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;

            var bindSafely = Shumway.FunctionUtilities.bindSafely;

            var vmNextTrampolineId = 1;
            var vmNextMemoizerId = 1;

            function getMethodOverrideKey(methodInfo) {
                var key;
                if (methodInfo.holder instanceof ClassInfo) {
                    key = "static " + methodInfo.holder.instanceInfo.name.getOriginalName() + "::" + methodInfo.name.getOriginalName();
                } else if (methodInfo.holder instanceof InstanceInfo) {
                    key = methodInfo.holder.name.getOriginalName() + "::" + methodInfo.name.getOriginalName();
                } else {
                    key = methodInfo.name.getOriginalName();
                }
                return key;
            }
            Runtime.getMethodOverrideKey = getMethodOverrideKey;

            function checkMethodOverrides(methodInfo) {
                if (methodInfo.name) {
                    var key = getMethodOverrideKey(methodInfo);
                    if (key in Shumway.AVM2.Runtime.VM_METHOD_OVERRIDES) {
                        Shumway.Debug.warning("Overriding Method: " + key);
                        return Shumway.AVM2.Runtime.VM_METHOD_OVERRIDES[key];
                    }
                }
            }
            Runtime.checkMethodOverrides = checkMethodOverrides;

            

            /**
            * Creates a trampoline function stub which calls the result of a |forward| callback. The forward
            * callback is only executed the first time the trampoline is executed and its result is cached in
            * the trampoline closure.
            */
            function makeTrampoline(forward, parameterLength, description) {
                release || assert(forward && typeof forward === "function");
                return (function trampolineContext() {
                    var target = null;

                    /**
                    * Triggers the trampoline and executes it.
                    */
                    var trampoline = function execute() {
                        print("Enter into Executing Trampolining");
                        if (Shumway.AVM2.Runtime.traceExecution.value >= 3) {
                            log("Trampolining");
                        }
                        Counter.count("Executing Trampoline");
                        Shumway.AVM2.Runtime.traceCallExecution.value > 1 && callWriter.writeLn("Trampoline: " + description);
                        if (!target) {
                            target = forward(trampoline);
                            release || assert(target);
                        }
                        var ret = target.apply(this, arguments);
                        print("Leave Executing Trampolining");
                        return ret;
                    };

                    /**
                    * Just triggers the trampoline without executing it.
                    */
                    trampoline.trigger = function trigger() {
                        print("Enter into Triggering Trampoline");
                        Counter.count("Triggering Trampoline");
                        if (!target) {
                            target = forward(trampoline);
                            release || assert(target);
                        }
                        print("Leave Triggering Trampoline");
                    };
                    trampoline.isTrampoline = true;
                    trampoline.debugName = "Trampoline #" + vmNextTrampolineId++;

                    // Make sure that the length property of the trampoline matches the trait's number of
                    // parameters. However, since we can't redefine the |length| property of a function,
                    // we define a new hidden |VM_LENGTH| property to store this value.
                    defineReadOnlyProperty(trampoline, Shumway.AVM2.Runtime.VM_LENGTH, parameterLength);
                    return trampoline;
                })();
            }
            Runtime.makeTrampoline = makeTrampoline;

            function makeMemoizer(qn, target) {
                function memoizer() {
                    Counter.count("Runtime: Memoizing");

                    // release || assert (!Object.prototype.hasOwnProperty.call(this, "class"), this);
                    if (Shumway.AVM2.Runtime.traceExecution.value >= 3) {
                        //log("Memoizing: " + qn);
                    }
                    //Shumway.AVM2.Runtime.traceCallExecution.value > 1 && callWriter.writeLn("Memoizing: " + qn);
                    if (Shumway.AVM2.Runtime.isNativePrototype(this)) {
                        Counter.count("Runtime: Method Closures");
                        return bindSafely(target.value, this);
                    }
                    if (isTrampoline(target.value)) {
                        // If the memoizer target is a trampoline then we need to trigger it before we bind the memoizer
                        // target to |this|. Triggering the trampoline will patch the memoizer target but not actually
                        // call it.
                        target.value.trigger();
                    }
                    release || assert(!isTrampoline(target.value), "We should avoid binding trampolines.");
                    var mc = null;
                    if (Shumway.AVM2.Runtime.isClass(this)) {
                        Counter.count("Runtime: Static Method Closures");
                        mc = bindSafely(target.value, this);
                        defineReadOnlyProperty(this, qn, mc);
                        return mc;
                    }
                    if (Object.prototype.hasOwnProperty.call(this, qn)) {
                        var pd = Object.getOwnPropertyDescriptor(this, qn);
                        if (pd.get) {
                            Counter.count("Runtime: Method Closures");
                            return bindSafely(target.value, this);
                        }
                        Counter.count("Runtime: Unpatched Memoizer");
                        return this[qn];
                    }
                    mc = bindSafely(target.value, this);
                    mc.methodInfo = target.value.methodInfo;
                    defineReadOnlyProperty(mc, Multiname.getPublicQualifiedName("prototype"), null);
                    defineReadOnlyProperty(this, qn, mc);
                    return mc;
                }
                var m = memoizer;
                Counter.count("Runtime: Memoizers");
                m.isMemoizer = true;
                m.debugName = "Memoizer #" + vmNextMemoizerId++;
                return m;
            }
            Runtime.makeMemoizer = makeMemoizer;

            function isTrampoline(fn) {
                release || assert(fn && typeof fn === "function");
                return fn.isTrampoline;
            }
            Runtime.isTrampoline = isTrampoline;

            function isMemoizer(fn) {
                release || assert(fn && typeof fn === "function");
                return fn.isMemoizer;
            }
            Runtime.isMemoizer = isMemoizer;
        })(AVM2.Runtime || (AVM2.Runtime = {}));
        var Runtime = AVM2.Runtime;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
