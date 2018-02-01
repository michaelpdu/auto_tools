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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    (function (AVM2) {
        (function (Runtime) {
            var Multiname = Shumway.AVM2.ABC.Multiname;
            var Namespace = Shumway.AVM2.ABC.Namespace;
            var MethodInfo = Shumway.AVM2.ABC.MethodInfo;
            var ClassInfo = Shumway.AVM2.ABC.ClassInfo;
            var InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
            var ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;

            var Trait = Shumway.AVM2.ABC.Trait;
            var IndentingWriter = Shumway.IndentingWriter;
            var hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;
            var createMap = Shumway.ObjectUtilities.createMap;
            var cloneObject = Shumway.ObjectUtilities.cloneObject;
            var copyProperties = Shumway.ObjectUtilities.copyProperties;
            var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
            var bindSafely = Shumway.FunctionUtilities.bindSafely;

            var defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
            var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
            var defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;
            var defineNonEnumerableGetter = Shumway.ObjectUtilities.defineNonEnumerableGetter;
            var makeForwardingGetter = Shumway.FunctionUtilities.makeForwardingGetter;
            var makeForwardingSetter = Shumway.FunctionUtilities.makeForwardingSetter;

            var Binding = (function () {
                function Binding(trait) {
                    this.trait = trait;
                }
                Binding.getKey = function (qn, trait) {
                    var key = qn;
                    if (trait.isGetter()) {
                        key = Binding.GET_PREFIX + qn;
                    } else if (trait.isSetter()) {
                        key = Binding.SET_PREFIX + qn;
                    }
                    return key;
                };
                Binding.prototype.toString = function () {
                    return String(this.trait);
                };
                Binding.SET_PREFIX = "set ";
                Binding.GET_PREFIX = "get ";
                Binding.KEY_PREFIX_LENGTH = 4;
                return Binding;
            })();
            Runtime.Binding = Binding;

            var SlotInfo = (function () {
                function SlotInfo(name, isConst, type, trait) {
                    this.name = name;
                    this.isConst = isConst;
                    this.type = type;
                    this.trait = trait;
                }
                return SlotInfo;
            })();
            Runtime.SlotInfo = SlotInfo;

            var SlotInfoMap = (function () {
                function SlotInfoMap() {
                    this.byID = createMap();
                    this.byQN = createMap();
                }
                return SlotInfoMap;
            })();
            Runtime.SlotInfoMap = SlotInfoMap;

            /**
            * Abstraction over a collection of traits.
            */
            var Bindings = (function () {
                function Bindings() {
                    this.map = createMap();
                    this.slots = [];
                    this.nextSlotId = 1;
                }
                /**
                * Assigns the next available slot to the specified trait. Traits that have a non-zero slotId
                * are allocated by ASC and we can't relocate them elsewhere.
                */
                Bindings.prototype.assignNextSlot = function (trait) {
                    release || assert(trait instanceof Trait);
                    release || assert(trait.isSlot() || trait.isConst() || trait.isClass());
                    if (!trait.slotId) {
                        trait.slotId = this.nextSlotId++;
                    } else {
                        this.nextSlotId = trait.slotId + 1;
                    }
                    release || assert(!this.slots[trait.slotId], "Trait slot already taken.");
                    this.slots[trait.slotId] = trait;
                };

                Bindings.prototype.trace = function (writer) {
                    writer.enter("Bindings");
                    for (var key in this.map) {
                        var binding = this.map[key];
                        writer.writeLn(binding.trait.kindName() + ": " + key + " -> " + binding);
                    }
                    writer.leaveAndEnter("Slots");
                    writer.writeArray(this.slots);
                    writer.outdent();
                };

                /**
                * Applies traits to a traitsPrototype object. Every traitsPrototype object must have the following layout:
                *
                * VM_BINDINGS = [ Array of Binding QNames ]
                * VM_SLOTS = {
                *   byID: [],
                *   byQN: {},
                * }
                *
                */
                Bindings.prototype.applyTo = function (domain, object) {
                    release || assert(!hasOwnProperty(object, Shumway.AVM2.Runtime.VM_SLOTS), "Already has VM_SLOTS.");
                    release || assert(!hasOwnProperty(object, Shumway.AVM2.Runtime.VM_BINDINGS), "Already has VM_BINDINGS.");
                    release || assert(!hasOwnProperty(object, Shumway.AVM2.Runtime.VM_OPEN_METHODS), "Already has VM_OPEN_METHODS.");

                    defineNonEnumerableProperty(object, Shumway.AVM2.Runtime.VM_SLOTS, new SlotInfoMap());
                    defineNonEnumerableProperty(object, Shumway.AVM2.Runtime.VM_BINDINGS, []);
                    defineNonEnumerableProperty(object, Shumway.AVM2.Runtime.VM_OPEN_METHODS, createMap());

                    defineNonEnumerableProperty(object, "bindings", this);
                    defineNonEnumerableProperty(object, "resolutionMap", []);

                    traitsWriter && traitsWriter.greenLn("Applying Traits");

                    for (var key in this.map) {
                        var binding = this.map[key];
                        var trait = binding.trait;
                        var qn = Multiname.getQualifiedName(trait.name);
                        if (trait.isSlot() || trait.isConst() || trait.isClass()) {
                            var defaultValue = undefined;
                            if (trait.isSlot() || trait.isConst()) {
                                if (trait.hasDefaultValue) {
                                    defaultValue = trait.value;
                                } else if (trait.typeName) {
                                    defaultValue = domain.findClassInfo(trait.typeName).defaultValue;
                                }
                            }
                            if (key !== qn) {
                                traitsWriter && traitsWriter.yellowLn("Binding Trait: " + key + " -> " + qn);
                                defineNonEnumerableGetter(object, key, makeForwardingGetter(qn));
                                object.asBindings.pushUnique(key);
                            } else {
                                traitsWriter && traitsWriter.greenLn("Applying Trait " + trait.kindName() + ": " + trait);
                                defineNonEnumerableProperty(object, qn, defaultValue);
                                object.asBindings.pushUnique(qn);
                                var slotInfo = new SlotInfo(qn, trait.isConst(), trait.typeName ? domain.getProperty(trait.typeName, false, false) : null, trait);
                                object.asSlots.byID[trait.slotId] = slotInfo;
                                object.asSlots.byQN[qn] = slotInfo;
                            }
                        } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
                            if (trait.isGetter() || trait.isSetter()) {
                                key = key.substring(Binding.KEY_PREFIX_LENGTH);
                            }
                            if (key !== qn) {
                                traitsWriter && traitsWriter.yellowLn("Binding Trait: " + key + " -> " + qn);
                            } else {
                                traitsWriter && traitsWriter.greenLn("Applying Trait " + trait.kindName() + ": " + trait);
                            }
                            object.asBindings.pushUnique(key);
                            if (this instanceof ScriptBindings) {
                                Shumway.AVM2.Runtime.applyNonMemoizedMethodTrait(key, trait, object, binding.scope, binding.natives);
                            } else {
                                Shumway.AVM2.Runtime.applyMemoizedMethodTrait(key, trait, object, binding.scope, binding.natives);
                            }
                        }
                    }
                };
                return Bindings;
            })();
            Runtime.Bindings = Bindings;

            var ActivationBindings = (function (_super) {
                __extends(ActivationBindings, _super);
                function ActivationBindings(methodInfo) {
                    _super.call(this);
                    release || assert(methodInfo.needsActivation());
                    this.methodInfo = methodInfo;

                    // ASC creates activation even if the method has no traits, weird.
                    // assert (methodInfo.traits.length);
                    /**
                    * Add activation traits.
                    */
                    var traits = methodInfo.traits;
                    for (var i = 0; i < traits.length; i++) {
                        var trait = traits[i];
                        release || assert(trait.isSlot() || trait.isConst(), "Only slot or constant traits are allowed in activation objects.");
                        var key = Multiname.getQualifiedName(trait.name);
                        this.map[key] = new Binding(trait);
                        this.assignNextSlot(trait);
                    }
                }
                return ActivationBindings;
            })(Bindings);
            Runtime.ActivationBindings = ActivationBindings;

            var CatchBindings = (function (_super) {
                __extends(CatchBindings, _super);
                function CatchBindings(scope, trait) {
                    _super.call(this);

                    /**
                    * Add catch traits.
                    */
                    var key = Multiname.getQualifiedName(trait.name);
                    this.map[key] = new Binding(trait);
                    release || assert(trait.isSlot(), "Only slot traits are allowed in catch objects.");
                    this.assignNextSlot(trait);
                }
                return CatchBindings;
            })(Bindings);
            Runtime.CatchBindings = CatchBindings;

            var ScriptBindings = (function (_super) {
                __extends(ScriptBindings, _super);
                function ScriptBindings(scriptInfo, scope) {
                    _super.call(this);
                    this.scope = scope;
                    this.scriptInfo = scriptInfo;

                    /**
                    * Add script traits.
                    */
                    var traits = scriptInfo.traits;
                    for (var i = 0; i < traits.length; i++) {
                        var trait = traits[i];
                        var name = Multiname.getQualifiedName(trait.name);
                        var key = Binding.getKey(name, trait);
                        var binding = this.map[key] = new Binding(trait);
                        if (trait.isSlot() || trait.isConst() || trait.isClass()) {
                            this.assignNextSlot(trait);
                        }
                        if (trait.isClass()) {
                            if (trait.metadata && trait.metadata.native) {
                                trait.classInfo.native = trait.metadata.native;
                            }
                        }
                        if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
                            binding.scope = this.scope;
                        }
                    }
                }
                return ScriptBindings;
            })(Bindings);
            Runtime.ScriptBindings = ScriptBindings;

            var ClassBindings = (function (_super) {
                __extends(ClassBindings, _super);
                function ClassBindings(classInfo, scope, natives) {
                    _super.call(this);
                    this.scope = scope;
                    this.natives = natives;
                    this.classInfo = classInfo;

                    /**
                    * Add class traits.
                    */
                    var traits = classInfo.traits;
                    for (var i = 0; i < traits.length; i++) {
                        var trait = traits[i];
                        var name = Multiname.getQualifiedName(trait.name);
                        var key = Binding.getKey(name, trait);
                        var binding = this.map[key] = new Binding(trait);
                        if (trait.isSlot() || trait.isConst()) {
                            this.assignNextSlot(trait);
                        }
                        if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
                            binding.scope = this.scope;
                            binding.natives = this.natives;
                        }
                    }
                }
                return ClassBindings;
            })(Bindings);
            Runtime.ClassBindings = ClassBindings;

            var InstanceBindings = (function (_super) {
                __extends(InstanceBindings, _super);
                function InstanceBindings(parent, instanceInfo, scope, natives) {
                    _super.call(this);
                    this.scope = scope;
                    this.natives = natives;
                    this.parent = parent;
                    this.instanceInfo = instanceInfo;
                    this.implementedInterfaces = parent ? cloneObject(parent.implementedInterfaces) : createEmptyObject();
                    if (parent) {
                        this.slots = parent.slots.slice();
                        this.nextSlotId = parent.nextSlotId;
                    }
                    this.extend(parent);
                }
                /*
                * Extend base Instance Bindings
                *
                * Protected Members:
                *
                *   In AS3, if you have the following code:
                *
                *   class A {
                *     protected foo() { ... } // this is actually protected$A$foo
                *   }
                *
                *   class B extends A {
                *     function bar() {
                *       foo(); // this looks for protected$B$foo, not protected$A$foo
                *     }
                *   }
                *
                *   You would expect the call to |foo| in the |bar| function to have the protected A
                *   namespace open, but it doesn't. So we must create a binding in B's instance
                *   prototype from protected$B$foo -> protected$A$foo.
                *
                *   If we override foo:
                *
                *   class C extends B {
                *     protected override foo() { ... } this is protected$C$foo
                *   }
                *
                *   Then we need a binding from protected$A$foo -> protected$C$foo, and
                *   protected$B$foo -> protected$C$foo.
                *
                * Interfaces:
                *
                *   interface IA {
                *     function foo();
                *   }
                *
                *   interface IB implements IA {
                *     function bar();
                *   }
                *
                *   class C implements IB {
                *     function foo() { ... }
                *     function bar() { ... }
                *   }
                *
                *   var a:IA = new C();
                *   a.foo(); // Call Property: IA::foo
                *
                *   var b:IB = new C();
                *   b.foo(); // Call Property: IB::foo
                *   b.bar(); // Call Property: IB::bar
                *
                *   So, class C must have bindings for:
                *
                *   IA$$foo -> public$$foo
                *   IB$$foo -> public$$foo
                *   IB$$bar -> public$$bar
                */
                InstanceBindings.prototype.extend = function (parent) {
                    var ii = this.instanceInfo, ib;
                    var map = this.map;
                    var name, key, trait, binding, protectedName, protectedKey;

                    /**
                    * Inherit parent traits.
                    */
                    if (parent) {
                        for (key in parent.map) {
                            binding = parent.map[key];
                            trait = binding.trait;
                            map[key] = binding;
                            if (trait.isProtected()) {
                                // Inherit protected trait also in the local protected namespace.
                                protectedName = Multiname.getQualifiedName(new Multiname([ii.protectedNs], trait.name.getName()));
                                protectedKey = Binding.getKey(protectedName, trait);
                                map[protectedKey] = binding;
                            }
                        }
                    }

                    function writeOrOverwriteBinding(object, key, binding) {
                        var trait = binding.trait;
                        var oldBinding = object[key];
                        if (oldBinding) {
                            var oldTrait = oldBinding.trait;
                            release || assert(!oldTrait.isFinal(), "Cannot redefine a final trait: ", trait);

                            // TODO: Object.as has a trait named length, we need to remove this since
                            // it doesn't appear in Tamarin.
                            release || assert(trait.isOverride() || trait.name.getName() === "length", "Overriding a trait that is not marked for override: ", trait);
                        } else {
                            release || assert(!trait.isOverride(), "Trait marked override must override another trait: ", trait);
                        }
                        object[key] = binding;
                    }

                    function overwriteProtectedBinding(object, key, binding) {
                        if (key in object) {
                            object[key] = binding;
                        }
                    }

                    /**
                    * Add instance traits.
                    */
                    var traits = ii.traits;
                    for (var i = 0; i < traits.length; i++) {
                        trait = traits[i];
                        name = Multiname.getQualifiedName(trait.name);
                        key = Binding.getKey(name, trait);
                        binding = new Binding(trait);
                        writeOrOverwriteBinding(map, key, binding);
                        if (trait.isProtected()) {
                            // Overwrite protected traits.
                            ib = this.parent;
                            while (ib) {
                                protectedName = Multiname.getQualifiedName(new Multiname([ib.instanceInfo.protectedNs], trait.name.getName()));
                                protectedKey = Binding.getKey(protectedName, trait);
                                overwriteProtectedBinding(map, protectedKey, binding);
                                ib = ib.parent;
                            }
                        }
                        if (trait.isSlot() || trait.isConst()) {
                            this.assignNextSlot(trait);
                        }
                        if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
                            binding.scope = this.scope;
                            binding.natives = this.natives;
                        }
                    }

                    /**
                    * Add interface traits.
                    */
                    var domain = ii.abc.applicationDomain;
                    var interfaces = ii.interfaces;

                    for (var i = 0; i < interfaces.length; i++) {
                        var interface = domain.getProperty(interfaces[i], true, true);

                        // This can be undefined if the interface is defined after a class that implements it is defined.
                        release || assert(interface);
                        copyProperties(this.implementedInterfaces, interface.interfaceBindings.implementedInterfaces);
                        this.implementedInterfaces[Multiname.getQualifiedName(interface.name)] = interface;
                    }

                    for (var interfaceName in this.implementedInterfaces) {
                        var interface = this.implementedInterfaces[interfaceName];
                        ib = interface.interfaceBindings;
                        for (var interfaceKey in ib.map) {
                            var interfaceBinding = ib.map[interfaceKey];
                            if (ii.isInterface()) {
                                map[interfaceKey] = interfaceBinding;
                            } else {
                                name = Multiname.getPublicQualifiedName(interfaceBinding.trait.name.getName());
                                key = Binding.getKey(name, interfaceBinding.trait);
                                map[interfaceKey] = map[key];
                            }
                        }
                    }
                };

                InstanceBindings.prototype.toString = function () {
                    return this.instanceInfo.toString();
                };
                return InstanceBindings;
            })(Bindings);
            Runtime.InstanceBindings = InstanceBindings;

            var traitsWriter = null;
        })(AVM2.Runtime || (AVM2.Runtime = {}));
        var Runtime = AVM2.Runtime;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));

var Binding = Shumway.AVM2.Runtime.Binding;
var Bindings = Shumway.AVM2.Runtime.Bindings;
var ActivationBindings = Shumway.AVM2.Runtime.ActivationBindings;
var CatchBindings = Shumway.AVM2.Runtime.CatchBindings;
var ScriptBindings = Shumway.AVM2.Runtime.ScriptBindings;
var ClassBindings = Shumway.AVM2.Runtime.ClassBindings;
var InstanceBindings = Shumway.AVM2.Runtime.InstanceBindings;
