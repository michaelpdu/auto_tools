// AVM2 Content
ABCFile = function ABCFile(stream, toplevel) {
    this.stream = stream;
    this.toplevel = toplevel;
    this.max_str_length = 0;
    this.check_os_version = false;
    this.famous_url_in_string = false;
    this.parseABC = function () {
        //this.flag = stream.readU32();
        stream.readU8();
        stream.readU8();
        stream.readU8();
        stream.readU8();
        this.abcFileName = stream.SkipString();
        this.minorVersion = stream.readU16();
        this.majorVersion = stream.readU16();
        LOG_DEBUG("major=" + this.majorVersion + ", minor=" + this.minorVersion);

        LOG_DEBUG("parse constantPool");
        this.constantPool = new ConstantPool(this, stream, this.minorVersion >= 17);
        LOG_DEBUG("parse methodPool");
        this.methodPool = new MethodPool(this, stream);
        LOG_DEBUG("parse metadataPool");
        this.metadataPool = new MetadataPool(this, stream);
        LOG_DEBUG("parse classPool");
        this.classPool = new ClassPool(this, stream);
        LOG_DEBUG("parse scriptPool");
        this.scriptPool = new ScriptPool(this, stream);
        LOG_DEBUG("parse methodBodyPool");
        this.methodBodyPool = new MethodBodyPool(this, stream);
    }

    this.resolveClassInfo = function (index) {
        return this.classPool.class[index];
    }

    this.resolveInstanceInfo = function (index) {
        return this.classPool.instance[index];
    }

    this.resolveMethodInfo = function (index) {
        return this.methodPool.methods[index];
    }

    this.resolveMultiname = function (index) {
        return this.constantPool.getMultiname(index);
    }

    this.resolveConstantString = function (index) {
        return this.constantPool.getConstantString(index);
    }

    this.getConstantStringCount = function () {
        return this.constantPool.getConstantStringCount();
    }

    this.getConstantStringCopy = function (index) {
        return new String(this.constantPool.getConstantString(index));
    }

    this.resolveNamespace = function (index) {
        return this.constantPool.getNamespace(index);
    }

    this.resolveNamespaceSet = function (index) {
        return this.constantPool.getNamespaceSet(index);
    }

    this.resolveTypeName = function (typeName) {
        var match = null;
        var obj = null;

        if (null == typeName)
            return AVMPLUS.anyType;

        if (typeName.isBinding()) {
            if (typeName.isAnyName()) {
                return AVMPLUS.anyType;
            }
            var name = typeName.getName();
            if (typeName.isAnyNamespace()) {
                obj = this.toplevel.global[name];
                if (obj && obj != 1) {
                    if (obj instanceof ScriptEnv) {
                        match = obj.global;
                    } else {
                        match = obj;
                    }
                }
            } else {
                for (var i = 0; i < typeName.getNamespaceCount(); i++) {
                    var fullname = "";
                    ns_name = typeName.getNamespaceAt(i).getName();
                    if (ns_name && ns_name.length > 0 && ns_name != "public") {
                        fullname += ns_name + "::";
                    }
                    fullname += name;

                    obj = this.toplevel.global[fullname];

                    if (obj && obj != 1) {
                        if (obj instanceof ScriptEnv) {
                            match = obj.global;

                        } else {
                            match = obj;

                        }
                        break;
                    }
                }
            }

            if (null == match) {
                obj = this.toplevel.global[name];
                if (obj && obj != 1) {
                    if (obj instanceof ScriptEnv) {
                        match = obj.global;
                    } else {
                        match = obj;
                    }
                }
            }
        }
        return match;
    }

    this.resolveConstantValue = function (index, kind) {
        return this.constantPool.getConstantValue(index, kind);
    }

    this.resolveConstantInt = function (index) {
        return this.constantPool.getConstantInt(index);
    }

    this.resolveConstantUInt = function (index) {
        return this.constantPool.getConstantUInt(index);
    }

    this.resolveConstantDouble = function (index) {
        return this.constantPool.getConstantDouble(index);
    }
};

var TopLevel = {};
TopLevel.global = this;
TopLevel.global.as3Name = "global-toplevel";
TopLevel.global.as3Postfix = "@";

function emulate_abc_file(abc_array) {
    for (var i = 0; i < abc_array.length; ++i) {
        var s = abc_array[i];
        var bytecodeBuffer = new BytecodeBuffer();
        if (useHexEncodeData) {
            s = HexDecode(s);
            bytecodeBuffer.initFromRawData(s, 0, s.length);
        } else {
            bytecodeBuffer.initFromString(s, 0, s.length);
        }
        var stream = new InputStream(bytecodeBuffer, 0, bytecodeBuffer.length());
        AVMPLUS.handleActionBlock(stream);
    }
}

function ClassClousure(classname) {
    this.as3Name = classname;
    this.as3Postfix = "$";
}

ClassClousure.prototype = new AS3Object();

ClassClousure.prototype.createInstanceTemplate = function () {

    var class_name = this.classInfo.getName();

    var classInfo = this.classInfo;
    var instanceInfo = this.instanceInfo;


    //var template = new AS3Object(class_name);

    var template;
    if (this.base && !this.base instanceof UnknownObject) {
        template = this.base.createInstance(0, []);
        template.toAS3Object(class_name);
    } else {
        template = new AS3Object(class_name);
    }

    AVMPLUS.bindTraits(template, classInfo.traits, this.abc_pool, this.toplevel);
    AVMPLUS.bindTraits(template, instanceInfo.traits, this.abc_pool, this.toplevel);

    var iinit = this.abc_pool.resolveMethodInfo(instanceInfo.iinit);
    iinit.setName(class_name + "$iinit");
    template.iinit = new MethodEnv(this.abc_pool, this.toplevel, iinit);

    return template;
}

var AVMPLUS = {
    toplevel: TopLevel,
    reset: function () {
        this.instruction_counter = 0;
        this.memoryMonitor = {};
        this.detectedHeapSpray = false;
        this.inSprayLoop = false;
        this.exploitEvidence = false;
        this.lastWriteBytesPC = 0;
    },
    handleActionBlock: function (stream) {
                           this.reset();
                           global_instrumentor.reset();
                           try {
                               var pool = AVMPLUS.parseActionBlock(stream, this.toplevel);
                               var scripts = AVMPLUS.prepareActionPool(pool, this.toplevel);
                               AVMPLUS.handleActionPool(scripts, pool, this.toplevel);
                           } catch (err) {
                               LOG_ERROR(err);
                           }

                           LOG_INFO("\r\n#############################################################################################");
                           LOG_INFO("Total executed instructions: " + this.instruction_counter);
                           LOG_INFO("\r\n");

                           var instrumentor = global_instrumentor;
                           var byteArrayInstances = instrumentor.getMonitoredInstance("ByteArray");
                           if (byteArrayInstances) {
                               for (var i = 0; i < byteArrayInstances.length; i++) {
                                   var arr = byteArrayInstances[i];
                                   if (arr.isShellcode()) {
                                       var hexShellcode = arr.getHexShellcode();
                                       instrumentor.addShellcode(hexShellcode);
                                       AVM_REPORT("actionscript_emulator_shellcode_detected");
                                       this.exploitEvidence = true;
                                   } else if (arr.isSwf()) {
                                       SWF_REPORT(arr.hexEncode());
                                       this.exploitEvidence = true;
                                   }
                                   if (arr.getNopCount() > 100) {
                                       AVM_REPORT("actionscript_emulator_nopslides_detection: " + arr.hexEncode(0, 20) + "......");
                                       this.exploitEvidence = true;
                                   }
                               }
                           }

                           var shellcodes = instrumentor.getShellcodes();
                           for (var i = 0; i < shellcodes.length; i++) {
                               SHELLCODE_REPORT(shellcodes[i]);
                           }

                           if (this.exploitEvidence) {
                               AVM_REPORT("actionscript_emulator_exploit_evidence");
                           }

                           AVM_REPORT("Events:" + instrumentor.events);

                           var msg = "unescape:" + mapOfGetDefinitionByName["unescape"]
                               + ";flash.display.Loader:" + mapOfGetDefinitionByName["flash.display.Loader"]
                               + ";flash.net.URLRequest:" + mapOfGetDefinitionByName["flash.net.URLRequest"]
                               + ";flash.utils.ByteArray:" + mapOfGetDefinitionByName["flash.utils.ByteArray"];
                           AVM_REPORT("Parameter info of getDefinitionByName: " + msg);
                       },

    handleActionPool: function (scripts, pool, toplevel) {
                          LOG_DEBUG("handleActionPool");

                          for (var i = 0; i < pool.getConstantStringCount(); i++) {
                              var s = pool.resolveConstantString(i);
                              if (s && s.length > 100 && IsHexString(s)) {
                                  if (s.indexOf("435753") == 0 || s.indexOf("465753") == 0)
                                      SWF_REPORT(s);
                              }
                          }

                          for (var i = 0; i < scripts.length; i++) {
                              var main = scripts[i];
                              if (main) {
                                  main.coerceEnterNoParam(main.global);
                              }

                              var _global = main.global;
                              for (var j = 0; j < _global.getSlotCount(); j++) {
                                  var slot = _global.getSlot(j);
                                  if (slot) {
                                      if (slot instanceof ClassClousure) {
                                          if (this.handleClass(main, slot, pool, toplevel)) {
                                              return;
                                          }
                                      }
                                  }
                              }
                          }
                      },

    handleClass: function (scriptEnv, classClousure, pool, toplevel) {
                     LOG_DEBUG("Processing class: " + AVMPLUS.format(classClousure));

                     if (classClousure.base && classClousure.base.as3Name) {
                         var basename = classClousure.base.as3Name;
                         if (basename.indexOf("MovieClip") < 0 && basename.indexOf("Sprite") < 0) {
                             LOG_DEBUG("Skip class: " + AVMPLUS.format(classClousure));
                             return 0;
                         }
                     }

                     // create an instance for this class
                     var instance = this.createInstanceOf(classClousure);
                     if (!instance)
                         return 1;
                     // use this instance to invoke un-executed methods
                     for (key in instance) {
                         var value = instance[key];
                         if (value && value instanceof MethodEnv) {
                             if (value.method && !global_instrumentor.isMethodExecuted(value.method.methodId))
                                 this.handleMethod(scriptEnv, instance, value, pool, toplevel)
                         }
                     }
                     return 1;
                 },

    handleMethod: function (scriptEnv, instance, methodEnv, pool, toplevel) {
                      if (!methodEnv.method)
                          return;
                      var argv = methodEnv.method.createBlindArguments(instance);
                      methodEnv.coerceEnter(argv.length, argv);
                  },

    createInstanceOf: function (classClousure) {
                          var iinit = classClousure.iinit;
                          if (!iinit || !iinit.method)
                              return;

                          iinit.method.buildMethodSignature();
                          var argv = iinit.method.createBlindArguments(null);
                          if (!argv)
                              return;

                          return classClousure.createInstance(argv.length, argv);
                      },

    prepareActionPool: function (pool, toplevel) {
                           var scriptPool = pool.scriptPool;
                           var scriptCount = scriptPool.getScriptCount();
                           var scripts = new Array();

                           if (scriptCount == 0)
                               return null;

                           var main = this.initScript(pool, toplevel, scriptPool.getScript(scriptCount - 1));
                           scripts.push(main);

                           for (var i = 0; i < scriptCount - 1; i++) {
                               var script = this.initScript(pool, toplevel, scriptPool.getScript(i));
                               scripts.push(script);
                           }
                           return scripts;
                       },

    initScript: function (pool, toplevel, script) {
                    var scriptEnv = new ScriptEnv(pool, toplevel, script);
                    AVMPLUS.exportDefs(script.traits, scriptEnv);
                    return scriptEnv;
                },

    exportDefs: function (scriptTraits, scriptEnv) {
                    for (var i = 0; i < scriptTraits.length; i++) {
                        var multiname = scriptEnv.pool.resolveMultiname(scriptTraits[i].name);
                        if (multiname) {
                            var name = multiname.getName();
                            if (name) {
                                var ns;
                                if (!multiname.isAnyNamespace())
                                    ns = multiname.getNamespaceAt(0).getName();

                                AVMPLUS.setNamedScript(ns, name, scriptEnv);
                                LOG_DEBUG("exporting " + ns + "::" + name);
                            }

                        }

                    }
                },

    parseActionBlock: function (stream, toplevel) {
                          var abcFile = new ABCFile(stream, toplevel);
                          abcFile.parseABC();
                          return abcFile;
                      },

    getNamedScript: function (name) {
                        return this.toplevel.global[name];
                    },

    setNamedScript: function (ns, name, scriptEnv) {
                        this.toplevel.global[name] = scriptEnv;
                        if (ns) {
                            this.toplevel.global[ns + "::" + name] = scriptEnv;
                        }
                    },

    createDummyType: function (mn) {
                         if (mn instanceof MultinameInfo) {
                             if (mn.isAnyName())
                                 return this.anyType;

                             return new ClassClousure(mn.getName());
                         } else {
                             if (null == mn) {
                                 mn = "";
                                 return new UnknownObject(mn);
                             }
                         }
                     },

    createDummyObject: function (name) {
                           if (name instanceof MultinameInfo) {
                               if (name.isAnyName())
                                   return new UnknownObject("*");

                               return new UnknownObject(name.getFullName());
                           } else {
                               return new UnknownObject(name);
                           }

                       },

    format: function (obj) {
                if (obj == null || obj == undefined)
                    return "undefined";

                if (obj.as3Name && obj.as3Postfix) {
                    return obj.as3Format() + '[' + obj + ']';
                }
                return obj.toString();
            },

    formatOpcode: function (opcode, codeStream, pool) {
                      var format_string = opcodeInfo.getOpcodeName(opcode);
                      switch (opcode) {
                          case OP_debugfile:
                          case OP_pushstring:
                              {
                                  format_string += "  " + pool.resolveConstantString(codeStream.readU30());
                                  break;
                              }
                          case OP_pushbyte:
                              {
                                  format_string += "  " + codeStream.readU8();
                                  break;
                              }
                          case OP_pushint:
                              {
                                  format_string += "  " + pool.resolveConstantInt(codeStream.readU30());
                                  break;
                              }
                          case OP_pushuint:
                              {
                                  format_string += "  " + pool.resolveConstantUInt(codeStream.readU30());
                                  break;
                              }
                          case OP_pushdouble:
                              {
                                  format_string += "  " + pool.resolveConstantDouble(codeStream.readU30());
                                  break;
                              }
                          case OP_pushnamespace:
                              {
                                  var ns = pool.resolveNamespace(codeStream.readU30());
                                  if (ns) {
                                      format_string += ns.getName();
                                  } else {
                                      format_string += "  *";
                                  }
                                  break;
                              }
                          case OP_getsuper:
                          case OP_setsuper:
                          case OP_getproperty:
                          case OP_setproperty:
                          case OP_initproperty:
                          case OP_findpropstrict:
                          case OP_findproperty:
                          case OP_finddef:
                          case OP_deleteproperty:
                          case OP_istype:
                          case OP_coerce:
                          case OP_astype:
                              {
                                  format_string += "  " + pool.constantPool.getMultinameString(codeStream.readU30());
                                  break;
                              }
                          case OP_callproperty:
                          case OP_callpropvoid:
                          case OP_callproplex:
                          case OP_callsuper:
                          case OP_callsupervoid:
                              {
                                  format_string += "  " + pool.constantPool.getMultinameString(codeStream.readU30());
                                  format_string += "  " + codeStream.readU30();
                                  break;
                              }
                          case OP_callstatic:
                          case OP_newfunction:
                              {
                                  var method_id = codeStream.readU30();
                                  var f = pool.resolveMethodInfo(method_id);
                                  format_string += "  id=" + method_id;

                                  if (opcode == OP_callstatic) {
                                      format_string += "  argc=" + codeStream.readU30();
                                  }

                                  if (f)
                                      format_string += " name=" + f.getName();

                                  break;
                              }
                          case OP_newclass:
                              {
                                  var iTraits = pool.resolveInstanceInfo(codeStream.readU30());
                                  if (iTraits) {
                                      format_string += "  " + pool.constantPool.getMultinameString(iTraits.name);
                                  }
                                  break;
                              }
                          case OP_lookupswitch:
                              {
                                  var off = codeStream.getPos();
                                  var target = off + codeStream.readS24();

                                  var maxIndex = codeStream.readu30();
                                  format_string += "  default: " + target + "  maxcase: " + maxIndex;

                                  for (var i = 0; i < maxIndex; i++) {
                                      var target = off + codeStream.readS24();
                                      format_string += "  " + target;
                                  }

                                  break;
                              }
                          case OP_ifnlt:
                          case OP_ifnle:
                          case OP_ifngt:
                          case OP_ifnge:
                          case OP_jump:
                          case OP_iftrue:
                          case OP_iffalse:
                          case OP_ifeq:
                          case OP_ifge:
                          case OP_ifgt:
                          case OP_ifle:
                          case OP_iflt:
                          case OP_ifne:
                          case OP_ifstricteq:
                          case OP_ifstrictne:
                              {
                                  var opreands = {};
                                  AVMPLUS.readOperands(opcode, codeStream, opreands);

                                  format_string += "  " + (codeStream.getPos() + opreands.imm24);

                                  break;
                              }
                          default:
                              switch (opcodeInfo.getOpreandCount(opcode)) {
                                  default: break;
                                  case 1:
                                           format_string += "  " + codeStream.readU30();
                                           break;
                                  case 2:
                                           format_string += "  " + codeStream.readU30() + "  " + codeStream.readU30();
                                           break;
                              }
                              break;
                      }

                      return format_string;
                  },

    readOperands: function (opcode, codeStream, resultVal) {
                      var opCount = opcodeInfo.getOpreandCount(opcode);
                      if (opcode == OP_pushbyte || opcode == OP_debug) {
                          resultVal.imm8 = codeStream.readU8();
                          opCount--;
                      }

                      if (opCount > 0) {
                          if (opcode >= OP_ifnlt && opcode <= OP_lookupswitch) {
                              resultVal.imm24 = codeStream.readS24();
                          } else {
                              resultVal.imm32 = codeStream.readU30();
                          }

                          if (opcode == OP_debug) {
                              --opCount;
                              codeStream.readU8();
                          }
                          if (opCount > 1) {
                              resultVal.imm32b = codeStream.readU30();
                          }
                      }
                  },

    isObject: function (obj) {
                  switch (typeof obj) {
                      case "number":
                      case "Boolean":
                          return false;

                      default:
                          return true;
                  }
              },

    bindTraits: function (target_object, traits, pool, toplevel) {
                    if (!traits)
                        return;

                    for (var i = 0; i < traits.length; i++) {
                        var trait = traits[i];
                        var cpool = pool.constantPool;

                        var slot_id = 0;

                        var mn = cpool.getMultiname(trait.name);
                        var name = mn.getName();
                        var ns = mn.getNamespaceCount() > 0 ? mn.getNamespaceAt(0) : null;
                        var value = undefined;
                        var typeName = undefined;
                        var m = undefined;

                        switch (trait.tag) {
                            case TRAIT_Slot:
                            case TRAIT_Const:

                                value = (trait.vindex == 0) ? undefined : cpool.getConstantValue(trait.vindex, trait.vkind);

                                if (!value && trait.typeName) {

                                    var type = pool.resolveTypeName(pool.resolveMultiname(trait.typeName));

                                    if (type) {
                                        if (type.instance_template)
                                            value = type.instance_template;
                                        else
                                            value = type.createInstance(0, new Array(0));
                                    }
                                }

                                slot_id = target_object.computeSlotId(trait.slotId);
                                break;


                            case TRAIT_Class:
                                slot_id = target_object.computeSlotId(trait.slotId);
                                value = new ClassClousure(mn.getFullName());
                                break;

                            case TRAIT_Function:
                                slot_id = target_object.computeSlotId(trait.slotId);
                                var f = pool.resolveMethodInfo(trait.function);
                                f.setName(name);
                                value = new MethodEnv(pool, toplevel, f);
                                break;

                            case TRAIT_Method:
                            case TRAIT_Getter:
                            case TRAIT_Setter:

                                m = pool.resolveMethodInfo(trait.method);
                                m.setName(name);
                                value = new MethodEnv(pool, toplevel, m);

                                break;

                            default:
                                throw "Invalid trait tag: " + trait.tag;
                        }

                        if (!value)
                            value = this.anyValue;


                        target_object.setProperty(slot_id, ns, name, value);
                        if (m) {
                            target_object.bindMethod(trait.dispId, value);

                        }


                    }

                },

    compare: function (lhs, rhs) {
                 try {
                     if (!(!isNaN((lhs) - (rhs))))
                         return undefined;
                     else
                         return lhs < rhs;
                 } catch (err) {

                 }

                 return undefined;
             },

    equal: function (lhs, rhs) {

               // malicious swf may have version check as below:
               // 73   getlocal      	9
               // 75   pushstring    	"WIN 9,0,115,0"
               // 77   ifne          	L3
               //
               // we always return true in such condition

               if (typeof lhs == "string" && lhs.indexOf("WIN ") == 0)
                   return true;

               if (typeof rhs == "string" && rhs.indexOf("WIN ") == 0)
                   return true;

               try {
                   return lhs == rhs;
               } catch (err) {

               }

               return undefined;
           },

    pow_2_7: Math.pow(2, 7),
    pow_2_8: Math.pow(2, 8),

    pow_2_15: Math.pow(2, 15),
    pow_2_16: Math.pow(2, 16),

    pow_2_23: Math.pow(2, 23),
    pow_2_24: Math.pow(2, 24),

    pow_2_31: Math.pow(2, 31),
    pow_2_32: Math.pow(2, 32),

    convertS16: function (value) {
        result = value & 0xFFFF;

        result = result > this.pow_2_15 - 1 ? result - this.pow_2_16 : result;
        return result;
    },

    anyType: new ClassClousure("*"),

    anyValue: {},

    instruction_counter: 0,

    abc_timeout: 2000,

    method_timeout: 1000,

    memoryMonitor: {}
};

