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
            var MethodInfo = Shumway.AVM2.ABC.MethodInfo;
            var ClassInfo = Shumway.AVM2.ABC.ClassInfo;
            var InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
            var InstanceBindings = Shumway.AVM2.Runtime.InstanceBindings;
            var ClassBindings = Shumway.AVM2.Runtime.ClassBindings;

            var defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
            var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
            var defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;
            var defineNonEnumerableGetter = Shumway.ObjectUtilities.defineNonEnumerableGetter;
            var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
            var toKeyValueArray = Shumway.ObjectUtilities.toKeyValueArray;

            var boxValue = Shumway.ObjectUtilities.boxValue;

            function makeCacheKey(namespaces, name, flags) {
                if (!namespaces) {
                    return name;
                } else if (namespaces.length > 1) {
                    return namespaces.runtimeId + "$" + name;
                } else {
                    return namespaces[0].qualifiedName + "$" + name;
                }
            }

            /**
            * Scopes are used to emulate the scope stack as a linked list of scopes, rather than a stack. Each
            * scope holds a reference to a scope [object] (which may exist on multiple scope chains, thus preventing
            * us from chaining the scope objects together directly).
            *
            * Scope Operations:
            *
            *  push scope: scope = new Scope(scope, object)
            *  pop scope: scope = scope.parent
            *  get global scope: scope.global
            *  get scope object: scope.object
            *
            * Method closures have a [savedScope] property which is bound when the closure is created. Since we use a
            * linked list of scopes rather than a scope stack, we don't need to clone the scope stack, we can bind
            * the closure to the current scope.
            *
            * The "scope stack" for a method always starts off as empty and methods push and pop scopes on their scope
            * stack explicitly. If a property is not found on the current scope stack, it is then looked up
            * in the [savedScope]. To emulate this we actually wrap every generated function in a closure, such as
            *
            *  function fnClosure(scope) {
            *    return function fn() {
            *      ... scope;
            *    };
            *  }
            *
            * When functions are created, we bind the function to the current scope, using fnClosure.bind(null, this)();
            *
            * Scope Caching:
            *
            * Calls to |findScopeProperty| are very expensive. They recurse all the way to the top of the scope chain and then
            * laterally across other scripts. We optimize this by caching property lookups in each scope using Multiname
            * |id|s as keys. Each Multiname object is given a unique ID when it's constructed. For QNames we only cache
            * string QNames.
            *
            * TODO: This is not sound, since you can add/delete properties to/from with scopes.
            */
            var Scope = (function () {
                function Scope(parent, object, isWith) {
                    if (typeof isWith === "undefined") { isWith = false; }
                    this.parent = parent;
                    this.object = boxValue(object);
                    release || assert(Shumway.isObject(this.object));
                    this.global = parent ? parent.global : this;
                    this.isWith = isWith;
                    this.cache = createEmptyObject();
                }
                Scope.prototype.findDepth = function (object) {
                    var current = this;
                    var depth = 0;
                    while (current) {
                        if (current.object === object) {
                            return depth;
                        }
                        depth++;
                        current = current.parent;
                    }
                    return -1;
                };

                Scope.prototype.getScopeObjects = function () {
                    var objects = [];
                    var current = this;
                    while (current) {
                        objects.unshift(current.object);
                        current = current.parent;
                    }
                    return objects;
                };

                /**
                * Searches the scope stack for the object containing the specified property. If |strict| is specified then throw
                * an exception if the property is not found. If |scopeOnly| is specified then only search the scope chain and not
                * any of the top level domains (this is used by the verifier to bake in direct object references).
                *
                * Property lookups are cached in scopes but are not used when only looking at |scopesOnly|.
                */
                Scope.prototype.findScopeProperty = function (namespaces, name, flags, domain, strict, scopeOnly) {
                    Counter.count("findScopeProperty");
                    var object;
                    var key = makeCacheKey(namespaces, name, flags);
                    if (!scopeOnly && (object = this.cache[key])) {
                        return object;
                    }
                    if (this.object.asHasProperty(namespaces, name, flags, true)) {
                        return this.isWith ? this.object : (this.cache[key] = this.object);
                    }
                    if (this.parent) {
                        return (this.cache[key] = this.parent.findScopeProperty(namespaces, name, flags, domain, strict, scopeOnly));
                    }
                    if (scopeOnly)
                        return null;

                    // If we can't find the property look in the domain.
                    if ((object = domain.findDomainProperty(new Multiname(namespaces, name, flags), strict, true))) {
                        return object;
                    }
                    if (strict) {
                        Shumway.Debug.unexpected("Cannot find property " + name);
                    }

                    // Can't find it still, return the global object.
                    return this.global.object;
                };
                return Scope;
            })();
            Runtime.Scope = Scope;

            /**
            * Wraps the free method in a closure that passes the dynamic scope object as the
            * first argument and also makes sure that the |asGlobal| object gets passed in as
            * |this| when the method is called with |fn.call(null)|.
            */
            function bindFreeMethodScope(methodInfo, scope) {
                var fn = methodInfo.freeMethod;
                if (methodInfo.lastBoundMethod && methodInfo.lastBoundMethod.scope === scope) {
                    return methodInfo.lastBoundMethod.boundMethod;
                }
                release || assert(fn, "There should already be a cached method.");
                var boundMethod;
                var asGlobal = scope.global.object;
                if (!methodInfo.hasOptional() && !methodInfo.needsArguments() && !methodInfo.needsRest()) {
                    switch (methodInfo.parameters.length) {
                        case 0:
                            boundMethod = function () {
                                return fn.call(this === jsGlobal ? asGlobal : this, scope);
                            };
                            break;
                        case 1:
                            boundMethod = function (x) {
                                return fn.call(this === jsGlobal ? asGlobal : this, scope, x);
                            };
                            break;
                        case 2:
                            boundMethod = function (x, y) {
                                return fn.call(this === jsGlobal ? asGlobal : this, scope, x, y);
                            };
                            break;
                        case 3:
                            boundMethod = function (x, y, z) {
                                return fn.call(this === jsGlobal ? asGlobal : this, scope, x, y, z);
                            };
                            break;
                        default:
                            break;
                    }
                }
                if (!boundMethod) {
                    Counter.count("Bind Scope - Slow Path");
                    boundMethod = function () {
                        Array.prototype.unshift.call(arguments, scope);
                        var global = (this === jsGlobal ? scope.global.object : this);
                        return fn.apply(global, arguments);
                    };
                }
                boundMethod.methodInfo = methodInfo;
                boundMethod.instanceConstructor = boundMethod;
                methodInfo.lastBoundMethod = {
                    scope: scope,
                    boundMethod: boundMethod
                };
                return boundMethod;
            }
            Runtime.bindFreeMethodScope = bindFreeMethodScope;
        })(AVM2.Runtime || (AVM2.Runtime = {}));
        var Runtime = AVM2.Runtime;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
