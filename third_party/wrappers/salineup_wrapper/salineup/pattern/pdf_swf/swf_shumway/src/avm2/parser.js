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
        (function (ABC) {
            var Timer = Shumway.Metrics.Timer;
            var isString = Shumway.isString;
            var isNumber = Shumway.isNumber;
            var isNumeric = Shumway.isNumeric;
            var isObject = Shumway.isObject;

            var textDecoder = null;
            if (typeof TextDecoder !== "undefined") {
                textDecoder = new TextDecoder();
            }

            var AbcStream = (function () {
                function AbcStream(bytes) {
                    this._bytes = bytes;
                    this._view = new DataView(bytes.buffer, bytes.byteOffset);
                    this._position = 0;
                }
                AbcStream._getResultBuffer = function (length) {
                    if (!AbcStream._resultBuffer || AbcStream._resultBuffer.length < length) {
                        AbcStream._resultBuffer = new Int32Array(length * 2);
                    }
                    return AbcStream._resultBuffer;
                };

                Object.defineProperty(AbcStream.prototype, "position", {
                    get: function () {
                        return this._position;
                    },
                    enumerable: true,
                    configurable: true
                });
                AbcStream.prototype.remaining = function () {
                    return this._bytes.length - this._position;
                };
                AbcStream.prototype.seek = function (position) {
                    this._position = position;
                };
                AbcStream.prototype.readU8 = function () {
                    return this._bytes[this._position++];
                };
                AbcStream.prototype.readU8s = function (count) {
                    var b = new Uint8Array(count);
                    b.set(this._bytes.subarray(this._position, this._position + count), 0);
                    this._position += count;
                    return b;
                };
                AbcStream.prototype.readS8 = function () {
                    return this._bytes[this._position++] << 24 >> 24;
                };
                AbcStream.prototype.readU32 = function () {
                    return this.readS32() >>> 0;
                };
                AbcStream.prototype.readU30 = function () {
                    var result = this.readU32();
                    if (result & 0xc0000000) {
                        // TODO: Spec says this is a corrupt ABC file, but it seems that some content
                        // has this, e.g. 1000-0.abc
                        // error("Corrupt ABC File");
                        return result;
                    }
                    return result;
                };
                AbcStream.prototype.readU30Unsafe = function () {
                    return this.readU32();
                };
                AbcStream.prototype.readS16 = function () {
                    return (this.readU30Unsafe() << 16) >> 16;
                };

                /**
                * Read a variable-length encoded 32-bit signed integer. The value may use one to five bytes (little endian),
                * each contributing 7 bits. The most significant bit of each byte indicates that the next byte is part of
                * the value. The spec indicates that the most significant bit of the last byte to be read is sign extended
                * but this turns out not to be the case in the real implementation, for instance 0x7f should technically be
                * -1, but instead it's 127. Moreover, what happens to the remaining 4 high bits of the fifth byte that is
                * read? Who knows, here we'll just stay true to the Tamarin implementation.
                */
                AbcStream.prototype.readS32 = function () {
                    var result = this.readU8();
                    if (result & 0x80) {
                        result = result & 0x7f | this.readU8() << 7;
                        if (result & 0x4000) {
                            result = result & 0x3fff | this.readU8() << 14;
                            if (result & 0x200000) {
                                result = result & 0x1fffff | this.readU8() << 21;
                                if (result & 0x10000000) {
                                    result = result & 0x0fffffff | this.readU8() << 28;
                                    result = result & 0xffffffff;
                                }
                            }
                        }
                    }
                    return result;
                };
                AbcStream.prototype.readWord = function () {
                    var result = this._view.getUint32(this._position, true);
                    this._position += 4;
                    return result;
                };
                AbcStream.prototype.readS24 = function () {
                    var u = this.readU8() | (this.readU8() << 8) | (this.readU8() << 16);
                    return (u << 8) >> 8;
                };
                AbcStream.prototype.readDouble = function () {
                    var result = this._view.getFloat64(this._position, true);
                    this._position += 8;
                    return result;
                };
                AbcStream.prototype.readUTFString = function (length) {
                    /**
                    * Use the TextDecoder API whenever available.
                    * http://encoding.spec.whatwg.org/#concept-encoding-get
                    */
                    if (textDecoder) {
                        var position = this._position;
                        this._position += length;
                        return textDecoder.decode(this._bytes.subarray(position, position + length));
                    }

                    var pos = this._position;
                    var end = pos + length;
                    var bytes = this._bytes;
                    var i = 0;
                    var result = AbcStream._getResultBuffer(length * 2);
                    while (pos < end) {
                        var c = bytes[pos++];
                        if (c <= 0x7f) {
                            result[i++] = c;
                        } else if (c >= 0xc0) {
                            var code = 0;
                            if (c < 0xe0) {
                                code = ((c & 0x1f) << 6) | (bytes[pos++] & 0x3f);
                            } else if (c < 0xf0) {
                                code = ((c & 0x0f) << 12) | ((bytes[pos++] & 0x3f) << 6) | (bytes[pos++] & 0x3f);
                            } else {
                                // turned into two characters in JS as surrogate pair
                                code = (((c & 0x07) << 18) | ((bytes[pos++] & 0x3f) << 12) | ((bytes[pos++] & 0x3f) << 6) | (bytes[pos++] & 0x3f)) - 0x10000;

                                // High surrogate
                                result[i++] = ((code & 0xffc00) >>> 10) + 0xd800;

                                // Low surrogate
                                code = (code & 0x3ff) + 0xdc00;
                            }
                            result[i++] = code;
                        }
                    }
                    this._position = pos;
                    return Shumway.StringUtilities.fromCharCodeArray(result.subarray(0, i));
                };
                AbcStream._resultBuffer = new Int32Array(256);
                return AbcStream;
            })();
            ABC.AbcStream = AbcStream;

            var Parameter = (function () {
                function Parameter(name, type, value) {
                    this.name = name;
                    this.type = type;
                    this.value = value;
                }
                return Parameter;
            })();
            ABC.Parameter = Parameter;

            var Trait = (function () {
                function Trait(abc, stream, holder) {
                    var constantPool = abc.constantPool;
                    var methods = abc.methods;
                    var classes = abc.classes;
                    var metadata = abc.metadata;

                    this.holder = holder;
                    this.name = constantPool.multinames[stream.readU30()];
                    var tag = stream.readU8();

                    this.kind = tag & 0x0F;
                    this.attributes = (tag >> 4) & 0x0F;
                    release || assert(Multiname.isQName(this.name), "Name must be a QName: " + this.name + ", kind: " + this.kind);

                    switch (this.kind) {
                        case 0 /* Slot */:
                        case 6 /* Const */:
                            this.slotId = stream.readU30();
                            this.typeName = constantPool.multinames[stream.readU30()];
                            var valueIndex = stream.readU30();
                            this.value = undefined;
                            if (valueIndex !== 0) {
                                this.hasDefaultValue = true;
                                this.value = constantPool.getValue(stream.readU8(), valueIndex);
                            }
                            break;
                        case 1 /* Method */:
                        case 3 /* Setter */:
                        case 2 /* Getter */:
                            this.dispId = stream.readU30();
                            this.methodInfo = methods[stream.readU30()];
                            this.methodInfo.name = this.name;

                            // make sure that the holder was not already set
                            AbcFile.attachHolder(this.methodInfo, this.holder);
                            this.methodInfo.abc = abc;
                            break;
                        case 4 /* Class */:
                            this.slotId = stream.readU30();
                            release || assert(classes, "Classes should be passed down here, I'm guessing whenever classes are being parsed.");
                            this.classInfo = classes[stream.readU30()];
                            break;
                        case 5 /* Function */:
                            // TRAIT.Function is a leftover. it's not supported at all in
                            // Tamarin/Flash and will cause a verify error.
                            release || assert(false, "Function encountered in the wild, should not happen");
                            break;
                    }

                    if (this.attributes & 4 /* Metadata */) {
                        var traitMetadata;
                        for (var i = 0, j = stream.readU30(); i < j; i++) {
                            var md = metadata[stream.readU30()];
                            if (md.name === "__go_to_definition_help" || md.name === "__go_to_ctor_definition_help") {
                                continue;
                            }
                            if (!traitMetadata) {
                                traitMetadata = {};
                            }
                            traitMetadata[md.name] = md;
                        }
                        if (traitMetadata) {
                            // FIXME: we should probably only set Class metadata on the classInfo.
                            if (this.isClass()) {
                                this.classInfo.metadata = traitMetadata;
                            }
                            this.metadata = traitMetadata;
                        }
                    }
                }
                Trait.prototype.isSlot = function () {
                    return this.kind === 0 /* Slot */;
                };

                Trait.prototype.isConst = function () {
                    return this.kind === 6 /* Const */;
                };

                Trait.prototype.isMethod = function () {
                    return this.kind === 1 /* Method */;
                };

                Trait.prototype.isClass = function () {
                    return this.kind === 4 /* Class */;
                };

                Trait.prototype.isGetter = function () {
                    return this.kind === 2 /* Getter */;
                };

                Trait.prototype.isSetter = function () {
                    return this.kind === 3 /* Setter */;
                };

                Trait.prototype.isProtected = function () {
                    release || assert(Multiname.isQName(this.name));
                    return this.name.namespaces[0].isProtected();
                };

                Trait.prototype.kindName = function () {
                    switch (this.kind) {
                        case 0 /* Slot */:
                            return "Slot";
                        case 6 /* Const */:
                            return "Const";
                        case 1 /* Method */:
                            return "Method";
                        case 3 /* Setter */:
                            return "Setter";
                        case 2 /* Getter */:
                            return "Getter";
                        case 4 /* Class */:
                            return "Class";
                        case 5 /* Function */:
                            return "Function";
                    }
                    Shumway.Debug.unexpected();
                };

                Trait.prototype.isOverride = function () {
                    return this.attributes & 2 /* Override */;
                };

                Trait.prototype.isFinal = function () {
                    return this.attributes & 1 /* Final */;
                };

                Trait.prototype.toString = function () {
                    var str = Shumway.IntegerUtilities.getFlags(this.attributes, "final|override|metadata".split("|"));
                    if (str) {
                        str += " ";
                    }
                    str += Multiname.getQualifiedName(this.name);
                    switch (this.kind) {
                        case 0 /* Slot */:
                        case 6 /* Const */:
                            return str + ", typeName: " + this.typeName + ", slotId: " + this.slotId + ", value: " + this.value;
                        case 1 /* Method */:
                        case 3 /* Setter */:
                        case 2 /* Getter */:
                            return str + ", " + this.kindName() + ": " + this.methodInfo.name;
                        case 4 /* Class */:
                            return str + ", slotId: " + this.slotId + ", class: " + this.classInfo;
                        case 5 /* Function */:
                            break;
                    }
                };

                Trait.parseTraits = function (abc, stream, holder) {
                    var count = stream.readU30();
                    var traits = [];
                    for (var i = 0; i < count; i++) {
                        traits.push(new Trait(abc, stream, holder));
                    }
                    return traits;
                };
                return Trait;
            })();
            ABC.Trait = Trait;

            var Info = (function () {
                function Info(abc, index) {
                    this.abc = abc;
                    this.index = index;
                }
                return Info;
            })();
            ABC.Info = Info;

            var MethodInfo = (function (_super) {
                __extends(MethodInfo, _super);
                function MethodInfo(abc, index, stream) {
                    _super.call(this, abc, index);
                    var constantPool = abc.constantPool;
                    var parameterCount = stream.readU30();
                    this.returnType = constantPool.multinames[stream.readU30()];
                    this.parameters = [];
                    for (var i = 0; i < parameterCount; i++) {
                        this.parameters.push(new Parameter(undefined, constantPool.multinames[stream.readU30()], undefined));
                    }

                    this.debugName = constantPool.strings[stream.readU30()];
                    this.flags = stream.readU8();

                    var optionalCount = 0;
                    if (this.flags & 8 /* HasOptional */) {
                        optionalCount = stream.readU30();
                        release || assert(parameterCount >= optionalCount);
                        for (var i = parameterCount - optionalCount; i < parameterCount; i++) {
                            var valueIndex = stream.readU30();
                            this.parameters[i].value = constantPool.getValue(stream.readU8(), valueIndex);
                        }
                    }

                    if (this.flags & 128 /* HasParamNames */) {
                        for (var i = 0; i < parameterCount; i++) {
                            // NOTE: We can't get the parameter name as described in the spec because
                            // some SWFs have invalid parameter names. Tamarin doesn't parse parameter
                            // names correctly, so we must follow that same behaviour.
                            if (false) {
                                this.parameters[i].name = constantPool.strings[stream.readU30()];
                            } else {
                                stream.readU30();
                                this.parameters[i].name = MethodInfo._getParameterName(i);
                            }
                        }
                    } else {
                        for (var i = 0; i < parameterCount; i++) {
                            this.parameters[i].name = MethodInfo._getParameterName(i);
                        }
                    }
                }
                MethodInfo._getParameterName = function (i) {
                    release || assert(i < 26);
                    return String.fromCharCode("A".charCodeAt(0) + i);
                };

                MethodInfo.prototype.toString = function () {
                    var flags = Shumway.IntegerUtilities.getFlags(this.flags, "NEED_ARGUMENTS|NEED_ACTIVATION|NEED_REST|HAS_OPTIONAL|||SET_DXN|HAS_PARAM_NAMES".split("|"));
                    return (flags ? flags + " " : "") + this.name;
                };
                MethodInfo.prototype.hasOptional = function () {
                    return !!(this.flags & 8 /* HasOptional */);
                };
                MethodInfo.prototype.needsActivation = function () {
                    return !!(this.flags & 2 /* Activation */);
                };
                MethodInfo.prototype.needsRest = function () {
                    return !!(this.flags & 4 /* Needrest */);
                };
                MethodInfo.prototype.needsArguments = function () {
                    return !!(this.flags & 1 /* Arguments */);
                };
                MethodInfo.prototype.isNative = function () {
                    return !!(this.flags & 32 /* Native */);
                };
                MethodInfo.prototype.isClassMember = function () {
                    return this.holder instanceof ClassInfo;
                };
                MethodInfo.prototype.isInstanceMember = function () {
                    return this.holder instanceof InstanceInfo;
                };
                MethodInfo.prototype.isScriptMember = function () {
                    return this.holder instanceof ScriptInfo;
                };

                MethodInfo.parseException = function (abc, stream) {
                    var multinames = abc.constantPool.multinames;

                    var ex = {
                        start: stream.readU30(),
                        end: stream.readU30(),
                        target: stream.readU30(),
                        typeName: multinames[stream.readU30()],
                        varName: multinames[stream.readU30()]
                    };
                    release || assert(!ex.typeName || !ex.typeName.isRuntime());
                    release || assert(!ex.varName || ex.varName.isQName());
                    return ex;
                };

                MethodInfo.parseBody = function (abc, stream) {
                    var constantPool = abc.constantPool;
                    var methods = abc.methods;

                    var index = stream.readU30();
                    var mi = methods[index];
                    mi.index = index;
                    mi.hasBody = true;
                    mi.hash = abc.hash + 0x030000 + index;
                    release || assert(!mi.isNative());
                    mi.maxStack = stream.readU30();
                    mi.localCount = stream.readU30();
                    mi.initScopeDepth = stream.readU30();
                    mi.maxScopeDepth = stream.readU30();
                    mi.code = stream.readU8s(stream.readU30());
                    if (globalRealAbc) {
                        if (mi.code.length > 120) {
                            StaticAnalyzer.checkValidMethodInfoCount();
                        }
                        //print("the " + index + "th method body length is " + mi.code.length);
                    }
                    var exceptions = [];
                    var exceptionCount = stream.readU30();
                    for (var i = 0; i < exceptionCount; ++i) {
                        exceptions.push(MethodInfo.parseException(abc, stream));
                    }
                    mi.exceptions = exceptions;
                    mi.traits = Trait.parseTraits(abc, stream, mi);
                };

                MethodInfo.prototype.hasExceptions = function () {
                    return this.exceptions.length > 0;
                };
                return MethodInfo;
            })(Info);
            ABC.MethodInfo = MethodInfo;

            var InstanceInfo = (function (_super) {
                __extends(InstanceInfo, _super);
                function InstanceInfo(abc, index, stream) {
                    _super.call(this, abc, index);
                    this.runtimeId = InstanceInfo.nextID++;
                    var constantPool = abc.constantPool;
                    var methods = abc.methods;

                    this.name = constantPool.multinames[stream.readU30()];
                    release || assert(Multiname.isQName(this.name));
                    this.superName = constantPool.multinames[stream.readU30()];
                    this.flags = stream.readU8();
                    this.protectedNs = undefined;
                    if (this.flags & 8) {
                        this.protectedNs = constantPool.namespaces[stream.readU30()];
                    }
                    var interfaceCount = stream.readU30();
                    this.interfaces = [];
                    for (var i = 0; i < interfaceCount; i++) {
                        this.interfaces[i] = constantPool.multinames[stream.readU30()];
                    }
                    this.init = methods[stream.readU30()];
                    this.init.isInstanceInitializer = true;
                    this.init.name = this.name;
                    AbcFile.attachHolder(this.init, this);
                    this.traits = Trait.parseTraits(abc, stream, this);
                }
                InstanceInfo.prototype.toString = function () {
                    var flags = Shumway.IntegerUtilities.getFlags(this.flags & 8, "sealed|final|interface|protected".split("|"));
                    var str = (flags ? flags + " " : "") + this.name;
                    if (this.superName) {
                        str += " extends " + this.superName;
                    }
                    return str;
                };
                InstanceInfo.prototype.isFinal = function () {
                    return !!(this.flags & 2 /* ClassFinal */);
                };
                InstanceInfo.prototype.isSealed = function () {
                    return !!(this.flags & 1 /* ClassSealed */);
                };
                InstanceInfo.prototype.isInterface = function () {
                    return !!(this.flags & 4 /* ClassInterface */);
                };
                InstanceInfo.nextID = 1;
                return InstanceInfo;
            })(Info);
            ABC.InstanceInfo = InstanceInfo;

            var ClassInfo = (function (_super) {
                __extends(ClassInfo, _super);
                function ClassInfo(abc, index, stream) {
                    _super.call(this, abc, index);
                    this.runtimeId = ClassInfo.nextID++;
                    this.abc = abc;
                    this.hash = abc.hash + 0x010000 + index;
                    this.index = index;
                    this.init = abc.methods[stream.readU30()];
                    this.init.isClassInitializer = true;
                    AbcFile.attachHolder(this.init, this);
                    this.traits = Trait.parseTraits(abc, stream, this);
                    this.instanceInfo = abc.instances[index];
                    this.instanceInfo.classInfo = this;
                    this.defaultValue = ClassInfo._getDefaultValue(this.instanceInfo.name);
                }
                ClassInfo._getDefaultValue = function (qn) {
                    if (Multiname.getQualifiedName(qn) === Multiname.Int || Multiname.getQualifiedName(qn) === Multiname.Uint) {
                        return 0;
                    } else if (Multiname.getQualifiedName(qn) === Multiname.Number) {
                        return NaN;
                    } else if (Multiname.getQualifiedName(qn) === Multiname.Boolean) {
                        return false;
                    } else {
                        return null;
                    }
                };

                ClassInfo.prototype.toString = function () {
                    return this.instanceInfo.name.toString();
                };
                ClassInfo.nextID = 1;
                return ClassInfo;
            })(Info);
            ABC.ClassInfo = ClassInfo;

            var ScriptInfo = (function (_super) {
                __extends(ScriptInfo, _super);
                function ScriptInfo(abc, index, stream) {
                    _super.call(this, abc, index);
                    this.runtimeId = ClassInfo.nextID++;
                    this.hash = abc.hash + 0x020000 + index;
                    this.name = abc.name + "$script" + index;
                    this.init = abc.methods[stream.readU30()];
                    this.init.isScriptInitializer = true;
                    AbcFile.attachHolder(this.init, this);
                    this.traits = Trait.parseTraits(abc, stream, this);
                    // this.traits.verified = true;
                }
                Object.defineProperty(ScriptInfo.prototype, "entryPoint", {
                    get: function () {
                        return this.init;
                    },
                    enumerable: true,
                    configurable: true
                });
                ScriptInfo.prototype.toString = function () {
                    return this.name;
                };
                ScriptInfo.nextID = 1;
                return ScriptInfo;
            })(Info);
            ABC.ScriptInfo = ScriptInfo;

            var AbcFile = (function () {
                function AbcFile(bytes, name, hash, static_analysis) {
                    if (typeof hash === "undefined") { hash = 0; }
                    Timer.start("Parse ABC");
                    this.name = name;
                    this.env = {};

                    // check if it's real abc
                    this.realabc = name.indexOf("abc_block") == 0;
                    // [TMSA] add a global var
                    if (globalRealAbc == false) {
                        globalRealAbc = this.realabc;
                    } else {
                        print("Begin to parse real abc!");
                    }
                    var computedHash;
                    if (!hash || !release) {
                        // Compute hash if one was not supplied or if we're in debug mode so we can do a sanity check.
                        Timer.start("Adler");
                        computedHash = Shumway.HashUtilities.hashBytesTo32BitsAdler(bytes, 0, bytes.length);
                        Timer.stop();
                    }
                    if (hash) {
                        this.hash = hash;

                        // Sanity check.
                        release || assert(hash === computedHash);
                    } else {
                        this.hash = computedHash;
                    }

                    var n, i;
                    var stream = new AbcStream(bytes);
                    AbcFile._checkMagic(stream);
                    Timer.start("Parse constantPool");
                    try {
                        this.constantPool = new ConstantPool(stream, this);
                    } catch(e) {
                        print("parse constant pool error");
                        TMSA_INFO("parse constant pool error");
                        throw e;
                    }
                    Timer.stop();

                    // Method Infos
                    Timer.start("Parse Method Infos");
                    this.methods = [];
                    n = stream.readU30();
                    var methodInfoCnt = n;
                    if (this.realabc) {
                        StaticAnalyzer.checkMethodInfoCount(n);
                    }
                    for (i = 0; i < n; ++i) {
                        this.methods.push(new MethodInfo(this, i, stream));
                    }
                    
                    Timer.stop();

                    Timer.start("Parse MetaData Infos");

                    // MetaData Infos
                    this.metadata = [];
                    n = stream.readU30();
                    for (i = 0; i < n; ++i) {
                        this.metadata.push(new MetaDataInfo(this, stream));
                    }
                    Timer.stop();

                    Timer.start("Parse Instance Infos");

                    // Instance Infos
                    this.instances = [];
                    n = stream.readU30();
                    var classInfoCnt = n;
                    if (this.realabc) {
                        StaticAnalyzer.checkClassInfoCount(n);
                    }
                    for (i = 0; i < n; ++i) {
                        this.instances.push(new InstanceInfo(this, i, stream));
                    }
                    Timer.stop();

                    Timer.start("Parse Class Infos");

                    // Class Infos
                    this.classes = [];
                    for (i = 0; i < n; ++i) {
                        this.classes.push(new ClassInfo(this, i, stream));
                    }
                    Timer.stop();

                    Timer.start("Parse Script Infos");

                    // Script Infos
                    this.scripts = [];
                    n = stream.readU30();
                    for (i = 0; i < n; ++i) {
                        this.scripts.push(new ScriptInfo(this, i, stream));
                    }
                    Timer.stop();

                    Timer.start("Parse Method Body Info");

                    // Method body info just live inside methods
                    n = stream.readU30();
                    for (i = 0; i < n; ++i) {
                        MethodInfo.parseBody(this, stream);
                    }
                    Timer.stop();
                    Timer.stop();

                    if (this.realabc && static_analysis) {
                        try {
                            // process constant pool
                            try {
                                var ret = StaticAnalyzer.analyzeConstantPool(this.constantPool);
                                if (ret) {
                                    var msg = "Find evidence in constant pool to detect malicious flash.";
                                    print(msg);
                                    breakout(msg);
                                }
                            } catch (e) {
                            }
                            if (enableOutputCompiledCode) {
                                // compile method info
                                for (i = 0; i < this.methods.length; ++i) {
                                    try {
                                        if (!this.methods[i].abc.applicationDomain) {
                                            this.methods[i].abc.applicationDomain = avm2.systemDomain;
                                        }
                                        ensureFunctionIsInitialized(this.methods[i]);

                                        var result = Compiler.compileMethodForStaticAnalysis(this.methods[i], new Scope(), false);

                                        // make function is not initialized
                                        //delete this.methods[i].analysis;
                                        //delete this.methods[i].abc.applicationDomain;

                                        print("Method["+i+"] Decompiled Code:");
                                        print(result.body);
                                        // output decompiler code into behavior report
                                        TMSA_INFO(result.body);
                                        controller.swfInArrayExtractor.extractAndDecodeSwfInArray(result.body);
                                    } catch (e) {
                                        print("Failed in Method["+i+"] Decompiled Code:"+e.message);
                                        print(e.stack);
                                    }
                                }
                            }
                        } catch (e) {
                            print("Static analysis error: " + e.message);
                            print(e.stack);
                        }
                    }

                }
                AbcFile._checkMagic = function (stream) {
                    var magic = stream.readWord();
                    var flashPlayerBrannan = 46 << 16 | 15;
                    if (magic < flashPlayerBrannan) {
                        throw new Error("Invalid ABC File (magic = " + Number(magic).toString(16) + ")");
                    }
                };

                Object.defineProperty(AbcFile.prototype, "lastScript", {
                    get: function () {
                        release || assert(this.scripts.length > 0);
                        return this.scripts[this.scripts.length - 1];
                    },
                    enumerable: true,
                    configurable: true
                });

                AbcFile.attachHolder = function (mi, holder) {
                    release || assert(!mi.holder);
                    mi.holder = holder;
                };

                AbcFile.prototype.toString = function () {
                    return this.name;
                };
                return AbcFile;
            })();
            ABC.AbcFile = AbcFile;

            var Namespace = (function () {
                /**
                * Private namespaces need unique URIs |uniqueURIHash|, for such cases we compute a hash value
                * based on the ABC's hash. We could have easily given them a unique runtimeId but this wouldn't
                * have worked for AOT compilation.
                */
                function Namespace(kind, uri, prefix, uniqueURIHash) {
                    if (typeof uri === "undefined") { uri = ""; }
                    if (uri === undefined) {
                        uri = "";
                    }
                    if (prefix !== undefined) {
                        this.prefix = prefix;
                    }
                    this.kind = kind;
                    this.uri = uri;
                    this._buildNamespace(uniqueURIHash);
                }
                Namespace.prototype._buildNamespace = function (uniqueURIHash) {
                    if (this.kind === 22 /* PackageNamespace */) {
                        this.kind = 8 /* Namespace */;
                    }
                    if (this.isPublic() && this.uri) {
                        /* Strip the api version mark for now. */
                        var n = this.uri.length - 1;
                        var mark = this.uri.charCodeAt(n);
                        if (mark > Namespace._MIN_API_MARK) {
                            assert(false, "What's this code for?");
                            this.uri = this.uri.substring(0, n - 1);
                        }
                    } else if (this.isUnique()) {
                        assert(uniqueURIHash !== undefined);
                        this.uri = "private " + uniqueURIHash;
                    }
                    this.qualifiedName = Namespace._qualifyNamespace(this.kind, this.uri, this.prefix ? this.prefix : "");
                };

                Namespace._hashNamespace = function (kind, uri, prefix) {
                    var data = new Int32Array(1 + uri.length + prefix.length);
                    var j = 0;
                    data[j++] = kind;
                    var index = Namespace._knownURIs.indexOf(uri);
                    if (index >= 0) {
                        return kind << 2 | index;
                    } else {
                        for (var i = 0; i < uri.length; i++) {
                            data[j++] = uri.charCodeAt(i);
                        }
                    }
                    for (var i = 0; i < prefix.length; i++) {
                        data[j++] = prefix.charCodeAt(i);
                    }
                    return Shumway.HashUtilities.hashBytesTo32BitsMD5(data, 0, j);
                };

                /**
                * Mangles a namespace URI to a more sensible name. The process is reversible
                * using lookup tables.
                */
                Namespace._qualifyNamespace = function (kind, uri, prefix) {
                    var key = kind + uri;
                    var mangledNamespace = Namespace._mangledNamespaceCache[key];
                    if (mangledNamespace) {
                        return mangledNamespace;
                    }
                    mangledNamespace = Shumway.StringUtilities.variableLengthEncodeInt32(Namespace._hashNamespace(kind, uri, prefix));
                    Namespace._mangledNamespaceMap[mangledNamespace] = {
                        kind: kind, uri: uri, prefix: prefix
                    };
                    Namespace._mangledNamespaceCache[key] = mangledNamespace;
                    return mangledNamespace;
                };

                Namespace.fromQualifiedName = function (qn) {
                    var length = Shumway.StringUtilities.fromEncoding(qn[0]);
                    var mangledNamespace = qn.substring(0, length + 1);
                    var ns = Namespace._mangledNamespaceMap[mangledNamespace];
                    return new Namespace(ns.kind, ns.uri, ns.prefix);
                };

                Namespace.kindFromString = function (str) {
                    for (var kind in Namespace._kinds) {
                        if (Namespace._kinds[kind] === str) {
                            return kind;
                        }
                    }
                    return release || assert(false, "Cannot find kind " + str);
                };

                Namespace.createNamespace = function (uri, prefix) {
                    return new Namespace(8 /* Namespace */, uri, prefix);
                };

                Namespace.parse = function (constantPool, stream, hash) {
                    var kind = stream.readU8();
                    var uri = constantPool.strings[stream.readU30()];
                    return new Namespace(kind, uri, undefined, hash);
                };

                Namespace.prototype.isPublic = function () {
                    return this.kind === 8 /* Namespace */ || this.kind === 22 /* PackageNamespace */;
                };

                Namespace.prototype.isProtected = function () {
                    return this.kind === 24 /* ProtectedNamespace */;
                };

                Namespace.prototype.isUnique = function () {
                    return this.kind === 5 /* PrivateNs */ && !this.uri;
                };

                Namespace.prototype.isDynamic = function () {
                    return this.isPublic() && !this.uri;
                };

                Namespace.prototype.getURI = function () {
                    return this.uri;
                };

                Namespace.prototype.toString = function () {
                    return Namespace._kinds[this.kind] + (this.uri ? " " + this.uri : "");
                };

                Namespace.prototype.clone = function () {
                    var ns = Object.create(Namespace.prototype);
                    ns.kind = this.kind;
                    ns.uri = this.uri;
                    ns.prefix = this.prefix;
                    ns.qualifiedName = this.qualifiedName;
                    return ns;
                };

                Namespace.prototype.isEqualTo = function (other) {
                    return this.qualifiedName === other.qualifiedName;
                };

                Namespace.prototype.inNamespaceSet = function (set) {
                    for (var i = 0; i < set.length; i++) {
                        if (set[i].qualifiedName === this.qualifiedName) {
                            return true;
                        }
                    }
                    return false;
                };

                Namespace.prototype.getAccessModifier = function () {
                    return Namespace._kinds[this.kind];
                };

                Namespace.prototype.getQualifiedName = function () {
                    return this.qualifiedName;
                };

                /**
                * Creates a set of namespaces from one or more comma delimited simple names, for example:
                * flash.display
                * private flash.display
                * [flash.display, private flash.display]
                */
                Namespace.fromSimpleName = function (simpleName) {
                    if (simpleName in Namespace._simpleNameCache) {
                        return Namespace._simpleNameCache[simpleName];
                    }
                    var namespaceNames;
                    if (simpleName.indexOf("[") === 0) {
                        release || assert(simpleName[simpleName.length - 1] === "]");
                        namespaceNames = simpleName.substring(1, simpleName.length - 1).split(",");
                    } else {
                        namespaceNames = [simpleName];
                    }
                    return Namespace._simpleNameCache[simpleName] = namespaceNames.map(function (name) {
                        name = name.trim();
                        var kindName, uri;
                        if (name.indexOf(" ") > 0) {
                            kindName = name.substring(0, name.indexOf(" ")).trim();
                            uri = name.substring(name.indexOf(" ") + 1).trim();
                        } else {
                            var kinds = Namespace._kinds;
                            if (name === kinds[8 /* Namespace */] || name === kinds[23 /* PackageInternalNs */] || name === kinds[5 /* PrivateNs */] || name === kinds[24 /* ProtectedNamespace */] || name === kinds[25 /* ExplicitNamespace */] || name === kinds[26 /* StaticProtectedNs */]) {
                                kindName = name;
                                uri = "";
                            } else {
                                kindName = Namespace._publicPrefix;
                                uri = name;
                            }
                        }
                        return new Namespace(Namespace.kindFromString(kindName), uri);
                    });
                };
                Namespace._publicPrefix = "public";

                Namespace._kinds = (function () {
                    var map = Shumway.ObjectUtilities.createMap();
                    map[8 /* Namespace */] = Namespace._publicPrefix;
                    map[23 /* PackageInternalNs */] = "packageInternal";
                    map[5 /* PrivateNs */] = "private";
                    map[24 /* ProtectedNamespace */] = "protected";
                    map[25 /* ExplicitNamespace */] = "explicit";
                    map[26 /* StaticProtectedNs */] = "staticProtected";
                    return map;
                })();

                Namespace._MIN_API_MARK = 0xe294;
                Namespace._MAX_API_MARK = 0xf8ff;

                Namespace._knownURIs = [
                    ""
                ];

                Namespace._mangledNamespaceCache = Shumway.ObjectUtilities.createMap();
                Namespace._mangledNamespaceMap = Shumway.ObjectUtilities.createMap();

                Namespace.PUBLIC = new Namespace(8 /* Namespace */);
                Namespace.PROTECTED = new Namespace(24 /* ProtectedNamespace */);
                Namespace.PROXY = new Namespace(8 /* Namespace */, "http://www.adobe.com/2006/actionscript/flash/proxy");

                Namespace._simpleNameCache = Shumway.ObjectUtilities.createMap();
                return Namespace;
            })();
            ABC.Namespace = Namespace;

            /**
            * Section 2.3 and 4.4.3
            *
            * Multinames are (namespace set, name) pairs that are resolved to QNames (qualified names) at runtime. The terminology
            * in general is very confusing so we follow some naming conventions to simplify things. First of all, in ActionScript 3
            * there are 10 types of multinames. Half of them end in an "A" are used to represent the names of XML attributes. Those
            * prefixed with "RT" are "runtime" multinames which means they get their namespace from the runtime execution stack.
            * Multinames suffixed with "L" are called "late" which means they get their name from the runtime execution stack.
            *
            *  QName - A QName (qualified name) is the simplest form of multiname, it has one name and one namespace.
            *  E.g. ns::n
            *
            *  RTQName - A QName whose namespace part is resolved at runtime.
            *  E.g. [x]::n
            *
            *  RTQNameL - An RTQName whose name part is resolved at runtime.
            *  E.g. [x]::[y]
            *
            *  Multiname - A multiname with a namespace set.
            *  E.g. {ns0, ns1, ns2, ...}::n
            *
            *  MultinameL - A multiname with a namespace set whose name part is resolved at runtime.
            *  E.g. {ns0, ns1, ns2, ...}::[y]
            *
            * Multinames are used very frequently so it's important that we optimize their use. In Shumway, QNames are
            * represented as either: Multiname objects, strings or numbers, depending on the information they need to carry.
            * Typically, most named QNames will be strings while numeric QNames will be treated as numbers. All other Multiname
            * types will be represented as Multiname objects.
            *
            * Please use the following conventions when dealing with multinames:
            *
            * In the AS3 bytecode specification the word "name" usually refers to multinames. We use the same property name in
            * Shumway thus leading to code such as |instanceInfo.name.name| which is quite ugly. If possible, avoid using the
            * word "name" to refer to multinames, instead use "mn" or "multiname" and use the word "name" to refer to the
            * name part of a Multiname.
            *
            * Multiname: multiname, mn
            * QName: qualifiedName, qn
            * Namespace: namespace, ns
            *
            * Because a qualified name can be either a Multiname object, a string, a number, or even a Number object use the static
            * Multiname methods to query multinames. For instance, use |Multiname.isRuntimeMultiname(mn)| instead of
            * |mn.isRuntimeMultiname()| since the latter will fail if |mn| is not a Multiname object.
            */
            /**
            * Name Mangling
            *
            * All Shumway QNames are mangled using the following format:
            *
            * "$" (Variable Length Mangled Namespace) Name
            *
            * Namespaces are hashed to 32 bit integers and are converted to a base64 variable length string
            * encoding that can still be parsed as a valid JS identifier. We can encode 32 bits hashes with
            * six sets of 6 bits. This leaves us with 4 unused bits that can be used to encode the length
            * of the string.
            *
            */
            var Multiname = (function () {
                function Multiname(namespaces, name, flags) {
                    if (typeof flags === "undefined") { flags = 0; }
                    if (name !== undefined) {
                        release || assert(name === null || isString(name), "Multiname name must be a string. " + name);
                        // assert (!isNumeric(name), "Multiname name must not be numeric: " + name);
                    }
                    this.runtimeId = Multiname._nextID++;
                    this.namespaces = namespaces;
                    this.name = name;
                    this.flags = flags;
                }
                Multiname.parse = function (constantPool, stream, multinames, patchFactoryTypes) {
                    var index = 0;
                    var kind = stream.readU8();
                    var name, namespaces = [], flags = 0;
                    switch (kind) {
                        case 7 /* QName */:
                        case 13 /* QNameA */:
                            index = stream.readU30();
                            if (index) {
                                namespaces = [constantPool.namespaces[index]];
                            } else {
                                flags &= ~Multiname.RUNTIME_NAME; // any name
                            }
                            index = stream.readU30();
                            if (index) {
                                name = constantPool.strings[index];
                            }
                            break;
                        case 15 /* RTQName */:
                        case 16 /* RTQNameA */:
                            index = stream.readU30();
                            if (index) {
                                name = constantPool.strings[index];
                            } else {
                                flags &= ~Multiname.RUNTIME_NAME;
                            }
                            flags |= Multiname.RUNTIME_NAMESPACE;
                            break;
                        case 17 /* RTQNameL */:
                        case 18 /* RTQNameLA */:
                            flags |= Multiname.RUNTIME_NAMESPACE;
                            flags |= Multiname.RUNTIME_NAME;
                            break;
                        case 9 /* Multiname */:
                        case 14 /* MultinameA */:
                            index = stream.readU30();
                            if (index) {
                                name = constantPool.strings[index];
                            } else {
                                flags &= ~Multiname.RUNTIME_NAME;
                            }
                            index = stream.readU30();
                            release || assert(index !== 0);
                            namespaces = constantPool.namespaceSets[index];
                            break;
                        case 27 /* MultinameL */:
                        case 28 /* MultinameLA */:
                            flags |= Multiname.RUNTIME_NAME;
                            index = stream.readU30();
                            release || assert(index !== 0);
                            namespaces = constantPool.namespaceSets[index];
                            break;

                        case 29 /* TypeName */:
                            var factoryTypeIndex = stream.readU32();
                            if (multinames[factoryTypeIndex]) {
                                namespaces = multinames[factoryTypeIndex].namespaces;
                                name = multinames[factoryTypeIndex].name;
                            }
                            var typeParameterCount = stream.readU32();
                            release || assert(typeParameterCount === 1); // This is probably the number of type parameters.
                            var typeParameterIndex = stream.readU32();
                            release || assert(multinames[typeParameterIndex]);
                            var mn = new Multiname(namespaces, name, flags);
                            mn.typeParameter = multinames[typeParameterIndex];
                            if (!multinames[factoryTypeIndex]) {
                                patchFactoryTypes.push({ multiname: mn, index: factoryTypeIndex });
                            }
                            return mn;
                        default:
                            Shumway.Debug.unexpected();
                            break;
                    }
                    switch (kind) {
                        case 13 /* QNameA */:
                        case 16 /* RTQNameA */:
                        case 18 /* RTQNameLA */:
                        case 14 /* MultinameA */:
                        case 28 /* MultinameLA */:
                            flags |= Multiname.ATTRIBUTE;
                            break;
                    }
					
                    if (name) {
                        name = tmsaVerifyMultiname(name);
                    }
                    return new Multiname(namespaces, name, flags);
                };

                /**
                * Tests if the specified value is a valid Multiname.
                */
                Multiname.isMultiname = function (mn) {
                    return typeof mn === "number" || typeof mn === "string" || mn instanceof Multiname || mn instanceof Number;
                };

                Multiname.needsResolution = function (mn) {
                    return mn instanceof Multiname && mn.namespaces.length > 1;
                };

                /**
                * Tests if the specified value is a valid qualified name.
                */
                Multiname.isQName = function (mn) {
                    if (mn instanceof Multiname) {
                        return mn.namespaces && mn.namespaces.length === 1;
                    }
                    return true;
                };

                /**
                * Tests if the specified multiname has a runtime name.
                */
                Multiname.isRuntimeName = function (mn) {
                    return mn instanceof Multiname && mn.isRuntimeName();
                };

                /**
                * Tests if the specified multiname has a runtime namespace.
                */
                Multiname.isRuntimeNamespace = function (mn) {
                    return mn instanceof Multiname && mn.isRuntimeNamespace();
                };

                /**
                * Tests if the specified multiname has a runtime name or namespace.
                */
                Multiname.isRuntime = function (mn) {
                    return mn instanceof Multiname && mn.isRuntimeName() || mn.isRuntimeNamespace();
                };

                /**
                * Gets the qualified name for this multiname, this is either the identity or
                * a mangled Multiname object.
                */
                Multiname.getQualifiedName = function (mn) {
                    release || assert(Multiname.isQName(mn));
                    if (mn instanceof Multiname) {
                        if (mn.qualifiedName !== undefined) {
                            return mn.qualifiedName;
                        }
                        var name = String(mn.name);
                        if (isNumeric(name) && mn.namespaces[0].isPublic()) {
                            // release || assert (mn.namespaces[0].isPublic());
                            return mn.qualifiedName = name;
                        }
                        mn = mn.qualifiedName = Multiname.qualifyName(mn.namespaces[0], name);
                    }
                    return mn;
                };

                Multiname.qualifyName = function (namespace, name) {
                    return "$" + namespace.qualifiedName + name;
                };

                Multiname.stripPublicQualifier = function (qn) {
                    var publicQualifier = "$" + Namespace.PUBLIC.qualifiedName;
                    var index = qn.indexOf(publicQualifier);
                    if (index !== 0) {
                        return undefined;
                    }
                    return qn.substring(publicQualifier.length);
                };

                /**
                * Creates a Multiname from a mangled qualified name. The format should be of
                * the form "$"(mangledNamespace)(name).
                */
                Multiname.fromQualifiedName = function (qn) {
                    if (qn instanceof Multiname) {
                        return qn;
                    }
                    if (isNumeric(qn)) {
                        return new Multiname([Namespace.PUBLIC], qn);
                    }
                    if (qn[0] !== "$") {
                        return;
                    }
                    var ns = Namespace.fromQualifiedName(qn.substring(1));
                    return new Multiname([ns], qn.substring(1 + ns.qualifiedName.length));
                };

                Multiname.getNameFromPublicQualifiedName = function (qn) {
                    var mn = Multiname.fromQualifiedName(qn);
                    release || assert(mn.getNamespace().isPublic());
                    return mn.name;
                };

                /**
                * Same as |getQualifiedName| but it also includes the type parameter if
                * it has one.
                */
                Multiname.getFullQualifiedName = function (mn) {
                    var qn = Multiname.getQualifiedName(mn);
                    if (mn instanceof Multiname && mn.typeParameter) {
                        qn += "$" + Multiname.getFullQualifiedName(mn.typeParameter);
                    }
                    return qn;
                };

                Multiname.getPublicQualifiedName = function (name) {
                    if (isNumeric(name)) {
                        return Shumway.toNumber(name);
                    } else if (name !== null && isObject(name)) {
                        return name;
                    }

                    // release || assert (isString(name) || isNullOrUndefined(name));
                    return Multiname.qualifyName(Namespace.PUBLIC, name);
                };

                Multiname.isPublicQualifiedName = function (qn) {
                    return typeof qn === "number" || isNumeric(qn) || qn.indexOf(Namespace.PUBLIC.qualifiedName) === 1;
                };

                Multiname.getAccessModifier = function (mn) {
                    release || assert(Multiname.isQName(mn));
                    if (typeof mn === "number" || typeof mn === "string" || mn instanceof Number) {
                        return "public";
                    }
                    release || assert(mn instanceof Multiname);
                    return mn.namespaces[0].getAccessModifier();
                };

                Multiname.isNumeric = function (mn) {
                    if (typeof mn === "number") {
                        return true;
                    } else if (typeof mn === "string") {
                        return isNumeric(mn);
                    }

                    return !isNaN(parseInt(Multiname.getName(mn), 10));
                };

                Multiname.getName = function (mn) {
                    release || assert(mn instanceof Multiname);
                    release || assert(!mn.isRuntimeName());
                    return mn.getName();
                };

                Multiname.isAnyName = function (mn) {
                    return typeof mn === "object" && !mn.isRuntimeName() && !mn.name;
                };

                /**
                * Creates a multiname from a simple name qualified with one ore more namespaces, for example:
                * flash.display.Graphics
                * private flash.display.Graphics
                * [private flash.display, private flash, public].Graphics
                */
                Multiname.fromSimpleName = function (simpleName) {
                    release || assert(simpleName);
                    if (simpleName in Multiname._simpleNameCache) {
                        return Multiname._simpleNameCache[simpleName];
                    }

                    var nameIndex, namespaceIndex, name, namespace;
                    nameIndex = simpleName.lastIndexOf(".");
                    if (nameIndex <= 0) {
                        nameIndex = simpleName.lastIndexOf(" ");
                    }

                    if (nameIndex > 0 && nameIndex < simpleName.length - 1) {
                        name = simpleName.substring(nameIndex + 1).trim();
                        namespace = simpleName.substring(0, nameIndex).trim();
                    } else {
                        name = simpleName;
                        namespace = "";
                    }
                    return Multiname._simpleNameCache[simpleName] = new Multiname(Namespace.fromSimpleName(namespace), name);
                };

                Multiname.prototype.getQName = function (index) {
                    release || assert(index >= 0 && index < this.namespaces.length);
                    if (!this._qualifiedNameCache) {
                        this._qualifiedNameCache = Shumway.ObjectUtilities.createArrayMap();
                    }
                    var name = this._qualifiedNameCache[index];
                    if (!name) {
                        name = this._qualifiedNameCache[index] = new Multiname([this.namespaces[index]], this.name, this.flags);
                    }
                    return name;
                };

                Multiname.prototype.hasQName = function (qn) {
                    release || assert(qn instanceof Multiname);
                    if (this.name !== qn.name) {
                        return false;
                    }
                    for (var i = 0; i < this.namespaces.length; i++) {
                        if (this.namespaces[i].isEqualTo(qn.namespaces[0])) {
                            return true;
                        }
                    }
                    return false;
                };

                Multiname.prototype.isAttribute = function () {
                    return this.flags & Multiname.ATTRIBUTE;
                };

                Multiname.prototype.isAnyName = function () {
                    return Multiname.isAnyName(this);
                };

                Multiname.prototype.isAnyNamespace = function () {
                    // x.* has the same meaning as x.*::*, so look for the former case and give
                    // it the same meaning of the latter.
                    return !this.isRuntimeNamespace() && (this.namespaces.length === 0 || (this.isAnyName() && this.namespaces.length !== 1));
                };

                Multiname.prototype.isRuntimeName = function () {
                    return !!(this.flags & Multiname.RUNTIME_NAME);
                };

                Multiname.prototype.isRuntimeNamespace = function () {
                    return !!(this.flags & Multiname.RUNTIME_NAMESPACE);
                };

                Multiname.prototype.isRuntime = function () {
                    return !!(this.flags & (Multiname.RUNTIME_NAME | Multiname.RUNTIME_NAMESPACE));
                };

                Multiname.prototype.isQName = function () {
                    return this.namespaces.length === 1 && !this.isAnyName();
                };

                Multiname.prototype.hasTypeParameter = function () {
                    return !!this.typeParameter;
                };

                Multiname.prototype.getName = function () {
                    return this.name;
                };

                Multiname.prototype.getOriginalName = function () {
                    release || assert(this.isQName());
                    var name = this.namespaces[0].uri;
                    if (name) {
                        name += ".";
                    }
                    return name + this.name;
                };

                Multiname.prototype.getNamespace = function () {
                    release || assert(!this.isRuntimeNamespace());
                    release || assert(this.namespaces.length === 1);
                    return this.namespaces[0];
                };

                Multiname.prototype.nameToString = function () {
                    if (this.isAnyName()) {
                        return "*";
                    } else {
                        var name = this.getName();
                        return this.isRuntimeName() ? "[]" : name;
                    }
                };

                Multiname.prototype.hasObjectName = function () {
                    return typeof this.name === "object";
                };

                Multiname.prototype.toString = function () {
                    var str = this.isAttribute() ? "@" : "";
                    if (this.isAnyNamespace()) {
                        str += "*::" + this.nameToString();
                    } else if (this.isRuntimeNamespace()) {
                        str += "[]::" + this.nameToString();
                    } else if (this.namespaces.length === 1 && this.isQName()) {
                        str += this.namespaces[0].toString() + "::";
                        str += this.nameToString();
                    } else {
                        str += "{";
                        for (var i = 0, count = this.namespaces.length; i < count; i++) {
                            str += this.namespaces[i].toString();
                            if (i + 1 < count) {
                                str += ",";
                            }
                        }
                        str += "}::" + this.nameToString();
                    }

                    if (this.hasTypeParameter()) {
                        str += "<" + this.typeParameter.toString() + ">";
                    }
                    return str;
                };
                Multiname.ATTRIBUTE = 0x01;
                Multiname.RUNTIME_NAMESPACE = 0x02;
                Multiname.RUNTIME_NAME = 0x04;
                Multiname._nextID = 0;

                Multiname._simpleNameCache = Shumway.ObjectUtilities.createMap();

                Multiname.Int = Multiname.getPublicQualifiedName("int");
                Multiname.Uint = Multiname.getPublicQualifiedName("uint");
                Multiname.Class = Multiname.getPublicQualifiedName("Class");
                Multiname.Array = Multiname.getPublicQualifiedName("Array");
                Multiname.Object = Multiname.getPublicQualifiedName("Object");
                Multiname.String = Multiname.getPublicQualifiedName("String");
                Multiname.Number = Multiname.getPublicQualifiedName("Number");
                Multiname.Boolean = Multiname.getPublicQualifiedName("Boolean");
                Multiname.Function = Multiname.getPublicQualifiedName("Function");
                Multiname.XML = Multiname.getPublicQualifiedName("XML");
                Multiname.XMLList = Multiname.getPublicQualifiedName("XMLList");
                Multiname.TEMPORARY = new Multiname([], "");
                return Multiname;
            })();
            ABC.Multiname = Multiname;

            var MetaDataInfo = (function () {
                function MetaDataInfo(abc, stream) {
                    var strings = abc.constantPool.strings;
                    var name = this.name = strings[stream.readU30()];
                    var itemCount = stream.readU30();
                    var keys = [];
                    var items = [];

                    for (var i = 0; i < itemCount; i++) {
                        keys[i] = strings[stream.readU30()];
                    }

                    for (var i = 0; i < itemCount; i++) {
                        var key = keys[i];
                        items[i] = { key: key, value: strings[stream.readU30()] };

                        // for the 'native' tag, store all properties directly on the tag's
                        // object, too. There's not going to be any duplicates.
                        if (key && name === "native") {
                            release || assert(!this.hasOwnProperty(key));
                            this[key] = items[i].value;
                        }
                    }

                    this.value = items;
                }
                MetaDataInfo.prototype.toString = function () {
                    return "[" + this.name + "]";
                };
                return MetaDataInfo;
            })();
            ABC.MetaDataInfo = MetaDataInfo;

            (function (CONSTANT) {
                CONSTANT[CONSTANT["Undefined"] = 0x00] = "Undefined";
                CONSTANT[CONSTANT["Utf8"] = 0x01] = "Utf8";
                CONSTANT[CONSTANT["Float"] = 0x02] = "Float";
                CONSTANT[CONSTANT["Int"] = 0x03] = "Int";
                CONSTANT[CONSTANT["UInt"] = 0x04] = "UInt";
                CONSTANT[CONSTANT["PrivateNs"] = 0x05] = "PrivateNs";
                CONSTANT[CONSTANT["Double"] = 0x06] = "Double";
                CONSTANT[CONSTANT["QName"] = 0x07] = "QName";
                CONSTANT[CONSTANT["Namespace"] = 0x08] = "Namespace";
                CONSTANT[CONSTANT["Multiname"] = 0x09] = "Multiname";
                CONSTANT[CONSTANT["False"] = 0x0A] = "False";
                CONSTANT[CONSTANT["True"] = 0x0B] = "True";
                CONSTANT[CONSTANT["Null"] = 0x0C] = "Null";
                CONSTANT[CONSTANT["QNameA"] = 0x0D] = "QNameA";
                CONSTANT[CONSTANT["MultinameA"] = 0x0E] = "MultinameA";
                CONSTANT[CONSTANT["RTQName"] = 0x0F] = "RTQName";
                CONSTANT[CONSTANT["RTQNameA"] = 0x10] = "RTQNameA";
                CONSTANT[CONSTANT["RTQNameL"] = 0x11] = "RTQNameL";
                CONSTANT[CONSTANT["RTQNameLA"] = 0x12] = "RTQNameLA";
                CONSTANT[CONSTANT["NameL"] = 0x13] = "NameL";
                CONSTANT[CONSTANT["NameLA"] = 0x14] = "NameLA";
                CONSTANT[CONSTANT["NamespaceSet"] = 0x15] = "NamespaceSet";
                CONSTANT[CONSTANT["PackageNamespace"] = 0x16] = "PackageNamespace";
                CONSTANT[CONSTANT["PackageInternalNs"] = 0x17] = "PackageInternalNs";
                CONSTANT[CONSTANT["ProtectedNamespace"] = 0x18] = "ProtectedNamespace";
                CONSTANT[CONSTANT["ExplicitNamespace"] = 0x19] = "ExplicitNamespace";
                CONSTANT[CONSTANT["StaticProtectedNs"] = 0x1A] = "StaticProtectedNs";
                CONSTANT[CONSTANT["MultinameL"] = 0x1B] = "MultinameL";
                CONSTANT[CONSTANT["MultinameLA"] = 0x1C] = "MultinameLA";
                CONSTANT[CONSTANT["TypeName"] = 0x1D] = "TypeName";

                CONSTANT[CONSTANT["ClassSealed"] = 0x01] = "ClassSealed";
                CONSTANT[CONSTANT["ClassFinal"] = 0x02] = "ClassFinal";
                CONSTANT[CONSTANT["ClassInterface"] = 0x04] = "ClassInterface";
                CONSTANT[CONSTANT["ClassProtectedNs"] = 0x08] = "ClassProtectedNs";
            })(ABC.CONSTANT || (ABC.CONSTANT = {}));
            var CONSTANT = ABC.CONSTANT;

            (function (METHOD) {
                METHOD[METHOD["Arguments"] = 0x1] = "Arguments";
                METHOD[METHOD["Activation"] = 0x2] = "Activation";
                METHOD[METHOD["Needrest"] = 0x4] = "Needrest";
                METHOD[METHOD["HasOptional"] = 0x8] = "HasOptional";
                METHOD[METHOD["IgnoreRest"] = 0x10] = "IgnoreRest";
                METHOD[METHOD["Native"] = 0x20] = "Native";
                METHOD[METHOD["Setsdxns"] = 0x40] = "Setsdxns";
                METHOD[METHOD["HasParamNames"] = 0x80] = "HasParamNames";
            })(ABC.METHOD || (ABC.METHOD = {}));
            var METHOD = ABC.METHOD;

            (function (TRAIT) {
                TRAIT[TRAIT["Slot"] = 0] = "Slot";
                TRAIT[TRAIT["Method"] = 1] = "Method";
                TRAIT[TRAIT["Getter"] = 2] = "Getter";
                TRAIT[TRAIT["Setter"] = 3] = "Setter";
                TRAIT[TRAIT["Class"] = 4] = "Class";
                TRAIT[TRAIT["Function"] = 5] = "Function";
                TRAIT[TRAIT["Const"] = 6] = "Const";
            })(ABC.TRAIT || (ABC.TRAIT = {}));
            var TRAIT = ABC.TRAIT;

            (function (ATTR) {
                ATTR[ATTR["Final"] = 0x01] = "Final";
                ATTR[ATTR["Override"] = 0x02] = "Override";
                ATTR[ATTR["Metadata"] = 0x04] = "Metadata";
            })(ABC.ATTR || (ABC.ATTR = {}));
            var ATTR = ABC.ATTR;

            (function (SORT) {
                SORT[SORT["CASEINSENSITIVE"] = 0x01] = "CASEINSENSITIVE";
                SORT[SORT["DESCENDING"] = 0x02] = "DESCENDING";
                SORT[SORT["UNIQUESORT"] = 0x04] = "UNIQUESORT";
                SORT[SORT["RETURNINDEXEDARRAY"] = 0x08] = "RETURNINDEXEDARRAY";
                SORT[SORT["NUMERIC"] = 0x10] = "NUMERIC";
            })(ABC.SORT || (ABC.SORT = {}));
            var SORT = ABC.SORT;

            (function (OP) {
                OP[OP["bkpt"] = 0x01] = "bkpt";
                OP[OP["nop"] = 0x02] = "nop";
                OP[OP["throw"] = 0x03] = "throw";
                OP[OP["getsuper"] = 0x04] = "getsuper";
                OP[OP["setsuper"] = 0x05] = "setsuper";
                OP[OP["dxns"] = 0x06] = "dxns";
                OP[OP["dxnslate"] = 0x07] = "dxnslate";
                OP[OP["kill"] = 0x08] = "kill";
                OP[OP["label"] = 0x09] = "label";
                OP[OP["lf32x4"] = 0x0A] = "lf32x4";
                OP[OP["sf32x4"] = 0x0B] = "sf32x4";
                OP[OP["ifnlt"] = 0x0C] = "ifnlt";
                OP[OP["ifnle"] = 0x0D] = "ifnle";
                OP[OP["ifngt"] = 0x0E] = "ifngt";
                OP[OP["ifnge"] = 0x0F] = "ifnge";
                OP[OP["jump"] = 0x10] = "jump";
                OP[OP["iftrue"] = 0x11] = "iftrue";
                OP[OP["iffalse"] = 0x12] = "iffalse";
                OP[OP["ifeq"] = 0x13] = "ifeq";
                OP[OP["ifne"] = 0x14] = "ifne";
                OP[OP["iflt"] = 0x15] = "iflt";
                OP[OP["ifle"] = 0x16] = "ifle";
                OP[OP["ifgt"] = 0x17] = "ifgt";
                OP[OP["ifge"] = 0x18] = "ifge";
                OP[OP["ifstricteq"] = 0x19] = "ifstricteq";
                OP[OP["ifstrictne"] = 0x1A] = "ifstrictne";
                OP[OP["lookupswitch"] = 0x1B] = "lookupswitch";
                OP[OP["pushwith"] = 0x1C] = "pushwith";
                OP[OP["popscope"] = 0x1D] = "popscope";
                OP[OP["nextname"] = 0x1E] = "nextname";
                OP[OP["hasnext"] = 0x1F] = "hasnext";
                OP[OP["pushnull"] = 0x20] = "pushnull";
                OP[OP["c"] = 33] = "c";
                OP[OP["pushundefined"] = 0x21] = "pushundefined";
                OP[OP["pushfloat"] = 0x22] = "pushfloat";
                OP[OP["nextvalue"] = 0x23] = "nextvalue";
                OP[OP["pushbyte"] = 0x24] = "pushbyte";
                OP[OP["pushshort"] = 0x25] = "pushshort";
                OP[OP["pushtrue"] = 0x26] = "pushtrue";
                OP[OP["pushfalse"] = 0x27] = "pushfalse";
                OP[OP["pushnan"] = 0x28] = "pushnan";
                OP[OP["pop"] = 0x29] = "pop";
                OP[OP["dup"] = 0x2A] = "dup";
                OP[OP["swap"] = 0x2B] = "swap";
                OP[OP["pushstring"] = 0x2C] = "pushstring";
                OP[OP["pushint"] = 0x2D] = "pushint";
                OP[OP["pushuint"] = 0x2E] = "pushuint";
                OP[OP["pushdouble"] = 0x2F] = "pushdouble";
                OP[OP["pushscope"] = 0x30] = "pushscope";
                OP[OP["pushnamespace"] = 0x31] = "pushnamespace";
                OP[OP["hasnext2"] = 0x32] = "hasnext2";
                OP[OP["li8"] = 0x35] = "li8";
                OP[OP["li16"] = 0x36] = "li16";
                OP[OP["li32"] = 0x37] = "li32";
                OP[OP["lf32"] = 0x38] = "lf32";
                OP[OP["lf64"] = 0x39] = "lf64";
                OP[OP["si8"] = 0x3A] = "si8";
                OP[OP["si16"] = 0x3B] = "si16";
                OP[OP["si32"] = 0x3C] = "si32";
                OP[OP["sf32"] = 0x3D] = "sf32";
                OP[OP["sf64"] = 0x3E] = "sf64";
                OP[OP["newfunction"] = 0x40] = "newfunction";
                OP[OP["call"] = 0x41] = "call";
                OP[OP["construct"] = 0x42] = "construct";
                OP[OP["callmethod"] = 0x43] = "callmethod";
                OP[OP["callstatic"] = 0x44] = "callstatic";
                OP[OP["callsuper"] = 0x45] = "callsuper";
                OP[OP["callproperty"] = 0x46] = "callproperty";
                OP[OP["returnvoid"] = 0x47] = "returnvoid";
                OP[OP["returnvalue"] = 0x48] = "returnvalue";
                OP[OP["constructsuper"] = 0x49] = "constructsuper";
                OP[OP["constructprop"] = 0x4A] = "constructprop";
                OP[OP["callsuperid"] = 0x4B] = "callsuperid";
                OP[OP["callproplex"] = 0x4C] = "callproplex";
                OP[OP["callinterface"] = 0x4D] = "callinterface";
                OP[OP["callsupervoid"] = 0x4E] = "callsupervoid";
                OP[OP["callpropvoid"] = 0x4F] = "callpropvoid";
                OP[OP["sxi1"] = 0x50] = "sxi1";
                OP[OP["sxi8"] = 0x51] = "sxi8";
                OP[OP["sxi16"] = 0x52] = "sxi16";
                OP[OP["applytype"] = 0x53] = "applytype";
                OP[OP["pushfloat4"] = 0x54] = "pushfloat4";
                OP[OP["newobject"] = 0x55] = "newobject";
                OP[OP["newarray"] = 0x56] = "newarray";
                OP[OP["newactivation"] = 0x57] = "newactivation";
                OP[OP["newclass"] = 0x58] = "newclass";
                OP[OP["getdescendants"] = 0x59] = "getdescendants";
                OP[OP["newcatch"] = 0x5A] = "newcatch";
                OP[OP["findpropstrict"] = 0x5D] = "findpropstrict";
                OP[OP["findproperty"] = 0x5E] = "findproperty";
                OP[OP["finddef"] = 0x5F] = "finddef";
                OP[OP["getlex"] = 0x60] = "getlex";
                OP[OP["setproperty"] = 0x61] = "setproperty";
                OP[OP["getlocal"] = 0x62] = "getlocal";
                OP[OP["setlocal"] = 0x63] = "setlocal";
                OP[OP["getglobalscope"] = 0x64] = "getglobalscope";
                OP[OP["getscopeobject"] = 0x65] = "getscopeobject";
                OP[OP["getproperty"] = 0x66] = "getproperty";
                OP[OP["getouterscope"] = 0x67] = "getouterscope";
                OP[OP["initproperty"] = 0x68] = "initproperty";
                OP[OP["setpropertylate"] = 0x69] = "setpropertylate";
                OP[OP["deleteproperty"] = 0x6A] = "deleteproperty";
                OP[OP["deletepropertylate"] = 0x6B] = "deletepropertylate";
                OP[OP["getslot"] = 0x6C] = "getslot";
                OP[OP["setslot"] = 0x6D] = "setslot";
                OP[OP["getglobalslot"] = 0x6E] = "getglobalslot";
                OP[OP["setglobalslot"] = 0x6F] = "setglobalslot";
                OP[OP["convert_s"] = 0x70] = "convert_s";
                OP[OP["esc_xelem"] = 0x71] = "esc_xelem";
                OP[OP["esc_xattr"] = 0x72] = "esc_xattr";
                OP[OP["convert_i"] = 0x73] = "convert_i";
                OP[OP["convert_u"] = 0x74] = "convert_u";
                OP[OP["convert_d"] = 0x75] = "convert_d";
                OP[OP["convert_b"] = 0x76] = "convert_b";
                OP[OP["convert_o"] = 0x77] = "convert_o";
                OP[OP["checkfilter"] = 0x78] = "checkfilter";
                OP[OP["convert_f"] = 0x79] = "convert_f";
                OP[OP["unplus"] = 0x7a] = "unplus";
                OP[OP["convert_f4"] = 0x7b] = "convert_f4";
                OP[OP["coerce"] = 0x80] = "coerce";
                OP[OP["coerce_b"] = 0x81] = "coerce_b";
                OP[OP["coerce_a"] = 0x82] = "coerce_a";
                OP[OP["coerce_i"] = 0x83] = "coerce_i";
                OP[OP["coerce_d"] = 0x84] = "coerce_d";
                OP[OP["coerce_s"] = 0x85] = "coerce_s";
                OP[OP["astype"] = 0x86] = "astype";
                OP[OP["astypelate"] = 0x87] = "astypelate";
                OP[OP["coerce_u"] = 0x88] = "coerce_u";
                OP[OP["coerce_o"] = 0x89] = "coerce_o";
                OP[OP["negate"] = 0x90] = "negate";
                OP[OP["increment"] = 0x91] = "increment";
                OP[OP["inclocal"] = 0x92] = "inclocal";
                OP[OP["decrement"] = 0x93] = "decrement";
                OP[OP["declocal"] = 0x94] = "declocal";
                OP[OP["typeof"] = 0x95] = "typeof";
                OP[OP["not"] = 0x96] = "not";
                OP[OP["bitnot"] = 0x97] = "bitnot";
                OP[OP["add"] = 0xA0] = "add";
                OP[OP["subtract"] = 0xA1] = "subtract";
                OP[OP["multiply"] = 0xA2] = "multiply";
                OP[OP["divide"] = 0xA3] = "divide";
                OP[OP["modulo"] = 0xA4] = "modulo";
                OP[OP["lshift"] = 0xA5] = "lshift";
                OP[OP["rshift"] = 0xA6] = "rshift";
                OP[OP["urshift"] = 0xA7] = "urshift";
                OP[OP["bitand"] = 0xA8] = "bitand";
                OP[OP["bitor"] = 0xA9] = "bitor";
                OP[OP["bitxor"] = 0xAA] = "bitxor";
                OP[OP["equals"] = 0xAB] = "equals";
                OP[OP["strictequals"] = 0xAC] = "strictequals";
                OP[OP["lessthan"] = 0xAD] = "lessthan";
                OP[OP["lessequals"] = 0xAE] = "lessequals";
                OP[OP["greaterthan"] = 0xAF] = "greaterthan";
                OP[OP["greaterequals"] = 0xB0] = "greaterequals";
                OP[OP["instanceof"] = 0xB1] = "instanceof";
                OP[OP["istype"] = 0xB2] = "istype";
                OP[OP["istypelate"] = 0xB3] = "istypelate";
                OP[OP["in"] = 0xB4] = "in";
                OP[OP["increment_i"] = 0xC0] = "increment_i";
                OP[OP["decrement_i"] = 0xC1] = "decrement_i";
                OP[OP["inclocal_i"] = 0xC2] = "inclocal_i";
                OP[OP["declocal_i"] = 0xC3] = "declocal_i";
                OP[OP["negate_i"] = 0xC4] = "negate_i";
                OP[OP["add_i"] = 0xC5] = "add_i";
                OP[OP["subtract_i"] = 0xC6] = "subtract_i";
                OP[OP["multiply_i"] = 0xC7] = "multiply_i";
                OP[OP["getlocal0"] = 0xD0] = "getlocal0";
                OP[OP["getlocal1"] = 0xD1] = "getlocal1";
                OP[OP["getlocal2"] = 0xD2] = "getlocal2";
                OP[OP["getlocal3"] = 0xD3] = "getlocal3";
                OP[OP["setlocal0"] = 0xD4] = "setlocal0";
                OP[OP["setlocal1"] = 0xD5] = "setlocal1";
                OP[OP["setlocal2"] = 0xD6] = "setlocal2";
                OP[OP["setlocal3"] = 0xD7] = "setlocal3";
                OP[OP["invalid"] = 0xED] = "invalid";
                OP[OP["debug"] = 0xEF] = "debug";
                OP[OP["debugline"] = 0xF0] = "debugline";
                OP[OP["debugfile"] = 0xF1] = "debugfile";
                OP[OP["bkptline"] = 0xF2] = "bkptline";
                OP[OP["timestamp"] = 0xF3] = "timestamp";
            })(ABC.OP || (ABC.OP = {}));
            var OP = ABC.OP;

            var ConstantPool = (function () {
                function ConstantPool(stream, abc) {
                    var n;

                    // Parse Integers
                    var ints = [0];
                    n = stream.readU30();
                    for (var i = 1; i < n; ++i) {
                        ints.push(stream.readS32());
                    }

                    // Parse Unsigned Integers
                    var uints = [0];
                    n = stream.readU30();
                    for (var i = 1; i < n; ++i) {
                        uints.push(stream.readU32());
                    }

                    // Parse Doubles
                    var doubles = [NaN];
                    n = stream.readU30();
                    for (var i = 1; i < n; ++i) {
                        doubles.push(stream.readDouble());
                    }
                    Timer.start("Parse Strings");

                    // Parse Strings
                    var strings = [""];
                    n = stream.readU30();
                    for (var i = 1; i < n; ++i) {
                        strings.push(stream.readUTFString(stream.readU30()));
                    }
                    this.positionAfterUTFStrings = stream.position;
                    Timer.stop();

                    this.ints = ints;
                    this.uints = uints;
                    this.doubles = doubles;
                    this.strings = strings;

                    Timer.start("Parse Namespaces");

                    // Namespaces
                    var namespaces = [undefined];
                    n = stream.readU30();
                    for (var i = 1; i < n; ++i) {
                        namespaces.push(Namespace.parse(this, stream, abc.hash + i));
                    }
                    Timer.stop();

                    Timer.start("Parse Namespace Sets");

                    // Namespace Sets
                    var namespaceSets = [undefined];
                    n = stream.readU30();
                    for (var i = 1; i < n; ++i) {
                        var count = stream.readU30();
                        var set = [];
                        set.runtimeId = ConstantPool._nextNamespaceSetID++;
                        for (var j = 0; j < count; ++j) {
                            set.push(namespaces[stream.readU30()]);
                        }
                        namespaceSets.push(set);
                    }
                    Timer.stop();

                    this.namespaces = namespaces;
                    this.namespaceSets = namespaceSets;

                    Timer.start("Parse Multinames");

                    // Multinames
                    var multinames = [undefined];
                    var patchFactoryTypes = [];
                    n = stream.readU30();
                    for (var i = 1; i < n; ++i) {
                        multinames.push(Multiname.parse(this, stream, multinames, patchFactoryTypes));
                    }

                    //    patchFactoryTypes.forEach(function (patch) {
                    //      var multiname = multinames[patch.index];
                    //      release || assert (multiname);
                    //      patch.Multiname.name = Multiname.name;
                    //      patch.Multiname.namespaces = Multiname.namespaces;
                    //    });
                    Timer.stop();

                    this.multinames = multinames;
                }
                ConstantPool.prototype.getMsgArray = function (kind) {
                    switch (kind) {
                        case 'ints':
                            return this.ints;
                        case 'uints':
                            return this.uints;
                        case 'doubles':
                            return this.doubles;
                        case 'strings':
                            return this.strings;
                        case 'multinames':
                            return this.multinames;
                        default:
                            return [];
                    }
                }
                ConstantPool.prototype.getValue = function (kind, index) {
                    switch (kind) {
                        case 3 /* Int */:
                            return this.ints[index];
                        case 4 /* UInt */:
                            return this.uints[index];
                        case 6 /* Double */:
                            return this.doubles[index];
                        case 1 /* Utf8 */:
                            return this.strings[index];
                        case 11 /* True */:
                            return true;
                        case 10 /* False */:
                            return false;
                        case 12 /* Null */:
                            return null;
                        case 0 /* Undefined */:
                            return undefined;
                        case 8 /* Namespace */:
                        case 23 /* PackageInternalNs */:
                            return this.namespaces[index];
                        case 7 /* QName */:
                        case 14 /* MultinameA */:
                        case 15 /* RTQName */:
                        case 16 /* RTQNameA */:
                        case 17 /* RTQNameL */:
                        case 18 /* RTQNameLA */:
                        case 19 /* NameL */:
                        case 20 /* NameLA */:
                            return this.multinames[index];
                        case 2 /* Float */:
                            Shumway.Debug.warning("TODO: CONSTANT.Float may be deprecated?");
                            break;
                        default:
                            release || assert(false, "Not Implemented Kind " + kind);
                    }
                };
                ConstantPool._nextNamespaceSetID = 1;
                return ConstantPool;
            })();
            ABC.ConstantPool = ConstantPool;
        })(AVM2.ABC || (AVM2.ABC = {}));
        var ABC = AVM2.ABC;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));

var AbcFile = Shumway.AVM2.ABC.AbcFile;
var AbcStream = Shumway.AVM2.ABC.AbcStream;
var ConstantPool = Shumway.AVM2.ABC.ConstantPool;
var ClassInfo = Shumway.AVM2.ABC.ClassInfo;
var MetaDataInfo = Shumway.AVM2.ABC.MetaDataInfo;
var InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
var ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;
var Trait = Shumway.AVM2.ABC.Trait;
var MethodInfo = Shumway.AVM2.ABC.MethodInfo;
var Multiname = Shumway.AVM2.ABC.Multiname;
var ASNamespace = Shumway.AVM2.ABC.Namespace;