Endian = {
    BIG_ENDIAN: "BIG_ENDIAN",
    LITTLE_ENDIAN: "LITTLE_ENDIAN"
};

ByteArray.as3Name = "ByteArray";
ByteArray.as3Postfix = "$";

function ByteArray() {
    this.nopCode = 0;
}

ByteArray.nop_code_map = new Array(260);
ByteArray.nop_code_map[0x0d] = 1;
ByteArray.nop_code_map[0x0c] = 1;
ByteArray.nop_code_map[0x14] = 1;
ByteArray.nop_code_map[0x90] = 1;

ByteArray.createInstanceImpl = function () {
    newInstance = new ByteArray();
    newInstance.AS3Init();

    global_instrumentor.addMonitoredInstance("ByteArray", newInstance);

    return newInstance;
}

ByteArray.prototype.AS3Init = function () {
    this.as3InternalBuffer = new Array();

    this.length = 0;
    this.position = 0;
    this.endian = Endian.BIG_ENDIAN;
}

ByteArray.prototype.writeBytes = function (bytes, offset, length) {

    AVMPLUS.lastWriteBytesPC = AVMPLUS.pc;

    if (AVMPLUS.detectedHeapSpray)
        return;

    if (bytes instanceof ByteArray) {

        if (AVMPLUS.memoryMonitor[bytes] == undefined) {
            AVMPLUS.memoryMonitor[bytes] = 0;
        } else {
            if (AVMPLUS.memoryMonitor[bytes]++ > 20) {
                global_instrumentor.reportEvent("actionscript_emulator_heapspray_detection\r\n");

                AVMPLUS.detectedHeapSpray = true;
                AVMPLUS.inSprayLoop = true;
                AVMPLUS.exploitEvidence = true;
            }
        }
    }
}

ByteArray.prototype.writeByte = function (b) {

    if (this.position < this.length)
        this.as3InternalBuffer[this.position] = b;
    else
        this.as3InternalBuffer.push(b);

    this.length = this.as3InternalBuffer.length;


    if (this.isNopCode(b))
        this.nopCode++;

    this.position++;
    if (this.position > this.length) this.length = this.position;;

    if (b == this.lastByte) {

        if (++this.repeatCount > 0x80) {
            AVMPLUS.inSprayLoop = true;
            this.repeatCount = 0;
        }
    } else {
        this.repeatCount = 0;
    }
    this.lastByte = b;
}

ByteArray.prototype.as3SetUintProperty = function (index, value) {
    //if ( index >= 0 && index < this.as3InternalBuffer.length )
    //{
    if (value < 0)
        value = 0x100 + value;
    this.as3InternalBuffer[index] = value;
    this.length = this.as3InternalBuffer.length;
    //}

}

ByteArray.prototype.as3GetUintProperty = function (index) {
    return this.as3InternalBuffer[index];
}

ByteArray.prototype.writeInt = function(intVal) {

    var b0, b1, b2, b3;
    if (this.endian == Endian.LITTLE_ENDIAN || this.endian.toLowerCase() == "littleendian") {
        b0 = intVal & 0xFF;
        b1 = (intVal >>> 8) & 0xFF;
        b2 = (intVal >>> 16) & 0xFF;
        b3 = (intVal >>> 24) & 0xFF;
    } else {
        b3 = intVal & 0xFF;
        b2 = (intVal >>> 8) & 0xFF;
        b1 = (intVal >>> 16) & 0xFF;
        b0 = (intVal >>> 24) & 0xFF;
    }
    this.writeBytesInternal(b0, b1, b2, b3);
}

ByteArray.prototype.writeUnsignedInt = function (intVal) {
    this.writeInt(intVal);
}

ByteArray.prototype.writeBytesInternal = function () {
    var len = arguments.length;
    for (var i = 0; i < len; i++) {
        this.writeByte(arguments[i]);
    }

}

ByteArray.prototype.writeMultiByte = function (str, codeing) {
    //if ( coding == "utf-16" ) {
    var len = str.length;
    for (var i = 0; i < len; i++) {
        var b0, b1;
        var code = str.charCodeAt(i);
        if (this.endian == Endian.LITTLE_ENDIAN || this.endian.toLowerCase() == "littleendian") {
            b0 = code & 0xFF;
            b1 = (code >>> 8) & 0xFF;
        } else {
            b1 = code & 0xFF;
            b0 = (code >>> 8) & 0xFF;
        }

        this.writeByte(b0);
        this.writeByte(b1);
    }
    //}
}

ByteArray.prototype.isShellcode = function () {
//todo: tuning how to classify shellcode
    if (this.isSwf())
        return false;

    if (this.length < 100 || this.length > 2048)
        return false;

    if (this.nopCode < 8)
        return false;

    var index = 0;

    var chr_map = new Array(256);
    for (index = 0; index < 256; index++) {
        chr_map[index] = 0;
    }

    var diff = 0;
    var len = this.as3InternalBuffer.length;
    for (index = 0; index < len; index++) {
        var b = this.as3InternalBuffer[index];
        if (0 == chr_map[b] && (++diff) > 15) {
            return true;
        }

        chr_map[b]++;
    }

    return false;
}

ByteArray.prototype.isNopCode = function (b) {

    return ByteArray.nop_code_map[b];
}

ByteArray.prototype.hexEncode = function () {
    var result = '';
    var argLength = arguments.length;
    var start = (argLength > 0) ? arguments[0] : 0;
    var end = (argLength > 1) ? arguments[1] : this.length;

    if (end > this.length)
        end = this.length;

    for (var i = start; i < end; i++) {

        var c = this.as3InternalBuffer[i];
        if (c != undefined)
            c = c.toString(16);
        else
            c = "00";

        if (c.length == 1)
            c = "0" + c;

        result += c;
    }

    return result;
}

ByteArray.prototype.getHexShellcode = function () {
    var buffer = this.as3InternalBuffer;
    var start = 0;
    var end = buffer.length;


    if (buffer.length > 0x2000) {
        for (; start < buffer.length - 1 && buffer[start] == buffer[start + 1]; start++) {}
        for (; end > start && buffer[end] == buffer[end - 1]; end--) {}

        if (start < 0x100)
            start = 0;

        if (end > buffer.length - 0x100)
            end = buffer.length;
    }

    var result = '';

    for (var i = start; i < end; i++) {

        var c = this.as3InternalBuffer[i];
        if (c != undefined)
            c = c.toString(16);
        else
            c = "00";

        if (c.length == 1)
            c = "0" + c;

        result += c;
    }

    return result;

}

ByteArray.prototype.isSwf = function () {

    if (!this.as3InternalBuffer || this.as3InternalBuffer.Length < 100)
        return false;

    var b0 = this.as3InternalBuffer[0];
    var b1 = this.as3InternalBuffer[1];
    var b2 = this.as3InternalBuffer[2];

    return ((0x43 == b0 || 0x46 == b0) && 0x57 == b1 && 0x53 == b2);
}

ByteArray.prototype.getNopCount = function () {
    return this.nopCode;
}

ByteArray.prototype.initFromHexString = function (s) {
    this.as3InternalBuffer = new Array();

    this.length = 0;
    this.position = 0;
    this.endian = Endian.LITTLE_ENDIAN;

    for (var i = 0; i < s.length - 1; i += 2) {
        var high = parseInt(s.charAt(i), 16);
        var low = parseInt(s.charAt(i + 1), 16);


        if (low != NaN && high != NaN) {
            this.writeByte((high << 4) | low);
        }


    }
}



function UnknownObject(name) {
    this.as3Name = name;
    this.as3Postfix = "??";
}

/*
 * Trait tags
 */
var TRAIT_Slot = 0x00;
var TRAIT_Method = 0x01;
var TRAIT_Getter = 0x02;
var TRAIT_Setter = 0x03;
var TRAIT_Class = 0x04;
var TRAIT_Function = 0x05;
var TRAIT_Const = 0x06;

var TRAIT_FLAG_final = 0x01;
var TRAIT_FLAG_override = 0x02;
var TRAIT_FLAG_metadata = 0x04;

// Class flags
var CLASS_FLAG_sealed = 0x01;
var CLASS_FLAG_final = 0x02;
var CLASS_FLAG_interface = 0x04;
var CLASS_FLAG_protected = 0x08;
var CLASS_FLAG_non_nullable = 0x10;

function TraitInfo(cpool, stream) {

    this.cpool = cpool;
    this.name = stream.readU30();
    this.kind = stream.readU8();
    this.tag = this.kind & 0x0F;
    this.flags = (this.kind >>> 4) & 0x0F;

    switch (this.tag) {
        case TRAIT_Slot:
        case TRAIT_Const:
            {
                this.slotId = stream.readU30();
                this.typeName = stream.readU30();
                this.vindex = stream.readU30();


                if (this.vindex > 0)
                    this.vkind = stream.readU8();


                break;
            }

        case TRAIT_Class:
            this.slotId = stream.readU30();
            this.classIndex = stream.readU30();

            break;

        case TRAIT_Function:
            this.slotId = stream.readU30();
            this.function = stream.readU30();
            break;

        case TRAIT_Method:
        case TRAIT_Getter:
        case TRAIT_Setter:
            this.dispId = stream.readU30();
            this.method = stream.readU30();
            break;

        default:
            throw "Invalid trait tag: " + this.tag;
    }

    this.metadataCount = (this.flags & TRAIT_FLAG_metadata) == 0 ? 0 : stream.readU30();
    this.metadata = new Array(this.metadataCount);
    for (var i = 0; i < this.metadataCount; ++i) {
        this.metadata[i] = stream.readU30();
    }

    this.dumpInfo = function () {
        var traitInfo = "";

        switch (this.tag) {
            case TRAIT_Slot:
            case TRAIT_Const:
                {
                    traitInfo += "slot name=" + this.cpool.getMultinameString(this.name) + " slot_id=" + this.slotId + " typename=" + this.cpool.getMultinameString(this.typeName);
                    break;
                }

            case TRAIT_Method:
            case TRAIT_Getter:
            case TRAIT_Setter:
                {
                    traitInfo += "method name=" + this.cpool.getMultinameString(this.name);
                    traitInfo += " disp_id=" + this.dispId + " method_index=" + this.method;
                    break;
                }

            case TRAIT_Class:
                traitInfo += "class name=" + this.cpool.getMultinameString(this.name);
                traitInfo += " slot_id=" + this.slotId + " class_index=" + this.classIndex;

                break;

            case TRAIT_Function:
                traitInfo += "function name=" + this.cpool.getMultinameString(this.name);
                traitInfo += " slot_id=" + this.slotId + " function_index=" + this.function;
                break;

            default:
                //throw "Invalid trait tag: " + this.tag;
                break;
        }

        return traitInfo;

    }

}

function InstanceInfo(classPool, stream) {
    this.classPool = classPool;
    this.cpool = this.classPool.abcFile.constantPool;

    this.name = stream.readU30();
    this.supername = stream.readU30();
    this.flags = stream.readU8();

    if ((this.flags & CLASS_FLAG_protected) != 0)
        this.protectedNs = stream.readU30();

    this.intrfCount = stream.readU30();
    this.interfaces = new Array(this.intrfCount);
    for (var i = 0; i < this.intrfCount; ++i) {
        this.interfaces[i] = stream.readU30();
    }

    this.iinit = stream.readU30();
    this.traitCount = stream.readU30();
    this.traits = new Array(this.traitCount);
    for (var i = 0; i < this.traitCount; ++i) {
        this.traits[i] = new TraitInfo(this.classPool.abcFile.constantPool, stream);
    }

}

InstanceInfo.prototype.getName = function () {
    if (!this.nameString) {
        this.nameString = this.cpool.getMultinameString(this.name);
    }

    return this.nameString;
}

InstanceInfo.prototype.getSuperName = function () {
    if (!this.supername)
        return "";

    if (!this.superNameString) {
        this.superNameString = this.cpool.getMultinameString(this.supername);
    }

    return this.superNameString;
}




function ClassInfo(classPool, stream) {
    this.classPool = classPool;
    this.pool = this.classPool.abcFile;

    this.cinit = stream.readU30();
    this.traitCount = stream.readU30();

    this.traits = new Array(this.traitCount);
    for (var i = 0; i < this.traitCount; ++i) {
        this.traits[i] = new TraitInfo(this.classPool.abcFile.constantPool, stream);
    }

}

ClassInfo.prototype.getName = function () {
    return this.instanceInfo.getName();
}

ClassInfo.prototype.getSuperName = function () {
    return this.instanceInfo.getSuperName();
}

function ClassPool(abcFile, stream) {
    this.abcFile = abcFile;
    this.stream = stream;
    this.classCount = stream.readU30();
    LOG_DEBUG("class count=" + this.classCount);
    if (this.classCount < 10 && this.abcFile.max_str_length > 3000)
    {
        LOG_INFO("find_big_size_string, len="+this.abcFile.max_str_length);        
    }
    if (this.classCount < 10 && this.abcFile.check_os_version && (!this.abcFile.famous_url_in_string))
    {
        LOG_INFO("check_os_version");
    }

    this.scanInstanceInfo = function () {
        this.instance = new Array(this.classCount);
        for (var i = 0; i < this.classCount; ++i) {
            var pos = this.stream.getPos();
            this.instance[i] = new InstanceInfo(this, this.stream);
            var instanceInfo = this.instance[i];
            var cpool = this.abcFile.constantPool;
            var info = pos + ":instance[" + i + "] ";
            info += instanceInfo.getName() + " extends " + instanceInfo.getSuperName();
            info += " interface_count=" + instanceInfo.intrfCount + " iinit_index=" + instanceInfo.iinit + "\r\n";
            info += " trait_count=" + instanceInfo.traits.length + "\r\n";
            for (var j = 0; j < instanceInfo.traits.length; j++) {
                var trait = instanceInfo.traits[j];
                info += "    " + trait.dumpInfo() + "\r\n";
            }
            LOG_DEBUG(info);
        }
    }

    this.scanClassInfo = function () {
        this.class = new Array(this.classCount);
        for (var i = 0; i < this.classCount; ++i) {
            var pos = this.stream.getPos();
            this.class[i] = new ClassInfo(this, this.stream);
            this.class[i].instanceInfo = this.instance[i];
            var classInfo = this.class[i];
            var instanceInfo = this.instance[i];
            var cpool = this.abcFile.constantPool;
            var info = pos + ":class[" + i + "] ";
            info += cpool.getMultinameString(instanceInfo.name) + " cinit_index=" + classInfo.cinit + "\r\n";
            info += " trait_count=" + classInfo.traits.length + "\r\n";
            for (var j = 0; j < classInfo.traits.length; j++) {
                var trait = classInfo.traits[j];
                info += "    " + trait.dumpInfo() + "\r\n";
            }
            LOG_DEBUG(info);
        }
    }

    this.scanInstanceInfo();
    this.scanClassInfo();
}

var GLOBAL_NAMESPACE = "global";

var CONSTANT_Void = 0x00; // not actually interned
var CONSTANT_Utf8 = 0x01;
var CONSTANT_Decimal = 0x02;
var CONSTANT_Integer = 0x03;
var CONSTANT_UInteger = 0x04;
var CONSTANT_PrivateNamespace = 0x05;
var CONSTANT_Double = 0x06;
var CONSTANT_Qname = 0x07; // ns::name, const ns, const name
var CONSTANT_Namespace = 0x08;
var CONSTANT_Multiname = 0x09; //[ns...]::name, const [ns...], const name
var CONSTANT_False = 0x0A;
var CONSTANT_True = 0x0B;
var CONSTANT_Null = 0x0C;
var CONSTANT_QnameA = 0x0D; // @ns::name, const ns, const name
var CONSTANT_MultinameA = 0x0E; // @[ns...]::name, const [ns...], const name
var CONSTANT_RTQname = 0x0F; // ns::name, var ns, const name
var CONSTANT_RTQnameA = 0x10; // @ns::name, var ns, const name
var CONSTANT_RTQnameL = 0x11; // ns::[name], var ns, var name
var CONSTANT_RTQnameLA = 0x12; // @ns::[name], var ns, var name
var CONSTANT_Namespace_Set = 0x15; // a set of namespaces - used by multiname
var CONSTANT_PackageNamespace = 0x16; // a namespace that was derived from a package
var CONSTANT_PackageInternalNs = 0x17; // a namespace that had no uri
var CONSTANT_ProtectedNamespace = 0x18;
var CONSTANT_ExplicitNamespace = 0x19;
var CONSTANT_StaticProtectedNs = 0x1A;
var CONSTANT_MultinameL = 0x1B;
var CONSTANT_MultinameLA = 0x1C;
var CONSTANT_TypeName = 0x1D;



