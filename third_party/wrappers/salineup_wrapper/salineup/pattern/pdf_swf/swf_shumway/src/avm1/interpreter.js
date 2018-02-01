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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var Shumway;
(function (Shumway) {
    (function (AVM1) {
        var Multiname = Shumway.AVM2.ABC.Multiname;
        var forEachPublicProperty = Shumway.AVM2.Runtime.forEachPublicProperty;
        var construct = Shumway.AVM2.Runtime.construct;
        var isNumeric = Shumway.isNumeric;
        var notImplemented = Shumway.Debug.notImplemented;
        var Option = Shumway.Options.Option;
        var OptionSet = Shumway.Options.OptionSet;

        var avm1Options = shumwayOptions.register(new OptionSet("AVM1"));
        AVM1.avm1TraceEnabled = avm1Options.register(new Option("t1", "traceAvm1", "boolean", false, "trace AVM1 execution"));
        AVM1.avm1ErrorsEnabled = avm1Options.register(new Option("e1", "errorsAvm1", "boolean", false, "fail on AVM1 errors"));
        AVM1.avm1TimeoutDisabled = avm1Options.register(new Option("ha1", "nohangAvm1", "boolean", false, "disable fail on AVM1 hang"));
        AVM1.avm1CompilerEnabled = avm1Options.register(new Option("ca1", "compileAvm1", "boolean", true, "compiles AVM1 code"));
        AVM1.avm1DebuggerEnabled = avm1Options.register(new Option("da1", "debugAvm1", "boolean", false, "allows AVM1 code debugging"));

        AVM1.Debugger = {
            pause: false,
            breakpoints: {}
        };

        var MAX_AVM1_HANG_TIMEOUT = 1000;
        var CHECK_AVM1_HANG_EVERY = 1000;
        var MAX_AVM1_ERRORS_LIMIT = 1000;
        var MAX_AVM1_STACK_LIMIT = 256;

        var AS2ScopeListItem = (function () {
            function AS2ScopeListItem(scope, next) {
                this.scope = scope;
                this.next = next;
            }
            AS2ScopeListItem.prototype.create = function (scope) {
                return new AS2ScopeListItem(scope, this);
            };
            return AS2ScopeListItem;
        })();

        var AS2Context = (function () {
            function AS2Context() {
            }
            AS2Context.create = function (swfVersion) {
                return new AS2ContextImpl(swfVersion);
            };
            AS2Context.prototype.flushPendingScripts = function () {
            };
            AS2Context.prototype.addAsset = function (className, symbolProps) {
            };
            AS2Context.prototype.getAsset = function (className) {
            };
            AS2Context.prototype.resolveTarget = function (target) {
            };
            AS2Context.prototype.resolveLevel = function (level) {
            };
            AS2Context.prototype.addToPendingScripts = function (fn) {
            };
            AS2Context.instance = null;
            return AS2Context;
        })();
        AVM1.AS2Context = AS2Context;

        var AS2ContextImpl = (function (_super) {
            __extends(AS2ContextImpl, _super);
            function AS2ContextImpl(swfVersion) {
                _super.call(this);
                this.swfVersion = swfVersion;
                this.globals = new avm1lib.AS2Globals();
                this.initialScope = new AS2ScopeListItem(this.globals, null);
                this.assets = {};
                this.isActive = false;
                this.executionProhibited = false;
                this.abortExecutionAt = 0;
                this.stackDepth = 0;
                this.isTryCatchListening = false;
                this.errorsIgnored = 0;
                this.deferScriptExecution = true;
                this.pendingScripts = [];
            }
            AS2ContextImpl.prototype.addAsset = function (className, symbolProps) {
                this.assets[className] = symbolProps;
            };
            AS2ContextImpl.prototype.getAsset = function (className) {
                return this.assets[className];
            };
            AS2ContextImpl.prototype.resolveTarget = function (target) {
                var currentTarget = this.currentTarget || this.defaultTarget;
                if (!target) {
                    target = currentTarget;
                } else if (typeof target === 'string') {
                    target = lookupAS2Children(target, currentTarget, this.globals.asGetPublicProperty('_root'));
                }
                if (typeof target !== 'object' || target === null || !('_nativeAS3Object' in target)) {
                    throw new Error('Invalid AS2 target object: ' + Object.prototype.toString.call(target));
                }

                return target;
            };
            AS2ContextImpl.prototype.resolveLevel = function (level) {
                return this.resolveTarget(this.globals['_level' + level]);
            };
            AS2ContextImpl.prototype.addToPendingScripts = function (fn) {
                if (!this.deferScriptExecution) {
                    fn();
                    return;
                }
                this.pendingScripts.push(fn);
            };
            AS2ContextImpl.prototype.flushPendingScripts = function () {
                var scripts = this.pendingScripts;
                while (scripts.length) {
                    scripts.shift()();
                }
                this.deferScriptExecution = false;
            };
            return AS2ContextImpl;
        })(AS2Context);

        var AS2Error = (function () {
            function AS2Error(error) {
                this.error = error;
            }
            return AS2Error;
        })();

        var AS2CriticalError = (function (_super) {
            __extends(AS2CriticalError, _super);
            function AS2CriticalError(message, error) {
                _super.call(this, message);
                this.error = error;
            }
            return AS2CriticalError;
        })(Error);

        function isAS2MovieClip(obj) {
            return typeof obj === 'object' && obj && obj instanceof avm1lib.AS2MovieClip;
        }

        function as2GetType(v) {
            if (v === null) {
                return 'null';
            }

            var type = typeof v;
            if (type === 'function') {
                return 'object';
            }
            if (type === 'object' && isAS2MovieClip(v)) {
                return 'movieclip';
            }
            return type;
        }

        function as2ToPrimitive(value) {
            return as2GetType(value) !== 'object' ? value : value.valueOf();
        }

        function as2GetCurrentSwfVersion() {
            return AS2Context.instance.swfVersion;
        }

        function as2ToAddPrimitive(value) {
            if (as2GetType(value) !== 'object') {
                return value;
            }

            if (value instanceof Date && as2GetCurrentSwfVersion() >= 6) {
                return value.toString();
            } else {
                return value.valueOf();
            }
        }

        function as2ToBoolean(value) {
            switch (as2GetType(value)) {
                default:
                case 'undefined':
                case 'null':
                    return false;
                case 'boolean':
                    return value;
                case 'number':
                    return value !== 0 && !isNaN(value);
                case 'string':
                    return value.length !== 0;
                case 'movieclip':
                case 'object':
                    return true;
            }
        }

        function as2ToNumber(value) {
            value = as2ToPrimitive(value);
            switch (as2GetType(value)) {
                case 'undefined':
                case 'null':
                    return as2GetCurrentSwfVersion() >= 7 ? NaN : 0;
                case 'boolean':
                    return value ? 1 : +0;
                case 'number':
                    return value;
                case 'string':
                    if (value === '' && as2GetCurrentSwfVersion() < 5) {
                        return 0;
                    }
                    return +value;
                default:
                    return as2GetCurrentSwfVersion() >= 5 ? NaN : 0;
            }
        }

        function as2ToInteger(value) {
            var result = as2ToNumber(value);
            if (isNaN(result)) {
                return 0;
            }
            if (!isFinite(result) || result === 0) {
                return result;
            }
            return (result < 0 ? -1 : 1) * Math.abs(result) | 0;
        }

        function as2ToInt32(value) {
            var result = as2ToNumber(value);
            return (isNaN(result) || !isFinite(result) || result === 0) ? 0 : (result | 0);
        }

        // TODO: We should just override Function.prototype.toString and change this to
        // only have a special case for 'undefined'.
        function as2ToString(value) {
            switch (as2GetType(value)) {
                case 'undefined':
                    return as2GetCurrentSwfVersion() >= 7 ? 'undefined' : '';
                case 'null':
                    return 'null';
                case 'boolean':
                    return value ? 'true' : 'false';
                case 'number':
                    return value.toString();
                case 'string':
                    return value;
                case 'movieclip':
                    return value.__targetPath;
                case 'object':
                    var result = value.toString !== Function.prototype.toString ? value.toString() : value;
                    if (typeof result === 'string') {
                        return result;
                    }
                    return typeof value === 'function' ? '[type Function]' : '[type Object]';
            }
        }

        function as2Compare(x, y) {
            var x2 = as2ToPrimitive(x);
            var y2 = as2ToPrimitive(y);
            if (typeof x2 === 'string' && typeof y2 === 'string') {
                return x2 < y2;
            } else {
                return as2ToNumber(x2) < as2ToNumber(y2);
            }
        }

        function as2InstanceOf(obj, constructor) {
            if (obj instanceof constructor) {
                return true;
            }

            // TODO interface check
            return false;
        }

        function as2ResolveProperty(obj, name) {
            // checking if avm2 public property is present
            var avm2PublicName = Multiname.getPublicQualifiedName(name);
            if (avm2PublicName in obj) {
                return name;
            }
            if (isNumeric(name)) {
                return null;
            }

            if (isAS2MovieClip(obj)) {
                var child = obj.__lookupChild(name);
                if (child) {
                    return name;
                }
            }

            // versions 6 and below ignore identifier case
            if (as2GetCurrentSwfVersion() > 6) {
                return null;
            }

            var foundName = null;
            var lowerCaseName = name.toLowerCase();
            as2Enumerate(obj, function (name) {
                if (name.toLowerCase() === lowerCaseName) {
                    foundName = name;
                }
            }, null);
            return foundName;
        }

        function as2GetProperty(obj, name) {
            if (!obj.asHasProperty(undefined, name, 0) && isAS2MovieClip(obj)) {
                return obj.__lookupChild(name);
            }
            return obj.asGetPublicProperty(name);
        }

        function as2GetPrototype(obj) {
            return obj && obj.asGetPublicProperty('prototype');
        }

        function as2Enumerate(obj, fn, thisArg) {
            forEachPublicProperty(obj, fn, thisArg);

            if (!isAS2MovieClip(obj)) {
                return;
            }

            // if it's a movie listing the children as well
            var as3MovieClip = obj._nativeAS3Object;
            for (var i = 0, length = as3MovieClip._children.length; i < length; i++) {
                var child = as3MovieClip._children[i];
                var name = child.name;
                if (!obj.asHasProperty(undefined, name, 0)) {
                    fn.call(thisArg, name);
                }
            }
        }

        function isAvm2Class(obj) {
            return typeof obj === 'object' && obj !== null && 'instanceConstructor' in obj;
        }

        function as2CreatePrototypeProxy(obj) {
            var prototype = obj.asGetPublicProperty('prototype');
            if (typeof Proxy === 'undefined') {
                console.error('ES6 proxies are not found');
                return prototype;
            }
            return Proxy.create({
                getOwnPropertyDescriptor: function (name) {
                    return Object.getOwnPropertyDescriptor(prototype, name);
                },
                getPropertyDescriptor: function (name) {
                    for (var p = prototype; p; p = Object.getPrototypeOf(p)) {
                        var desc = Object.getOwnPropertyDescriptor(p, name);
                        if (desc) {
                            return desc;
                        }
                    }
                    return undefined;
                },
                getOwnPropertyNames: function () {
                    return Object.getOwnPropertyNames(prototype);
                },
                getPropertyNames: function () {
                    // ES6: return getPropertyNames(prototype, name);
                    var names = Object.getOwnPropertyNames(prototype);
                    for (var p = Object.getPrototypeOf(prototype); p; p = Object.getPrototypeOf(p)) {
                        names = names.concat(Object.getOwnPropertyNames(p));
                    }
                    return names;
                },
                defineProperty: function (name, desc) {
                    if (desc) {
                        if (typeof desc.value === 'function' && '_setClass' in desc.value) {
                            desc.value._setClass(obj);
                        }
                        if (typeof desc.get === 'function' && '_setClass' in desc.get) {
                            desc.get._setClass(obj);
                        }
                        if (typeof desc.set === 'function' && '_setClass' in desc.set) {
                            desc.set._setClass(obj);
                        }
                    }
                    return Object.defineProperty(prototype, name, desc);
                },
                delete: function (name) {
                    return delete prototype[name];
                },
                fix: function () {
                    return undefined;
                }
            });
        }

        function executeActions(actionsData, as2Context, scope) {
            var context = as2Context;
            if (context.executionProhibited) {
                return;
            }

            var actionTracer = ActionTracerFactory.get();

            var scopeContainer = context.initialScope.create(scope);
            var savedContext = AS2Context.instance;
            try  {
                AS2Context.instance = context;
                context.isActive = true;
                context.abortExecutionAt = AVM1.avm1TimeoutDisabled.value ? Number.MAX_VALUE : Date.now() + MAX_AVM1_HANG_TIMEOUT;
                context.errorsIgnored = 0;
                context.defaultTarget = scope;
                context.currentTarget = null;
                actionTracer.message('ActionScript Execution Starts');
                actionTracer.indent();
                interpretActions(actionsData, scopeContainer, [], []);
            } catch (e) {
                if (e instanceof AS2CriticalError) {
                    console.error('Disabling AVM1 execution');
                    context.executionProhibited = true;
                }
                throw e;
            } finally {
                context.isActive = false;
                context.defaultTarget = null;
                context.currentTarget = null;
                actionTracer.unindent();
                actionTracer.message('ActionScript Execution Stops');
                AS2Context.instance = savedContext;
            }
        }
        AVM1.executeActions = executeActions;

        function lookupAS2Children(targetPath, defaultTarget, root) {
            var path = targetPath.split(/[\/.]/g);
            if (path[path.length - 1] === '') {
                path.pop();
            }
            var obj = defaultTarget;
            if (path[0] === '' || path[0] === '_level0' || path[0] === '_root') {
                obj = root;
                path.shift();
            }
            while (path.length > 0) {
                var prevObj = obj;
                obj = obj.__lookupChild(path[0]);
                if (!obj) {
                    throw new Error(path[0] + ' (expr ' + targetPath + ') is not found in ' + prevObj._target);
                }
                path.shift();
            }
            return obj;
        }

        function createBuiltinType(obj, args) {
            if (obj === Array) {
                // special case of array
                var result = args;
                if (args.length == 1 && typeof args[0] === 'number') {
                    result = [];
                    result.length = args[0];
                }
                return result;
            }
            if (obj === Boolean || obj === Number || obj === String || obj === Function) {
                return obj.apply(null, args);
            }
            if (obj === Date) {
                switch (args.length) {
                    case 0:
                        return new Date();
                    case 1:
                        return new Date(args[0]);
                    default:
                        return new Date(args[0], args[1], args.length > 2 ? args[2] : 1, args.length > 3 ? args[3] : 0, args.length > 4 ? args[4] : 0, args.length > 5 ? args[5] : 0, args.length > 6 ? args[6] : 0);
                }
            }
            if (obj === Object) {
                return {};
            }
            return undefined;
        }

        var AS2_SUPER_STUB = {};

        function avm1ValidateArgsCount(numArgs, maxAmount) {
            if (isNaN(numArgs) || numArgs < 0 || numArgs > maxAmount || numArgs != (0 | numArgs)) {
                throw new Error('Invalid number of arguments: ' + numArgs);
            }
        }
        function avm1ReadFunctionArgs(stack) {
            var numArgs = +stack.pop();
            avm1ValidateArgsCount(numArgs, stack.length);
            var args = [];
            for (var i = 0; i < numArgs; i++) {
                args.push(stack.pop());
            }
            return args;
        }
        function avm1SetTarget(ectx, targetPath) {
            var currentContext = ectx.context;
            var _global = ectx.global;

            if (!targetPath) {
                currentContext.currentTarget = null;
                return;
            }

            try  {
                var currentTarget = lookupAS2Children(targetPath, currentContext.currentTarget || currentContext.defaultTarget, _global.asGetPublicProperty('_root'));
                currentContext.currentTarget = currentTarget;
            } catch (e) {
                currentContext.currentTarget = null;
                throw e;
            }
        }

        function avm1DefineFunction(ectx, actionsData, functionName, parametersNames, registersCount, registersAllocation, suppressArguments) {
            var currentContext = ectx.context;
            var _global = ectx.global;
            var scopeContainer = ectx.scopeContainer;
            var scope = ectx.scope;
            var actionTracer = ectx.actionTracer;
            var defaultTarget = currentContext.defaultTarget;
            var constantPool = ectx.constantPool;

            var skipArguments = null;
            if (registersAllocation) {
                for (var i = 0; i < registersAllocation.length; i++) {
                    var registerAllocation = registersAllocation[i];
                    if (registerAllocation && registerAllocation.type === 1 /* Argument */) {
                        if (!skipArguments) {
                            skipArguments = [];
                        }
                        skipArguments[registersAllocation[i].index] = true;
                    }
                }
            }

            var ownerClass;
            var fn = (function () {
                var newScopeContainer;
                var newScope = {};

                if (!(suppressArguments & 4 /* Arguments */)) {
                    newScope.asSetPublicProperty('arguments', arguments);
                }
                if (!(suppressArguments & 2 /* This */)) {
                    newScope.asSetPublicProperty('this', this);
                }
                if (!(suppressArguments & 8 /* Super */)) {
                    newScope.asSetPublicProperty('super', AS2_SUPER_STUB);
                }
                newScope.asSetPublicProperty('__class', ownerClass);
                newScopeContainer = scopeContainer.create(newScope);
                var i;
                var registers = [];
                if (registersAllocation) {
                    for (i = 0; i < registersAllocation.length; i++) {
                        var registerAllocation = registersAllocation[i];
                        if (!registerAllocation) {
                            continue;
                        }
                        switch (registerAllocation.type) {
                            case 1 /* Argument */:
                                registers[i] = arguments[registerAllocation.index];
                                break;
                            case 2 /* This */:
                                registers[i] = this;
                                break;
                            case 4 /* Arguments */:
                                registers[i] = arguments;
                                break;
                            case 8 /* Super */:
                                registers[i] = AS2_SUPER_STUB;
                                break;
                            case 16 /* Global */:
                                registers[i] = _global;
                                break;
                            case 32 /* Parent */:
                                registers[i] = scope.asGetPublicProperty('_parent');
                                break;
                            case 64 /* Root */:
                                registers[i] = _global.asGetPublicProperty('_root');
                                break;
                        }
                    }
                }
                for (i = 0; i < arguments.length || i < parametersNames.length; i++) {
                    if (skipArguments && skipArguments[i]) {
                        continue;
                    }
                    newScope.asSetPublicProperty(parametersNames[i], arguments[i]);
                }

                var savedContext = AS2Context.instance;
                var savedIsActive = currentContext.isActive;
                var savedDefaultTarget = currentContext.defaultTarget;
                var savedCurrentTarget = currentContext.currentTarget;
                try  {
                    // switching contexts if called outside main thread
                    AS2Context.instance = currentContext;
                    if (!savedIsActive) {
                        currentContext.abortExecutionAt = AVM1.avm1TimeoutDisabled.value ? Number.MAX_VALUE : Date.now() + MAX_AVM1_HANG_TIMEOUT;
                        currentContext.errorsIgnored = 0;
                        currentContext.isActive = true;
                    }
                    currentContext.defaultTarget = defaultTarget;
                    currentContext.currentTarget = null;
                    actionTracer.indent();
                    currentContext.stackDepth++;
                    if (currentContext.stackDepth >= MAX_AVM1_STACK_LIMIT) {
                        throw new AS2CriticalError('long running script -- AVM1 recursion limit is reached');
                    }
                    return interpretActions(actionsData, newScopeContainer, constantPool, registers);
                } finally {
                    currentContext.defaultTarget = savedDefaultTarget;
                    currentContext.currentTarget = savedCurrentTarget;
                    currentContext.isActive = savedIsActive;
                    currentContext.stackDepth--;
                    actionTracer.unindent();
                    AS2Context.instance = savedContext;
                }
            });

            ownerClass = fn;
            var fnObj = fn;
            fnObj._setClass = function (class_) {
                ownerClass = class_;
            };

            fnObj.instanceConstructor = fn;
            fnObj.debugName = 'avm1 ' + (functionName || '<function>');
            if (functionName) {
                fnObj.name = functionName;
            }
            return fn;
        }
        function avm1DeleteProperty(ectx, propertyName) {
            var scopeContainer = ectx.scopeContainer;

            for (var p = scopeContainer; p; p = p.next) {
                if (p.scope.asHasProperty(undefined, propertyName, 0)) {
                    p.scope.asSetPublicProperty(propertyName, undefined); // in some cases we need to cleanup events binding
                    return p.scope.asDeleteProperty(undefined, propertyName, 0);
                }
            }
            return false;
        }
        function avm1ResolveVariableName(ectx, variableName, nonStrict) {
            var _global = ectx.global;
            var currentContext = ectx.context;
            var currentTarget = currentContext.currentTarget || currentContext.defaultTarget;

            var obj, name, i;
            if (variableName.indexOf(':') >= 0) {
                // "/A/B:FOO references the FOO variable in the movie clip with a target path of /A/B."
                var parts = variableName.split(':');
                obj = lookupAS2Children(parts[0], currentTarget, _global.asGetPublicProperty('_root'));
                if (!obj) {
                    throw new Error(parts[0] + ' is undefined');
                }
                name = parts[1];
            } else if (variableName.indexOf('.') >= 0) {
                // new object reference
                var objPath = variableName.split('.');
                name = objPath.pop();
                obj = _global;
                for (i = 0; i < objPath.length; i++) {
                    obj = obj.asGetPublicProperty(objPath[i]) || obj[objPath[i]];
                    if (!obj) {
                        throw new Error(objPath.slice(0, i + 1) + ' is undefined');
                    }
                }
            }

            if (!obj) {
                return null;
            }

            var resolvedName = as2ResolveProperty(obj, name);
            var resolved = resolvedName !== null;
            if (resolved || nonStrict) {
                return { obj: obj, name: resolvedName || name, resolved: resolved };
            }

            return null;
        }
        function avm1GetVariable(ectx, variableName) {
            var scopeContainer = ectx.scopeContainer;
            var currentContext = ectx.context;
            var currentTarget = currentContext.currentTarget || currentContext.defaultTarget;
            var scope = ectx.scope;

            // fast check if variable in the current scope
            if (scope.asHasProperty(undefined, variableName, 0)) {
                return scope.asGetPublicProperty(variableName);
            }

            var target = avm1ResolveVariableName(ectx, variableName);
            if (target) {
                return target.obj.asGetPublicProperty(target.name);
            }

            var resolvedName;
            if ((resolvedName = as2ResolveProperty(scope, variableName))) {
                return scope.asGetPublicProperty(resolvedName);
            }
            for (var p = scopeContainer; p; p = p.next) {
                resolvedName = as2ResolveProperty(p.scope, variableName);
                if (resolvedName !== null) {
                    return p.scope.asGetPublicProperty(resolvedName);
                }
            }

            if (currentTarget.asHasProperty(undefined, variableName, 0)) {
                return currentTarget.asGetPublicProperty(variableName);
            }

            // TODO refactor that
            if (variableName === 'this') {
                return currentTarget;
            }

            // trying movie clip children (if object is a MovieClip)
            var mc = isAS2MovieClip(currentTarget) && currentTarget.__lookupChild(variableName);
            if (mc) {
                return mc;
            }
            return undefined;
        }
        function avm1SetVariable(ectx, variableName, value) {
            var scopeContainer = ectx.scopeContainer;
            var currentContext = ectx.context;
            var currentTarget = currentContext.currentTarget || currentContext.defaultTarget;
            var scope = ectx.scope;

            if (currentContext.currentTarget) {
                currentTarget.asSetPublicProperty(variableName, value);
                return;
            }

            // fast check if variable in the current scope
            if (scope.asHasProperty(undefined, variableName, 0)) {
                scope.asSetPublicProperty(variableName, value);
                return;
            }

            var target = avm1ResolveVariableName(ectx, variableName, true);
            if (target) {
                target.obj.asSetPublicProperty(target.name, value);
                return;
            }

            for (var p = scopeContainer; p.next; p = p.next) {
                var resolvedName = as2ResolveProperty(p.scope, variableName);
                if (resolvedName !== null) {
                    p.scope.asSetPublicProperty(resolvedName, value);
                    return;
                }
            }

            currentTarget.asSetPublicProperty(variableName, value);
        }
        function avm1GetFunction(ectx, functionName) {
            var fn = avm1GetVariable(ectx, functionName);
            if (!(fn instanceof Function)) {
                throw new Error('Function "' + functionName + '" is not found');
            }
            return fn;
        }
        function avm1GetObjectByName(ectx, objectName) {
            var obj = avm1GetVariable(ectx, objectName);
            if (!(obj instanceof Object)) {
                throw new Error('Object "' + objectName + '" is not found');
            }
            return obj;
        }
        function avm1ProcessWith(ectx, obj, withBlock) {
            var scopeContainer = ectx.scopeContainer;
            var constantPool = ectx.constantPool;
            var registers = ectx.registers;

            var newScopeContainer = scopeContainer.create(Object(obj));
            interpretActions(withBlock, newScopeContainer, constantPool, registers);
        }
        function avm1ProcessTry(ectx, catchIsRegisterFlag, finallyBlockFlag, catchBlockFlag, catchTarget, tryBlock, catchBlock, finallyBlock) {
            var currentContext = ectx.context;
            var scopeContainer = ectx.scopeContainer;
            var scope = ectx.scope;
            var constantPool = ectx.constantPool;
            var registers = ectx.registers;

            var savedTryCatchState = currentContext.isTryCatchListening;
            try  {
                currentContext.isTryCatchListening = true;
                interpretActions(tryBlock, scopeContainer, constantPool, registers);
            } catch (e) {
                currentContext.isTryCatchListening = savedTryCatchState;
                if (!catchBlockFlag) {
                    throw e;
                }
                if (!(e instanceof AS2Error)) {
                    throw e;
                }
                if (typeof catchTarget === 'string') {
                    scope.asSetPublicProperty(catchTarget, e.error);
                } else {
                    registers[catchTarget] = e.error;
                }
                interpretActions(catchBlock, scopeContainer, constantPool, registers);
            } finally {
                currentContext.isTryCatchListening = savedTryCatchState;
                if (finallyBlockFlag) {
                    interpretActions(finallyBlock, scopeContainer, constantPool, registers);
                }
            }
        }

        // SWF 3 actions
        function avm1_0x81_ActionGotoFrame(ectx, args) {
            var _global = ectx.global;

            var frame = args[0];
            var play = args[1];
            if (play) {
                _global.gotoAndPlay(frame + 1);
            } else {
                _global.gotoAndStop(frame + 1);
            }
        }
        function avm1_0x83_ActionGetURL(ectx, args) {
            var _global = ectx.global;

            var urlString = args[0];
            var targetString = args[1];
            _global.getURL(urlString, targetString);
        }
        function avm1_0x04_ActionNextFrame(ectx) {
            var _global = ectx.global;

            _global.nextFrame();
        }
        function avm1_0x05_ActionPreviousFrame(ectx) {
            var _global = ectx.global;

            _global.prevFrame();
        }
        function avm1_0x06_ActionPlay(ectx) {
            var _global = ectx.global;

            _global.play();
        }
        function avm1_0x07_ActionStop(ectx) {
            var _global = ectx.global;

            _global.stop();
        }
        function avm1_0x08_ActionToggleQuality(ectx) {
            var _global = ectx.global;

            _global.toggleHighQuality();
        }
        function avm1_0x09_ActionStopSounds(ectx) {
            var _global = ectx.global;

            _global.stopAllSounds();
        }
        function avm1_0x8A_ActionWaitForFrame(ectx, args) {
            var _global = ectx.global;

            var frame = args[0];
            var count = args[1];
            return !_global.ifFrameLoaded(frame);
        }
        function avm1_0x8B_ActionSetTarget(ectx, args) {
            var targetName = args[0];
            avm1SetTarget(ectx, targetName);
        }
        function avm1_0x8C_ActionGoToLabel(ectx, args) {
            var _global = ectx.global;

            var label = args[0];
            _global.gotoLabel(label);
        }

        // SWF 4 actions
        function avm1_0x96_ActionPush(ectx, args) {
            var registers = ectx.registers;
            var constantPool = ectx.constantPool;
            var stack = ectx.stack;

            args.forEach(function (value) {
                if (value instanceof Shumway.AVM1.ParsedPushConstantAction) {
                    stack.push(constantPool[value.constantIndex]);
                } else if (value instanceof Shumway.AVM1.ParsedPushRegisterAction) {
                    stack.push(registers[value.registerNumber]);
                } else {
                    stack.push(value);
                }
            });
        }
        function avm1_0x17_ActionPop(ectx) {
            var stack = ectx.stack;

            stack.pop();
        }
        function avm1_0x0A_ActionAdd(ectx) {
            var stack = ectx.stack;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            stack.push(a + b);
        }
        function avm1_0x0B_ActionSubtract(ectx) {
            var stack = ectx.stack;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            stack.push(b - a);
        }
        function avm1_0x0C_ActionMultiply(ectx) {
            var stack = ectx.stack;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            stack.push(a * b);
        }
        function avm1_0x0D_ActionDivide(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            var c = b / a;
            stack.push(isSwfVersion5 ? c : isFinite(c) ? c : '#ERROR#');
        }
        function avm1_0x0E_ActionEquals(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            var f = a == b;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x0F_ActionLess(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            var f = b < a;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x10_ActionAnd(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var a = as2ToBoolean(stack.pop());
            var b = as2ToBoolean(stack.pop());
            var f = a && b;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x11_ActionOr(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var a = as2ToBoolean(stack.pop());
            var b = as2ToBoolean(stack.pop());
            var f = a || b;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x12_ActionNot(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var f = !as2ToBoolean(stack.pop());
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x13_ActionStringEquals(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var sa = as2ToString(stack.pop());
            var sb = as2ToString(stack.pop());
            var f = sa == sb;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x14_ActionStringLength(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var sa = as2ToString(stack.pop());
            stack.push(_global.length(sa));
        }
        function avm1_0x31_ActionMBStringLength(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var sa = as2ToString(stack.pop());
            stack.push(_global.length(sa));
        }
        function avm1_0x21_ActionStringAdd(ectx) {
            var stack = ectx.stack;

            var sa = as2ToString(stack.pop());
            var sb = as2ToString(stack.pop());
            stack.push(sb + sa);
        }
        function avm1_0x15_ActionStringExtract(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var count = stack.pop();
            var index = stack.pop();
            var value = as2ToString(stack.pop());
            stack.push(_global.substring(value, index, count));
        }
        function avm1_0x35_ActionMBStringExtract(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var count = stack.pop();
            var index = stack.pop();
            var value = as2ToString(stack.pop());
            stack.push(_global.mbsubstring(value, index, count));
        }
        function avm1_0x29_ActionStringLess(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var sa = as2ToString(stack.pop());
            var sb = as2ToString(stack.pop());
            var f = sb < sa;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x18_ActionToInteger(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            stack.push(_global.int(stack.pop()));
        }
        function avm1_0x32_ActionCharToAscii(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var ch = stack.pop();
            var charCode = _global.ord(ch);
            stack.push(charCode);
        }
        function avm1_0x36_ActionMBCharToAscii(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var ch = stack.pop();
            var charCode = _global.mbord(ch);
            stack.push(charCode);
        }
        function avm1_0x33_ActionAsciiToChar(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var charCode = +stack.pop();
            var ch = _global.chr(charCode);
            stack.push(ch);
        }
        function avm1_0x37_ActionMBAsciiToChar(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var charCode = +stack.pop();
            var ch = _global.mbchr(charCode);
            stack.push(ch);
        }
        function avm1_0x99_ActionJump(ectx, args) {
            // implemented in the analyzer
        }
        function avm1_0x9D_ActionIf(ectx, args) {
            var stack = ectx.stack;

            var offset = args[0];
            return !!stack.pop();
        }
        function avm1_0x9E_ActionCall(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var label = stack.pop();
            _global.call(label);
        }
        function avm1_0x1C_ActionGetVariable(ectx) {
            var stack = ectx.stack;

            var variableName = '' + stack.pop();

            var sp = stack.length;
            stack.push(undefined);

            stack[sp] = avm1GetVariable(ectx, variableName);
        }
        function avm1_0x1D_ActionSetVariable(ectx) {
            var stack = ectx.stack;

            var value = stack.pop();
            var variableName = '' + stack.pop();
            avm1SetVariable(ectx, variableName, value);
        }
        function avm1_0x9A_ActionGetURL2(ectx, args) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var flags = args[0];
            var target = stack.pop();
            var url = stack.pop();
            var sendVarsMethod;
            if (flags & 1) {
                sendVarsMethod = 'GET';
            } else if (flags & 2) {
                sendVarsMethod = 'POST';
            }
            var loadTargetFlag = flags & 1 << 6;
            if (!loadTargetFlag) {
                _global.getURL(url, target, sendVarsMethod);
                return;
            }
            var loadVariablesFlag = flags & 1 << 7;
            if (loadVariablesFlag) {
                _global.loadVariables(url, target, sendVarsMethod);
            } else {
                _global.loadMovie(url, target, sendVarsMethod);
            }
        }
        function avm1_0x9F_ActionGotoFrame2(ectx, args) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var flags = args[0];
            var gotoParams = [stack.pop()];
            if (!!(flags & 2)) {
                gotoParams.push(args[1]);
            }
            var gotoMethod = !!(flags & 1) ? _global.gotoAndPlay : _global.gotoAndStop;
            gotoMethod.apply(_global, gotoParams);
        }
        function avm1_0x20_ActionSetTarget2(ectx) {
            var stack = ectx.stack;

            var target = stack.pop();
            avm1SetTarget(ectx, target);
        }
        function avm1_0x22_ActionGetProperty(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var index = stack.pop();
            var target = stack.pop();

            var sp = stack.length;
            stack.push(undefined);

            stack[sp] = _global.getAS2Property(target, index);
        }
        function avm1_0x23_ActionSetProperty(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var value = stack.pop();
            var index = stack.pop();
            var target = stack.pop();
            _global.setAS2Property(target, index, value);
        }
        function avm1_0x24_ActionCloneSprite(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var depth = stack.pop();
            var target = stack.pop();
            var source = stack.pop();
            _global.duplicateMovieClip(source, target, depth);
        }
        function avm1_0x25_ActionRemoveSprite(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var target = stack.pop();
            _global.removeMovieClip(target);
        }
        function avm1_0x27_ActionStartDrag(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var target = stack.pop();
            var lockcenter = stack.pop();
            var constrain = !stack.pop() ? null : {
                y2: stack.pop(),
                x2: stack.pop(),
                y1: stack.pop(),
                x1: stack.pop()
            };
            var dragParams = [target, lockcenter];
            if (constrain) {
                dragParams = dragParams.concat(constrain.x1, constrain.y1, constrain.x2, constrain.y2);
            }
            _global.startDrag.apply(_global, dragParams);
        }
        function avm1_0x28_ActionEndDrag(ectx) {
            var _global = ectx.global;

            _global.stopDrag();
        }
        function avm1_0x8D_ActionWaitForFrame2(ectx, args) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var count = args[0];
            var frame = stack.pop();
            return !_global.ifFrameLoaded(frame);
        }
        function avm1_0x26_ActionTrace(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var value = stack.pop();
            _global.trace(value);
        }
        function avm1_0x34_ActionGetTime(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            stack.push(_global.getTimer());
        }
        function avm1_0x30_ActionRandomNumber(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            stack.push(_global.random(stack.pop()));
        }

        // SWF 5
        function avm1_0x3D_ActionCallFunction(ectx) {
            var stack = ectx.stack;
            var scope = ectx.scope;

            var functionName = stack.pop();
            var args = avm1ReadFunctionArgs(stack);

            var sp = stack.length;
            stack.push(undefined);

            var fn = avm1GetFunction(ectx, functionName);
            var result = fn.apply(scope, args);
            stack[sp] = result;
        }
        function avm1_0x52_ActionCallMethod(ectx) {
            var stack = ectx.stack;

            var methodName = stack.pop();
            var obj = stack.pop();
            var args = avm1ReadFunctionArgs(stack);
            var target, resolvedName, result;

            var sp = stack.length;
            stack.push(undefined);

            // checking "if the method name is blank or undefined"
            if (methodName !== null && methodName !== undefined && methodName !== '') {
                if (obj === null || obj === undefined) {
                    throw new Error('Cannot call method ' + methodName + ' of ' + typeof obj);
                } else if (obj !== AS2_SUPER_STUB) {
                    target = Object(obj);
                } else {
                    target = as2GetPrototype(avm1GetVariable(ectx, '__class').__super);
                    obj = avm1GetVariable(ectx, 'this');
                }
                resolvedName = as2ResolveProperty(target, methodName);
                if (resolvedName === null) {
                    throw new Error('Method ' + methodName + ' is not defined.');
                }
                result = target.asGetPublicProperty(resolvedName).apply(obj, args);
            } else if (obj !== AS2_SUPER_STUB) {
                result = obj.apply(obj, args);
            } else {
                result = avm1GetVariable(ectx, '__class').__super.apply(avm1GetVariable(ectx, 'this'), args);
            }
            stack[sp] = result;
        }
        function avm1_0x88_ActionConstantPool(ectx, args) {
            var constantPool = args[0];
            ectx.constantPool = constantPool;
        }
        function avm1_0x9B_ActionDefineFunction(ectx, args) {
            var stack = ectx.stack;
            var scope = ectx.scope;

            var functionBody = args[0];
            var functionName = args[1];
            var functionParams = args[2];

            var fn = avm1DefineFunction(ectx, functionBody, functionName, functionParams, 0, null, 0);
            if (functionName) {
                scope.asSetPublicProperty(functionName, fn);
            } else {
                stack.push(fn);
            }
        }
        function avm1_0x3C_ActionDefineLocal(ectx) {
            var stack = ectx.stack;
            var scope = ectx.scope;

            var value = stack.pop();
            var name = stack.pop();
            scope.asSetPublicProperty(name, value);
        }
        function avm1_0x41_ActionDefineLocal2(ectx) {
            var stack = ectx.stack;
            var scope = ectx.scope;

            var name = stack.pop();
            scope.asSetPublicProperty(name, undefined);
        }
        function avm1_0x3A_ActionDelete(ectx) {
            var stack = ectx.stack;

            var name = stack.pop();
            var obj = stack.pop();

            // in some cases we need to cleanup events binding
            obj.asSetPublicProperty(name, undefined);
            stack.push(obj.asDeleteProperty(undefined, name, 0));
        }
        function avm1_0x3B_ActionDelete2(ectx) {
            var stack = ectx.stack;

            var name = stack.pop();
            var result = avm1DeleteProperty(ectx, name);
            stack.push(result);
        }
        function avm1_0x46_ActionEnumerate(ectx) {
            var stack = ectx.stack;

            var objectName = stack.pop();
            stack.push(null);
            var obj = avm1GetObjectByName(ectx, objectName);
            as2Enumerate(obj, function (name) {
                stack.push(name);
            }, null);
        }
        function avm1_0x49_ActionEquals2(ectx) {
            var stack = ectx.stack;

            var a = stack.pop();
            var b = stack.pop();
            stack.push(a == b);
        }
        function avm1_0x4E_ActionGetMember(ectx) {
            var stack = ectx.stack;

            var name = stack.pop();
            var obj = stack.pop();
            if (name === 'prototype') {
                // special case to track members
                stack.push(as2CreatePrototypeProxy(obj));
            } else {
                var resolvedName = as2ResolveProperty(Object(obj), name);
                stack.push(resolvedName === null ? undefined : as2GetProperty(Object(obj), resolvedName));
            }
        }
        function avm1_0x42_ActionInitArray(ectx) {
            var stack = ectx.stack;

            var obj = avm1ReadFunctionArgs(stack);
            stack.push(obj);
        }
        function avm1_0x43_ActionInitObject(ectx) {
            var stack = ectx.stack;

            var count = +stack.pop();
            avm1ValidateArgsCount(count, stack.length >> 1);
            var obj = {};
            for (var i = 0; i < count; i++) {
                var value = stack.pop();
                var name = stack.pop();
                obj.asSetPublicProperty(name, value);
            }
            stack.push(obj);
        }
        function avm1_0x53_ActionNewMethod(ectx) {
            var stack = ectx.stack;

            var methodName = stack.pop();
            var obj = stack.pop();
            var args = avm1ReadFunctionArgs(stack);
            var resolvedName, method, result;

            var sp = stack.length;
            stack.push(undefined);

            // checking "if the name of the method is blank"
            if (methodName !== null && methodName !== undefined && methodName !== '') {
                resolvedName = as2ResolveProperty(obj, methodName);
                if (resolvedName === null) {
                    throw new Error('Method ' + methodName + ' is not defined.');
                }
                if (obj === null || obj === undefined) {
                    throw new Error('Cannot call new using method ' + resolvedName + ' of ' + typeof obj);
                }
                method = obj.asGetPublicProperty(resolvedName);
            } else {
                if (obj === null || obj === undefined) {
                    throw new Error('Cannot call new using ' + typeof obj);
                }
                method = obj;
            }
            if (isAvm2Class(obj)) {
                result = construct(obj, args);
            } else {
                result = Object.create(as2GetPrototype(method) || as2GetPrototype(Object));
                method.apply(result, args);
            }
            result.constructor = method;
            stack[sp] = result;
        }
        function avm1_0x40_ActionNewObject(ectx) {
            var stack = ectx.stack;

            var objectName = stack.pop();
            var obj = avm1GetObjectByName(ectx, objectName);
            var args = avm1ReadFunctionArgs(stack);

            var sp = stack.length;
            stack.push(undefined);

            var result = createBuiltinType(obj, args);
            if (typeof result === 'undefined') {
                // obj in not a built-in type
                if (isAvm2Class(obj)) {
                    result = construct(obj, args);
                } else {
                    result = Object.create(as2GetPrototype(obj) || as2GetPrototype(Object));
                    obj.apply(result, args);
                }
                result.constructor = obj;
            }
            stack[sp] = result;
        }
        function avm1_0x4F_ActionSetMember(ectx) {
            var stack = ectx.stack;

            var value = stack.pop();
            var name = stack.pop();
            var obj = stack.pop();

            obj.asSetPublicProperty(name, value);
        }
        function avm1_0x45_ActionTargetPath(ectx) {
            var stack = ectx.stack;

            var obj = stack.pop();
            stack.push(as2GetType(obj) === 'movieclip' ? obj._target : void (0));
        }
        function avm1_0x94_ActionWith(ectx, args) {
            var stack = ectx.stack;

            var withBody = args[0];
            var obj = stack.pop();

            avm1ProcessWith(ectx, obj, withBody);
        }
        function avm1_0x4A_ActionToNumber(ectx) {
            var stack = ectx.stack;

            stack.push(as2ToNumber(stack.pop()));
        }
        function avm1_0x4B_ActionToString(ectx) {
            var stack = ectx.stack;

            stack.push(as2ToString(stack.pop()));
        }
        function avm1_0x44_ActionTypeOf(ectx) {
            var stack = ectx.stack;

            var obj = stack.pop();
            var result = as2GetType(obj);
            stack.push(result);
        }
        function avm1_0x47_ActionAdd2(ectx) {
            var stack = ectx.stack;

            var a = as2ToAddPrimitive(stack.pop());
            var b = as2ToAddPrimitive(stack.pop());
            if (typeof a === 'string' || typeof b === 'string') {
                stack.push(as2ToString(b) + as2ToString(a));
            } else {
                stack.push(as2ToNumber(b) + as2ToNumber(a));
            }
        }
        function avm1_0x48_ActionLess2(ectx) {
            var stack = ectx.stack;

            var a = stack.pop();
            var b = stack.pop();
            stack.push(as2Compare(b, a));
        }
        function avm1_0x3F_ActionModulo(ectx) {
            var stack = ectx.stack;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            stack.push(b % a);
        }
        function avm1_0x60_ActionBitAnd(ectx) {
            var stack = ectx.stack;

            var a = as2ToInt32(stack.pop());
            var b = as2ToInt32(stack.pop());
            stack.push(b & a);
        }
        function avm1_0x63_ActionBitLShift(ectx) {
            var stack = ectx.stack;

            var a = as2ToInt32(stack.pop());
            var b = as2ToInt32(stack.pop());
            stack.push(b << a);
        }
        function avm1_0x61_ActionBitOr(ectx) {
            var stack = ectx.stack;

            var a = as2ToInt32(stack.pop());
            var b = as2ToInt32(stack.pop());
            stack.push(b | a);
        }
        function avm1_0x64_ActionBitRShift(ectx) {
            var stack = ectx.stack;

            var a = as2ToInt32(stack.pop());
            var b = as2ToInt32(stack.pop());
            stack.push(b >> a);
        }
        function avm1_0x65_ActionBitURShift(ectx) {
            var stack = ectx.stack;

            var a = as2ToInt32(stack.pop());
            var b = as2ToInt32(stack.pop());
            stack.push(b >>> a);
        }
        function avm1_0x62_ActionBitXor(ectx) {
            var stack = ectx.stack;

            var a = as2ToInt32(stack.pop());
            var b = as2ToInt32(stack.pop());
            stack.push(b ^ a);
        }
        function avm1_0x51_ActionDecrement(ectx) {
            var stack = ectx.stack;

            var a = as2ToNumber(stack.pop());
            a--;
            stack.push(a);
        }
        function avm1_0x50_ActionIncrement(ectx) {
            var stack = ectx.stack;

            var a = as2ToNumber(stack.pop());
            a++;
            stack.push(a);
        }
        function avm1_0x4C_ActionPushDuplicate(ectx) {
            var stack = ectx.stack;

            stack.push(stack[stack.length - 1]);
        }
        function avm1_0x3E_ActionReturn(ectx) {
            ectx.isEndOfActions = true;
        }
        function avm1_0x4D_ActionStackSwap(ectx) {
            var stack = ectx.stack;

            stack.push(stack.pop(), stack.pop());
        }
        function avm1_0x87_ActionStoreRegister(ectx, args) {
            var stack = ectx.stack;
            var registers = ectx.registers;

            var register = args[0];
            registers[register] = stack[stack.length - 1];
        }

        // SWF 6
        function avm1_0x54_ActionInstanceOf(ectx) {
            var stack = ectx.stack;

            var constr = stack.pop();
            var obj = stack.pop();
            stack.push(as2InstanceOf(Object(obj), constr));
        }
        function avm1_0x55_ActionEnumerate2(ectx) {
            var stack = ectx.stack;

            var obj = stack.pop();
            stack.push(null);

            as2Enumerate(obj, function (name) {
                stack.push(name);
            }, null);
        }
        function avm1_0x66_ActionStrictEquals(ectx) {
            var stack = ectx.stack;

            var a = stack.pop();
            var b = stack.pop();
            stack.push(b === a);
        }
        function avm1_0x67_ActionGreater(ectx) {
            var stack = ectx.stack;

            var a = stack.pop();
            var b = stack.pop();
            stack.push(as2Compare(a, b));
        }
        function avm1_0x68_ActionStringGreater(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var sa = as2ToString(stack.pop());
            var sb = as2ToString(stack.pop());
            var f = sb > sa;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }

        // SWF 7
        function avm1_0x8E_ActionDefineFunction2(ectx, args) {
            var stack = ectx.stack;
            var scope = ectx.scope;

            var functionBody = args[0];
            var functionName = args[1];
            var functionParams = args[2];
            var registerCount = args[3];
            var registerAllocation = args[4];
            var suppressArguments = args[5];

            var fn = avm1DefineFunction(ectx, functionBody, functionName, functionParams, registerCount, registerAllocation, suppressArguments);
            if (functionName) {
                scope.asSetPublicProperty(functionName, fn);
            } else {
                stack.push(fn);
            }
        }
        function avm1_0x69_ActionExtends(ectx) {
            var stack = ectx.stack;

            var constrSuper = stack.pop();
            var constr = stack.pop();
            var obj = Object.create(constrSuper.traitsPrototype || as2GetPrototype(constrSuper), {
                constructor: { value: constr, enumerable: false }
            });
            constr.__super = constrSuper;
            constr.prototype = obj;
        }
        function avm1_0x2B_ActionCastOp(ectx) {
            var stack = ectx.stack;

            var obj = stack.pop();
            var constr = stack.pop();
            stack.push(as2InstanceOf(obj, constr) ? obj : null);
        }
        function avm1_0x2C_ActionImplementsOp(ectx) {
            var stack = ectx.stack;

            var constr = stack.pop();
            var count = +stack.pop();
            avm1ValidateArgsCount(count, stack.length);
            var interfaces = [];
            for (var i = 0; i < count; i++) {
                interfaces.push(stack.pop());
            }
            constr._as2Interfaces = interfaces;
        }
        function avm1_0x8F_ActionTry(ectx, args) {
            var catchIsRegisterFlag = args[0];
            var catchTarget = args[1];
            var tryBody = args[2];
            var catchBlockFlag = args[3];
            var catchBody = args[4];
            var finallyBlockFlag = args[5];
            var finallyBody = args[6];

            avm1ProcessTry(ectx, catchIsRegisterFlag, finallyBlockFlag, catchBlockFlag, catchTarget, tryBody, catchBody, finallyBody);
        }
        function avm1_0x2A_ActionThrow(ectx) {
            var stack = ectx.stack;

            var obj = stack.pop();
            throw new AS2Error(obj);
        }
        function avm1_0x2D_ActionFSCommand2(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var args = avm1ReadFunctionArgs(stack);

            var sp = stack.length;
            stack.push(undefined);

            var result = _global.fscommand.apply(null, args);
            stack[sp] = result;
        }
        function avm1_0x89_ActionStrictMode(ectx, args) {
            var mode = args[0];
        }

        function wrapAvm1Error(fn) {
            return function avm1ErrorWrapper(executionContext, args) {
                var currentContext;
                try  {
                    fn(executionContext, args);

                    executionContext.recoveringFromError = false;
                } catch (e) {
                    // handling AVM1 errors
                    currentContext = executionContext.context;
                    if ((AVM1.avm1ErrorsEnabled.value && !currentContext.isTryCatchListening) || e instanceof AS2CriticalError) {
                        throw e;
                    }
                    if (e instanceof AS2Error) {
                        throw e;
                    }

                    var AVM1_ERROR_TYPE = 1;
                    TelemetryService.reportTelemetry({ topic: 'error', error: AVM1_ERROR_TYPE });

                    if (!executionContext.recoveringFromError) {
                        if (currentContext.errorsIgnored++ >= MAX_AVM1_ERRORS_LIMIT) {
                            throw new AS2CriticalError('long running script -- AVM1 errors limit is reached');
                        }
                        console.error('AVM1 error: ' + e);
                        avm2.exceptions.push({
                            source: 'avm1', message: e.message,
                            stack: e.stack });
                        executionContext.recoveringFromError = true;
                    }
                }
            };
        }

        function generateActionCalls() {
            var wrap;
            if (!AVM1.avm1ErrorsEnabled.value) {
                wrap = wrapAvm1Error;
            } else {
                wrap = function (fn) {
                    return fn;
                };
            }
            return {
                ActionGotoFrame: wrap(avm1_0x81_ActionGotoFrame),
                ActionGetURL: wrap(avm1_0x83_ActionGetURL),
                ActionNextFrame: wrap(avm1_0x04_ActionNextFrame),
                ActionPreviousFrame: wrap(avm1_0x05_ActionPreviousFrame),
                ActionPlay: wrap(avm1_0x06_ActionPlay),
                ActionStop: wrap(avm1_0x07_ActionStop),
                ActionToggleQuality: wrap(avm1_0x08_ActionToggleQuality),
                ActionStopSounds: wrap(avm1_0x09_ActionStopSounds),
                ActionWaitForFrame: wrap(avm1_0x8A_ActionWaitForFrame),
                ActionSetTarget: wrap(avm1_0x8B_ActionSetTarget),
                ActionGoToLabel: wrap(avm1_0x8C_ActionGoToLabel),
                ActionPush: wrap(avm1_0x96_ActionPush),
                ActionPop: wrap(avm1_0x17_ActionPop),
                ActionAdd: wrap(avm1_0x0A_ActionAdd),
                ActionSubtract: wrap(avm1_0x0B_ActionSubtract),
                ActionMultiply: wrap(avm1_0x0C_ActionMultiply),
                ActionDivide: wrap(avm1_0x0D_ActionDivide),
                ActionEquals: wrap(avm1_0x0E_ActionEquals),
                ActionLess: wrap(avm1_0x0F_ActionLess),
                ActionAnd: wrap(avm1_0x10_ActionAnd),
                ActionOr: wrap(avm1_0x11_ActionOr),
                ActionNot: wrap(avm1_0x12_ActionNot),
                ActionStringEquals: wrap(avm1_0x13_ActionStringEquals),
                ActionStringLength: wrap(avm1_0x14_ActionStringLength),
                ActionMBStringLength: wrap(avm1_0x31_ActionMBStringLength),
                ActionStringAdd: wrap(avm1_0x21_ActionStringAdd),
                ActionStringExtract: wrap(avm1_0x15_ActionStringExtract),
                ActionMBStringExtract: wrap(avm1_0x35_ActionMBStringExtract),
                ActionStringLess: wrap(avm1_0x29_ActionStringLess),
                ActionToInteger: wrap(avm1_0x18_ActionToInteger),
                ActionCharToAscii: wrap(avm1_0x32_ActionCharToAscii),
                ActionMBCharToAscii: wrap(avm1_0x36_ActionMBCharToAscii),
                ActionAsciiToChar: wrap(avm1_0x33_ActionAsciiToChar),
                ActionMBAsciiToChar: wrap(avm1_0x37_ActionMBAsciiToChar),
                ActionJump: wrap(avm1_0x99_ActionJump),
                ActionIf: wrap(avm1_0x9D_ActionIf),
                ActionCall: wrap(avm1_0x9E_ActionCall),
                ActionGetVariable: wrap(avm1_0x1C_ActionGetVariable),
                ActionSetVariable: wrap(avm1_0x1D_ActionSetVariable),
                ActionGetURL2: wrap(avm1_0x9A_ActionGetURL2),
                ActionGotoFrame2: wrap(avm1_0x9F_ActionGotoFrame2),
                ActionSetTarget2: wrap(avm1_0x20_ActionSetTarget2),
                ActionGetProperty: wrap(avm1_0x22_ActionGetProperty),
                ActionSetProperty: wrap(avm1_0x23_ActionSetProperty),
                ActionCloneSprite: wrap(avm1_0x24_ActionCloneSprite),
                ActionRemoveSprite: wrap(avm1_0x25_ActionRemoveSprite),
                ActionStartDrag: wrap(avm1_0x27_ActionStartDrag),
                ActionEndDrag: wrap(avm1_0x28_ActionEndDrag),
                ActionWaitForFrame2: wrap(avm1_0x8D_ActionWaitForFrame2),
                ActionTrace: wrap(avm1_0x26_ActionTrace),
                ActionGetTime: wrap(avm1_0x34_ActionGetTime),
                ActionRandomNumber: wrap(avm1_0x30_ActionRandomNumber),
                ActionCallFunction: wrap(avm1_0x3D_ActionCallFunction),
                ActionCallMethod: wrap(avm1_0x52_ActionCallMethod),
                ActionConstantPool: wrap(avm1_0x88_ActionConstantPool),
                ActionDefineFunction: wrap(avm1_0x9B_ActionDefineFunction),
                ActionDefineLocal: wrap(avm1_0x3C_ActionDefineLocal),
                ActionDefineLocal2: wrap(avm1_0x41_ActionDefineLocal2),
                ActionDelete: wrap(avm1_0x3A_ActionDelete),
                ActionDelete2: wrap(avm1_0x3B_ActionDelete2),
                ActionEnumerate: wrap(avm1_0x46_ActionEnumerate),
                ActionEquals2: wrap(avm1_0x49_ActionEquals2),
                ActionGetMember: wrap(avm1_0x4E_ActionGetMember),
                ActionInitArray: wrap(avm1_0x42_ActionInitArray),
                ActionInitObject: wrap(avm1_0x43_ActionInitObject),
                ActionNewMethod: wrap(avm1_0x53_ActionNewMethod),
                ActionNewObject: wrap(avm1_0x40_ActionNewObject),
                ActionSetMember: wrap(avm1_0x4F_ActionSetMember),
                ActionTargetPath: wrap(avm1_0x45_ActionTargetPath),
                ActionWith: wrap(avm1_0x94_ActionWith),
                ActionToNumber: wrap(avm1_0x4A_ActionToNumber),
                ActionToString: wrap(avm1_0x4B_ActionToString),
                ActionTypeOf: wrap(avm1_0x44_ActionTypeOf),
                ActionAdd2: wrap(avm1_0x47_ActionAdd2),
                ActionLess2: wrap(avm1_0x48_ActionLess2),
                ActionModulo: wrap(avm1_0x3F_ActionModulo),
                ActionBitAnd: wrap(avm1_0x60_ActionBitAnd),
                ActionBitLShift: wrap(avm1_0x63_ActionBitLShift),
                ActionBitOr: wrap(avm1_0x61_ActionBitOr),
                ActionBitRShift: wrap(avm1_0x64_ActionBitRShift),
                ActionBitURShift: wrap(avm1_0x65_ActionBitURShift),
                ActionBitXor: wrap(avm1_0x62_ActionBitXor),
                ActionDecrement: wrap(avm1_0x51_ActionDecrement),
                ActionIncrement: wrap(avm1_0x50_ActionIncrement),
                ActionPushDuplicate: wrap(avm1_0x4C_ActionPushDuplicate),
                ActionReturn: wrap(avm1_0x3E_ActionReturn),
                ActionStackSwap: wrap(avm1_0x4D_ActionStackSwap),
                ActionStoreRegister: wrap(avm1_0x87_ActionStoreRegister),
                ActionInstanceOf: wrap(avm1_0x54_ActionInstanceOf),
                ActionEnumerate2: wrap(avm1_0x55_ActionEnumerate2),
                ActionStrictEquals: wrap(avm1_0x66_ActionStrictEquals),
                ActionGreater: wrap(avm1_0x67_ActionGreater),
                ActionStringGreater: wrap(avm1_0x68_ActionStringGreater),
                ActionDefineFunction2: wrap(avm1_0x8E_ActionDefineFunction2),
                ActionExtends: wrap(avm1_0x69_ActionExtends),
                ActionCastOp: wrap(avm1_0x2B_ActionCastOp),
                ActionImplementsOp: wrap(avm1_0x2C_ActionImplementsOp),
                ActionTry: wrap(avm1_0x8F_ActionTry),
                ActionThrow: wrap(avm1_0x2A_ActionThrow),
                ActionFSCommand2: wrap(avm1_0x2D_ActionFSCommand2),
                ActionStrictMode: wrap(avm1_0x89_ActionStrictMode)
            };
        }

        function interpretAction(executionContext, parsedAction) {
            var stack = executionContext.stack;

            var actionCode = parsedAction.actionCode;
            var args = parsedAction.args;

            var actionTracer = executionContext.actionTracer;
            actionTracer.print(parsedAction, stack);

            var shallBranch = false;
            switch (actionCode | 0) {
                case 129 /* ActionGotoFrame */:
                    avm1_0x81_ActionGotoFrame(executionContext, args);
                    break;
                case 131 /* ActionGetURL */:
                    avm1_0x83_ActionGetURL(executionContext, args);
                    break;
                case 4 /* ActionNextFrame */:
                    avm1_0x04_ActionNextFrame(executionContext);
                    break;
                case 5 /* ActionPreviousFrame */:
                    avm1_0x05_ActionPreviousFrame(executionContext);
                    break;
                case 6 /* ActionPlay */:
                    avm1_0x06_ActionPlay(executionContext);
                    break;
                case 7 /* ActionStop */:
                    avm1_0x07_ActionStop(executionContext);
                    break;
                case 8 /* ActionToggleQuality */:
                    avm1_0x08_ActionToggleQuality(executionContext);
                    break;
                case 9 /* ActionStopSounds */:
                    avm1_0x09_ActionStopSounds(executionContext);
                    break;
                case 138 /* ActionWaitForFrame */:
                    shallBranch = avm1_0x8A_ActionWaitForFrame(executionContext, args);
                    break;
                case 139 /* ActionSetTarget */:
                    avm1_0x8B_ActionSetTarget(executionContext, args);
                    break;
                case 140 /* ActionGoToLabel */:
                    avm1_0x8C_ActionGoToLabel(executionContext, args);
                    break;

                case 150 /* ActionPush */:
                    avm1_0x96_ActionPush(executionContext, args);
                    break;
                case 23 /* ActionPop */:
                    avm1_0x17_ActionPop(executionContext);
                    break;
                case 10 /* ActionAdd */:
                    avm1_0x0A_ActionAdd(executionContext);
                    break;
                case 11 /* ActionSubtract */:
                    avm1_0x0B_ActionSubtract(executionContext);
                    break;
                case 12 /* ActionMultiply */:
                    avm1_0x0C_ActionMultiply(executionContext);
                    break;
                case 13 /* ActionDivide */:
                    avm1_0x0D_ActionDivide(executionContext);
                    break;
                case 14 /* ActionEquals */:
                    avm1_0x0E_ActionEquals(executionContext);
                    break;
                case 15 /* ActionLess */:
                    avm1_0x0F_ActionLess(executionContext);
                    break;
                case 16 /* ActionAnd */:
                    avm1_0x10_ActionAnd(executionContext);
                    break;
                case 17 /* ActionOr */:
                    avm1_0x11_ActionOr(executionContext);
                    break;
                case 18 /* ActionNot */:
                    avm1_0x12_ActionNot(executionContext);
                    break;
                case 19 /* ActionStringEquals */:
                    avm1_0x13_ActionStringEquals(executionContext);
                    break;
                case 20 /* ActionStringLength */:
                    avm1_0x14_ActionStringLength(executionContext);
                    break;
                case 49 /* ActionMBStringLength */:
                    avm1_0x31_ActionMBStringLength(executionContext);
                    break;
                case 33 /* ActionStringAdd */:
                    avm1_0x21_ActionStringAdd(executionContext);
                    break;
                case 21 /* ActionStringExtract */:
                    avm1_0x15_ActionStringExtract(executionContext);
                    break;
                case 53 /* ActionMBStringExtract */:
                    avm1_0x35_ActionMBStringExtract(executionContext);
                    break;
                case 41 /* ActionStringLess */:
                    avm1_0x29_ActionStringLess(executionContext);
                    break;
                case 24 /* ActionToInteger */:
                    avm1_0x18_ActionToInteger(executionContext);
                    break;
                case 50 /* ActionCharToAscii */:
                    avm1_0x32_ActionCharToAscii(executionContext);
                    break;
                case 54 /* ActionMBCharToAscii */:
                    avm1_0x36_ActionMBCharToAscii(executionContext);
                    break;
                case 51 /* ActionAsciiToChar */:
                    avm1_0x33_ActionAsciiToChar(executionContext);
                    break;
                case 55 /* ActionMBAsciiToChar */:
                    avm1_0x37_ActionMBAsciiToChar(executionContext);
                    break;
                case 153 /* ActionJump */:
                    avm1_0x99_ActionJump(executionContext, args);
                    break;
                case 157 /* ActionIf */:
                    shallBranch = avm1_0x9D_ActionIf(executionContext, args);
                    break;
                case 158 /* ActionCall */:
                    avm1_0x9E_ActionCall(executionContext);
                    break;
                case 28 /* ActionGetVariable */:
                    avm1_0x1C_ActionGetVariable(executionContext);
                    break;
                case 29 /* ActionSetVariable */:
                    avm1_0x1D_ActionSetVariable(executionContext);
                    break;
                case 154 /* ActionGetURL2 */:
                    avm1_0x9A_ActionGetURL2(executionContext, args);
                    break;
                case 159 /* ActionGotoFrame2 */:
                    avm1_0x9F_ActionGotoFrame2(executionContext, args);
                    break;
                case 32 /* ActionSetTarget2 */:
                    avm1_0x20_ActionSetTarget2(executionContext);
                    break;
                case 34 /* ActionGetProperty */:
                    avm1_0x22_ActionGetProperty(executionContext);
                    break;
                case 35 /* ActionSetProperty */:
                    avm1_0x23_ActionSetProperty(executionContext);
                    break;
                case 36 /* ActionCloneSprite */:
                    avm1_0x24_ActionCloneSprite(executionContext);
                    break;
                case 37 /* ActionRemoveSprite */:
                    avm1_0x25_ActionRemoveSprite(executionContext);
                    break;
                case 39 /* ActionStartDrag */:
                    avm1_0x27_ActionStartDrag(executionContext);
                    break;
                case 40 /* ActionEndDrag */:
                    avm1_0x28_ActionEndDrag(executionContext);
                    break;
                case 141 /* ActionWaitForFrame2 */:
                    shallBranch = avm1_0x8D_ActionWaitForFrame2(executionContext, args);
                    break;
                case 38 /* ActionTrace */:
                    avm1_0x26_ActionTrace(executionContext);
                    break;
                case 52 /* ActionGetTime */:
                    avm1_0x34_ActionGetTime(executionContext);
                    break;
                case 48 /* ActionRandomNumber */:
                    avm1_0x30_ActionRandomNumber(executionContext);
                    break;

                case 61 /* ActionCallFunction */:
                    avm1_0x3D_ActionCallFunction(executionContext);
                    break;
                case 82 /* ActionCallMethod */:
                    avm1_0x52_ActionCallMethod(executionContext);
                    break;
                case 136 /* ActionConstantPool */:
                    avm1_0x88_ActionConstantPool(executionContext, args);
                    break;
                case 155 /* ActionDefineFunction */:
                    avm1_0x9B_ActionDefineFunction(executionContext, args);
                    break;
                case 60 /* ActionDefineLocal */:
                    avm1_0x3C_ActionDefineLocal(executionContext);
                    break;
                case 65 /* ActionDefineLocal2 */:
                    avm1_0x41_ActionDefineLocal2(executionContext);
                    break;
                case 58 /* ActionDelete */:
                    avm1_0x3A_ActionDelete(executionContext);
                    break;
                case 59 /* ActionDelete2 */:
                    avm1_0x3B_ActionDelete2(executionContext);
                    break;
                case 70 /* ActionEnumerate */:
                    avm1_0x46_ActionEnumerate(executionContext);
                    break;
                case 73 /* ActionEquals2 */:
                    avm1_0x49_ActionEquals2(executionContext);
                    break;
                case 78 /* ActionGetMember */:
                    avm1_0x4E_ActionGetMember(executionContext);
                    break;
                case 66 /* ActionInitArray */:
                    avm1_0x42_ActionInitArray(executionContext);
                    break;
                case 67 /* ActionInitObject */:
                    avm1_0x43_ActionInitObject(executionContext);
                    break;
                case 83 /* ActionNewMethod */:
                    avm1_0x53_ActionNewMethod(executionContext);
                    break;
                case 64 /* ActionNewObject */:
                    avm1_0x40_ActionNewObject(executionContext);
                    break;
                case 79 /* ActionSetMember */:
                    avm1_0x4F_ActionSetMember(executionContext);
                    break;
                case 69 /* ActionTargetPath */:
                    avm1_0x45_ActionTargetPath(executionContext);
                    break;
                case 148 /* ActionWith */:
                    avm1_0x94_ActionWith(executionContext, args);
                    break;
                case 74 /* ActionToNumber */:
                    avm1_0x4A_ActionToNumber(executionContext);
                    break;
                case 75 /* ActionToString */:
                    avm1_0x4B_ActionToString(executionContext);
                    break;
                case 68 /* ActionTypeOf */:
                    avm1_0x44_ActionTypeOf(executionContext);
                    break;
                case 71 /* ActionAdd2 */:
                    avm1_0x47_ActionAdd2(executionContext);
                    break;
                case 72 /* ActionLess2 */:
                    avm1_0x48_ActionLess2(executionContext);
                    break;
                case 63 /* ActionModulo */:
                    avm1_0x3F_ActionModulo(executionContext);
                    break;
                case 96 /* ActionBitAnd */:
                    avm1_0x60_ActionBitAnd(executionContext);
                    break;
                case 99 /* ActionBitLShift */:
                    avm1_0x63_ActionBitLShift(executionContext);
                    break;
                case 97 /* ActionBitOr */:
                    avm1_0x61_ActionBitOr(executionContext);
                    break;
                case 100 /* ActionBitRShift */:
                    avm1_0x64_ActionBitRShift(executionContext);
                    break;
                case 101 /* ActionBitURShift */:
                    avm1_0x65_ActionBitURShift(executionContext);
                    break;
                case 98 /* ActionBitXor */:
                    avm1_0x62_ActionBitXor(executionContext);
                    break;
                case 81 /* ActionDecrement */:
                    avm1_0x51_ActionDecrement(executionContext);
                    break;
                case 80 /* ActionIncrement */:
                    avm1_0x50_ActionIncrement(executionContext);
                    break;
                case 76 /* ActionPushDuplicate */:
                    avm1_0x4C_ActionPushDuplicate(executionContext);
                    break;
                case 62 /* ActionReturn */:
                    avm1_0x3E_ActionReturn(executionContext);
                    break;
                case 77 /* ActionStackSwap */:
                    avm1_0x4D_ActionStackSwap(executionContext);
                    break;
                case 135 /* ActionStoreRegister */:
                    avm1_0x87_ActionStoreRegister(executionContext, args);
                    break;

                case 84 /* ActionInstanceOf */:
                    avm1_0x54_ActionInstanceOf(executionContext);
                    break;
                case 85 /* ActionEnumerate2 */:
                    avm1_0x55_ActionEnumerate2(executionContext);
                    break;
                case 102 /* ActionStrictEquals */:
                    avm1_0x66_ActionStrictEquals(executionContext);
                    break;
                case 103 /* ActionGreater */:
                    avm1_0x67_ActionGreater(executionContext);
                    break;
                case 104 /* ActionStringGreater */:
                    avm1_0x68_ActionStringGreater(executionContext);
                    break;

                case 142 /* ActionDefineFunction2 */:
                    avm1_0x8E_ActionDefineFunction2(executionContext, args);
                    break;
                case 105 /* ActionExtends */:
                    avm1_0x69_ActionExtends(executionContext);
                    break;
                case 43 /* ActionCastOp */:
                    avm1_0x2B_ActionCastOp(executionContext);
                    break;
                case 44 /* ActionImplementsOp */:
                    avm1_0x2C_ActionImplementsOp(executionContext);
                    break;
                case 143 /* ActionTry */:
                    avm1_0x8F_ActionTry(executionContext, args);
                    break;
                case 42 /* ActionThrow */:
                    avm1_0x2A_ActionThrow(executionContext);
                    break;

                case 45 /* ActionFSCommand2 */:
                    avm1_0x2D_ActionFSCommand2(executionContext);
                    break;
                case 137 /* ActionStrictMode */:
                    avm1_0x89_ActionStrictMode(executionContext, args);
                    break;
                case 0 /* None */:
                    executionContext.isEndOfActions = true;
                    break;
                default:
                    throw new Error('Unknown action code: ' + actionCode);
            }
            return shallBranch;
        }

        function interpretActionWithRecovery(executionContext, parsedAction) {
            var currentContext;
            var result;
            try  {
                result = interpretAction(executionContext, parsedAction);

                executionContext.recoveringFromError = false;
            } catch (e) {
                // handling AVM1 errors
                currentContext = executionContext.context;
                if ((AVM1.avm1ErrorsEnabled.value && !currentContext.isTryCatchListening) || e instanceof AS2CriticalError) {
                    throw e;
                }
                if (e instanceof AS2Error) {
                    throw e;
                }

                var AVM1_ERROR_TYPE = 1;
                TelemetryService.reportTelemetry({ topic: 'error', error: AVM1_ERROR_TYPE });

                if (!executionContext.recoveringFromError) {
                    if (currentContext.errorsIgnored++ >= MAX_AVM1_ERRORS_LIMIT) {
                        throw new AS2CriticalError('long running script -- AVM1 errors limit is reached');
                    }
                    console.error('AVM1 error: ' + e);
                    avm2.exceptions.push({
                        source: 'avm1', message: e.message,
                        stack: e.stack });
                    executionContext.recoveringFromError = true;
                }
            }
            return result;
        }

        function interpretActions(actionsData, scopeContainer, constantPool, registers) {
            var currentContext = AS2Context.instance;

            if (!actionsData.ir) {
                var stream = new Shumway.AVM1.ActionsDataStream(actionsData.bytes, currentContext.swfVersion);
                var parser = new Shumway.AVM1.ActionsDataParser(stream);
                parser.dataId = actionsData.id;
                var analyzer = new Shumway.AVM1.ActionsDataAnalyzer();
                actionsData.ir = analyzer.analyze(parser);

                if (AVM1.avm1CompilerEnabled.value) {
                    try  {
                        var c = new ActionsDataCompiler();
                        actionsData.ir.compiled = c.generate(actionsData.ir);
                    } catch (e) {
                        console.error('Unable to compile AVM1 function: ' + e);
                    }
                }
            }
            var ir = actionsData.ir;
            var compiled = ir.compiled;

            var stack = [];
            var isSwfVersion5 = currentContext.swfVersion >= 5;
            var actionTracer = ActionTracerFactory.get();
            var scope = scopeContainer.scope;

            var executionContext = {
                context: currentContext,
                global: currentContext.globals,
                scopeContainer: scopeContainer,
                scope: scope,
                actionTracer: actionTracer,
                constantPool: constantPool,
                registers: registers,
                stack: stack,
                isSwfVersion5: isSwfVersion5,
                recoveringFromError: false,
                isEndOfActions: false
            };

            if (scope._nativeAS3Object && scope._nativeAS3Object._deferScriptExecution) {
                currentContext.deferScriptExecution = true;
            }

            if (compiled) {
                return compiled(executionContext);
            }

            var instructionsExecuted = 0;
            var abortExecutionAt = currentContext.abortExecutionAt;

            if (AVM1.avm1DebuggerEnabled.value && (AVM1.Debugger.pause || AVM1.Debugger.breakpoints[ir.dataId])) {
                debugger;
            }

            var position = 0;
            var nextAction = ir.actions[position];

            while (nextAction && !executionContext.isEndOfActions) {
                // let's check timeout/Date.now every some number of instructions
                if (instructionsExecuted++ % CHECK_AVM1_HANG_EVERY === 0 && Date.now() >= abortExecutionAt) {
                    throw new AS2CriticalError('long running script -- AVM1 instruction hang timeout');
                }

                var shallBranch = interpretActionWithRecovery(executionContext, nextAction.action);
                if (shallBranch) {
                    position = nextAction.conditionalJumpTo;
                } else {
                    position = nextAction.next;
                }
                nextAction = ir.actions[position];
            }
            return stack.pop();
        }

        // Bare-minimum JavaScript code generator to make debugging better.
        var ActionsDataCompiler = (function () {
            function ActionsDataCompiler() {
                if (!ActionsDataCompiler.cachedCalls) {
                    ActionsDataCompiler.cachedCalls = generateActionCalls();
                }
            }
            ActionsDataCompiler.prototype.convertArgs = function (args, id, res) {
                var parts = [];
                for (var i = 0; i < args.length; i++) {
                    var arg = args[i];
                    if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
                        if (arg instanceof Shumway.AVM1.ParsedPushConstantAction) {
                            var hint = '';
                            var currentConstantPool = res.constantPool;
                            if (currentConstantPool) {
                                var constant = currentConstantPool[arg.constantIndex];
                                hint = constant === undefined ? 'undefined' : JSON.stringify(constant);

                                // preventing code breakage due to bad constant
                                hint = hint.indexOf('*/') >= 0 ? '' : ' /* ' + hint + ' */';
                            }
                            parts.push('constantPool[' + arg.constantIndex + ']' + hint);
                        } else if (arg instanceof Shumway.AVM1.ParsedPushRegisterAction) {
                            parts.push('registers[' + arg.registerNumber + ']');
                        } else if (arg instanceof Shumway.AVM1.AS2ActionsData) {
                            var resName = 'code_' + id + '_' + i;
                            res[resName] = arg;
                            parts.push('res.' + resName);
                        } else {
                            notImplemented('Unknown AVM1 action argument type');
                        }
                    } else if (arg === undefined) {
                        parts.push('undefined'); // special case
                    } else {
                        parts.push(JSON.stringify(arg));
                    }
                }
                return parts.join(',');
            };
            ActionsDataCompiler.prototype.convertAction = function (item, id, res) {
                switch (item.action.actionCode) {
                    case 153 /* ActionJump */:
                    case 62 /* ActionReturn */:
                        return '';
                    case 136 /* ActionConstantPool */:
                        res.constantPool = item.action.args[0];
                        return '  constantPool = [' + this.convertArgs(item.action.args[0], id, res) + '];\n' + '  ectx.constantPool = constantPool;\n';
                    case 150 /* ActionPush */:
                        return '  stack.push(' + this.convertArgs(item.action.args, id, res) + ');\n';
                    case 138 /* ActionWaitForFrame */:
                    case 141 /* ActionWaitForFrame2 */:
                        return '  if (calls.' + item.action.actionName + '(ectx,[' + this.convertArgs(item.action.args, id, res) + '])) { position = ' + item.conditionalJumpTo + '; break; }\n';
                    case 157 /* ActionIf */:
                        return '  if (!!stack.pop()) { position = ' + item.conditionalJumpTo + '; break; }\n';
                    default:
                        var result = '  calls.' + item.action.actionName + '(ectx' + (item.action.args ? ',[' + this.convertArgs(item.action.args, id, res) + ']' : '') + ');\n';
                        return result;
                }
            };
            ActionsDataCompiler.prototype.checkAvm1Timeout = function (ectx) {
                if (Date.now() >= ectx.context.abortExecutionAt) {
                    throw new AS2CriticalError('long running script -- AVM1 instruction hang timeout');
                }
            };
            ActionsDataCompiler.prototype.generate = function (ir) {
                var _this = this;
                var blocks = ir.blocks;
                var res = {};
                var uniqueId = 0;
                var debugName = ir.dataId;
                var fn = 'return function avm1gen_' + debugName + '(ectx) {\n' + 'var position = 0;\n' + 'var checkTimeAfter = 0;\n' + 'var constantPool = ectx.constantPool, registers = ectx.registers, stack = ectx.stack;\n';
                if (AVM1.avm1DebuggerEnabled.value) {
                    fn += '/* Running ' + debugName + ' */ ' + 'if (Shumway.AVM1.Debugger.pause || Shumway.AVM1.Debugger.breakpoints.' + debugName + ') { debugger; }\n';
                }
                fn += 'while (!ectx.isEndOfActions) {\n' + 'if (checkTimeAfter <= 0) { checkTimeAfter = ' + CHECK_AVM1_HANG_EVERY + '; checkTimeout(ectx); }\n' + 'switch(position) {\n';
                blocks.forEach(function (b) {
                    fn += ' case ' + b.label + ':\n';
                    b.items.forEach(function (item) {
                        fn += _this.convertAction(item, uniqueId++, res);
                    });
                    fn += '  position = ' + b.jump + ';\n' + '  checkTimeAfter -= ' + b.items.length + ';\n' + '  break;\n';
                });
                fn += ' default: ectx.isEndOfActions = true; break;\n}\n}\n' + 'return stack.pop();};';
                return (new Function('calls', 'res', 'checkTimeout', fn))(ActionsDataCompiler.cachedCalls, res, this.checkAvm1Timeout);
            };
            return ActionsDataCompiler;
        })();

        var ActionTracerFactory = (function () {
            function ActionTracerFactory() {
            }
            ActionTracerFactory.get = function () {
                return AVM1.avm1TraceEnabled.value ? ActionTracerFactory.tracer : ActionTracerFactory.nullTracer;
            };
            ActionTracerFactory.tracer = (function () {
                var indentation = 0;
                return {
                    print: function (parsedAction, stack) {
                        var position = parsedAction.position;
                        var actionCode = parsedAction.actionCode;
                        var actionName = parsedAction.actionName;
                        var stackDump = [];
                        for (var q = 0; q < stack.length; q++) {
                            var item = stack[q];
                            stackDump.push(item && typeof item === 'object' ? '[' + (item.constructor && item.constructor.name ? item.constructor.name : 'Object') + ']' : item);
                        }

                        var indent = new Array(indentation + 1).join('..');

                        console.log('AVM1 trace: ' + indent + position + ': ' + actionName + '(' + actionCode.toString(16) + '), ' + 'stack=' + stackDump);
                    },
                    indent: function () {
                        indentation++;
                    },
                    unindent: function () {
                        indentation--;
                    },
                    message: function (msg) {
                        console.log('AVM1 trace: ------- ' + msg);
                    }
                };
            })();

            ActionTracerFactory.nullTracer = {
                print: function (parsedAction, stack) {
                },
                indent: function () {
                },
                unindent: function () {
                },
                message: function (msg) {
                }
            };
            return ActionTracerFactory;
        })();
    })(Shumway.AVM1 || (Shumway.AVM1 = {}));
    var AVM1 = Shumway.AVM1;
})(Shumway || (Shumway = {}));
