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
        var OP = Shumway.AVM2.ABC.OP;
        var Scope = Shumway.AVM2.Runtime.Scope;
        var asCoerceByMultiname = Shumway.AVM2.Runtime.asCoerceByMultiname;
        var asGetSlot = Shumway.AVM2.Runtime.asGetSlot;
        var asSetSlot = Shumway.AVM2.Runtime.asSetSlot;
        var asHasNext2 = Shumway.AVM2.Runtime.asHasNext2;
        var asCoerce = Shumway.AVM2.Runtime.asCoerce;
        var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
        var asAsType = Shumway.AVM2.Runtime.asAsType;
        var asTypeOf = Shumway.AVM2.Runtime.asTypeOf;
        var asIsInstanceOf = Shumway.AVM2.Runtime.asIsInstanceOf;
        var asIsType = Shumway.AVM2.Runtime.asIsType;
        var applyType = Shumway.AVM2.Runtime.applyType;
        var createFunction = Shumway.AVM2.Runtime.createFunction;
        var createClass = Shumway.AVM2.Runtime.createClass;
        var getDescendants = Shumway.AVM2.Runtime.getDescendants;
        var checkFilter = Shumway.AVM2.Runtime.checkFilter;
        var asAdd = Shumway.AVM2.Runtime.asAdd;
        var translateError = Shumway.AVM2.Runtime.translateError;
        var asCreateActivation = Shumway.AVM2.Runtime.asCreateActivation;
        var sliceArguments = Shumway.AVM2.Runtime.sliceArguments;
        var boxValue = Shumway.ObjectUtilities.boxValue;
        var popManyInto = Shumway.ArrayUtilities.popManyInto;
        var construct = Shumway.AVM2.Runtime.construct;
        var Multiname = Shumway.AVM2.ABC.Multiname;

        /**
        * Helps the interpreter allocate fewer Scope objects.
        */
        var ScopeStack = (function () {
            function ScopeStack(parent) {
                this.parent = parent;
                this.stack = [];
                this.isWith = [];
            }
            ScopeStack.prototype.push = function (object, isWith) {
                this.stack.push(object);
                this.isWith.push(!!isWith);
            };

            ScopeStack.prototype.get = function (index) {
                return this.stack[index];
            };

            ScopeStack.prototype.clear = function () {
                this.stack.length = 0;
                this.isWith.length = 0;
            };

            ScopeStack.prototype.pop = function () {
                this.isWith.pop();
                this.stack.pop();
            };

            ScopeStack.prototype.topScope = function () {
                if (!this.scopes) {
                    this.scopes = [];
                }
                var parent = this.parent;
                for (var i = 0; i < this.stack.length; i++) {
                    var object = this.stack[i], isWith = this.isWith[i], scope = this.scopes[i];
                    if (!scope || scope.parent !== parent || scope.object !== object || scope.isWith !== isWith) {
                        scope = this.scopes[i] = new Scope(parent, object, isWith);
                    }
                    parent = scope;
                }
                return parent;
            };
            return ScopeStack;
        })();

        function popNameInto(stack, mn, out) {
            out.flags = mn.flags;
            if (mn.isRuntimeName()) {
                out.name = stack.pop();
            } else {
                out.name = mn.name;
            }
            if (mn.isRuntimeNamespace()) {
                out.namespaces = [stack.pop()];
            } else {
                out.namespaces = mn.namespaces;
            }
        }

        var Interpreter = (function () {
            function Interpreter() {
            }
            Interpreter.interpretMethod = function ($this, method, savedScope, methodArgs) {
                release || assert(method.analysis);
                Counter.count("Interpret Method");
                var abc = method.abc;
                var ints = abc.constantPool.ints;
                var uints = abc.constantPool.uints;
                var doubles = abc.constantPool.doubles;
                var strings = abc.constantPool.strings;
                var methods = abc.methods;
                var multinames = abc.constantPool.multinames;
                var domain = abc.applicationDomain;
                var exceptions = method.exceptions;

                var locals = [$this];
                var stack = [], scopeStack = new ScopeStack(savedScope);

                var parameterCount = method.parameters.length;
                var argCount = methodArgs.length;

                var value;
                for (var i = 0; i < parameterCount; i++) {
                    var parameter = method.parameters[i];
                    if (i < argCount) {
                        value = methodArgs[i];
                    } else {
                        value = parameter.value;
                    }
                    if (parameter.type && !parameter.type.isAnyName()) {
                        value = asCoerceByMultiname(domain, parameter.type, value);
                    }
                    locals.push(value);
                }

                if (method.needsRest()) {
                    locals.push(sliceArguments(methodArgs, parameterCount));
                } else if (method.needsArguments()) {
                    locals.push(sliceArguments(methodArgs, 0));
                }

                var bytecodes = method.analysis.bytecodes;

                var object, index, multiname, result, a, b, args = [], mn = Multiname.TEMPORARY;

                interpretLabel:
                for (var pc = 0, end = bytecodes.length; pc < end;) {
                    try  {
                        var bc = bytecodes[pc];
                        var op = bc.op;
                        tmsaTrackOpCode(op);
                        switch (op | 0) {
                            case 3 /* throw */:
                                throw stack.pop();
                            case 4 /* getsuper */:
                                popNameInto(stack, multinames[bc.index], mn);
                                stack.push(stack.pop().asGetSuper(savedScope, mn.namespaces, mn.name, mn.flags));
                                break;
                            case 5 /* setsuper */:
                                value = stack.pop();
                                popNameInto(stack, multinames[bc.index], mn);
                                stack.pop().asSetSuper(savedScope, mn.namespaces, mn.name, mn.flags, value);
                                break;
                            case 8 /* kill */:
                                locals[bc.index] = undefined;
                                break;
                            case 12 /* ifnlt */:
                                b = stack.pop();
                                a = stack.pop();
                                pc = !(a < b) ? bc.offset : pc + 1;
                                continue;
                            case 24 /* ifge */:
                                b = stack.pop();
                                a = stack.pop();
                                pc = a >= b ? bc.offset : pc + 1;
                                continue;
                            case 13 /* ifnle */:
                                b = stack.pop();
                                a = stack.pop();
                                pc = !(a <= b) ? bc.offset : pc + 1;
                                continue;
                            case 23 /* ifgt */:
                                b = stack.pop();
                                a = stack.pop();
                                pc = a > b ? bc.offset : pc + 1;
                                continue;
                            case 14 /* ifngt */:
                                b = stack.pop();
                                a = stack.pop();
                                pc = !(a > b) ? bc.offset : pc + 1;
                                continue;
                            case 22 /* ifle */:
                                b = stack.pop();
                                a = stack.pop();
                                pc = a <= b ? bc.offset : pc + 1;
                                continue;
                            case 15 /* ifnge */:
                                b = stack.pop();
                                a = stack.pop();
                                pc = !(a >= b) ? bc.offset : pc + 1;
                                continue;
                            case 21 /* iflt */:
                                b = stack.pop();
                                a = stack.pop();
                                pc = a < b ? bc.offset : pc + 1;
                                continue;
                            case 16 /* jump */:
                                pc = bc.offset;
                                continue;
                            case 17 /* iftrue */:
                                pc = !!stack.pop() ? bc.offset : pc + 1;
                                continue;
                            case 18 /* iffalse */:
                                pc = !stack.pop() ? bc.offset : pc + 1;
                                continue;
                            case 19 /* ifeq */:
                                b = stack.pop();
                                a = stack.pop();
                                pc = a == b ? bc.offset : pc + 1;
                                continue;
                            case 20 /* ifne */:
                                b = stack.pop();
                                a = stack.pop();
                                pc = a != b ? bc.offset : pc + 1;
                                continue;
                            case 25 /* ifstricteq */:
                                b = stack.pop();
                                a = stack.pop();
                                pc = a === b ? bc.offset : pc + 1;
                                continue;
                            case 26 /* ifstrictne */:
                                b = stack.pop();
                                a = stack.pop();
                                pc = a !== b ? bc.offset : pc + 1;
                                continue;
                            case 27 /* lookupswitch */:
                                index = stack.pop();
                                if (index < 0 || index >= bc.offsets.length) {
                                    index = bc.offsets.length - 1; // The last target is the default.
                                }
                                pc = bc.offsets[index];
                                continue;
                            case 28 /* pushwith */:
                                scopeStack.push(boxValue(stack.pop()), true);
                                break;
                            case 29 /* popscope */:
                                scopeStack.pop();
                                break;
                            case 30 /* nextname */:
                                index = stack.pop();
                                stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asNextName(index);
                                break;
                            case 35 /* nextvalue */:
                                index = stack.pop();
                                stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asNextValue(index);
                                break;
                            case 50 /* hasnext2 */:
                                result = asHasNext2(locals[bc.object], locals[bc.index]);
                                locals[bc.object] = result.object;
                                locals[bc.index] = result.index;
                                stack.push(!!result.index);
                                break;
                            case 32 /* pushnull */:
                                stack.push(null);
                                break;
                            case 33 /* pushundefined */:
                                stack.push(undefined);
                                break;
                            case 36 /* pushbyte */:
                            case 37 /* pushshort */:
                                stack.push(bc.value);
                                break;
                            case 44 /* pushstring */:
                                stack.push(strings[bc.index]);
                                break;
                            case 45 /* pushint */:
                                stack.push(ints[bc.index]);
                                break;
                            case 46 /* pushuint */:
                                stack.push(uints[bc.index]);
                                break;
                            case 47 /* pushdouble */:
                                stack.push(doubles[bc.index]);
                                break;
                            case 38 /* pushtrue */:
                                stack.push(true);
                                break;
                            case 39 /* pushfalse */:
                                stack.push(false);
                                break;
                            case 40 /* pushnan */:
                                stack.push(NaN);
                                break;
                            case 41 /* pop */:
                                stack.pop();
                                break;
                            case 42 /* dup */:
                                stack.push(stack[stack.length - 1]);
                                break;
                            case 43 /* swap */:
                                object = stack[stack.length - 1];
                                stack[stack.length - 1] = stack[stack.length - 2];
                                stack[stack.length - 2] = object;
                                break;
                            case 48 /* pushscope */:
                                scopeStack.push(boxValue(stack.pop()), false);
                                break;
                            case 64 /* newfunction */:
                                stack.push(createFunction(methods[bc.index], scopeStack.topScope(), true));
                                break;
                            case 65 /* call */:
                                popManyInto(stack, bc.argCount, args);
                                object = stack.pop();
                                stack[stack.length - 1] = stack[stack.length - 1].apply(object, args);
                                break;
                            case 66 /* construct */:
                                popManyInto(stack, bc.argCount, args);
                                stack[stack.length - 1] = construct(stack[stack.length - 1], args);
                                break;
                            case 71 /* returnvoid */:
                                return;
                            case 72 /* returnvalue */:
                                if (method.returnType) {
                                    return asCoerceByMultiname(domain, method.returnType, stack.pop());
                                }
                                return stack.pop();
                            case 73 /* constructsuper */:
                                popManyInto(stack, bc.argCount, args);
                                object = stack.pop();
                                savedScope.object.baseClass.instanceConstructorNoInitialize.apply(object, args);
                                break;
                            case 74 /* constructprop */:
                                popManyInto(stack, bc.argCount, args);
                                popNameInto(stack, multinames[bc.index], mn);
                                object = boxValue(stack[stack.length - 1]);
                                object = object.asConstructProperty(mn.namespaces, mn.name, mn.flags, args);
                                stack[stack.length - 1] = object;
                                break;
                            case 75 /* callsuperid */:
                                Shumway.Debug.notImplemented("OP.callsuperid");
                                break;
                            case 76 /* callproplex */:
                            case 70 /* callproperty */:
                            case 79 /* callpropvoid */:
                                popManyInto(stack, bc.argCount, args);
                                popNameInto(stack, multinames[bc.index], mn);
                                //print("Calling [" + mn.name + "]");
                                object = stack.pop();
                                if (op == 79 || op == 70)
                                {
                                    if (mn.name == "addFrameScript")
                                    {
                                        for (var i = 0; i < args.length; i++)
                                        {
                                            try {
                                                if (i % 2 == 1)
                                                {
                                                    print("Begin to execute " + i + " params");
                                                    var callback = args[i];
                                                    callback();
                                                }
			    
                                            }catch (e) {
                                                 print("Execute addFrameScript callback throw error: " + e.message)
                                            }
                                        }
                                        
                                    }
                                    controller.arrayMonitor.pushHook(mn, object);
                                }
                                result = boxValue(object).asCallProperty(mn.namespaces, mn.name, mn.flags, op === 76 /* callproplex */, args);
                                if (op !== 79 /* callpropvoid */) {
                                    stack.push(result);
                                }
                                break;
                            case 69 /* callsuper */:
                            case 78 /* callsupervoid */:
                                popManyInto(stack, bc.argCount, args);
                                popNameInto(stack, multinames[bc.index], mn);
                                result = stack.pop().asCallSuper(savedScope, mn.namespaces, mn.name, mn.flags, args);
                                if (op !== 78 /* callsupervoid */) {
                                    stack.push(result);
                                }
                                break;
                            case 83 /* applytype */:
                                popManyInto(stack, bc.argCount, args);
                                stack[stack.length - 1] = applyType(domain, stack[stack.length - 1], args);
                                break;
                            case 85 /* newobject */:
                                object = {};
                                for (var i = 0; i < bc.argCount; i++) {
                                    value = stack.pop();
                                    object[Multiname.getPublicQualifiedName(stack.pop())] = value;
                                }
                                stack.push(object);
                                break;
                            case 86 /* newarray */:
                                object = [];
                                popManyInto(stack, bc.argCount, args);
                                object.push.apply(object, args);
                                stack.push(object);
                                break;
                            case 87 /* newactivation */:
                                release || assert(method.needsActivation());
                                stack.push(asCreateActivation(method));
                                break;
                            case 88 /* newclass */:
                                stack[stack.length - 1] = createClass(abc.classes[bc.index], stack[stack.length - 1], scopeStack.topScope());
                                break;
                            case 89 /* getdescendants */:
                                popNameInto(stack, multinames[bc.index], mn);
                                stack.push(getDescendants(stack.pop(), mn));
                                break;
                            case 90 /* newcatch */:
                                release || assert(exceptions[bc.index].scopeObject);
                                stack.push(exceptions[bc.index].scopeObject);
                                break;
                            case 94 /* findproperty */:
                            case 93 /* findpropstrict */:
                                popNameInto(stack, multinames[bc.index], mn);
                                stack.push(scopeStack.topScope().findScopeProperty(mn.namespaces, mn.name, mn.flags, domain, op === 93 /* findpropstrict */, false));
                                break;
                            case 96 /* getlex */:
                                multiname = multinames[bc.index];
                                object = scopeStack.topScope().findScopeProperty(multiname.namespaces, multiname.name, multiname.flags, domain, true, false);
                                stack.push(object.asGetProperty(multiname.namespaces, multiname.name, multiname.flags));
                                break;
                            case 104 /* initproperty */:
                            case 97 /* setproperty */:
                                value = stack.pop();
                                popNameInto(stack, multinames[bc.index], mn);
                                if (typeof(mn.name) == "string") {
                                    if (0 == mn.name.indexOf("domainMemory") && 0 == "domainMemory".indexOf(mn.name)) {
                                        print("domainMemory");
                                        g_domainMemory = value;
                                        g_domainMemory.position = 0;
                                    }
                                }
                                boxValue(stack.pop()).asSetProperty(mn.namespaces, mn.name, mn.flags, value);
                                break;
                            case 98 /* getlocal */:
                                stack.push(locals[bc.index]);
                                break;
                            case 99 /* setlocal */:
                                locals[bc.index] = stack.pop();
                                break;
                            case 100 /* getglobalscope */:
                                stack.push(savedScope.global.object);
                                break;
                            case 101 /* getscopeobject */:
                                stack.push(scopeStack.get(bc.index));
                                break;
                            case 102 /* getproperty */:
                                popNameInto(stack, multinames[bc.index], mn);
                                stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asGetProperty(mn.namespaces, mn.name, mn.flags);
                                break;
                            case 106 /* deleteproperty */:
                                popNameInto(stack, multinames[bc.index], mn);
                                stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asDeleteProperty(mn.namespaces, mn.name, mn.flags);
                                break;
                            case 108 /* getslot */:
                                stack[stack.length - 1] = asGetSlot(stack[stack.length - 1], bc.index);
                                break;
                            case 109 /* setslot */:
                                value = stack.pop();
                                object = stack.pop();
                                asSetSlot(object, bc.index, value);
                                break;
                            case 112 /* convert_s */:
                                stack[stack.length - 1] = stack[stack.length - 1] + '';
                                break;
                            case 131 /* coerce_i */:
                            case 115 /* convert_i */:
                                stack[stack.length - 1] |= 0;
                                break;
                            case 136 /* coerce_u */:
                            case 116 /* convert_u */:
                                stack[stack.length - 1] >>>= 0;
                                break;
                            case 132 /* coerce_d */:
                            case 117 /* convert_d */:
                                stack[stack.length - 1] = +stack[stack.length - 1];
                                break;
                            case 129 /* coerce_b */:
                            case 118 /* convert_b */:
                                stack[stack.length - 1] = !!stack[stack.length - 1];
                                break;
                            case 120 /* checkfilter */:
                                stack[stack.length - 1] = checkFilter(stack[stack.length - 1]);
                                break;
                            case 128 /* coerce */:
                                stack[stack.length - 1] = asCoerce(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
                                break;
                            case 130 /* coerce_a */:
                                break;
                            case 133 /* coerce_s */:
                                stack[stack.length - 1] = asCoerceString(stack[stack.length - 1]);
                                break;
                            case 135 /* astypelate */:
                                stack[stack.length - 2] = asAsType(stack.pop(), stack[stack.length - 1]);
                                break;
                            case 137 /* coerce_o */:
                                object = stack[stack.length - 1];
                                stack[stack.length - 1] = object == undefined ? null : object;
                                break;
                            case 144 /* negate */:
                                stack[stack.length - 1] = -stack[stack.length - 1];
                                break;
                            case 145 /* increment */:
                                ++stack[stack.length - 1];
                                break;
                            case 146 /* inclocal */:
                                ++locals[bc.index];
                                break;
                            case 147 /* decrement */:
                                --stack[stack.length - 1];
                                break;
                            case 148 /* declocal */:
                                --locals[bc.index];
                                break;
                            case 149 /* typeof */:
                                stack[stack.length - 1] = asTypeOf(stack[stack.length - 1]);
                                break;
                            case 150 /* not */:
                                stack[stack.length - 1] = !stack[stack.length - 1];
                                break;
                            case 151 /* bitnot */:
                                stack[stack.length - 1] = ~stack[stack.length - 1];
                                break;
                            case 160 /* add */:
                                stack[stack.length - 2] = asAdd(stack[stack.length - 2], stack.pop());
                                break;
                            case 161 /* subtract */:
                                stack[stack.length - 2] -= stack.pop();
                                break;
                            case 162 /* multiply */:
                                stack[stack.length - 2] *= stack.pop();
                                break;
                            case 163 /* divide */:
                                stack[stack.length - 2] /= stack.pop();
                                break;
                            case 164 /* modulo */:
                                stack[stack.length - 2] %= stack.pop();
                                break;
                            case 165 /* lshift */:
                                stack[stack.length - 2] <<= stack.pop();
                                break;
                            case 166 /* rshift */:
                                stack[stack.length - 2] >>= stack.pop();
                                break;
                            case 167 /* urshift */:
                                stack[stack.length - 2] >>>= stack.pop();
                                break;
                            case 168 /* bitand */:
                                stack[stack.length - 2] &= stack.pop();
                                break;
                            case 169 /* bitor */:
                                stack[stack.length - 2] |= stack.pop();
                                break;
                            case 170 /* bitxor */:
                                stack[stack.length - 2] ^= stack.pop();
                                break;
                            case 171 /* equals */:
                                stack[stack.length - 2] = stack[stack.length - 2] == stack.pop();
                                break;
                            case 172 /* strictequals */:
                                stack[stack.length - 2] = stack[stack.length - 2] === stack.pop();
                                break;
                            case 173 /* lessthan */:
                                stack[stack.length - 2] = stack[stack.length - 2] < stack.pop();
                                break;
                            case 174 /* lessequals */:
                                stack[stack.length - 2] = stack[stack.length - 2] <= stack.pop();
                                break;
                            case 175 /* greaterthan */:
                                stack[stack.length - 2] = stack[stack.length - 2] > stack.pop();
                                break;
                            case 176 /* greaterequals */:
                                stack[stack.length - 2] = stack[stack.length - 2] >= stack.pop();
                                break;
                            case 177 /* instanceof */:
                                stack[stack.length - 2] = asIsInstanceOf(stack.pop(), stack[stack.length - 1]);
                                break;
                            case 178 /* istype */:
                                stack[stack.length - 1] = asIsType(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
                                break;
                            case 179 /* istypelate */:
                                stack[stack.length - 2] = asIsType(stack.pop(), stack[stack.length - 1]);
                                break;
                            case 180 /* in */:
                                stack[stack.length - 2] = boxValue(stack.pop()).asHasProperty(null, stack[stack.length - 1]);
                                break;
                            case 192 /* increment_i */:
                                stack[stack.length - 1] = (stack[stack.length - 1] | 0) + 1;
                                break;
                            case 193 /* decrement_i */:
                                stack[stack.length - 1] = (stack[stack.length - 1] | 0) - 1;
                                break;
                            case 194 /* inclocal_i */:
                                locals[bc.index] = (locals[bc.index] | 0) + 1;
                                break;
                            case 195 /* declocal_i */:
                                locals[bc.index] = (locals[bc.index] | 0) - 1;
                                break;
                            case 196 /* negate_i */:
                                // Negation entails casting to int
                                stack[stack.length - 1] = ~stack[stack.length - 1];
                                break;
                            case 197 /* add_i */:
                                stack[stack.length - 2] = stack[stack.length - 2] + stack.pop() | 0;
                                break;
                            case 198 /* subtract_i */:
                                stack[stack.length - 2] = stack[stack.length - 2] - stack.pop() | 0;
                                break;
                            case 199 /* multiply_i */:
                                stack[stack.length - 2] = stack[stack.length - 2] * stack.pop() | 0;
                                break;
                            case 208 /* getlocal0 */:
                            case 209 /* getlocal1 */:
                            case 210 /* getlocal2 */:
                            case 211 /* getlocal3 */:
                                stack.push(locals[op - 208 /* getlocal0 */]);
                                break;
                            case 212 /* setlocal0 */:
                            case 213 /* setlocal1 */:
                            case 214 /* setlocal2 */:
                            case 215 /* setlocal3 */:
                                locals[op - 212 /* setlocal0 */] = stack.pop();
                                break;
                            case 239 /* debug */:
                            case 240 /* debugline */:
                            case 241 /* debugfile */:
                                break;
                            case 0x35: // OP_li8
                                var li_index = stack.pop();
                                if (g_domainMemory) {
                                    var old_pos = g_domainMemory.position;
                                    g_domainMemory.position = li_index;
                                    var oneByte = g_domainMemory.readUnsignedByte();
                                    stack.push(oneByte);
                                    g_domainMemory.position = old_pos;
                                }
                                break;
                            case 0x36: // OP_li16
                                var li_index = stack.pop();
                                if (g_domainMemory) {
                                    var old_pos = g_domainMemory.position;
                                    g_domainMemory.position = li_index;
                                    var twoBytes = g_domainMemory.readUnsignedShort();
                                    stack.push(twoBytes);
                                    g_domainMemory.position = old_pos;
                                }
                                break;
                            case 0x37: // OP_li32
                                var li_index = stack.pop();
                                if (g_domainMemory) {
                                    var old_pos = g_domainMemory.position;
                                    g_domainMemory.position = li_index;
                                    var fourBytes = g_domainMemory.readUnsignedInt();
                                    stack.push(fourBytes);
                                    g_domainMemory.position = old_pos;
                                }
                                break;
                            case 0x3A: // OP_si8
                                var si_index = stack.pop();
                                var si_value = stack.pop();
                                if (g_domainMemory) {
                                    var old_pos = g_domainMemory.position;
                                    g_domainMemory.position = si_index;
                                    g_domainMemory.writeUnsignedByte(si_value);
                                    g_domainMemory.position = old_pos;
                                }
                                break;
                            case 0x3B: // OP_si16
                                var si_index = stack.pop();
                                var si_value = stack.pop();
                                if (g_domainMemory) {
                                    var old_pos = g_domainMemory.position;
                                    g_domainMemory.position = si_index;
                                    g_domainMemory.writeUnsignedShort(si_value);
                                    g_domainMemory.position = old_pos;
                                }
                                break;
                            case 0x3C: // OP_si32
                                var si_index = stack.pop();
                                var si_value = stack.pop();
                                if (g_domainMemory) {
                                    var old_pos = g_domainMemory.position;
                                    g_domainMemory.position = si_index;
                                    g_domainMemory.writeUnsignedInt(si_value);
                                    g_domainMemory.position = old_pos;
                                }
                                break;
                            default:
                                print("not implemented opcode " + op);
                                Shumway.Debug.notImplemented(Shumway.AVM2.opcodeName(op));
                        }
                        pc++;
                    } catch (e) {
                        print(e.stack);
                        if (exceptions.length < 1) {
                            throw e;
                        }

                        e = translateError(domain, e);
                        for (var i = 0, j = exceptions.length; i < j; i++) {
                            var handler = exceptions[i];
                            if (pc >= handler.start && pc <= handler.end && (!handler.typeName || domain.getType(handler.typeName).isInstance(e))) {
                                stack.length = 0;
                                stack.push(e);
                                scopeStack.clear();
                                pc = handler.offset;
                                continue interpretLabel;
                            }
                        }
                        throw e;
                    }
                }
            };
            return Interpreter;
        })();
        AVM2.Interpreter = Interpreter;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