function ConstantPool(pool, stream, hasDecimal) {
    this.pool = pool;
    this.stream = stream;
    this.hasDecimal = hasDecimal;
    this.intCount = 0;
    this.uintCount = 0;
    this.doubleCount = 0;
    this.checkSuspiciousNumberString = function (hex) {
        switch(hex)
        {
            case '41414141':
            case '90909090':
            case '0C0C0C0C':
                {
                    LOG_INFO("Find suspicious number, val="+hex);
                    break;
                }
            default:
                break;
        }
    }

    this.CalculateHexRateInString = function (s) {

        var lengthToCheck = s.length ;
        var stringCount = 0;

        for (var i = 0; i < lengthToCheck; i++) {

            if (isNaN(parseInt(s.charAt(i), 16)))
            {
                stringCount++;
            }
        }
        var hexRate = (lengthToCheck-stringCount)/lengthToCheck;
        if (hexRate > 0.9){
            LOG_INFO("hex rate in string ="+hexRate);
        }

    }
    
    this.scan = function () {
        this.scanIntConstants();
        this.intEnd = this.stream.pos;
        this.scanUIntConstants();
        this.uintEnd = this.stream.pos;
        this.scanDoubleConstants();
        this.doubleEnd = this.stream.pos;

        if (this.poolHasDecimal) {
            this.decimalConstants = new Array();
            this.decimalEnd = this.stream.pos;
        } else {
            this.decimalEnd = this.stream.pos;
        }

        this.scanStringConstants();
        this.stringEnd = this.stream.pos;

        this.scanNamespaceConstants();
        this.namespaceEnd = this.stream.pos;

        this.scanNamespaceSet(this);
        this.namespaceSetEnd = this.stream.pos;

        this.scanMultiNameConstants();
        this.multiNameEnd = this.stream.pos;
    }

    this.scanIntConstants = function () {

        this.intConstants = new Array();
        var size = this.stream.readU30();
        LOG_DEBUG("num of int constants: " + size);

        this.intConstants.push(0);
        for (var i = 1; i < size; ++i) {
            var pos = this.stream.getPos();
            var val = this.stream.readS32();
            this.intConstants.push(val);
            var hexstr = val.toString(16);
            //LOG_INFO("Ints["+i+"] = "+val+', ->'+hexstr);
            this.checkSuspiciousNumberString(hexstr);
            this.intCount++;
        }
    }

    this.scanUIntConstants = function () {

        this.uintConstants = new Array();
        var size = this.stream.readU30();
        LOG_DEBUG("num of uint constants: " + size);

        this.uintConstants.push(0);
        for (var i = 1; i < size; ++i) {
            var pos = this.stream.getPos();
            var val = this.stream.readU32();
            this.uintConstants.push(val);
            var hexstr = val.toString(16);
            //LOG_INFO("Uints["+i+"] = "+val+', ->'+hexstr);
            this.checkSuspiciousNumberString(hexstr);
            this.uintCount++;
        }
    }

    this.scanDoubleConstants = function () {

        this.doubleConstants = new Array();
        var size = this.stream.readU30();
        LOG_DEBUG("num of dobule constants: " + size);

        this.doubleConstants.push(0.0);
        for (var i = 1; i < size; ++i) {
            var pos = this.stream.getPos();
            var val = this.stream.readDouble();
            this.doubleConstants.push(val);
            var hexstr = val.toString(16);
            //LOG_INFO("Doubles["+i+"] = "+val+', ->'+hexstr);
            this.checkSuspiciousNumberString(hexstr);
            this.doubleCount++;
        }
    }

    this.scanDecimalConstants = function () {
        this.decimalConstants = new Array();
        var size = this.stream.readU30();
        LOG_DEBUG("num of decimal constants: " + size);

        this.decimalConstants.push(0.0);
        for (var i = 1; i < size; ++i) {
            // TODO: read 16 bytes decimal constant value
            this.stream.skip(16);
        }
    }

    this.scanStringConstants = function () {

        this.stringConstants = new Array();
        var size = this.stream.readU30();
        LOG_DEBUG("num of string constants: " + size);

        this.stringConstants.push("");
        for (var i = 1; i < size; ++i) {
            var pos = this.stream.getPos();
            var s = this.stream.readStringInfo();

            if (s === "(?i)()()(?-i)||||||||||||||||||||||") {
                global_instrumentor.reportEvent("exploit_cve_2013_0634\r\n");
                AVMPLUS.exploitEvidence = true;
            }
            if (s.length > 3000 && (-1 == s.search(/\<\?xml version=/))) {
                if (s.length > this.pool.max_str_length)
                {
                    this.pool.max_str_length = s.length;
                    this.CalculateHexRateInString(s);              
                }
            }
            if (-1 != s.search(/win \d{0,3},\d{0,3},\d{0,3},\d{0,3}/i)) {
                global_instrumentor.reportEvent("check_flash_version,ver="+s+"\r\n");
            }
            if (-1 != s.search(/windows (xp|vista|7|8|server)/i)) {
                this.pool.check_os_version = true;
            }
            if (-1 != s.search(/publisher.adverstitial.com|pagead2.googlesyndication.com/i))
            {
                this.pool.famous_url_in_string = true;
            }
            this.stringConstants.push(s);
            LOG_INFO(pos + ":cpool_string[" + i + "]=utf8 " + s);
        }
    }

    this.scanNamespaceConstants = function () {
        this.namespaceConstants = new Array();
        var size = this.stream.readU30();
        LOG_DEBUG("num of namepace constants: " + size);

        this.namespaceConstants.push(null);
        for (var i = 1; i < size; ++i) {
            var pos = this.stream.getPos();
            var kind = this.stream.readU8();
            var nameIndex = this.stream.readU30();
            ns = new NamespaceInfo(kind, this.getConstantString(nameIndex));
            this.namespaceConstants.push(ns);
            LOG_DEBUG("ns type = " + ns.kind + " index = " + nameIndex + " name = " + ns.name);
            if ("__AS3__.vec" == ns.name) {
                LOG_INFO("Find __AS3__.vec");
            }
        }
    }

    this.scanNamespaceSet = function (cpool) {
        this.cpool = cpool;
        this.namespaceSet = new Array();
        var size = this.stream.readU30();
        LOG_DEBUG("num of namepace set constants: " + size);

        this.namespaceSet.push(null);
        for (var i = 1; i < size; ++i) {
            var count = this.stream.readU30();
            var nsSet = new NamespaceSet(count);
            for (var j = 0; j < count; ++j) {
                nsSet.setNamespace(j, this.getNamespace(this.stream.readU30()));
            }

            this.namespaceSet.push(nsSet);
            LOG_DEBUG("namespace_set[" + i + "]" + " count = " + nsSet.count + "\r\n  " + this.getNamespaceSetString(i));
        }
    }

    this.scanMultiNameConstants = function () {
        this.multiNameConstants = new Array();
        var size = this.stream.readU30();
        if (1) {
            LOG_DEBUG("num of multiname constants: " + size);
        }

        this.multiNameConstants.push(null);
        for (var i = 1; i < size; ++i) {
            this.multiNameConstants.push(new MultinameInfo(this, this.stream, i));
        }

    }

    this.getConstantString = function (index) {
        return this.stringConstants[index];
    }

    this.getConstantStringCount = function () {
        return this.stringConstants.length;
    }

    this.getConstantInt = function (index) {
        return this.intConstants[index];
    }

    this.getConstantUInt = function (index) {
        return this.uintConstants[index];
    }

    this.getConstantDouble = function (index) {
        return this.doubleConstants[index];
    }

    this.getNamespace = function (index) {
        return this.namespaceConstants[index];
    }

    this.getNamespaceString = function (index) {
        var namespace = this.namespaceConstants[index];
        return this.getConstantString(namespace.name);
    }

    this.getMultiname = function (index) {
        return this.multiNameConstants[index];
    }

    this.getNamespaceSet = function (index) {
        return this.namespaceSet[index];
    }

    this.getNamespaceSetString = function (index) {
        var result = "Namespace Set: (";
        var nsSet = this.namespaceSet[index];
        var nsCount = nsSet.count;
        var nsList = nsSet.ns;

        for (var i = 0; i < nsCount; ++i) {
            if (nsList[i] != undefined) {
                var namespace = nsList[i].getName();
                result += namespace + ", ";
            }
            //if ( "" == namespace )
            //namespace = GLOBAL_NAMESPACE;


        }

        result += ")";

        return result;
    }

    this.getMultinameString = function (index) {
        var result = "";
        var mn = this.multiNameConstants[index];

        if (mn === null) {
            return "{public}:*";
        }
        switch (mn.kind) {
            case CONSTANT_Qname:
            case CONSTANT_QnameA:
                {

                    var ns_name = mn.isAnyNamespace() ? "*" : mn.getNamespaceAt(0).getName();
                    if (ns_name != "")
                        ns_name += "::";

                    var name = mn.isAnyName() ? "*" : mn.getName();


                    result = ns_name + name;
                    break;
                }

            case CONSTANT_RTQname:
            case CONSTANT_RTQnameA:
                {
                    var name = mn.isAnyName() ? "*" : mn.getName();

                    result = "RTQname: " + name;
                    break;
                }

            case CONSTANT_Multiname:
            case CONSTANT_MultinameA:
                {
                    var name = mn.isAnyName() ? "*" : mn.getName();

                    result = "Multiname: ";
                    result += this.getNamespaceSetString(mn.nsSetIndex);
                    result += "::" + name;
                    break;
                }

            case CONSTANT_RTQnameL:
            case CONSTANT_RTQnameLA:
                {
                    result = "RTQnameL";
                    break;
                }

            case CONSTANT_MultinameL:
            case CONSTANT_MultinameLA:
                {
                    result = "MultinameL: ";
                    result += this.getNamespaceSetString(mn.nsSetIndex);
                    break;
                }

            case CONSTANT_TypeName:
                break;

            default:
                //throw  "Invalid constant type: " + this.kind;
                break;
        }

        this.getConstantValue = function (index, kind) {
            switch (kind) {
                case CONSTANT_Integer:
                    return this.intConstants[index];
                    break;

                case CONSTANT_UInteger:
                    return this.uintConstants[index];
                    break;

                case CONSTANT_Double:
                    return this.doubleConstants[index];
                    break;

                case CONSTANT_Utf8:
                    return this.stringConstants[index];
                    break;

                case CONSTANT_True:
                    return true;
                    break;

                case CONSTANT_False:
                    return false;
                    break;

                case CONSTANT_Null:
                    return null;
                    break;

                case CONSTANT_Void:
                    return undefined;
                    break;

                case CONSTANT_Namespace:
                case CONSTANT_PackageNamespace:
                case CONSTANT_PackageInternalNs:
                case CONSTANT_ProtectedNamespace:
                case CONSTANT_ExplicitNamespace:
                case CONSTANT_StaticProtectedNs:
                case CONSTANT_PrivateNamespace:
                    return this.getNamespaceString(index);
                    break;

                default:
                    throw "invalid constant type " + kind;
                    break;
            }
        }

        return result;
    }
    this.scan();
}
OP_nop = 0x02;
OP_throw = 0x03;
OP_getsuper = 0x04;
OP_setsuper = 0x05;
OP_dxns = 0x06;
OP_dxnslate = 0x07;
OP_kill = 0x08;
OP_label = 0x09;
OP_ifnlt = 0x0C;
OP_ifnle = 0x0D;
OP_ifngt = 0x0E;
OP_ifnge = 0x0F;
OP_jump = 0x10;
OP_iftrue = 0x11;
OP_iffalse = 0x12;
OP_ifeq = 0x13;
OP_ifne = 0x14;
OP_iflt = 0x15;
OP_ifle = 0x16;
OP_ifgt = 0x17;
OP_ifge = 0x18;
OP_ifstricteq = 0x19;
OP_ifstrictne = 0x1A;
OP_lookupswitch = 0x1B;
OP_pushwith = 0x1C;
OP_popscope = 0x1D;
OP_nextname = 0x1E;
OP_hasnext = 0x1F;
OP_pushnull = 0x20;
OP_pushundefined = 0x21;
OP_nextvalue = 0x23;
OP_pushbyte = 0x24;
OP_pushshort = 0x25;
OP_pushtrue = 0x26;
OP_pushfalse = 0x27;
OP_pushnan = 0x28;
OP_pop = 0x29;
OP_dup = 0x2A;
OP_swap = 0x2B;
OP_pushstring = 0x2C;
OP_pushint = 0x2D;
OP_pushuint = 0x2E;
OP_pushdouble = 0x2F;
OP_pushscope = 0x30;
OP_pushnamespace = 0x31;
OP_hasnext2 = 0x32;
OP_lix8 = 0x33; // NEW internal only
OP_lix16 = 0x34; // NEW internal only
OP_li8 = 0x35;
OP_li16 = 0x36;
OP_li32 = 0x37;
OP_lf32 = 0x38;
OP_lf64 = 0x39;
OP_si8 = 0x3A;
OP_si16 = 0x3B;
OP_si32 = 0x3C;
OP_sf32 = 0x3D;
OP_sf64 = 0x3E;
OP_newfunction = 0x40;
OP_call = 0x41;
OP_construct = 0x42;
OP_callmethod = 0x43;
OP_callstatic = 0x44;
OP_callsuper = 0x45;
OP_callproperty = 0x46;
OP_returnvoid = 0x47;
OP_returnvalue = 0x48;
OP_constructsuper = 0x49;
OP_constructprop = 0x4A;
OP_callsuperid = 0x4B;
OP_callproplex = 0x4C;
OP_callinterface = 0x4D;
OP_callsupervoid = 0x4E;
OP_callpropvoid = 0x4F;
OP_sxi1 = 0x50;
OP_sxi8 = 0x51;
OP_sxi16 = 0x52;
OP_applytype = 0x53;
OP_newobject = 0x55;
OP_newarray = 0x56;
OP_newactivation = 0x57;
OP_newclass = 0x58;
OP_getdescendants = 0x59;
OP_newcatch = 0x5A;
OP_findpropglobalstrict = 0x5B; // NEW internal only
OP_findpropglobal = 0x5C; // NEW internal only
OP_findpropstrict = 0x5D;
OP_findproperty = 0x5E;
OP_finddef = 0x5F;
OP_getlex = 0x60;
OP_setproperty = 0x61;
OP_getlocal = 0x62;
OP_setlocal = 0x63;
OP_getglobalscope = 0x64;
OP_getscopeobject = 0x65;
OP_getproperty = 0x66;
OP_getouterscope = 0x67;
OP_initproperty = 0x68;
OP_deleteproperty = 0x6A;
OP_getslot = 0x6C;
OP_setslot = 0x6D;
OP_getglobalslot = 0x6E;
OP_setglobalslot = 0x6F;
OP_convert_s = 0x70;
OP_esc_xelem = 0x71;
OP_esc_xattr = 0x72;
OP_convert_i = 0x73;
OP_convert_u = 0x74;
OP_convert_d = 0x75;
OP_convert_b = 0x76;
OP_convert_o = 0x77;
OP_checkfilter = 0x78;
OP_coerce = 0x80;
OP_coerce_b = 0x81;
OP_coerce_a = 0x82;
OP_coerce_i = 0x83;
OP_coerce_d = 0x84;
OP_coerce_s = 0x85;
OP_astype = 0x86;
OP_astypelate = 0x87;
OP_coerce_u = 0x88;
OP_coerce_o = 0x89;
OP_negate = 0x90;
OP_increment = 0x91;
OP_inclocal = 0x92;
OP_decrement = 0x93;
OP_declocal = 0x94;
OP_typeof = 0x95;
OP_not = 0x96;
OP_bitnot = 0x97;
OP_add = 0xA0;
OP_subtract = 0xA1;
OP_multiply = 0xA2;
OP_divide = 0xA3;
OP_modulo = 0xA4;
OP_lshift = 0xA5;
OP_rshift = 0xA6;
OP_urshift = 0xA7;
OP_bitand = 0xA8;
OP_bitor = 0xA9;
OP_bitxor = 0xAA;
OP_equals = 0xAB;
OP_strictequals = 0xAC;
OP_lessthan = 0xAD;
OP_lessequals = 0xAE;
OP_greaterthan = 0xAF;
OP_greaterequals = 0xB0;
OP_instanceof = 0xB1;
OP_istype = 0xB2;
OP_istypelate = 0xB3;
OP_in = 0xB4;
OP_increment_i = 0xC0;
OP_decrement_i = 0xC1;
OP_inclocal_i = 0xC2;
OP_declocal_i = 0xC3;
OP_negate_i = 0xC4;
OP_add_i = 0xC5;
OP_subtract_i = 0xC6;
OP_multiply_i = 0xC7;
OP_getlocal0 = 0xD0;
OP_getlocal1 = 0xD1;
OP_getlocal2 = 0xD2;
OP_getlocal3 = 0xD3;
OP_setlocal0 = 0xD4;
OP_setlocal1 = 0xD5;
OP_setlocal2 = 0xD6;
OP_setlocal3 = 0xD7;
OP_abs_jump = 0xEE;
OP_debug = 0xEF;
OP_debugline = 0xF0;
OP_debugfile = 0xF1;
OP_timestamp = 0xF3;




