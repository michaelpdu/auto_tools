/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
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
var Shumway;
(function (Shumway) {
    (function (AVM2) {
        (function (Runtime) {
            var AbcFile = Shumway.AVM2.ABC.AbcFile;
            var Multiname = Shumway.AVM2.ABC.Multiname;
            var Namespace = Shumway.AVM2.ABC.Namespace;
            var MethodInfo = Shumway.AVM2.ABC.MethodInfo;
            var ClassInfo = Shumway.AVM2.ABC.ClassInfo;
            var InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
            var ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;

            var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
            var IndentingWriter = Shumway.IndentingWriter;

            (function (EXECUTION_MODE) {
                EXECUTION_MODE[EXECUTION_MODE["INTERPRET"] = 0x1] = "INTERPRET";
                EXECUTION_MODE[EXECUTION_MODE["COMPILE"] = 0x2] = "COMPILE";
            })(Runtime.EXECUTION_MODE || (Runtime.EXECUTION_MODE = {}));
            var EXECUTION_MODE = Runtime.EXECUTION_MODE;

            function createNewCompartment() {
                return newGlobal('new-compartment');
            }

            function executeScript(script) {
                var abc = script.abc;
                release || assert(!script.executing && !script.executed);
                var global = new Shumway.AVM2.Runtime.Global(script);
                if (abc.applicationDomain.allowNatives) {
                    global[Multiname.getPublicQualifiedName("unsafeJSNative")] = getNative;
                }
                script.executing = true;
                var scope = new Shumway.AVM2.Runtime.Scope(null, script.global);

                // XXX interpreted methods populate stack with every call, compiled don't
                // pushing current runtime to the stack, so Runtime.currentDomain is successful
                createFunction(script.init, scope).call(script.global, false);
                script.executed = true;
            }
            Runtime.executeScript = executeScript;

            function ensureScriptIsExecuted(script, reason) {
                if (typeof reason === "undefined") { reason = ""; }
                if (!script.executed && !script.executing) {
                    if (Shumway.AVM2.Runtime.traceExecution.value >= 2) {
                        log("Executing Script For: " + reason);
                        //print(getStackTrace());
                    }
                    executeScript(script);
                }
            }
            Runtime.ensureScriptIsExecuted = ensureScriptIsExecuted;

            (function (Glue) {
                Glue[Glue["PUBLIC_PROPERTIES"] = 0x1] = "PUBLIC_PROPERTIES";
                Glue[Glue["PUBLIC_METHODS"] = 0x2] = "PUBLIC_METHODS";
                Glue[Glue["ALL"] = 1 /* PUBLIC_PROPERTIES */ | 2 /* PUBLIC_METHODS */] = "ALL";
            })(Runtime.Glue || (Runtime.Glue = {}));
            var Glue = Runtime.Glue;

            function grabAbc(abcName) {
                var entry = playerglobal.scripts[abcName];
                if (!entry) {
                    return null;
                }
                var offset = entry.offset;
                var length = entry.length;
                return new AbcFile(new Uint8Array(playerglobal.abcs, offset, length), abcName);
            }

            function findDefiningAbc(mn) {
                if (!playerglobal) {
                    return null;
                }
                for (var i = 0; i < mn.namespaces.length; i++) {
                    var name = mn.namespaces[i].uri + ":" + mn.name;
                    var abcName = playerglobal.map[name];
                    if (abcName) {
                        break;
                    }
                }
                if (abcName) {
                    return grabAbc(abcName);
                }
                return null;
            }

            function promiseFile(path, responseType) {
                return new Promise(function (resolve, reject) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', path);
                    xhr.responseType = responseType;
                    xhr.onload = function () {
                        var response = xhr.response;
                        if (response) {
                            if (responseType === 'json' && xhr.responseType !== 'json') {
                                // some browsers (e.g. Safari) have no idea what json is
                                response = JSON.parse(response);
                            }
                            resolve(response);
                        } else {
                            reject('Unable to load ' + path + ': ' + xhr.statusText);
                        }
                    };
                    xhr.send();
                });
            }

            var AVM2 = (function () {
                function AVM2(sysMode, appMode, loadAVM1) {
                    // TODO: this will change when we implement security domains.
                    this.systemDomain = new ApplicationDomain(this, null, sysMode, true);
                    this.applicationDomain = new ApplicationDomain(this, this.systemDomain, appMode, false);
                    this.findDefiningAbc = findDefiningAbc;
                    this.loadAVM1 = loadAVM1;
                    this.isAVM1Loaded = false;

                    /**
                    * All runtime exceptions are boxed in this object to tag them as having
                    * originated from within the VM.
                    */
                    this.exception = { value: undefined };
                    this.exceptions = [];
                }
                AVM2.initialize = function (sysMode, appMode, loadAVM1) {
                    assert(!AVM2.instance);
                    AVM2.instance = new AVM2(sysMode, appMode, loadAVM1);
                };

                // We sometimes need to know where we came from, such as in
                // |ApplicationDomain.currentDomain|.
                AVM2.currentAbc = function () {
                    var caller = arguments.callee;
                    var maxDepth = 20;
                    var abc = null;
                    for (var i = 0; i < maxDepth && caller; i++) {
                        var mi = caller.methodInfo;
                        if (mi) {
                            abc = mi.abc;
                            break;
                        }
                        caller = caller.caller;
                    }
                    return abc;
                };

                AVM2.currentDomain = function () {
                    var abc = AVM2.currentAbc();
                    assert(abc && abc.applicationDomain, "No domain environment was found on the stack, increase STACK_DEPTH or " + "make sure that a compiled / interpreted function is on the call stack.");
                    return abc.applicationDomain;
                };

                AVM2.isPlayerglobalLoaded = function () {
                    return !!playerglobal;
                };

                AVM2.loadPlayerglobal = function (abcsPath, catalogPath) {
                    if (playerglobalLoadedPromise) {
                        return Promise.reject('Playerglobal is already loaded');
                    }
                    playerglobalLoadedPromise = Promise.all([promiseFile(abcsPath, 'arraybuffer'), promiseFile(catalogPath, 'json')]).then(function (result) {
                        playerglobal = {
                            abcs: result[0],
                            map: Object.create(null),
                            scripts: Object.create(null)
                        };
                        var catalog = result[1];
                        for (var i = 0; i < catalog.length; i++) {
                            var abc = catalog[i];
                            playerglobal.scripts[abc.name] = abc;
                            if (typeof abc.defs === 'string') {
                                playerglobal.map[abc.defs] = abc.name;
                            } else {
                                for (var j = 0; j < abc.defs.length; j++) {
                                    var def = abc.defs[j];
                                    playerglobal.map[def] = abc.name;
                                }
                            }
                        }
                    }, function (e) {
                        console.error(e);
                    });
                    return playerglobalLoadedPromise;
                };

                AVM2.prototype.notifyConstruct = function (instanceConstructor, args) {
                    // REMOVEME
                };

                AVM2.getStackTrace = function () {
                    Shumway.Debug.notImplemented("getStackTrace");
                };
                return AVM2;
            })();
            Runtime.AVM2 = AVM2;

            var ApplicationDomain = (function () {
                function ApplicationDomain(vm, base, mode, allowNatives) {
                    release || assert(vm instanceof AVM2);
                    release || assert(Shumway.isNullOrUndefined(base) || base instanceof ApplicationDomain);

                    this.vm = vm;

                    // ABCs that belong to this domain.
                    this.abcs = [];

                    // ABCs that have been loaded
                    this.loadedAbcs = {};

                    // Classes that have been loaded.
                    this.loadedClasses = [];

                    // Classes cache.
                    this.classCache = createEmptyObject();

                    // Script cache.
                    this.scriptCache = createEmptyObject();

                    // Class Info cache.
                    this.classInfoCache = createEmptyObject();

                    // Our parent.
                    this.base = base;

                    // Do we allow natives?
                    this.allowNatives = allowNatives;

                    // Do we compile or interpret?
                    this.mode = mode;

                    this.onMessage = new Callback();

                    // If we are the system domain (the root), we should initialize the Class
                    // and MethodClosure classes.
                    if (base) {
                        this.system = base.system;
                    } else {
                        this.system = this;
                    }
                }
                ApplicationDomain.passthroughCallable = function (f) {
                    return {
                        call: function ($this) {
                            Array.prototype.shift.call(arguments);
                            return f.apply($this, arguments);
                        },
                        apply: function ($this, args) {
                            return f.apply($this, args);
                        }
                    };
                };

                ApplicationDomain.coerceCallable = function (type) {
                    return {
                        call: function ($this, value) {
                            return Shumway.AVM2.Runtime.asCoerce(type, value);
                        },
                        apply: function ($this, args) {
                            return Shumway.AVM2.Runtime.asCoerce(type, args[0]);
                        }
                    };
                };

                ApplicationDomain.constructingCallable = function (instanceConstructor) {
                    return {
                        call: function (self) {
                            return new (Function.bind.apply(instanceConstructor, arguments));
                        },
                        apply: function (self, args) {
                            return new (Function.bind.apply(instanceConstructor, [self].concat(args)));
                        }
                    };
                };

                ApplicationDomain.prototype.getType = function (multiname) {
                    return this.getProperty(multiname, true, true);
                };

                ApplicationDomain.prototype.getProperty = function (multiname, strict, execute) {
                    var resolved = this.findDefiningScript(multiname, execute);
                    if (resolved) {
                        if (!resolved.script.executing) {
                            // console.info("Getting " + multiname + " but script is not executed");
                            return undefined;
                        }
                        return resolved.script.global[Multiname.getQualifiedName(resolved.trait.name)];
                    }
                    if (strict) {
                        return Shumway.Debug.unexpected("Cannot find property " + multiname);
                    }

                    return undefined;
                };

                ApplicationDomain.prototype.getClass = function (simpleName) {
                    var cache = this.classCache;
                    var c = cache[simpleName];
                    if (!c) {
                        c = cache[simpleName] = this.getProperty(Multiname.fromSimpleName(simpleName), true, true);
                    }
                    release || assert(c instanceof Shumway.AVM2.Runtime.Class);
                    return c;
                };

                ApplicationDomain.prototype.findClass = function (simpleName) {
                    if (simpleName in this.classCache) {
                        return true;
                    }
                    return this.findDomainProperty(Multiname.fromSimpleName(simpleName), false, true);
                };

                ApplicationDomain.prototype.findDomainProperty = function (multiname, strict, execute) {
                    if (Shumway.AVM2.Runtime.traceDomain.value) {
                        log("ApplicationDomain.findDomainProperty: " + multiname);
                    }
                    var resolved = this.findDefiningScript(multiname, execute);
                    if (resolved) {
                        return resolved.script.global;
                    }
                    if (strict) {
                        return Shumway.Debug.unexpected("Cannot find property " + multiname);
                    } else {
                        return undefined;
                    }
                    return undefined;
                };

                ApplicationDomain.prototype.findClassInfo = function (mn) {
                    var originalQn;
                    if (Multiname.isQName(mn)) {
                        // This deals with the case where mn is already a qn.
                        originalQn = Multiname.getQualifiedName(mn);
                        var ci = this.classInfoCache[originalQn];
                        if (ci) {
                            return ci;
                        }
                    } else {
                        var ci = this.classInfoCache[mn.runtimeId];
                        if (ci) {
                            return ci;
                        }
                    }
                    if (this.base) {
                        // Recurse with the mn as is.
                        ci = this.base.findClassInfo(mn);
                        if (ci) {
                            return ci;
                        }
                    }

                    // The class info may be among the loaded ABCs, go looking for it.
                    var abcs = this.abcs;
                    for (var i = 0; i < abcs.length; i++) {
                        var abc = abcs[i];
                        var scripts = abc.scripts;
                        for (var j = 0; j < scripts.length; j++) {
                            var script = scripts[j];
                            var traits = script.traits;
                            for (var k = 0; k < traits.length; k++) {
                                var trait = traits[k];
                                if (trait.isClass()) {
                                    var traitName = Multiname.getQualifiedName(trait.name);

                                    // So here mn is either a Multiname or a QName.
                                    if (originalQn) {
                                        if (traitName === originalQn) {
                                            return (this.classInfoCache[originalQn] = trait.classInfo);
                                        }
                                    } else {
                                        for (var m = 0, n = mn.namespaces.length; m < n; m++) {
                                            var qn = mn.getQName(m);
                                            if (traitName === Multiname.getQualifiedName(qn)) {
                                                return (this.classInfoCache[qn] = trait.classInfo);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Still no luck, so let's ask host to load the defining ABC and try again.
                    if (!this.base && this.vm.findDefiningAbc) {
                        var abc = this.vm.findDefiningAbc(mn);
                        if (abc !== null && !this.loadedAbcs[abc.name]) {
                            this.loadedAbcs[abc.name] = true;
                            this.loadAbc(abc);
                            return this.findClassInfo(mn);
                        }
                    }
                    return undefined;
                };

                ApplicationDomain.prototype.installNative = function (name, func) {
                    natives[name] = function () {
                        return func;
                    };
                };

                /**
                * Find the first script that defines a multiname.
                *
                * ABCs are added to the list in load order, so a later loaded ABC with a
                * definition of conflicting name will never be resolved.
                */
                ApplicationDomain.prototype.findDefiningScript = function (mn, execute) {
                    var resolved = this.scriptCache[mn.runtimeId];
                    if (resolved && (resolved.script.executed || !execute)) {
                        return resolved;
                    }

                    if (this.base) {
                        resolved = this.base.findDefiningScript(mn, execute);
                        if (resolved) {
                            return resolved;
                        }
                    }

                    Counter.count("ApplicationDomain: findDefiningScript");

                    var abcs = this.abcs;
                    for (var i = 0; i < abcs.length; i++) {
                        var abc = abcs[i];
                        var scripts = abc.scripts;
                        for (var j = 0; j < scripts.length; j++) {
                            var script = scripts[j];
                            var traits = script.traits;
                            if (mn instanceof Multiname) {
                                for (var k = 0; k < traits.length; k++) {
                                    var trait = traits[k];
                                    if (mn.hasQName(trait.name)) {
                                        if (execute) {
                                            ensureScriptIsExecuted(script, String(trait.name));
                                        }
                                        return (this.scriptCache[mn.runtimeId] = { script: script, trait: trait });
                                    }
                                }
                            } else {
                                Shumway.Debug.unexpected();
                            }
                        }
                    }

                    // Ask host to execute the defining ABC
                    if (!this.base && this.vm.findDefiningAbc) {
                        var abc = this.vm.findDefiningAbc(mn);
                        if (abc !== null && !this.loadedAbcs[abc.name]) {
                            this.loadedAbcs[abc.name] = true;
                            this.loadAbc(abc);
                            return this.findDefiningScript(mn, execute);
                        }
                    }

                    return undefined;
                };

                ApplicationDomain.prototype.compileAbc = function (abc, writer) {
                    compileAbc(abc, writer);
                };

                ApplicationDomain.prototype.executeAbc = function (abc) {
                    // console.time("Execute ABC: " + abc.name);
                    this.loadAbc(abc);
                    executeScript(abc.lastScript);
                    // console.timeEnd("Execute ABC: " + abc.name);
                };

                ApplicationDomain.prototype.loadAbc = function (abc) {
                    if (Shumway.AVM2.Runtime.traceExecution.value) {
                        log("Loading: " + abc.name);
                    }
                    abc.applicationDomain = this;
                    GlobalMultinameResolver.loadAbc(abc);
                    this.abcs.push(abc);
                    if (!this.base) {
                        Type.initializeTypes(this);
                    }
                };

                ApplicationDomain.prototype.broadcastMessage = function (type, message, origin) {
                    if (debug) {
                        Timer.start("broadcast: " + type);
                    }
                    try  {
                        this.onMessage.notify1(type, {
                            data: message,
                            origin: origin,
                            source: this
                        });
                    } catch (e) {
                        avm2.exceptions.push({
                            source: type, message: e.message,
                            stack: e.stack });
                        throw e;
                    }
                    if (debug) {
                        Timer.stop();
                    }
                };

                ApplicationDomain.prototype.traceLoadedClasses = function (lastOnly) {
                    var writer = new IndentingWriter();
                    lastOnly || writer.enter("Loaded Classes And Interfaces");
                    var classes = lastOnly ? [this.loadedClasses.last()] : this.loadedClasses;
                    classes.forEach(function (cls) {
                        if (cls !== Shumway.AVM2.Runtime.Class) {
                            cls.trace(writer);
                        }
                    });
                    lastOnly || writer.leave("");
                };
                return ApplicationDomain;
            })();
            Runtime.ApplicationDomain = ApplicationDomain;

            var SecurityDomain = (function () {
                function SecurityDomain() {
                    this.compartment = createNewCompartment();
                    this.compartment.homePath = homePath;
                    this.compartment.release = release;
                    this.compartment.eval(snarf("compartment.js"));
                }
                SecurityDomain.prototype.initializeShell = function (sysMode, appMode) {
                    var compartment = this.compartment;
                    compartment.AVM2.initialize(sysMode, appMode);
                    compartment.AVM2.instance.systemDomain.executeAbc(compartment.grabAbc(homePath + "src/avm2/generated/builtin/builtin.abc"));
                    compartment.AVM2.instance.systemDomain.executeAbc(compartment.grabAbc(homePath + "src/avm2/generated/shell/shell.abc"));

                    // compartment.avm2.systemDomain.executeAbc(compartment.grabAbc(homePath + "src/avm2/generated/avmplus/avmplus.abc"));
                    this.systemDomain = compartment.AVM2.instance.systemDomain;
                    this.applicationDomain = compartment.AVM2.instance.applicationDomain;
                };
                return SecurityDomain;
            })();
            Runtime.SecurityDomain = SecurityDomain;
        })(AVM2.Runtime || (AVM2.Runtime = {}));
        var Runtime = AVM2.Runtime;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));

var Glue = Shumway.AVM2.Runtime.Glue;
var ApplicationDomain = Shumway.AVM2.Runtime.ApplicationDomain;
var AVM2 = Shumway.AVM2.Runtime.AVM2;
var EXECUTION_MODE = Shumway.AVM2.Runtime.EXECUTION_MODE;