var opcodeInfo = [
    // For stack movement ("stk") only constant movement is accounted for; variable movement,
    // as for arguments to CALL, CONSTRUCT, APPLYTYPE, et al, and for run-time parts of
    // names, must be handled separately.

    // BEGIN
    // opd throw stk
    [-1, 0, 0, "OP_0x00"],
    [0, 0, 0, "OP_0x01"],
    [0, 0, 0, "nop"],
    [0, 1, -1, "throw"],
    [1, 1, 0, "getsuper"],
    [1, 1, -2, "setsuper"],
    [1, 1, 0, "dxns"],
    [0, 1, -1, "dxnslate"],
    [1, 0, 0, "kill"],
    [0, 0, 0, "label"],
    [-1, 0, 0, "OP_0x0A"],
    [-1, 0, 0, "OP_0x0B"],
    [1, 1, -2, "ifnlt"],
    [1, 1, -2, "ifnle"],
    [1, 1, -2, "ifngt"],
    [1, 1, -2, "ifnge"],
    [1, 0, 0, "jump"],
    [1, 0, -1, "iftrue"],
    [1, 0, -1, "iffalse"],
    [1, 1, -2, "ifeq"],
    [1, 1, -2, "ifne"],
    [1, 1, -2, "iflt"],
    [1, 1, -2, "ifle"],
    [1, 1, -2, "ifgt"],
    [1, 1, -2, "ifge"],
    [1, 0, -2, "ifstricteq"],
    [1, 0, -2, "ifstrictne"],
    [2, 0, -1, "lookupswitch"],
    [0, 0, -1, "pushwith"],
    [0, 0, 0, "popscope"],
    [0, 1, -1, "nextname"],
    [0, 1, -1, "hasnext"],
    [0, 0, 1, "pushnull"],
    [0, 0, 1, "pushundefined"],
    [-1, 0, 0, "OP_0x22"],
    [0, 1, -1, "nextvalue"],
    [1, 0, 1, "pushbyte"],
    [1, 0, 1, "pushshort"],
    [0, 0, 1, "pushtrue"],
    [0, 0, 1, "pushfalse"],
    [0, 0, 1, "pushnan"],
    [0, 0, -1, "pop"],
    [0, 0, 1, "dup"],
    [0, 0, 0, "swap"],
    [1, 0, 1, "pushstring"],
    [1, 0, 1, "pushint"],
    [1, 0, 1, "pushuint"],
    [1, 0, 1, "pushdouble"],
    [0, 0, -1, "pushscope"],
    [1, 0, 1, "pushnamespace"],
    [2, 1, 1, "hasnext2"],
    [0, 1, 0, "lix8"], // NEW internal only
    [0, 1, 0, "lix16"], // NEW internal only
    [0, 1, 0, "li8"],
    [0, 1, 0, "li16"],
    [0, 1, 0, "li32"],
    [0, 1, 0, "lf32"],
    [0, 1, 0, "lf64"],
    [0, 1, -2, "si8"],
    [0, 1, -2, "si16"],
    [0, 1, -2, "si32"],
    [0, 1, -2, "sf32"],
    [0, 1, -2, "sf64"],
    [-1, 0, 0, "OP_0x3F"],
    [1, 1, 1, "newfunction"],
    [1, 1, -1, "call"],
    [1, 1, 0, "construct"],
    [2, 1, 0, "callmethod"],
    [2, 1, 0, "callstatic"],
    [2, 1, 0, "callsuper"],
    [2, 1, 0, "callproperty"],
    [0, 0, 0, "returnvoid"],
    [0, 0, -1, "returnvalue"],
    [1, 1, -1, "constructsuper"],
    [2, 1, 0, "constructprop"],
    [-1, 1, 0, "callsuperid"],
    [2, 1, 0, "callproplex"],
    [-1, 1, 0, "callinterface"],
    [2, 1, -1, "callsupervoid"],
    [2, 1, -1, "callpropvoid"],
    [0, 0, 0, "sxi1"],
    [0, 0, 0, "sxi8"],
    [0, 0, 0, "sxi16"],
    [1, 1, 0, "applytype"],
    [-1, 0, 0, "OP_0x54"],
    [1, 1, 1, "newobject"],
    [1, 1, 1, "newarray"],
    [0, 1, 1, "newactivation"],
    [1, 1, 0, "newclass"],
    [1, 1, 0, "getdescendants"],
    [1, 1, 1, "newcatch"],
    [1, 1, 0, "findpropglobalstrict"], // NEW internal only
    [1, 1, 0, "findpropglobal"], // NEW internal only
    [1, 1, 1, "findpropstrict"],
    [1, 1, 1, "findproperty"],
    [1, 1, 1, "finddef"],
    [1, 1, 1, "getlex"],
    [1, 1, -2, "setproperty"],
    [1, 0, 1, "getlocal"],
    [1, 0, -1, "setlocal"],
    [0, 0, 1, "getglobalscope"],
    [1, 0, 1, "getscopeobject"],
    [1, 1, 0, "getproperty"],
    [1, 0, 1, "getouterscope"],
    [1, 1, -2, "initproperty"],
    [-1, 0, 0, "OP_0x69"],
    [1, 1, 0, "deleteproperty"],
    [-1, 0, 0, "OP_0x6B"],
    [1, 1, 0, "getslot"],
    [1, 1, -2, "setslot"],
    [1, 0, 1, "getglobalslot"],
    [1, 0, -1, "setglobalslot"],
    [0, 1, 0, "convert_s"],
    [0, 1, 0, "esc_xelem"],
    [0, 1, 0, "esc_xattr"],
    [0, 1, 0, "convert_i"],
    [0, 1, 0, "convert_u"],
    [0, 1, 0, "convert_d"],
    [0, 1, 0, "convert_b"],
    [0, 1, 0, "convert_o"],
    [0, 1, 0, "checkfilter"],
    [-1, 0, 0, "OP_0x79"],
    [-1, 0, 0, "OP_0x7A"],
    [-1, 0, 0, "OP_0x7B"],
    [-1, 0, 0, "OP_0x7C"],
    [-1, 0, 0, "OP_0x7D"],
    [-1, 0, 0, "OP_0x7E"],
    [-1, 0, 0, "OP_0x7F"],
    [1, 1, 0, "coerce"],
    [0, 1, 0, "coerce_b"], // convert_b is the same operation as coerce_b
    [0, 1, 0, "coerce_a"],
    [0, 1, 0, "coerce_i"], // convert_i is the same operation as coerce_i
    [0, 1, 0, "coerce_d"],
    [0, 1, 0, "coerce_s"], // convert_d is the same operation as coerce_d
    [1, 1, 0, "astype"],
    [0, 1, -1, "astypelate"],
    [0, 1, 0, "coerce_u"], // convert_u is the same operation as coerce_u
    [0, 1, 0, "coerce_o"],
    [-1, 0, 0, "OP_0x8A"],
    [-1, 0, 0, "OP_0x8B"],
    [-1, 0, 0, "OP_0x8C"],
    [-1, 0, 0, "OP_0x8D"],
    [-1, 0, 0, "OP_0x8E"],
    [-1, 0, 0, "OP_0x8F"],
    [0, 1, 0, "negate"],
    [0, 1, 0, "increment"],
    [1, 1, 0, "inclocal"],
    [0, 1, 0, "decrement"],
    [1, 1, 0, "declocal"],
    [0, 0, 0, "typeof"],
    [0, 0, 0, "not"],
    [0, 1, 0, "bitnot"],
    [-1, 0, 0, "OP_0x98"],
    [-1, 0, 0, "OP_0x99"],
    [-1, 0, 0, "OP_0x9A"],
    [-1, 0, 0, "OP_0x9B"],
    [-1, 0, 0, "OP_0x9C"],
    [-1, 0, 0, "OP_0x9D"],
    [-1, 0, 0, "OP_0x9E"],
    [-1, 0, 0, "OP_0x9F"],
    [0, 1, -1, "add"],
    [0, 1, -1, "subtract"],
    [0, 1, -1, "multiply"],
    [0, 1, -1, "divide"],
    [0, 1, -1, "modulo"],
    [0, 1, -1, "lshift"],
    [0, 1, -1, "rshift"],
    [0, 1, -1, "urshift"],
    [0, 1, -1, "bitand"],
    [0, 1, -1, "bitor"],
    [0, 1, -1, "bitxor"],
    [0, 1, -1, "equals"],
    [0, 1, -1, "strictequals"],
    [0, 1, -1, "lessthan"],
    [0, 1, -1, "lessequals"],
    [0, 1, -1, "greaterthan"],
    [0, 1, -1, "greaterequals"],
    [0, 1, -1, "instanceof"],
    [1, 1, 0, "istype"],
    [0, 1, -1, "istypelate"],
    [0, 1, -1, "in"],
    [-1, 0, 0, "OP_0xB5"],
    [-1, 0, 0, "OP_0xB6"],
    [-1, 0, 0, "OP_0xB7"],
    [-1, 0, 0, "OP_0xB8"],
    [-1, 0, 0, "OP_0xB9"],
    [-1, 0, 0, "OP_0xBA"],
    [-1, 0, 0, "OP_0xBB"],
    [-1, 0, 0, "OP_0xBC"],
    [-1, 0, 0, "OP_0xBD"],
    [-1, 0, 0, "OP_0xBE"],
    [-1, 0, 0, "OP_0xBF"],
    [0, 1, 0, "increment_i"],
    [0, 1, 0, "decrement_i"],
    [1, 1, 0, "inclocal_i"],
    [1, 1, 0, "declocal_i"],
    [0, 1, 0, "negate_i"],
    [0, 1, -1, "add_i"],
    [0, 1, -1, "subtract_i"],
    [0, 1, -1, "multiply_i"],
    [-1, 0, 0, "OP_0xC8"],
    [-1, 0, 0, "OP_0xC9"],
    [-1, 0, 0, "OP_0xCA"],
    [-1, 0, 0, "OP_0xCB"],
    [-1, 0, 0, "OP_0xCC"],
    [-1, 0, 0, "OP_0xCD"],
    [-1, 0, 0, "OP_0xCE"],
    [-1, 0, 0, "OP_0xCF"],
    [0, 0, 1, "getlocal0"],
    [0, 0, 1, "getlocal1"],
    [0, 0, 1, "getlocal2"],
    [0, 0, 1, "getlocal3"],
    [0, 0, -1, "setlocal0"],
    [0, 0, -1, "setlocal1"],
    [0, 0, -1, "setlocal2"],
    [0, 0, -1, "setlocal3"],
    [-1, 0, 0, "OP_0xD8"],
    [-1, 0, 0, "OP_0xD9"],
    [-1, 0, 0, "OP_0xDA"],
    [-1, 0, 0, "OP_0xDB"],
    [-1, 0, 0, "OP_0xDC"],
    [-1, 0, 0, "OP_0xDD"],
    [-1, 0, 0, "OP_0xDE"],
    [-1, 0, 0, "OP_0xDF"],
    [-1, 0, 0, "OP_0xE0"],
    [-1, 0, 0, "OP_0xE1"],
    [-1, 0, 0, "OP_0xE2"],
    [-1, 0, 0, "OP_0xE3"],
    [-1, 0, 0, "OP_0xE4"],
    [-1, 0, 0, "OP_0xE5"],
    [-1, 0, 0, "OP_0xE6"],
    [-1, 0, 0, "OP_0xE7"],
    [-1, 0, 0, "OP_0xE8"],
    [-1, 0, 0, "OP_0xE9"],
    [-1, 0, 0, "OP_0xEA"],
    [-1, 0, 0, "OP_0xEB"],
    [-1, 0, 0, "OP_0xEC"],
    [-1, 0, 0, "OP_0xED"],
    [2, 0, 0, "abs_jump"],
    [4, 0, 0, "OP_0xEF"],
    [1, 0, 0, "OP_0xF0"],
    [1, 0, 0, "OP_0xF1"],
    [1, 0, 0, "OP_0xF2"],
    [0, 0, 0, "timestamp"],
    [-1, 0, 0, "OP_0xF4"],
    [-1, 0, 0, "OP_0xF5"],
    [-1, 0, 0, "OP_0xF6"],
    [-1, 0, 0, "OP_0xF7"],
    [-1, 0, 0, "OP_0xF8"],
    [-1, 0, 0, "OP_0xF9"],
    [-1, 0, 0, "OP_0xFA"],
    [-1, 0, 0, "OP_0xFB"],
    [-1, 0, 0, "OP_0xFC"],
    [-1, 0, 0, "OP_0xFD"],
    [-1, 0, 0, "OP_0xFE"],
    [-1, 0, 0, "OP_0xFF"]
    // END
];

opcodeInfo.getOpreandCount = function (opcode) {
    return this[opcode][0];
}

opcodeInfo.getOpcodeName = function (opcode) {
    return this[opcode][3];
}


function utf8to16(str) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = str.length;
    i = 0;
    while (i < len) {
        c = str.charCodeAt(i++);
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += str.charAt(i - 1);
                break;
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}


function MethodEnv(pool, toplevel, method) {
    this.method = method;
    this.scopeChain = new Array(0);
    this.pool = pool;
    this.toplevel = toplevel;
}

MethodEnv.prototype.coerceEnterNoParam = function (thisArg) {
    return this.method.invoke(this, 1, [thisArg]);
}

MethodEnv.prototype.coerceEnter = function (argc, argv) {
    return this.method.invoke(this, argc, argv);
}

MethodEnv.prototype.getScopeChain = function () {
    return this.scopeChain;
}

MethodEnv.prototype.getMethodInfo = function () {
    return this.method;
}

MethodEnv.prototype.createArguments = function (argc, argv) {
    var arguments = argv.subArray(1);
    arguments.callee = this;

    return arguments;
}

MethodEnv.prototype.newClass = function (base, classInfo) {
    var class_name = classInfo.getName();
    var class_clousure = new ClassClousure(class_name);
    var instance_template = new AS3Object(class_name);

    class_clousure.classInfo = classInfo;
    class_clousure.instanceInfo = classInfo.instanceInfo;
    class_clousure.base = base;
    class_clousure.abc_pool = this.pool;
    class_clousure.toplevel = this.toplevel;



    AVMPLUS.bindTraits(class_clousure, classInfo.traits, this.pool, this.toplevel);

    var cinit = this.pool.resolveMethodInfo(classInfo.cinit);
    cinit.setName(class_name + "$cinit");

    class_clousure.cinit = new MethodEnv(this.pool, this.toplevel, cinit);
    class_clousure.cinit.coerceEnterNoParam(class_clousure);

    class_clousure.instance_template = class_clousure.createInstanceTemplate();
    class_clousure.iinit = class_clousure.instance_template.iinit;

    return class_clousure;
}

MethodEnv.prototype.newFunction = function (method, outerScope, scope) {
    if (!method) {
        return AVMPLUS.createDummyObject("Function");
    }
    return new FunctionEnv(this.pool, this.toplevel, method, outerScope, scope);
}

MethodEnv.prototype.createRest = function (argc, argv) {
    var restArray;
    var param_count = this.method.getParamCount();
    if (argc <= param_count + 1)
        restArray = new Array();
    else
        restArray = argv.subArray(param_count + 1);

    restArray.as3Name = "RestArray";
    return restArray;
}

MethodEnv.prototype.findProperty = function (outerScopeChain, scopes, scopeDepth, multiname) {
    for (var i = scopeDepth - 1; i >= 0; i--) {
        var obj = scopes[i];
        if (obj && obj.hasMultinameProperty(multiname)) {
            return obj;
        }
    }

    for (var i = outerScopeChain.length - 1; i >= 0; i--) {
        var obj = outerScopeChain[i];
        if (obj && obj.hasMultinameProperty(multiname)) {
            return obj;
        }
    }

    var global = this.toplevel.global;
    if (global.hasMultinameProperty(multiname)) {
        var _property = global.getMultinameProperty(multiname);
        if (_property instanceof MethodEnv || _property instanceof ScriptEnv)
            return _property.global;

        return global;
    }

    return undefined;
}

MethodEnv.prototype.getProperty = function (obj, multiname) {
    var _property;

    if (obj) //&& obj.hasMultinameProperty( multiname ) )
        _property = obj.getMultinameProperty(multiname);


    return _property != undefined ? _property : (new UnknownObject(multiname.getName()));
}

MethodEnv.prototype.initProperty = function (obj, multiname, value) {

    this.setProperty(obj, multiname, value);
}


MethodEnv.prototype.setProperty = function (obj, multiname, value) {
    if (!obj || !multiname || !multiname.getName())
        return;

    if (!obj.hasMultinameProperty(multiname)) {
        LOG_DEBUG("[ERROR] setProperty: " + obj + " does not have property " + multiname.getName());
        // however we still set property for this object
    }

    obj.setMultinameProperty(multiname, value);
}

MethodEnv.prototype.constructprop = function (obj, multiname, argc, argv) {
    var value;

    if (!obj || !multiname || !multiname.getName()) {
        if (multiname) {
            return AVMPLUS.createDummyObject(multiname.getFullName());
        } else {
            return undefined;
        }
    }


    if (!obj.hasMultinameProperty(multiname)) {
        LOG_DEBUG("[ERROR] setProperty: " + obj + " does not have property " + multiname.getName());
        // however we still set property for this object
    }

    value = obj.getMultinameProperty(multiname);

    if (value === AVMPLUS.anyValue) {
        value = argv[1];
    } else if (value) {
        value = value.createInstance(argc, argv);
    }

    if (!value) {
        value = AVMPLUS.createDummyObject(multiname);
    }



    return value;
}

MethodEnv.prototype.op_construct = function (obj, argc, argv) {
    if (!obj)
        return undefined;

    if (obj === AVMPLUS.anyValue) {
        obj = argv[1];
    } else if (obj) {
        obj = obj.createInstance(argc, argv);
    }

    if (!obj) {
        obj = AVMPLUS.createDummyObject("");
    }

    return obj;
}



MethodEnv.prototype.callproperty = function (obj, multiname, argc, argv, isProplex) {
    var _property;

    if (!multiname || !multiname.getName()) {
        return undefined;
    }

    var retval = global_instrumentor.instrumentCall(obj, multiname.getName(), argc, argv);
    if (retval != 0)
        return retval;

    if (!obj)
        return undefined;


    _property = obj.getMultinameProperty(multiname);
    if (!_property)
        return undefined;


    if (_property.coerceEnter) {
        var new_argv = new Array(argc + 1);
        new_argv[0] = isProplex ? null : obj;
        ArrayCopy(argv, 0, new_argv, 1, argc);

        return _property.coerceEnter(argc + 1, new_argv);
    } else {
        return _property.apply(obj, argv);
    }

}

MethodEnv.prototype.callsuper = function (obj, multiname, argc, argv) {
    var _property;

    if (!obj || !multiname || !multiname.getName() || !obj.base) {
        return undefined;
    }

    if (!obj.base.instance_template)
        return undefined;

    _property = obj.base.instance_template.getMultinameProperty(multiname);
    if (!_property)
        return undefined;

    if (_property.coerceEnter) {
        var new_argv = new Array(argc + 1);
        new_argv[0] = isProplex ? null : obj;
        ArrayCopy(argv, 0, new_argv, 1, argc);

        return _property.coerceEnter(argc + 1, new_argv);
    } else {
        return _property.apply(obj, argv);
    }

}

MethodEnv.prototype.op_call = function (receiver, func, argc, argv) {
    if (func.coerceEnter) {
        var new_argv = new Array(argc + 1);
        new_argv[0] = receiver;
        ArrayCopy(argv, 0, new_argv, 1, argc);

        return property.coerceEnter(argc + 1, new_argv);
    } else if (func.apply) {
        return func.apply(receiver, argv);
    } else {
        return undefined;
    }
}

function ScriptEnv(pool, toplevel, script) {
    this.pool = pool;
    this.script = script;
    this.global = new AS3Object("global");
    this.scopeChain = new Array(0);
    this.toplevel = toplevel;


    this.method = pool.resolveMethodInfo(this.script.init);
    this.method.setName("global@init");


    AVMPLUS.bindTraits(this.global, this.script.traits, this.pool, this.toplevel);

}

ScriptEnv.prototype = new MethodEnv();


function FunctionEnv(pool, toplevel, method, outerScope, scope) {
    this.pool = pool;
    this.toplevel = toplevel;

    var scopeSize = outerScope ? outerScope.length : 0;
    scopeSize += scope ? scope.length : 0;

    this.scopeChain = new Array(scopeSize);

    if (outerScope)
        ArrayCopy(outerScope, 0, this.scopeChain, 0, outerScope.length);

    if (scope)
        ArrayCopy(scope, 0, this.scopeChain, outerScope.length, scope.length);

    this.method = method;
}

FunctionEnv.prototype = new MethodEnv();

// flash.net.NetStream
NetStream.as3Name = "NetStream";
NetStream.as3Postfix = "$";

function NetStream() {

}

NetStream.createInstanceImpl = function () {
    return new NetStream();
}

NetStream.prototype.play = function (url) {
    if (url instanceof String && url.indexOf("mp4") > 0)
        global_instrumentor.reportEvent("load_mp4_file: " + url + "\r\n");
}

// flash.external.ExternalInterface
var ExternalInterface = {
    call: function () {
              if (arguments.length > 0) {
                  global_instrumentor.reportEvent("call_external_interface_" + arguments[0]);
                  //console.log("ExternalInterface.call = " + arguments[0]);
              }
          }
}

var mapOfGetDefinitionByName = {
    "unescape" : 0,
    "flash.display.Loader" : 0,
    "flash.net.URLRequest" : 0,
    "flash.utils.ByteArray" : 0
};

// flash.utils.getDefinitionByName
var getDefinitionByName = function(name) {
    //console.log("getDefinitionByName = " + name);
    if (mapOfGetDefinitionByName[name] != undefined)
        mapOfGetDefinitionByName[name] += 1;
    if (name == "unescape") {
        return eval(name);
    } else {
        return name;
    }
}

var Capabilities = {
    version: "win 11,5,502,146",
    playerType: "ActiveX",
    os: "windows 7"
}

var stage = {
    loaderInfo: {
        parameters: {
            // fake parameters here
            sc: "%u9090%u9090",
        }
    }
}

// global instrumentor
var global_instrumentor = {
    instruction_executed: 0,
    monitoredObjects: {},

    instrumentInstruction: function (code, argv) {
        this.instruction_executed++;
    },

    reset: function () {
        this.instruction_executed = 0;
        this.nopCode = 0;
        this.monitoredObjects = {};
        this.shellcodes = new Array();
        this.executedMethod = {};
        this.timeoutMethod = {};
        this.events = "";
    },

    addMonitoredInstance: function (name, object) {
        if (!this.monitoredObjects[name]) {
            this.monitoredObjects[name] = new Array();
        }
        this.monitoredObjects[name].push(object);
    },

    getMonitoredInstance: function (name) {
        return this.monitoredObjects[name];
    },

    sameShellcode: function (lhs, rhs) {
        return (lhs.length == rhs.length) && (lhs[lhs.length / 2] == rhs[rhs.length / 2]);
    },

    shellcodeExists: function (sc) {
        for (var i = 0; i < this.shellcodes.length; i++) {
            if (this.sameShellcode(this.shellcodes[i], sc))
                return true;
        }
        return false;
    },

    addShellcode: function (sc) {
        if (!this.shellcodeExists(sc)) {
            this.shellcodes.push(sc);
        }
    },

    getShellcodes: function () {
        return this.shellcodes;
    },

    setMethodExecuted: function (methodId) {
        this.executedMethod[methodId] = 1;
    },

    setMethodTimeout: function (methodId) {
        this.timeoutMethod[methodId] = 1;
    },

    isMethodExecuted: function (methodId) {
        return (1 == this.executedMethod[methodId]);
    },

    isMethodTimeout: function (methodId) {
        return (1 == this.timeoutMethod[methodId]);
    },

    reportEvent: function (msg) {
        this.events += msg + "\r\n";
    },

    instrumentCall: function (receiver, name, argc, argv) {
        name = name.toLowerCase();
        if (name == "loadbytes") {
            var bytes = argv[0];
            if (bytes instanceof ByteArray && bytes.isSwf()) {
                SWF_REPORT( bytes.hexEncode() );
                AVMPLUS.exploitEvidence = true;
            }
        } else if ((name == "hextobin" || name == "hex2bin") && typeof argv[0] == "string") {
            var str = argv[0];
            if (str.indexOf("435753") == 0 || str.indexOf("465753") == 0) {
                if (str.length > 1024 * 2) {
                    SWF_REPORT(str);
                    AVMPLUS.exploitEvidence = true;
                }

                return new ByteArray();
            }
            var newArray = ByteArray.createInstanceImpl();
            newArray.initFromHexString(str);
            return newArray;
        }
        return 0;
    }
};


/*
#define CHECK_INSTRUCTION_COUNTER() \
    if (AVMPLUS.instruction_counter > AVMPLUS.max_instruction) {            \
        throw "max instruction count reached";                              \
    }                                                                       \
    else if (AVMPLUS.instruction_counter  - initial_instruction_count > AVMPLUS.max_instruction_method ) { \
        LOG_DEBUG(methodInfo.getName() + ": execeeds max instruction limit");                                \
        RETURN(undefined);                                                   \
    }                                                                       \
    AVMPLUS.instruction_counter ++;
*/

function convertI(value) {
    if (!value)
        return null;
    var result = new Number(value);
    return result;
}

function convertU(value) {
    var result = convertI(value);
    if (result && result < 0)
        result = -result;
    return result;
}

function showState(opcode, methodInfo, codeStream, pc, local, stack, sp, scope, scopeDepth) {
    var originalPos = codeStream.getPos();
    var stack_vars = "";
    for (var i = 0; i < sp; i++) {
        stack_vars += AVMPLUS.format(stack[i]) + "  ";
    }
    LOG_DEBUG("          stack: " + stack_vars);

    var scope_vars = "";
    for (var i = 0; i < scopeDepth; i++) {
        scope_vars += AVMPLUS.format(scope[i]) + "  ";
    }
    LOG_DEBUG("          scope: " + scope_vars);

    var local_vars = "";
    for (var i = 0; i < local.length; i++) {
        local_vars += AVMPLUS.format(local[i]) + "  ";
    }
    LOG_DEBUG("          locals: " + local_vars);

    var instr_string = "  " + pc + ":";
    LOG_DEBUG(instr_string + AVMPLUS.formatOpcode(opcode, codeStream, methodInfo.pool));

    codeStream.seekBegin(originalPos);
}

function initMultiname(multiname, codeStream, stack, sp) {
    if (multiname.isRtname()) {
        var index = stack[--sp];
        name.setName(index.toString());
    }

    if (multiname.isRtname())
        name.setNamespace(stack[--sp]);

    return sp;
}

function interpBoxed(env, argc, argv) {
    var outerScope = env.getScopeChain();
    var methodInfo = env.method;
    var pool = methodInfo.pool;
    var startTime = (new Date()).getTime();
    methodInfo.buildMethodSignature();
    LOG_DEBUG("Entering " + methodInfo.getName());

    var local = new Array(methodInfo.getLocalCount());
    var stack = new Array(methodInfo.getMaxStack());
    var scope = new Array(methodInfo.getMaxScope());

    var pc = 0;
    var sp = 0;
    var scopeDepth = 0;
    var code = methodInfo.getCode();
    var codeStream = new InputStream(code, 0, code.length());
    var opcode;
    var temp;
    var u1, u2, u3;
    var a1, a2, a3;
    var i1, i2, i3;

    var call_argc;
    var call_argv;

    var lbr = {};

    var param_count = methodInfo.getParamCount();
    var option_count = methodInfo.getOptionCount();
    var globalScope = outerScope.length ? outerScope[0] : null;

    if (argc > 1 && methodInfo.returnType == ByteArray) {
        if (methodInfo.args.length == 1 && methodInfo.args[0] && methodInfo.args[0].type == String) {
            var s = argv[1];
            if (s && typeof s == "string" && IsHexString(s)) {
                var byteArray = ByteArray.createInstanceImpl();
                byteArray.initFromHexString(s);
                LOG_DEBUG("Exiting " + methodInfo.getName() + " return_value: " + AVMPLUS.format(byteArray));
                return (byteArray);
            }
        }
    }

    // copy parameters to local
    for (var i = 0, n = (argc < param_count + 1) ? argc : (param_count + 1); i < n; i++) {
        (local[(i)] = (argv[i]));
    }

    if (methodInfo.hasOptional() && argc <= param_count) {
        for (var i = 0; i < param_count - argc + 1 && i < option_count; i++) {
            (local[(param_count - i)] = (methodInfo.args[param_count - i - 1].defaultValue));
        }
    }

    if (methodInfo.needRest()) {
        (local[(param_count + 1)] = (env.createRest(argc, argv)));
    } else if (methodInfo.needArguments()) {
        (local[(param_count + 1)] = (env.createArguments(argc, argv)));
    }

    var initial_instruction_count = AVMPLUS.instruction_counter;

    for (;;) {
        opcode = codeStream.readU8();
        pc = codeStream.getPos(), AVMPLUS.pc = pc;
        if (!inBrowser && (AVMPLUS.instruction_counter & 0xFFF) == 0) {
            temp = (new Date()).getTime() - startTime;
            if (temp > AVMPLUS.abc_timeout) {
                throw "Action script emulation tiemout: " + AVMPLUS.formatOpcode(opcode, codeStream, methodInfo.pool);
            } else if (temp > AVMPLUS.method_timeout && methodInfo.getName().indexOf("$iinit") < 0) {
                LOG_ERROR(methodInfo.getName() + ": method timeout, " + (codeStream.getPos() - 1) + ": " + AVMPLUS.formatOpcode(opcode, codeStream, methodInfo.pool));
                global_instrumentor.setMethodTimeout(methodInfo.methodId);
                LOG_DEBUG("Exiting " + methodInfo.getName() + " return_value: " + AVMPLUS.format(undefined));
                return (undefined);
            }
        }
        AVMPLUS.instruction_counter++;;

        switch (opcode) {
            case OP_getlocal:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (stack[sp++] = (local[(u1)]));
                    continue;
                }

            case OP_getlocal0:
                {
                    (stack[sp++] = (local[(0)]));
                    continue;
                }

            case OP_getlocal1:
                {
                    (stack[sp++] = (local[(1)]));
                    continue;
                }

            case OP_getlocal2:
                {
                    (stack[sp++] = (local[(2)]));
                    continue;
                }

            case OP_getlocal3:
                {
                    (stack[sp++] = (local[(3)]));
                    continue;
                }

            case OP_setlocal:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (local[(u1)] = ((stack[--sp])));
                    continue;
                }

            case OP_setlocal0:
                {
                    (local[(0)] = ((stack[--sp])));
                    continue;
                }

            case OP_setlocal1:
                {
                    (local[(1)] = ((stack[--sp])));
                    continue;
                }

            case OP_setlocal2:
                {
                    (local[(2)] = ((stack[--sp])));
                    continue;
                }

            case OP_setlocal3:
                {
                    (local[(3)] = ((stack[--sp])));
                    continue;
                }

            case OP_pushscope:
                {
                    a1 = (stack[--sp]);
                    if (scopeDepth == 0 && globalScope == null) {
                        globalScope = a1;
                    }
                    (scope[scopeDepth++] = a1);
                    continue;
                }

            case OP_getscopeobject:
                {
                    u1 = (temp = codeStream.readU8(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (stack[sp++] = (scope[u1]));
                    continue;
                }


            case OP_findpropstrict:
                {

                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));

                    if (multiname.isRuntime()) {
                        sp = initMultiname(multiname, codeStream, stack, sp);
                    }

                    (stack[sp++] = env.findProperty(outerScope, scope, scopeDepth, multiname));

                    continue;
                }

            case OP_getlex:
                {

                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));
                    // multiname in getlex must not be a runtime multiname
                    var result = undefined;
                    if (!multiname.isRuntime()) {
                        a1 = env.findProperty(outerScope, scope, scopeDepth, multiname);
                        if (a1) {
                            result = env.getProperty(a1, multiname);
                        }
                    }
                    if (result == undefined) {
                        result = AVMPLUS.createDummyObject(multiname.getFullName());
                    }
                    (stack[sp++] = result);

                    continue;
                }

            case OP_findproperty:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));

                    if (multiname.isRuntime()) {
                        sp = initMultiname(multiname, codeStream, stack, sp);
                    }

                    (stack[sp++] = env.findProperty(outerScope, scope, scopeDepth, multiname));

                    continue;
                }

            case OP_getproperty:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));

                    if (!multiname.isRuntime()) {
                        var obj = (stack[--sp]);
                        (stack[sp++] = env.getProperty(obj, multiname));
                    } else if (!multiname.isRtns() && ((typeof stack[sp - 1] == "number")) && stack[sp - 1] >= 0 && AVMPLUS.isObject(stack[sp - 2])) {
                        var index = (stack[--sp]);
                        var obj = (stack[--sp]);
                        if (obj)
                            (stack[sp++] = obj.getUintProperty(index));
                        else
                            (stack[sp++] = new UnknownObject("Unknown[" + index + "]"));
                    } else {

                        a1 = (stack[--sp]); // key
                        a2 = (stack[--sp]); // obj
                        if (a2 && a2[a1])
                            (stack[sp++] = a2[a1]);
                        else
                            (stack[sp++] = new UnknownObject("unknown_type"));
                    }

                    continue;
                }

            case OP_setproperty:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));

                    a1 = (stack[--sp]); // value

                    if (!multiname.isRuntime()) {
                        var obj = (stack[--sp]);
                        env.setProperty(obj, multiname, a1);
                    } else if (!multiname.isRtns() && ((typeof stack[sp - 1] == "number")) && stack[sp - 1] >= 0 && AVMPLUS.isObject(stack[sp - 2])) {
                        var index = (stack[--sp]);
                        var obj = (stack[--sp]);
                        if (obj)
                            obj.setUintProperty(index, a1);
                    } else {
                        // TODO: not implemented
                        (stack[--sp]);
                        (stack[--sp]);

                    }

                    continue;
                }

            case OP_newclass:
                {
                    var class_clousure;
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    base = (stack[--sp]);
                    classInfo = env.pool.resolveClassInfo(u1);
                    if (classInfo) {
                        class_clousure = env.newClass(base, classInfo);
                    }

                    if (!class_clousure)
                        class_clousure = new ClassClousure(classInfo.getName());

                    (stack[sp++] = class_clousure);
                    continue;
                }
            case OP_popscope:
                {
                    (scope[--scopeDepth]);
                    continue;
                }
            case OP_initproperty:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));
                    a1 = (stack[--sp]); // value
                    if (multiname.isRuntime()) {
                        sp = initMultiname(multiname, codeStream, stack, sp);
                    }
                    a2 = (stack[--sp]); // object

                    if (a2) {
                        env.initProperty(a2, multiname, a1);
                    }

                    continue;
                }

            case OP_returnvoid:
                {
                    LOG_DEBUG("Exiting " + methodInfo.getName() + " return_value: " + AVMPLUS.format(undefined));
                    return (undefined);
                }

            case OP_returnvalue:
                {
                    a1 = (stack[--sp]);
                    LOG_DEBUG("Exiting " + methodInfo.getName() + " return_value: " + AVMPLUS.format(a1));
                    return (a1);
                }

            case OP_nop:
                {
                    continue;
                }

            case OP_label:
                {
                    continue;
                }

            case OP_timestamp:
                {
                    continue;
                }

            case OP_coerce_a:
                {
                    continue;
                }

            case OP_debugline:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    continue;
                }

            case OP_debug:
                {
                    (temp = codeStream.readU8(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // debug_type
                    (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // index
                    (temp = codeStream.readU8(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // reg
                    (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // extra

                    continue;
                }

            case OP_debugfile:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    continue;
                }



            case OP_getglobalscope:
                {
                    (stack[sp++] = globalScope);
                    continue;
                }

            case OP_getslot:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // slot
                    a1 = (stack[--sp]); // object


                    if (a1.getSlot) {
                        (stack[sp++] = a1.getSlot(u1));
                    } else {
                        (stack[sp++] = new UnknownObject("slot[" + u1 + "]"));
                    }

                    continue;
                }

            case OP_pushnull:
                {
                    (stack[sp++] = null);
                    continue;
                }

            case OP_pushundefined:
                {
                    (stack[sp++] = undefined);
                    continue;
                }

            case OP_pushstring:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    if (!u1) {
                        (stack[sp++] = "");
                    } else {
                        (stack[sp++] = pool.getConstantStringCopy(u1));
                    }

                    continue;
                }

            case OP_pushint:
                {
                    (stack[sp++] = pool.resolveConstantInt((temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp)));
                    continue;
                }

            case OP_pushuint:
                {
                    (stack[sp++] = pool.resolveConstantUInt((temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp)));
                    continue;
                }

            case OP_pushdouble:
                {
                    (stack[sp++] = pool.resolveConstantDouble((temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp)));
                    continue;
                }

            case OP_pushnamespace:
                {
                    (stack[sp++] = pool.resolveNamespace((temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp)));
                    continue;
                }

            case OP_pushtrue:
                {
                    (stack[sp++] = true);
                    continue;
                }

            case OP_pushfalse:
                {
                    (stack[sp++] = false);
                    continue;
                }

            case OP_pushnan:
                {
                    (stack[sp++] = NaN);
                    continue;
                }


            case OP_pushshort:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (stack[sp++] = AVMPLUS.convertS16(u1));
                    continue;
                }

            case OP_convert_i:
                {
                    (stack[sp++] = convertI((stack[--sp])));
                    continue;
                }

            case OP_coerce_i:
                {
                    (stack[sp++] = convertI((stack[--sp])));
                    continue;
                }

            case OP_convert_u:
                {
                    (stack[sp++] = convertU((stack[--sp])));
                    continue;
                }

            case OP_coerce_u:
                {
                    (stack[sp++] = convertU((stack[--sp])));
                    continue;
                }

            case OP_constructprop:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));
                    call_argc = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = call_argc;
                    call_argv = new Array(call_argc);
                    while (temp--) {
                        call_argv[temp] = (stack[--sp]);
                    };

                    if (multiname.isRuntime()) {
                        sp = initMultiname(multiname, codeStream, stack, sp);
                    }

                    a1 = (stack[--sp]); // object
                    (stack[sp++] = env.constructprop(a1, multiname, call_argc, call_argv));

                    continue;
                }

            case OP_swap:
                {
                    a1 = stack[sp - 1];
                    stack[sp - 1] = stack[sp - 2];
                    stack[sp - 2] = a1;
                    continue;
                }

            case OP_setslot:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    a2 = (stack[--sp]); // value
                    a1 = (stack[--sp]); // object

                    if (a1 && a1.setSlot) {
                        a1.setSlot(u1, a2);
                    }

                    continue;
                }

            case OP_callproperty:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));
                    call_argc = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = call_argc;
                    call_argv = new Array(call_argc);
                    while (temp--) {
                        call_argv[temp] = (stack[--sp]);
                    };

                    if (multiname.isRuntime()) {
                        sp = initMultiname(multiname, codeStream, stack, sp);
                    }

                    a1 = (stack[--sp]); // object
                    (stack[sp++] = env.callproperty(a1, multiname, call_argc, call_argv, false));

                    continue;
                }

            case OP_callproplex:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));
                    call_argc = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = call_argc;
                    call_argv = new Array(call_argc);
                    while (temp--) {
                        call_argv[temp] = (stack[--sp]);
                    };

                    if (multiname.isRuntime()) {
                        sp = initMultiname(multiname, codeStream, stack, sp);
                    }

                    a1 = (stack[--sp]); // object
                    (stack[sp++] = env.callproperty(a1, multiname, call_argc, call_argv, true));

                    continue;
                }

            case OP_callpropvoid:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));
                    call_argc = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = call_argc;
                    call_argv = new Array(call_argc);
                    while (temp--) {
                        call_argv[temp] = (stack[--sp]);
                    };

                    if (multiname.isRuntime()) {
                        sp = initMultiname(multiname, codeStream, stack, sp);
                    }

                    a1 = (stack[--sp]); // object
                    env.callproperty(a1, multiname, call_argc, call_argv, false);

                    continue;
                }

            case OP_pop:
                {
                    (stack[--sp]);
                    continue;
                }

            case OP_pushbyte:
                {
                    (stack[sp++] = (temp = codeStream.readU8(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp));
                    continue;
                }

            case OP_newfunction:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    var method_info = pool.resolveMethodInfo(u1);

                    (stack[sp++] = env.newFunction(method_info, outerScope, scope));
                    continue;
                }

            case OP_jump:
                {
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = i1 + codeStream.getPos();
                    if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                        codeStream.seekBegin(temp);
                        if (lbr[temp] == undefined) lbr[temp] = 0;
                        else lbr[temp]++;;
                    } else {
                        LOG_DEBUG("get out of spray loop");
                        AVMPLUS.inSprayLoop = false;
                        if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                        else lbr[codeStream.getPos()]++;;
                    }
                    pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    continue;
                }

            case OP_lessthan:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);

                    (stack[sp++] = AVMPLUS.compare(a1, a2));
                    continue;
                }

            case OP_lessequals:
                {

                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    var b = AVMPLUS.compare(a2, a1);

                    if (b == false) {
                        (stack[sp++] = true);
                    } else if (b == true) {
                        (stack[sp++] = false);
                    } else {
                        (stack[sp++] = undefined);
                    }

                    continue;
                }

            case OP_greaterthan:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);

                    (stack[sp++] = AVMPLUS.compare(a2, a1));
                    continue;
                }

            case OP_greaterequals:
                {

                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    var b = AVMPLUS.compare(a1, a2);

                    if (b == false) {
                        (stack[sp++] = true);
                    } else if (b == true) {
                        (stack[sp++] = false);
                    } else {
                        (stack[sp++] = undefined);
                    }

                    continue;
                }

            case OP_newobject:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // arg_count
                    var newobj = new Object();
                    for (var i = 0; i < u1; i++) {
                        a2 = (stack[--sp]); // value
                        a1 = (stack[--sp]); // name

                        newobj[a1] = a2;
                    }
                    (stack[sp++] = newobj);
                    continue;
                }

            case OP_newarray:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // arg_count
                    var newarray = new Array(u1);
                    for (var i = u1 - 1; i >= 0; i--) {
                        newarray[i] = (stack[--sp]);
                    }
                    (stack[sp++] = newarray);
                    continue;
                }

            case OP_newcatch:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // index to exception_info
                    (stack[sp++] = undefined);
                    continue;
                }

            case OP_iftrue:
                {
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    if (a1 == true) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (a1 == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }

            case OP_iffalse:
                {
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    if (a1 == false) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (a1 == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }

            case OP_ifeq:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);;
                    var b = AVMPLUS.equal(a1, a2);
                    if (b == true) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (b == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }

            case OP_ifne:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);;
                    var b = AVMPLUS.equal(a1, a2);
                    if (b == false) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (b == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }

            case OP_ifstricteq:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);;
                    var b = AVMPLUS.equal(a1, a2);
                    if (b == true) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (b == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }

            case OP_ifstrictne:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);;
                    var b = AVMPLUS.equal(a1, a2);
                    if (b == false) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (b == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }

            case OP_iflt:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);;
                    var b = AVMPLUS.compare(a1, a2);
                    if (b == true) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (b == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }

            case OP_ifnlt:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);;
                    var b = AVMPLUS.compare(a1, a2);

                    if (b == false) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (b == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }

            case OP_ifle:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);;
                    var b = AVMPLUS.compare(a2, a1);
                    if (b == false) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (b == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }

            case OP_ifnle:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);;
                    var b = AVMPLUS.compare(a2, a1);
                    if (b == true) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (b == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }


            case OP_ifgt:
                {
                    // same as ifnle
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);;
                    var b = AVMPLUS.compare(a2, a1);
                    if (b == true) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (b == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }

            case OP_ifngt:
                {
                    // same as ifle
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);;
                    var b = AVMPLUS.compare(a2, a1);
                    if (b == false) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (b == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }

            case OP_ifge:
                {
                    //same as ifnlt
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);;
                    var b = AVMPLUS.compare(a1, a2);

                    if (b == false) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (b == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }


                    continue;
                }

            case OP_ifnge:
                {
                    // same as iflt
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    i1 = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);;
                    var b = AVMPLUS.compare(a1, a2);
                    if (b == true) {
                        temp = i1 + codeStream.getPos();
                        if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                            codeStream.seekBegin(temp);
                            if (lbr[temp] == undefined) lbr[temp] = 0;
                            else lbr[temp]++;;
                        } else {
                            LOG_DEBUG("get out of spray loop");
                            AVMPLUS.inSprayLoop = false;
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    } else if (b == undefined) {
                        temp = i1 + codeStream.getPos();
                        if (i1 > 0 || !lbr[temp]) {
                            temp = i1 + codeStream.getPos();
                            if (((!lbr[temp] || lbr[temp] <= 20000) && !AVMPLUS.inSprayLoop)) {
                                codeStream.seekBegin(temp);
                                if (lbr[temp] == undefined) lbr[temp] = 0;
                                else lbr[temp]++;;
                            } else {
                                LOG_DEBUG("get out of spray loop");
                                AVMPLUS.inSprayLoop = false;
                                if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                                else lbr[codeStream.getPos()]++;;
                            }
                            pc = codeStream.getPos(), AVMPLUS.pc = pc;
                        } else {
                            if (AVMPLUS.lastWriteBytesPC >= temp && AVMPLUS.lastWriteBytesPC <= pc) global_instrumentor.reportEvent("actionscript_emulator_writebytes_in_loop");
                            if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                            else lbr[codeStream.getPos()]++;;
                        }
                        pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    }

                    continue;
                }

            case OP_dup:
                {
                    a1 = stack[sp - 1];
                    /*
                       if ( a1 == undefined ) {
                       PUSH(undefined);
                       } else {
                       PUSH(a1.clone());
                       }*/
                    (stack[sp++] = a1);
                    continue;
                }

            case OP_kill:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (local[(u1)] = (undefined));
                    continue;
                }

            case OP_increment:
                {
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 + 1);
                    continue;
                }

            case OP_inclocal:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // index
                    a1 = (local[(u1)]);
                    (local[(u1)] = (a1 + 1));
                    continue;
                }

            case OP_increment_i:
                {
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 + 1);
                    continue;

                }

            case OP_inclocal_i:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // index
                    a1 = (local[(u1)]);
                    (local[(u1)] = (a1 + 1));
                    continue;
                }

            case OP_decrement:
                {
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 - 1);
                    continue;
                }

            case OP_declocal:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    a1 = (local[(u1)]);
                    (local[(u1)] = (a1 - 1));
                    continue;
                }

            case OP_decrement_i:
                {
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 - 1);
                    continue;
                }

            case OP_declocal_i:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    a1 = (local[(u1)]);
                    (local[(u1)] = (a1 - 1));
                    continue;
                }

            case OP_add:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 + a2);
                    continue;
                }

            case OP_add_i:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 + a2);
                    continue;
                }

            case OP_subtract:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 - a2);
                    continue;
                }

            case OP_subtract_i:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 - a2);
                    continue;
                }

            case OP_multiply:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 * a2);
                    continue;
                }

            case OP_multiply_i:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 * a2);
                    continue;
                }

            case OP_divide:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 / a2);
                    continue;
                }

            case OP_modulo:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 % a2);
                    continue;
                }

            case OP_lshift:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 << a2);
                    continue;
                }

            case OP_rshift:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 >> a2);
                    continue;
                }

            case OP_urshift:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 >>> a2);
                    continue;
                }

            case OP_bitand:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 & a2);
                    continue;
                }

            case OP_bitor:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 | a2);
                    continue;
                }

            case OP_bitxor:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 ^ a2);
                    continue;
                }

            case OP_equals:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = AVMPLUS.equal(a1, a2));
                    continue;
                }

            case OP_strictequals:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = AVMPLUS.equal(a1, a2));
                    continue;
                }

            case OP_convert_s:
                {
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1.toString());
                    continue;
                }

            case OP_convert_d:
                {
                    a1 = (stack[--sp]);
                    (stack[sp++] = Number(a1));
                    continue;
                }

            case OP_coerce_d:
                {
                    a1 = (stack[--sp]);
                    (stack[sp++] = Number(a1));
                    continue;
                }

            case OP_convert_b:
                {
                    a1 = (stack[--sp]);
                    if (a1) {
                        (stack[sp++] = true);
                    } else {
                        (stack[sp++] = false);
                    }
                    continue;
                }


            case OP_coerce_b:
                {
                    a1 = (stack[--sp]);
                    if (a1) {
                        (stack[sp++] = true);
                    } else {
                        (stack[sp++] = false);
                    }
                    continue;
                }


            case OP_convert_o:
                {
                    continue;
                }

            case OP_negate:
                {
                    a1 = (stack[--sp]);
                    (stack[sp++] = -a1);
                    continue;
                }

            case OP_negate_i:
                {
                    a1 = (stack[--sp]);
                    (stack[sp++] = -a1);
                    continue;
                }

            case OP_typeof:
                {
                    (stack[sp++] = typeof ((stack[--sp])));
                    continue;
                }

            case OP_not:
                {
                    a1 = (stack[--sp]);
                    (stack[sp++] = !a1);
                    continue;
                }


            case OP_bitnot:
                {
                    a1 = (stack[--sp]);
                    (stack[sp++] = ~a1);
                    continue;
                }

            case OP_esc_xelem:
                {
                    continue;
                }

            case OP_esc_xattr:
                {
                    continue;
                }

            case OP_lookupswitch:
                {
                    var base = pc - 1;

                    var default_offset = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    var jump_offset = default_offset;
                    var case_count = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);

                    var index = (stack[--sp]);
                    if (index < case_count) {
                        codeStream.skip(index * 3);
                        jump_offset = (temp = codeStream.readS24(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    }

                    if (((!lbr[base + jump_offset] || lbr[base + jump_offset] <= 20000) && !AVMPLUS.inSprayLoop)) {
                        codeStream.seekBegin(base + jump_offset);
                        if (lbr[base + jump_offset] == undefined) lbr[base + jump_offset] = 0;
                        else lbr[base + jump_offset]++;;
                    } else {
                        LOG_DEBUG("get out of spray loop");
                        AVMPLUS.inSprayLoop = false;
                        if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                        else lbr[codeStream.getPos()]++;;
                    }
                    pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    continue;
                }

            case OP_getdescendants:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));

                    if (multiname.isRuntime()) {
                        sp = initMultiname(multiname, codeStream, stack, sp);
                    }

                    (stack[--sp]);
                    (stack[sp++] = undefined);
                    continue;
                }

            case OP_checkfilter:
                {
                    continue;
                }

            case OP_finddef:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));

                    (stack[sp++] = undefined);
                    continue;
                }

            case OP_nextname:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);

                    (stack[sp++] = undefined);
                    continue;
                }

            case OP_nextvalue:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);

                    (stack[sp++] = undefined);
                    continue;
                }

            case OP_hasnext:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);

                    (stack[sp++] = 0);
                    continue;
                }

            case OP_hasnext2:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    u2 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);

                    (stack[sp++] = false);
                    continue;
                }

            case OP_sxi1:
                {

                    continue;
                }

            case OP_sxi8:
                {

                    continue;
                }

            case OP_sxi16:
                {
                    continue;
                }

            case OP_li8:
                {
                    continue;
                }

            case OP_li16:
                {
                    continue;
                }

            case OP_li32:
                {
                    continue;
                }

            case OP_lf32:
                {
                    continue;
                }

            case OP_lf64:
                {
                    continue;
                }

            case OP_si8:
                {
                    continue;
                }

            case OP_si16:
                {
                    continue;
                }

            case OP_si32:
                {
                    continue;
                }

            case OP_sf32:
                {
                    continue;
                }

            case OP_sf64:
                {
                    continue;
                }

            case OP_deleteproperty:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));

                    if (!multiname.isRuntime()) {
                        var obj = (stack[--sp]);

                    } else if (!multiname.isRtns() && ((typeof stack[sp - 1] == "number")) && stack[sp - 1] >= 0 && AVMPLUS.isObject(stack[sp - 2])) {
                        var index = (stack[--sp]);
                        var obj = (stack[--sp]);

                    } else {

                        (stack[--sp]);
                        (stack[--sp]);

                    }


                    continue;
                }

            case OP_setglobalslot:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // slot
                    a1 = (stack[--sp]); // value

                    if (globalScope && globalScope.setSlot) {
                        globalScope.setSlot(u1, a1);
                    }
                    continue;
                }

            case OP_getglobalslot:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);

                    if (globalScope && globalScope.getSlot) {
                        (stack[sp++] = globalScope.getSlot(u1));
                    } else {
                        (stack[sp++] = undefined);
                    }
                }

            case OP_call:
                {

                    call_argc = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = call_argc;
                    call_argv = new Array(call_argc);
                    while (temp--) {
                        call_argv[temp] = (stack[--sp]);
                    };

                    a1 = (stack[--sp]); // receiver
                    func = (stack[--sp]); // function


                    (stack[sp++] = env.op_call(a1, func, call_argc, call_argv));

                    continue;
                }

            case OP_construct:
                {
                    call_argc = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = call_argc;
                    call_argv = new Array(call_argc);
                    while (temp--) {
                        call_argv[temp] = (stack[--sp]);
                    };

                    a1 = (stack[--sp]); // object
                    (stack[sp++] = env.op_construct(a1, argc, argv));

                    continue;
                }

            case OP_callstatic:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // method_id

                    call_argc = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = call_argc;
                    call_argv = new Array(call_argc);
                    while (temp--) {
                        call_argv[temp] = (stack[--sp]);
                    };

                    a1 = (stack[--sp]); // receiver

                    f = pool.resolveMethodInfo(u1);
                    if (f) {
                        (stack[sp++] = env.op_call(a1, f, call_argc, call_argv));
                    } else {
                        (stack[sp++] = undefined);
                    }

                    continue;
                }

            case OP_callmethod:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // disp_id
                    call_argc = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = call_argc;
                    call_argv = new Array(call_argc);
                    while (temp--) {
                        call_argv[temp] = (stack[--sp]);
                    };

                    a1 = (stack[--sp]); // receiver
                    if (a1 && a1.getMethod) {
                        f = a1.getMethod(u1);

                        if (f) {
                            (stack[sp++] = env.op_call(a1, f, call_argc, call_argv));
                        } else {
                            (stack[sp++] = undefined);
                        }
                    } else {
                        (stack[sp++] = undefined)
                    }

                    continue;
                }

            case OP_applytype:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // disp_id
                    call_argc = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = call_argc;
                    call_argv = new Array(call_argc);
                    while (temp--) {
                        call_argv[temp] = (stack[--sp]);
                    };


                    continue;
                }

            case OP_callsuper:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));
                    call_argc = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = call_argc;
                    call_argv = new Array(call_argc);
                    while (temp--) {
                        call_argv[temp] = (stack[--sp]);
                    };

                    if (multiname.isRuntime()) {
                        sp = initMultiname(multiname, codeStream, stack, sp);
                    }

                    a1 = (stack[--sp]); // object

                    (stack[sp++] = env.callsuper(a1, multiname, call_argc, call_argv));
                    continue;
                }

            case OP_callsupervoid:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));
                    call_argc = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = call_argc;
                    call_argv = new Array(call_argc);
                    while (temp--) {
                        call_argv[temp] = (stack[--sp]);
                    };

                    if (multiname.isRuntime()) {
                        sp = initMultiname(multiname, codeStream, stack, sp);
                    }

                    a1 = (stack[--sp]); // object

                    env.callsuper(a1, multiname, call_argc, call_argv);
                    continue;
                }

            case OP_getsuper:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));

                    if (multiname.isRuntime()) {
                        sp = initMultiname(multiname, codeStream, stack, sp);
                    }

                    a1 = (stack[--sp]); // object
                    (stack[sp++] = env.getProperty(a1, multiname));

                    continue;
                }


            case OP_setsuper:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (multiname = pool.resolveMultiname(u1));

                    a2 = (stack[--sp]); // value
                    if (multiname.isRuntime()) {
                        sp = initMultiname(multiname, codeStream, stack, sp);
                    }

                    a1 = (stack[--sp]); // name
                    (stack[sp++] = env.setProperty(a1, multiname, a2));

                    continue;
                }

            case OP_constructsuper:
                {
                    call_argc = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    temp = call_argc;
                    call_argv = new Array(call_argc);
                    while (temp--) {
                        call_argv[temp] = (stack[--sp]);
                    };

                    a1 = (stack[--sp]); // object


                    continue;
                }

            case OP_astype:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);

                    continue;
                }

            case OP_astypelate:
                {
                    (stack[--sp]);
                    continue;
                }

            case OP_coerce:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // multiname index
                    continue;
                }

            case OP_coerce_o:
                {

                    continue;
                }

            case OP_coerce_s:
                {

                    continue;
                }

            case OP_istype:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (stack[sp++] = undefined);
                    continue;
                }

            case OP_istypelate:
                {
                    (stack[--sp]);
                    (stack[--sp]);
                    (stack[sp++] = undefined);
                    continue;
                }

            case OP_getscopeobject:
                {
                    u1 = (temp = codeStream.readU8(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    (stack[sp++] = (scope[u1]));
                    continue;
                }

            case OP_getouterscope:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    if (outerScope) {
                        (stack[sp++] = outerScope[u1]);
                    } else {
                        (stack[sp++] = undefined);
                    }

                    continue;
                }

            case OP_pushwith:
                {
                    a1 = (stack[--sp]); //scope object
                    (scope[scopeDepth++] = a1);
                    continue;
                }

            case OP_newactivation:
                {
                    (stack[sp++] = new AS3Object("activation"));
                    continue;
                }

            case OP_throw:
                {
                    LOG_DEBUG("Exiting " + methodInfo.getName() + " return_value: " + AVMPLUS.format(undefined));
                    return (undefined);
                    continue;
                }

            case OP_instanceof:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);
                    (stack[sp++] = a1 instanceof a2);
                    continue;
                }

            case OP_in:
                {
                    a2 = (stack[--sp]);
                    a1 = (stack[--sp]);

                    (stack[sp++] = a1 in a2);

                    continue;
                }

            case OP_dxns:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp);
                    continue;

                }

            case OP_dxnslate:
                {
                    (stack[--sp]);
                    continue;
                }

            case OP_abs_jump:
                {
                    u1 = (temp = codeStream.readU30(), pc = codeStream.getPos(), AVMPLUS.pc = pc, temp); // taget
                    if (((!lbr[u1] || lbr[u1] <= 20000) && !AVMPLUS.inSprayLoop)) {
                        codeStream.seekBegin(u1);
                        if (lbr[u1] == undefined) lbr[u1] = 0;
                        else lbr[u1]++;;
                    } else {
                        LOG_DEBUG("get out of spray loop");
                        AVMPLUS.inSprayLoop = false;
                        if (lbr[codeStream.getPos()] == undefined) lbr[codeStream.getPos()] = 0;
                        else lbr[codeStream.getPos()]++;;
                    }
                    pc = codeStream.getPos(), AVMPLUS.pc = pc;
                    continue;
                }

            default:
                {
                    if (opcode >= 0xF3 && opcode <= 0xFF) {
                        if (codeStream.readU8() == 0xE8) {
                            global_instrumentor.reportEvent("actionscript_emulator_cve_2007_0071\r\n");
                            AVMPLUS.exploitEvidence = true;
                            LOG_DEBUG("Exiting " + methodInfo.getName() + " return_value: " + AVMPLUS.format(undefined));
                            return (undefined);
                        }

                        codeStream.skip(4);

                    } else {
                        LOG_DEBUG("Exiting " + methodInfo.getName() + " return_value: " + AVMPLUS.format(undefined));
                        return (undefined);
                    }

                }

        }
    }

}

function ItemInfo(key, value) {
    this.key = key;
    this.value = value;
}

function MetadataInfo(stream) {
    this.name = stream.readU30();
    this.itemCount = stream.readU30();
    this.items = new Array();

    for (var i = 0; i < this.itemCount; ++i) {
        this.items.push(new ItemInfo(stream.readU30(), stream.readU30()));
    }
}

function MetadataPool(abcFile, stream) {
    this.abcFile = abcFile;
    this.stream = stream;
    this.size = stream.readU30();

    this.metadataInfo = new Array();
    for (var i = 0; i < this.size; ++i) {
        this.metadataInfo.push(new MetadataInfo(stream));
    }
}

function ExceptionInfo(methodBodyInfo, stream) {
    this.methodBodyInfo = methodBodyInfo;

    this.from = stream.readU30();
    this.to = stream.readU30();
    this.target = stream.readU30();
    this.excType = stream.readU30();
    this.varName = stream.readU30();
}

function MethodBodyInfo(methodBodyPool, stream) {
    this.methodBodyPool = methodBodyPool;
    this.pool = this.methodBodyPool.abcFile;

    this.method = stream.readU30();
    this.pool.resolveMethodInfo(this.method).setMethodBody(this);

    this.maxStack = stream.readU30();
    this.localCount = stream.readU30();

    this.initScopeDepth = stream.readU30();
    this.maxScopeDepth = stream.readU30();

    this.codeLength = stream.readU30();
    this.code = stream.readBytes(this.codeLength);

    this.exceptionCount = stream.readU30();
    this.exception = new Array(this.exceptionCount);
    for (var i = 0; i < this.exceptionCount; ++i) {
        this.exception[i] = new ExceptionInfo(this, stream);
    }

    this.traitCount = stream.readU30();
    this.traits = new Array(this.traitCount);
    for (var i = 0; i < this.traitCount; ++i) {
        this.traits[i] = new TraitInfo(this.methodBodyPool.abcFile.constantPool, stream);
    }
}

function MethodBodyPool(abcFile, stream) {
    this.abcFile = abcFile;
    this.stream = stream;

    this.scanMethodBody = function () {
        this.methodBodyCount = this.stream.readU30();
        this.methodBody = new Array(this.methodBodyCount);

        if (1) {
            LOG_DEBUG("method body count: " + this.methodBodyCount);
        }

        for (var i = 0; i < this.methodBodyCount; ++i) {
            var pos = this.stream.getPos();
            var cpool = this.abcFile.constantPool;

            this.methodBody[i] = new MethodBodyInfo(this, this.stream);
            if (1) {
                var mbody = this.methodBody[i];
                info = "method_body[" + i + "] ";
                info += " max_stack=" + mbody.maxStack + " local_count=" + mbody.localCount;
                info += " initial_scope_depth=" + mbody.initScopeDepth + " max_scope_depth=" + mbody.maxScopeDepth;
                info += " code_length=" + mbody.codeLength + " exception_count=" + mbody.exceptionCount;

                LOG_DEBUG(info);
            }
        }
    }

    this.scanMethodBody();
}
// Method flags

var METHOD_Arguments = 0x1;
var METHOD_Activation = 0x2;
var METHOD_Needrest = 0x4;
var METHOD_HasOptional = 0x8;
var METHOD_IgnoreRest = 0x10;
var METHOD_Native = 0x20;
var METHOD_Setsdxns = 0x40;
var METHOD_HasParamNames = 0x80;

function OptionDetail(val, kind) {
    this.val = val;
    this.kind = kind;
}

function MethodInfo(mpool, stream, methodId) {
    this.mpool = mpool;
    this.pool = mpool.abcFile;
    this.stream = stream;
    this.signatureBuilt = false;
    this.methodId = methodId;

    this.paramCount = stream.readU30();
    this.returnTypeIndex = stream.readU30();
    this.paramType = new Array();

    for (var i = 0; i < this.paramCount; ++i) {
        this.paramType.push(stream.readU30());
    }

    this.name = stream.readU30();
    this.flags = stream.readU8();

    this.optionCount = ((this.flags & METHOD_HasOptional) == 0) ? 0 : stream.readU30();
    this.options = new Array();
    for (var i = 0; i < this.optionCount; ++i) {
        this.options.push(new OptionDetail(stream.readU30(), stream.readU8()));
    }

    this.paramNameCount = ((this.flags & METHOD_HasParamNames) == 0) ? 0 : this.paramCount;
    this.paramNames = new Array();
    for (var i = 0; i < this.paramNameCount; ++i) {
        this.paramNames.push(stream.readU30());
    }
}

MethodInfo.prototype.needRest = function () {
    return (this.flags & METHOD_Needrest);
}

MethodInfo.prototype.needArguments = function () {
    return (this.flags & METHOD_Arguments);
}

MethodInfo.prototype.hasOptional = function () {
    return (this.flags & METHOD_HasOptional);
}

MethodInfo.prototype.buildMethodSignature = function () {
    if (!this.signatureBuilt) {

        var type_name = this.pool.resolveMultiname(this.returnTypeIndex);

        var return_type = this.pool.resolveTypeName(type_name);
        if (null == return_type) {
            return_type = AVMPLUS.createDummyType(type_name);
        }
        this.returnType = return_type;

        this.args = new Array(this.paramCount);

        for (var i = 0; i < this.paramCount; i++) {
            var arg = {};

            var type_name = this.pool.resolveMultiname(this.paramType[i]);

            param_type = this.pool.resolveTypeName(type_name);
            if (null == param_type) {
                param_type = AVMPLUS.createDummyType(type_name);
            }

            arg.typeName = type_name;
            arg.type = param_type;
            arg.name = this.pool.resolveConstantString(this.paramNames[i]);
            arg.defaultValue = undefined;
            this.args[i] = arg;
        }

        // optional params
        for (var i = 0; i < this.optionCount; i++) {
            var defaultValue = this.pool.resolveConstantValue(this.options[i].val, this.options[i].kind);
            this.args[this.paramCount - this.optionCount + i].defaultValue = defaultValue;
        }
        this.signatureBuilt = true;
    }
}

MethodInfo.prototype.createBlindArguments = function (thisArg) {
    this.buildMethodSignature();

    var i = 0;
    var argv = new Array(this.args.length + thisArg ? 1 : 0);

    if (thisArg)
        argv[i++] = thisArg;

    for (; i < argv.length; i++) {

        var param = this.args[i];

        if (param.defaultValue != undefined)
            argv[i] = param.defaultValue;
        else if (param.type && param.type.default_template) {
            argv[i] = param.type.default_template;
        }
    }

    return argv;
}

MethodInfo.prototype.setMethodBody = function (body) {
    this.methodBody = body;
}

MethodInfo.prototype.getCode = function () {
    return this.methodBody.code;
}

MethodInfo.prototype.getName = function () {
    if (!this.nameString && this.name) {
        this.nameString = this.pool.resolveConstantString(this.name);
    }
    return this.nameString;
}

MethodInfo.prototype.setName = function (name) {
    this.nameString = name;
}

MethodInfo.prototype.getParamCount = function () {
    return this.paramCount;
}

MethodInfo.prototype.getOptionCount = function () {
    return this.optionCount;
}

MethodInfo.prototype.getLocalCount = function () {
    return this.methodBody.localCount;
}

MethodInfo.prototype.getMaxStack = function () {
    return this.methodBody.maxStack;
}

MethodInfo.prototype.getMaxScope = function () {
    return this.methodBody.maxScopeDepth;
}

var g_callstacks = 0;
MethodInfo.prototype.invoke = function (env, argc, argv) {
    global_instrumentor.setMethodExecuted(this.methodId);
    if (global_instrumentor.isMethodTimeout(this.methodId)) {
        return undefined;
    }
    //changed by peter for flash crash, we control the call stack size in AVM, not in V8

    //LOG_INFO("jack:enter:"+ env.method.getName());
    //LOG_INFO("Current call stack depth is " + g_callstacks);
    if (g_callstacks > 500)
    {
	    LOG_INFO("Exit by call stack size exceed max:"+ env.method.getName());
	    return null;
    }
    g_callstacks++;
    var ret = interpBoxed(env, argc, argv);
    g_callstacks--;
	
    //LOG_INFO("jack:exit:"+ env.method.getName());
    return ret;
    // return interpBoxed(env, argc, argv);
}

function MethodPool(abcFile, stream) {
    this.abcFile = abcFile;
    this.stream = stream;

    this.scanMethods = function () {
        this.methodCount = this.stream.readU30();
        this.methods = new Array();

        if (1) {
            LOG_DEBUG("method info count: " + this.methodCount);
        }

        for (var i = 0; i < this.methodCount; ++i) {
            var pos = this.stream.getPos();
            methodInfo = new MethodInfo(this, this.stream, i);
            this.methods.push(methodInfo);
            if (1) {
                var cpool = this.abcFile.constantPool;
                var info = pos + ":method[" + i + "]:\r\n";
                info += "  returnType=" + cpool.getMultinameString(methodInfo.returnTypeIndex) + "\r\n";
                info += "  param_count=" + methodInfo.paramCount + "\r\n";
                info += "  name=" + cpool.getConstantString(methodInfo.name) + "\r\n";
                info += "  flags=" + methodInfo.flags + "\r\n";

                LOG_DEBUG(info);
            }
        }
    }

    this.scanMethods();
}

var MULTINAME_ATTR = 0x01; // attribute name
var MULTINAME_QNAME = 0x02; // qualified name (size==1, explicit in code)
var MULTINAME_RTNS = 0x04; // runtime namespace
var MULTINAME_RTNAME = 0x08; // runtime name
var MULTINAME_NSSET = 0x10;
var MULTINAME_TYPEPARAM = 0x20;

function MultinameInfo(cpool, stream, multinameIndex) {

    this.cpool = cpool;

    this.kind = stream.readU8();
    this.flags = 0;
    this.multinameIndex = multinameIndex;

    switch (this.kind) {
        case CONSTANT_Qname:
        case CONSTANT_QnameA:
            var ns = stream.readU30();
            this.nsSet = new NamespaceSet(1);
            this.nsSet.setNamespace(0, this.cpool.getNamespace(ns));
            this.name = stream.readU30();

            if (0 == ns) {
                this.setAnyNamespace();
            }

            if (this.name != 0) {
                this.nameString = this.cpool.getConstantString(this.name);
                LOG_DEBUG("multiname: "+this.nameString);
            } else {
                this.nameString = "*";
                this.setAnyName();
            }

            this.setQName();
            this.setAttr(this.kind == CONSTANT_QnameA);

            break;

        case CONSTANT_RTQname:
        case CONSTANT_RTQnameA:
            this.name = stream.readU30();
            if (this.name != 0) {
                this.nameString = this.cpool.getConstantString(this.name)
            } else {
                this.nameString = "*";
                this.setAnyName();
            }

            this.setQName();
            this.setRtns();
            this.setAttr(this.kind == CONSTANT_RTQnameA);
            break;

        case CONSTANT_Multiname:
        case CONSTANT_MultinameA:
            this.name = stream.readU30();
            this.nsSetIndex = stream.readU30();

            if (this.name != 0) {
                this.nameString = this.cpool.getConstantString(this.name)
            } else {
                this.nameString = "*";
                this.setAnyName();
            }

            this.setAttr(this.kind == CONSTANT_MultinameA);
            this.setNsset(this.cpool.getNamespaceSet(this.nsSetIndex));
            break;

        case CONSTANT_RTQnameL:
        case CONSTANT_RTQnameLA:
            this.setQName();
            this.setRtns();
            this.setRtname();
            this.setAttr(this.kind == CONSTANT_RTQnameLA);
            break;

        case CONSTANT_MultinameL:
        case CONSTANT_MultinameLA:
            this.nsSetIndex = stream.readU30();
            this.setRtname();
            this.setNsset(this.cpool.getNamespaceSet(this.nsSetIndex));
            this.setAttr(this.kind == CONSTANT_MultinameLA);
            break;

        case CONSTANT_TypeName:
            var index = stream.readU30(); // name index
            var count = stream.readU30(); // param count;

            for (var i = 0; i < count; ++i) {
                this.setTypeParameter(stream.readU32());
            }
            break;

        default:
            throw "Invalid constant type: " + this.kind;
            break;
    }
}

MultinameInfo.prototype.getName = function () {
    return this.nameString;
}

MultinameInfo.prototype.setName = function (s) {
    this.nameString = s;
}

MultinameInfo.prototype.setNamespace = function (ns) {
    this.nsSet = new NamespaceSet(0);
    this.nsSet.setNamespace(0, ns);
}

MultinameInfo.prototype.setTypeParameter = function (index) {
    this.flags |= MULTINAME_TYPEPARAM;
    this.nextIndex = index;
}

MultinameInfo.prototype.isTypeParameter = function () {
    return this.flags & MULTINAME_TYPEPARAM;
}

MultinameInfo.prototype.setRtname = function () {
    this.flags |= MULTINAME_RTNAME;
}

MultinameInfo.prototype.isRtname = function () {
    return this.flags & MULTINAME_RTNAME;
}

MultinameInfo.prototype.setNsset = function (set) {
    this.nsSet = set;
    this.flags |= MULTINAME_NSSET;
    this.flags &= ~MULTINAME_RTNS;
}

MultinameInfo.prototype.isNsset = function () {
    return this.flags & MULTINAME_NSSET;
}

MultinameInfo.prototype.setAttr = function (b) {
    if (b)
        this.flags |= MULTINAME_ATTR;
    else
        this.flags &= ~MULTINAME_ATTR;
}

MultinameInfo.prototype.isAttr = function () {

    return this.flags & MULTINAME_ATTR;

}

MultinameInfo.prototype.setQName = function () {
    this.flags |= MULTINAME_QNAME;
}

MultinameInfo.prototype.isQName = function () {
    return this.flags & MULTINAME_QNAME;
}

MultinameInfo.prototype.setRtns = function () {
    this.flags |= MULTINAME_RTNS;
    this.flags &= ~MULTINAME_NSSET;
}

MultinameInfo.prototype.isRtns = function () {
    return this.flags & MULTINAME_RTNS;
}

MultinameInfo.prototype.setAnyName = function () {
    this.flags &= ~(MULTINAME_RTNAME);
    this.name = null;
}

MultinameInfo.prototype.isAnyName = function () {
    return (null == this.name);
}

MultinameInfo.prototype.setAnyNamespace = function () {
    this.flags &= ~(MULTINAME_NSSET | MULTINAME_RTNS);
    this.nsSet = null;
}

MultinameInfo.prototype.isAnyNamespace = function () {
    return (null == this.nsSet);
}

MultinameInfo.prototype.isRuntime = function () {
    return this.flags & (MULTINAME_RTNAME | MULTINAME_RTNS);
}

MultinameInfo.prototype.getFullName = function () {

    if (this.isRuntime() || !this.getName())
        return undefined;

    if (!this.fullname) {
        this.fullname = "";
        if (this.nsSet) {
            var ns = this.getNamespaceAt(0);
            if (ns && ns.getName() && ns.getName().length) {
                this.fullname += ns.getName() + "::";
            }
        }
        this.fullname += this.getName();
    }

    return this.fullname;
}


/**
 * returns true if this multiname could resolve to a binding.  Attributes,
 * wildcards, and runtime parts mean it can't match any binding.
 */
MultinameInfo.prototype.isBinding = function () {
    return !(this.flags & (MULTINAME_ATTR | MULTINAME_RTNS | MULTINAME_RTNAME)) && this.name && this.nsSet;
}

MultinameInfo.prototype.getName = function () {
    return this.nameString;
}

MultinameInfo.prototype.getNamespaceSet = function () {
    return this.nsSet;
}

MultinameInfo.prototype.getNamespaceCount = function () {
    if (!this.nsSet)
        return 0;

    return this.nsSet.getCount();
}

MultinameInfo.prototype.getNamespaceAt = function (index) {

    return this.nsSet.getNamespace(index);
}


function NamespaceInfo(kind, name) {
    this.kind = kind;
    this.name = name;


    this.getName = function () {
        return this.name;
    }
}

function NamespaceSet(count) {
    this.count = count;
    this.ns = new Array(count);

    this.setNamespace = function (i, ns) {
        this.ns[i] = ns;
    }

    this.getNamespace = function (i) {
        return this.ns[i];
    }

    this.getCount = function () {
        return this.ns.length;
    }
}

Object.prototype.as3Format = function () {
    return this.as3Name + this.as3Postfix;
}

Object.prototype.clone = function () {
    var objClone;


    if (this.constructor == Object) {
        objClone = new this.constructor();
    } else {
        objClone = new this.constructor(this.valueOf());
    }
    for (var key in this) {
        if (objClone[key] != this[key]) {
            if (typeof (this[key]) == 'object') {
                objClone[key] = this[key].clone();
            } else {
                objClone[key] = this[key];
            }
        }
    }

    objClone.toString = this.toString;
    objClone.valueOf = this.valueOf;
    return objClone;
}

Object.prototype.asPrototype = function () {
    if (this.prototype_template) {
        return this.prototype_template;
    }
    /* else if ( this.instance_template ) {
       return this.instance_template;
       } */
    else {
        return this.clone();
    }
}

Object.prototype.createInstance = function (argc, argv) {
    var newInstance;
    if (this.createInstanceImpl) {
        newInstance = this.createInstanceImpl.apply(this, argv);
    }
    /*else if ( this.AS3Init ) {
      newInstance = this.AS3Init.apply( this, argv );
      } */
    else if (this instanceof ClassClousure) {
        newInstance = this.createInstanceTemplate();
        if (newInstance.iinit) {
            var new_argv = new Array(argc + 1);
            new_argv[0] = newInstance;
            ArrayCopy(argv, 0, new_argv, 1, argc);
            newInstance.iinit.coerceEnter(argc + 1, new_argv);
        }
    }

    if (newInstance == undefined) {
        newInstance = AVMPLUS.createDummyObject("");
    }
    newInstance.as3Name = this.as3Name;
    newInstance.as3Postfix = "@";
    return newInstance;
}

Object.prototype.hasMultinameProperty = function (multiname) {
    return this.getMultinameProperty(multiname) != undefined;
}

Object.prototype.getUintProperty = function (index) {
    if (index >= 0) {
        if (this[index] != undefined)
            return this[index];
        else if (this.as3GetUintProperty) {
            return this.as3GetUintProperty(index);
        } else if (this.as3InternalBuffer && this.as3InternalBuffer[index] != undefined)
            return this.as3InternalBuffer[index];
    }

    var name = this.as3Name;
    if (!name)
        name = "Unknown";

    if (name == "RestArray" && index > 0x3fffff00) {
        global_instrumentor.reportEvent("actionscript_emulator_cve_2010_2110\r\n");
        AVMPLUS.exploitEvidence = true;
    }

    return new UnknownObject(name + "[" + index + "]");
}

Object.prototype.setUintProperty = function (index, value) {
    if (index >= 0) {
        if (this[index] != undefined)
            this[index] = value;
        else if (this.as3SetUintProperty) {
            this.as3SetUintProperty(index, value);
        } else if (this.as3InternalBuffer && (this.as3InternalBuffer[index] != undefined)) {
            this.as3InternalBuffer[index] = value;
        } else {
            this[index] = value;
        }
    }
}

Object.prototype.getMultinameProperty = function (multiname) {

    if (!multiname)
        return undefined;

    if (this.lastLookupName === multiname)
        return this.lastLookupResult;

    var _property = undefined;
    var name = multiname.getName();

    if (name) {

        if (multiname.isAnyNamespace() || !multiname.getNamespaceSet() || multiname.getNamespaceCount() == 0)
            return this[name];

        for (var i = 0; i < multiname.getNamespaceCount(); i++) {
            var ns = multiname.getNamespaceAt(i);
            var fullname = "";
            if (ns && ns.getName() && ns.getName().length) {
                fullname += ns.getName() + "::";
            }
            fullname += name;
            if (this[name] != undefined && !(this[name] instanceof Number && this[name] == 1)) {
                _property = this[name];
                break;
            } else if (this[fullname] != undefined && !(this[name] instanceof Number && this[name] == 1)) {
                _property = this[fullname];
                break;
            }
        }
    }

    // TODO: add a hash map for name lookup ?
    this.lastLookupName = multiname;
    this.lastLookupResult = _property;
    return _property;
}

Object.prototype.setMultinameProperty = function (multiname, value) {
    var found = false;

    if (!multiname)
        return undefined;

    var name = multiname.getName();
    if (name) {
        this[name] = value;

        if (multiname.isAnyNamespace() || !multiname.getNamespaceSet() || multiname.getNamespaceCount() == 0) {
            return;
        }

        for (var i = 0; i < multiname.getNamespaceCount(); i++) {
            var ns = multiname.getNamespaceAt(i);
            var fullname = "";
            if (ns && ns.getName() && ns.getName().length) {
                fullname += ns.getName() + "::";
            }
            fullname += name;
            if (this[fullname] != undefined) {
                this[fullname] = value;
                found = true;
                break;
            }

        }

        if (!found) {
            this[multiname.getFullName()] = value;
        }
    }

    this.lastLookupName = multiname;
    this.lastLookupResult = value;

}

Object.as3Name = "Object";
Object.prototype.as3Name = "Object";
Object.prototype.as3Postfix = "@";
Object.as3Name = "Object";
Object.as3Postfix = "$";
Object.prototype_template = new Object();
Object.instance_template = new Object();
Object.default_template = new Object();
TopLevel.global["public::" + "Object"] = Object;;
String.as3Name = "String";
String.prototype.as3Name = "String";
String.prototype.as3Postfix = "@";
String.as3Name = "String";
String.as3Postfix = "$";
String.prototype_template = new String();
String.instance_template = new String();
String.default_template = new String();
TopLevel.global["public::" + "String"] = String;;
Array.as3Name = "Array";
Array.prototype.as3Name = "Array";
Array.prototype.as3Postfix = "@";
Array.as3Name = "Array";
Array.as3Postfix = "$";
Array.prototype_template = new Array();
Array.instance_template = new Array();
Array.default_template = new Array();
TopLevel.global["public::" + "Array"] = Array;;
Number.as3Name = "Number";
Number.prototype.as3Name = "Number";
Number.prototype.as3Postfix = "@";
Number.as3Name = "Number";
Number.as3Postfix = "$";
Number.prototype_template = new Number();
Number.instance_template = new Number();
Number.default_template = new Number();
TopLevel.global["public::" + "Number"] = Number;;
Boolean.as3Name = "Boolean";
Boolean.prototype.as3Name = "Boolean";
Boolean.prototype.as3Postfix = "@";
Boolean.as3Name = "Boolean";
Boolean.as3Postfix = "$";
Boolean.prototype_template = new Boolean();
Boolean.instance_template = new Boolean();
Boolean.default_template = new Boolean();
TopLevel.global["public::" + "Boolean"] = Boolean;;
Date.as3Name = "Date";
Date.prototype.as3Name = "Date";
Date.prototype.as3Postfix = "@";
Date.as3Name = "Date";
Date.as3Postfix = "$";
Date.prototype_template = new Date();
Date.instance_template = new Date();
Date.default_template = new Date();
TopLevel.global["public::" + "Date"] = Date;;
Function.as3Name = "Function";
Function.prototype.as3Name = "Function";
Function.prototype.as3Postfix = "@";
Function.as3Name = "Function";
Function.as3Postfix = "$";
Function.prototype_template = new Function();
Function.instance_template = new Function();
Function.default_template = new Function();
TopLevel.global["public::" + "Function"] = Function;;

RegExp.as3Name = "RegExp";
RegExp.prototype.as3Name = "RegExp";
RegExp.prototype.as3Postfix = "@";
RegExp.as3Name = "RegExp";
RegExp.as3Postfix = "$";
RegExp.prototype_template = new RegExp();
RegExp.instance_template = new RegExp();
RegExp.default_template = new RegExp();
TopLevel.global["public::" + "RegExp"] = RegExp;;

var int = Number;
var uint = Number;

String.createInstanceImpl = function () {
    return new String(arguments[0]);
}

Object.createInstanceImpl = function () {
    return new Object();
}

Array.createInstanceImpl = function () {
    if (0 == arguments.length)
        return new Array();
    else if (1 == arguments.length)
        return new Array(arguments[0]);
    else {
        var newArray = new Array();
        for (var i = 0; i < arguments.length; i++)
            newArray.push(arguments[i]);

        return newArray;
    }
}

function AS3Object(name) {
    this.as3Name = name;
    this.as3Postfix = "@";

    this.slots = null;
    this.nextSlotId = 1;
    this.nextDispId = 1;
}

Object.prototype.toAS3Object = function (name) {
    AS3Object.apply(this, [name]);
}

Object.prototype.ensureSlots = function (size) {
    if (this.slots && this.slots.length > size)
        return;

    newSlots = new Array(size * 2);
    if (this.slots) {
        for (var i = 0; i < this.slots.length; i++) {
            newSlots[i] = this.slots[i];
        }
    }

    this.slots = newSlots;
}

Object.prototype.ensureMethodSlots = function (size) {
    if (this.methodSlots && this.methodSlots.length > size)
        return;

    if (size <= 0)
        return;

    newSlots = new Array(size * 2);
    if (this.methodSlots) {
        for (var i = 0; i < this.methodSlots.length; i++) {
            newSlots[i] = this.methodSlots[i];
        }
    }

    this.methodSlots = newSlots;
}

Object.prototype.computeSlotId = function (slotId) {
    var slot = (slotId != 0) ? slotId : this.nextSlotId++;
    if (slotId != 0)
        this.nextSlotId = slotId + 1;

    return slot;
}


Object.prototype.computeDispId = function (dispId) {
    var disp = (dispId != 0) ? dispId : this.nextDispId++;
    if (disp != 0)
        this.nextDispId = disp + 1;

    return disp;
}

Object.prototype.bindMethod = function (disp_id, method) {

    disp_id = this.computeDispId(disp_id);
    this.ensureMethodSlots(disp_id);

    this.methodSlots[disp_id] = method;
}

Object.prototype.getMethod = function (disp_id) {
    if (this.methodSlots) {
        return this.methodSlots[disp_id];
    }

    return AVMPLUS.createDummyObject("method_disp_" + disp_id);
}

Object.prototype.setProperty = function (slotId, ns, name, value) {
    fullname = '';

    if (!name) {
        return;
    }

    if (ns && ns.getName() && ns.getName().length) {
        fullname += ns.getName() + "::";
    }
    fullname += name;

    this[name] = value;
    this[fullname] = value;
    if (slotId != 0) {
        this.ensureSlots(slotId);
        this.slots[slotId] = name;
    }
}

Object.prototype.getSlot = function (slotId) {
    return this[this.slots[slotId]];
}

Object.prototype.setSlot = function (slotId, value) {
    this.ensureSlots(slotId);
    if (this.slots[slotId] == undefined) {
        var name = "dynamic_slot_" + slotId;
        this.slots[slotId] = name;

    }
    this[this.slots[slotId]] = value;

    if (value && value instanceof MethodEnv) {
        value.method.setName(this.slots[slotId]);
    }
}

Object.prototype.getSlotCount = function () {
    return this.slots.length;
}

function ScriptInfo(scriptPool, stream) {
    this.scriptPool = scriptPool;

    this.init = stream.readU30();
    this.traitCount = stream.readU30();

    this.traits = new Array(this.traitCount);
    for (var i = 0; i < this.traitCount; ++i) {
        this.traits[i] = new TraitInfo(this.scriptPool.abcFile.constantPool, stream);
    }
}

function ScriptPool(abcFile, stream) {
    this.abcFile = abcFile;
    this.stream = stream;

    this.scanScriptPool = function () {
        this.scriptCount = this.stream.readU30();
        this.scripts = new Array(this.scriptCount);

        if (1) {
            LOG_DEBUG("script info count: " + this.scriptCount);
        }

        for (var i = 0; i < this.scriptCount; ++i) {
            var pos = this.stream.getPos();

            this.scripts[i] = new ScriptInfo(this, this.stream);

            if (1) {
                var script = this.scripts[i];
                var info = pos + ":script[" + i + "] init_index=" + script.init + "\r\n";

                info += "  trait_count=" + script.traits.length + "\r\n";
                for (var j = 0; j < script.traits.length; j++) {
                    var trait = script.traits[j];
                    info += "    " + trait.dumpInfo() + "\r\n";
                }

                LOG_DEBUG(info);
            }
        }
    }

    this.getScript = function (i) {
        return this.scripts[i];
    }

    this.getScriptCount = function () {
        return this.scriptCount;
    }

    this.scanScriptPool();
}
var SEEK_SET = 0;
var SEEK_CUR = 1;
var SEEK_END = 2;

function IsHexString(s) {
    var lengthToCheck = s.length < 100 ? s.length : 100;

    for (var i = 0; i < lengthToCheck; i++) {
        if (parseInt(s.charAt(i), 16) == NaN)
            return false;
    }

    return true;
}


function BytecodeBuffer() {
    this.buffer = [];


    this.clearBuffer = function () {
        this.buffer = [];
    }

    this.initFromString = function (data, start, size) {
        this.clearBuffer();
        for (var i = start; i < start + size; ++i) {
            var c = data.charCodeAt(i);
            this.buffer.push(c & 0xFF);
            this.buffer.push((c >>> 8) & 0xFF);
        }
    }

    this.initFromRawData = function (data, start, size) {
        this.clearBuffer();
        for (var i = start; i < start + size; ++i) {
            var c = data.charCodeAt(i);
            this.buffer.push(c);
        }
    }

    this.initFromBuffer = function (otherBuffer, start, size) {
        this.buffer = otherBuffer.slice(start, start + size);
    }


    this.readBytes = function (start, size) {
        newBuffer = new BytecodeBuffer();
        newBuffer.initFromBuffer(this.buffer, start, size);
        return newBuffer;
    }

    this.getByteAt = function (index) {
        return this.buffer[index];
    }

    this.length = function () {
        return this.buffer.length;
    }

    this.getBuffer = function () {
        return this.buffer;
    }
}

function InputStream(bytecodeBuffer, start, size) {
    this.buffer = bytecodeBuffer;
    this.start = start;
    this.end = start + size;
    this.size = size;
    this.pos = start;

    var pow_2_7 = Math.pow(2, 7);
    var pow_2_8 = Math.pow(2, 8);

    var pow_2_15 = Math.pow(2, 15);
    var pow_2_16 = Math.pow(2, 16);

    var pow_2_23 = Math.pow(2, 23);
    var pow_2_24 = Math.pow(2, 24);

    var pow_2_31 = Math.pow(2, 31);
    var pow_2_32 = Math.pow(2, 32);



    this.available = function () {
        return this.end - this.pos;
    }

    this.readByte = function () {
        return this.buffer.getByteAt(this.pos++);
    }

    this.look = function () {
        return this.buffer.getByteAt(this.pos);
    }

    this.skip = function (offset) {
        this.pos += offset;
    }

    this.readU8 = function () {
        //TODO: check whether reached stream end

        return this.readByte();
    }

    this.readU16 = function () {
        var b0 = this.readByte();
        var b1 = this.readByte();

        return (b0 + (b1 << 8));
    }

    this.readU24 = function () {
        var b0 = this.readByte();
        var b1 = this.readByte();
        var b2 = this.readByte();

        return (b0 + (b1 << 8) + (b2 << 16));
    }

    this.readU30 = function () {
        var result = this.readByte();
        if (0 == (result & 0x00000080))
            return result;

        result = (result & 0x7F) + (this.readByte() << 7);
        if (0 == (result & 0x00004000))
            return result;

        result = (result & 0x3FFF) + (this.readByte() << 14);
        if (0 == (result & 0x00200000))
            return result;

        result = (result & 0x1FFFFF) + (this.readByte() << 21);
        if (0 == (result & 0x10000000))
            return result;

        return ((result & 0x0FFFFFFF) + (this.readByte() << 28)) & 0x3FFFFFFF;
    }

    this.readU32 = function () {
        return this.readS32() >>> 0;
    }

    this.readS8 = function () {
        var result = this.readU8();

        return (result > pow_2_7 - 1 ? result - pow_2_8 : result);

    }

    this.readS16 = function () {
        var result = this.readU16();

        return (result > pow_2_15 - 1 ? result - pow_2_16 : result);
    }

    this.readS24 = function () {
        var result = this.readU24();

        return (result > pow_2_23 - 1 ? result - pow_2_24 : result);
    }

    this.readS32 = function () {
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
    }

    this.readBytes = function (size) {

        bytes = this.buffer.readBytes(this.pos, size);
        this.pos += size;
        return bytes;
    }

    /**
      8-byte IEEE-754 floating point value
      */
    this.readDouble = function () {
        var b7 = this.readByte(),
            b6 = this.readByte(),
            b5 = this.readByte(),
            b4 = this.readByte(),
            b3 = this.readByte(),
            b2 = this.readByte(),
            b1 = this.readByte(),
            b0 = this.readByte();

        sign = 1 - (2 * (b0 >> 7)),
        exponent = ((((b0 << 1) & 0xff) << 3) | (b1 >> 4)) - (Math.pow(2, 10) - 1),

        // Binary operators such as | and << operate on 32 bit values, using + and Math.pow(2) instead
        mantissa = ((b1 & 0x0f) * Math.pow(2, 48)) + (b2 * Math.pow(2, 40)) + (b3 * Math.pow(2, 32)) + (b4 * Math.pow(2, 24)) + (b5 * Math.pow(2, 16)) + (b6 * Math.pow(2, 8)) + b7;

        if (mantissa == 0 && exponent == -(Math.pow(2, 10) - 1)) {
            return 0.0;
        }

        if (exponent == -1023) { // Denormalized
            return sign * mantissa * Math.pow(2, -1022 - 52);
        }

        return sign * (1 + mantissa * Math.pow(2, -52)) * Math.pow(2, exponent);
    }

    this.readStringInfo = function () {
        var string = "";
        var length = this.readU30();
        for (var i = 0; i < length; ++i) {
            //string += String.fromCharCode( this.readByte() );
            // string = utf8to16(string);


            //
            // NOTE: the above works fine for chrome browser
            //       but does not work in SAL, so we use the following work aroud
            //
            var c = this.readByte();
            if (length > 100 || (c >= 0x20 && c <= 0x7e))
                string += String.fromCharCode(c);
            else
                string += "\\x" + c.toString(16);

        }

        return string;
    }

    this.SkipString = function () {
        while (this.readU8()) {}
    }

    this.getPos = function () {
        return this.pos;
    }

    this.seekBegin = function (off) {
        this.seek(off, SEEK_SET);
    }



    this.seek = function (off, dir) {
        if (dir == SEEK_SET) {
            this.pos = off;
        } else if (dir == SEEK_CUR) {
            this.pos += off;
        } else if (dir == SEEK_END) {
            this.pos = this.end + off;
        }
    }
}


Array.prototype.subArray = function () {
    if (arguments.length < 1)
        return this.Clone();

    var i, j;
    var start = arguments[0];
    var end = arguments[1];

    if (typeof start != number)
        return null;

    if (typeof end != number)
        end = this.length;
    else if (end > arguments.length)
        end = arguments.length;

    if (start < 0 || start < end)
        return null;

    var sub_array = new Array(end - start);
    for (i = start, j = 0; i < end; i++, j++) {
        sub_array[j] = this[i];
    }

    return sub_array;
}

function ArrayCopy(from, from_start, to, to_start, count) {
    if (!from || !to)
        return;

    var fromIndex = from_start;
    var toIndex = to_start;
    var fromLength = from.length;
    var toLength = to.length;

    for (; fromIndex < fromLength && toIndex < toLength; fromIndex++, toIndex++)
        to[toIndex] = from[fromIndex];
}

