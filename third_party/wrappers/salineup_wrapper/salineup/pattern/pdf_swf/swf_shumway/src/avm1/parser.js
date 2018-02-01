/*
* Copyright 2014 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    (function (AVM1) {
        var ActionsDataStream = Shumway.AVM1.ActionsDataStream;

        (function (ActionCode) {
            ActionCode[ActionCode["None"] = 0x00] = "None";
            ActionCode[ActionCode["ActionGotoFrame"] = 0x81] = "ActionGotoFrame";
            ActionCode[ActionCode["ActionGetURL"] = 0x83] = "ActionGetURL";
            ActionCode[ActionCode["ActionNextFrame"] = 0x04] = "ActionNextFrame";
            ActionCode[ActionCode["ActionPreviousFrame"] = 0x05] = "ActionPreviousFrame";
            ActionCode[ActionCode["ActionPlay"] = 0x06] = "ActionPlay";
            ActionCode[ActionCode["ActionStop"] = 0x07] = "ActionStop";
            ActionCode[ActionCode["ActionToggleQuality"] = 0x08] = "ActionToggleQuality";
            ActionCode[ActionCode["ActionStopSounds"] = 0x09] = "ActionStopSounds";
            ActionCode[ActionCode["ActionWaitForFrame"] = 0x8A] = "ActionWaitForFrame";
            ActionCode[ActionCode["ActionSetTarget"] = 0x8B] = "ActionSetTarget";
            ActionCode[ActionCode["ActionGoToLabel"] = 0x8C] = "ActionGoToLabel";
            ActionCode[ActionCode["ActionPush"] = 0x96] = "ActionPush";
            ActionCode[ActionCode["ActionPop"] = 0x17] = "ActionPop";
            ActionCode[ActionCode["ActionAdd"] = 0x0A] = "ActionAdd";
            ActionCode[ActionCode["ActionSubtract"] = 0x0B] = "ActionSubtract";
            ActionCode[ActionCode["ActionMultiply"] = 0x0C] = "ActionMultiply";
            ActionCode[ActionCode["ActionDivide"] = 0x0D] = "ActionDivide";
            ActionCode[ActionCode["ActionEquals"] = 0x0E] = "ActionEquals";
            ActionCode[ActionCode["ActionLess"] = 0x0F] = "ActionLess";
            ActionCode[ActionCode["ActionAnd"] = 0x10] = "ActionAnd";
            ActionCode[ActionCode["ActionOr"] = 0x11] = "ActionOr";
            ActionCode[ActionCode["ActionNot"] = 0x12] = "ActionNot";
            ActionCode[ActionCode["ActionStringEquals"] = 0x13] = "ActionStringEquals";
            ActionCode[ActionCode["ActionStringLength"] = 0x14] = "ActionStringLength";
            ActionCode[ActionCode["ActionMBStringLength"] = 0x31] = "ActionMBStringLength";
            ActionCode[ActionCode["ActionStringAdd"] = 0x21] = "ActionStringAdd";
            ActionCode[ActionCode["ActionStringExtract"] = 0x15] = "ActionStringExtract";
            ActionCode[ActionCode["ActionMBStringExtract"] = 0x35] = "ActionMBStringExtract";
            ActionCode[ActionCode["ActionStringLess"] = 0x29] = "ActionStringLess";
            ActionCode[ActionCode["ActionToInteger"] = 0x18] = "ActionToInteger";
            ActionCode[ActionCode["ActionCharToAscii"] = 0x32] = "ActionCharToAscii";
            ActionCode[ActionCode["ActionMBCharToAscii"] = 0x36] = "ActionMBCharToAscii";
            ActionCode[ActionCode["ActionAsciiToChar"] = 0x33] = "ActionAsciiToChar";
            ActionCode[ActionCode["ActionMBAsciiToChar"] = 0x37] = "ActionMBAsciiToChar";
            ActionCode[ActionCode["ActionJump"] = 0x99] = "ActionJump";
            ActionCode[ActionCode["ActionIf"] = 0x9D] = "ActionIf";
            ActionCode[ActionCode["ActionCall"] = 0x9E] = "ActionCall";
            ActionCode[ActionCode["ActionGetVariable"] = 0x1C] = "ActionGetVariable";
            ActionCode[ActionCode["ActionSetVariable"] = 0x1D] = "ActionSetVariable";
            ActionCode[ActionCode["ActionGetURL2"] = 0x9A] = "ActionGetURL2";
            ActionCode[ActionCode["ActionGotoFrame2"] = 0x9F] = "ActionGotoFrame2";
            ActionCode[ActionCode["ActionSetTarget2"] = 0x20] = "ActionSetTarget2";
            ActionCode[ActionCode["ActionGetProperty"] = 0x22] = "ActionGetProperty";
            ActionCode[ActionCode["ActionSetProperty"] = 0x23] = "ActionSetProperty";
            ActionCode[ActionCode["ActionCloneSprite"] = 0x24] = "ActionCloneSprite";
            ActionCode[ActionCode["ActionRemoveSprite"] = 0x25] = "ActionRemoveSprite";
            ActionCode[ActionCode["ActionStartDrag"] = 0x27] = "ActionStartDrag";
            ActionCode[ActionCode["ActionEndDrag"] = 0x28] = "ActionEndDrag";
            ActionCode[ActionCode["ActionWaitForFrame2"] = 0x8D] = "ActionWaitForFrame2";
            ActionCode[ActionCode["ActionTrace"] = 0x26] = "ActionTrace";
            ActionCode[ActionCode["ActionGetTime"] = 0x34] = "ActionGetTime";
            ActionCode[ActionCode["ActionRandomNumber"] = 0x30] = "ActionRandomNumber";
            ActionCode[ActionCode["ActionCallFunction"] = 0x3D] = "ActionCallFunction";
            ActionCode[ActionCode["ActionCallMethod"] = 0x52] = "ActionCallMethod";
            ActionCode[ActionCode["ActionConstantPool"] = 0x88] = "ActionConstantPool";
            ActionCode[ActionCode["ActionDefineFunction"] = 0x9B] = "ActionDefineFunction";
            ActionCode[ActionCode["ActionDefineLocal"] = 0x3C] = "ActionDefineLocal";
            ActionCode[ActionCode["ActionDefineLocal2"] = 0x41] = "ActionDefineLocal2";
            ActionCode[ActionCode["ActionDelete"] = 0x3A] = "ActionDelete";
            ActionCode[ActionCode["ActionDelete2"] = 0x3B] = "ActionDelete2";
            ActionCode[ActionCode["ActionEnumerate"] = 0x46] = "ActionEnumerate";
            ActionCode[ActionCode["ActionEquals2"] = 0x49] = "ActionEquals2";
            ActionCode[ActionCode["ActionGetMember"] = 0x4E] = "ActionGetMember";
            ActionCode[ActionCode["ActionInitArray"] = 0x42] = "ActionInitArray";
            ActionCode[ActionCode["ActionInitObject"] = 0x43] = "ActionInitObject";
            ActionCode[ActionCode["ActionNewMethod"] = 0x53] = "ActionNewMethod";
            ActionCode[ActionCode["ActionNewObject"] = 0x40] = "ActionNewObject";
            ActionCode[ActionCode["ActionSetMember"] = 0x4F] = "ActionSetMember";
            ActionCode[ActionCode["ActionTargetPath"] = 0x45] = "ActionTargetPath";
            ActionCode[ActionCode["ActionWith"] = 0x94] = "ActionWith";
            ActionCode[ActionCode["ActionToNumber"] = 0x4A] = "ActionToNumber";
            ActionCode[ActionCode["ActionToString"] = 0x4B] = "ActionToString";
            ActionCode[ActionCode["ActionTypeOf"] = 0x44] = "ActionTypeOf";
            ActionCode[ActionCode["ActionAdd2"] = 0x47] = "ActionAdd2";
            ActionCode[ActionCode["ActionLess2"] = 0x48] = "ActionLess2";
            ActionCode[ActionCode["ActionModulo"] = 0x3F] = "ActionModulo";
            ActionCode[ActionCode["ActionBitAnd"] = 0x60] = "ActionBitAnd";
            ActionCode[ActionCode["ActionBitLShift"] = 0x63] = "ActionBitLShift";
            ActionCode[ActionCode["ActionBitOr"] = 0x61] = "ActionBitOr";
            ActionCode[ActionCode["ActionBitRShift"] = 0x64] = "ActionBitRShift";
            ActionCode[ActionCode["ActionBitURShift"] = 0x65] = "ActionBitURShift";
            ActionCode[ActionCode["ActionBitXor"] = 0x62] = "ActionBitXor";
            ActionCode[ActionCode["ActionDecrement"] = 0x51] = "ActionDecrement";
            ActionCode[ActionCode["ActionIncrement"] = 0x50] = "ActionIncrement";
            ActionCode[ActionCode["ActionPushDuplicate"] = 0x4C] = "ActionPushDuplicate";
            ActionCode[ActionCode["ActionReturn"] = 0x3E] = "ActionReturn";
            ActionCode[ActionCode["ActionStackSwap"] = 0x4D] = "ActionStackSwap";
            ActionCode[ActionCode["ActionStoreRegister"] = 0x87] = "ActionStoreRegister";
            ActionCode[ActionCode["ActionInstanceOf"] = 0x54] = "ActionInstanceOf";
            ActionCode[ActionCode["ActionEnumerate2"] = 0x55] = "ActionEnumerate2";
            ActionCode[ActionCode["ActionStrictEquals"] = 0x66] = "ActionStrictEquals";
            ActionCode[ActionCode["ActionGreater"] = 0x67] = "ActionGreater";
            ActionCode[ActionCode["ActionStringGreater"] = 0x68] = "ActionStringGreater";
            ActionCode[ActionCode["ActionDefineFunction2"] = 0x8E] = "ActionDefineFunction2";
            ActionCode[ActionCode["ActionExtends"] = 0x69] = "ActionExtends";
            ActionCode[ActionCode["ActionCastOp"] = 0x2B] = "ActionCastOp";
            ActionCode[ActionCode["ActionImplementsOp"] = 0x2C] = "ActionImplementsOp";
            ActionCode[ActionCode["ActionTry"] = 0x8F] = "ActionTry";
            ActionCode[ActionCode["ActionThrow"] = 0x2A] = "ActionThrow";
            ActionCode[ActionCode["ActionFSCommand2"] = 0x2D] = "ActionFSCommand2";
            ActionCode[ActionCode["ActionStrictMode"] = 0x89] = "ActionStrictMode";
        })(AVM1.ActionCode || (AVM1.ActionCode = {}));
        var ActionCode = AVM1.ActionCode;

        var AS2ActionsData = (function () {
            function AS2ActionsData(bytes, id) {
                this.bytes = bytes;
                this.id = id;
            }
            return AS2ActionsData;
        })();
        AVM1.AS2ActionsData = AS2ActionsData;

        var ParsedPushRegisterAction = (function () {
            function ParsedPushRegisterAction(registerNumber) {
                this.registerNumber = registerNumber;
            }
            return ParsedPushRegisterAction;
        })();
        AVM1.ParsedPushRegisterAction = ParsedPushRegisterAction;

        var ParsedPushConstantAction = (function () {
            function ParsedPushConstantAction(constantIndex) {
                this.constantIndex = constantIndex;
            }
            return ParsedPushConstantAction;
        })();
        AVM1.ParsedPushConstantAction = ParsedPushConstantAction;

        (function (ArgumentAssignmentType) {
            ArgumentAssignmentType[ArgumentAssignmentType["None"] = 0] = "None";
            ArgumentAssignmentType[ArgumentAssignmentType["Argument"] = 1] = "Argument";
            ArgumentAssignmentType[ArgumentAssignmentType["This"] = 2] = "This";
            ArgumentAssignmentType[ArgumentAssignmentType["Arguments"] = 4] = "Arguments";
            ArgumentAssignmentType[ArgumentAssignmentType["Super"] = 8] = "Super";
            ArgumentAssignmentType[ArgumentAssignmentType["Global"] = 16] = "Global";
            ArgumentAssignmentType[ArgumentAssignmentType["Parent"] = 32] = "Parent";
            ArgumentAssignmentType[ArgumentAssignmentType["Root"] = 64] = "Root";
        })(AVM1.ArgumentAssignmentType || (AVM1.ArgumentAssignmentType = {}));
        var ArgumentAssignmentType = AVM1.ArgumentAssignmentType;

        var ActionsDataParser = (function () {
            function ActionsDataParser(stream) {
                this.stream = stream;
            }
            Object.defineProperty(ActionsDataParser.prototype, "position", {
                get: function () {
                    return this.stream.position;
                },
                set: function (value) {
                    this.stream.position = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ActionsDataParser.prototype, "eof", {
                get: function () {
                    return this.stream.position >= this.stream.end;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ActionsDataParser.prototype, "length", {
                get: function () {
                    return this.stream.end;
                },
                enumerable: true,
                configurable: true
            });
            ActionsDataParser.prototype.readNext = function () {
                var stream = this.stream;
                var currentPosition = stream.position;
                var actionCode = stream.readUI8();
                var length = actionCode >= 0x80 ? stream.readUI16() : 0;
                var nextPosition = stream.position + length;

                var args = null;
                switch (actionCode | 0) {
                    case 129 /* ActionGotoFrame */:
                        var frame = stream.readUI16();
                        var nextActionCode = stream.readUI8();
                        var play = false;
                        if (nextActionCode !== 0x06 && nextActionCode !== 0x07) {
                            console.error('Unexpected gotoFrame next code: ' + nextActionCode);
                        } else {
                            nextPosition++;
                            play = nextActionCode === 0x06;
                        }
                        args = [frame, play];
                        break;
                    case 131 /* ActionGetURL */:
                        var urlString = stream.readString();
                        var targetString = stream.readString();
                        args = [urlString, targetString];
                        break;
                    case 138 /* ActionWaitForFrame */:
                        var frame = stream.readUI16();
                        var count = stream.readUI8();
                        args = [frame, count];
                        break;
                    case 139 /* ActionSetTarget */:
                        var targetName = stream.readString();
                        args = [targetName];
                        break;
                    case 140 /* ActionGoToLabel */:
                        var label = stream.readString();
                        args = [label];
                        break;
                    case 150 /* ActionPush */:
                        var type, value;
                        args = [];
                        while (stream.position < nextPosition) {
                            type = stream.readUI8();
                            switch (type | 0) {
                                case 0:
                                    value = stream.readString();
                                    break;
                                case 1:
                                    value = stream.readFloat();
                                    break;
                                case 2:
                                    value = null;
                                    break;
                                case 3:
                                    value = void (0);
                                    break;
                                case 4:
                                    value = new ParsedPushRegisterAction(stream.readUI8());
                                    break;
                                case 5:
                                    value = stream.readBoolean();
                                    break;
                                case 6:
                                    value = stream.readDouble();
                                    break;
                                case 7:
                                    value = stream.readInteger();
                                    break;
                                case 8:
                                    value = new ParsedPushConstantAction(stream.readUI8());
                                    break;
                                case 9:
                                    value = new ParsedPushConstantAction(stream.readUI16());
                                    break;
                                default:
                                    console.error('Unknown value type: ' + type);
                                    stream.position = nextPosition;
                                    continue;
                            }
                            args.push(value);
                        }
                        break;
                    case 153 /* ActionJump */:
                        var offset = stream.readSI16();
                        args = [offset];
                        break;
                    case 157 /* ActionIf */:
                        var offset = stream.readSI16();
                        args = [offset];
                        break;
                    case 154 /* ActionGetURL2 */:
                        var flags = stream.readUI8();
                        args = [flags];
                        break;
                    case 159 /* ActionGotoFrame2 */:
                        var flags = stream.readUI8();
                        args = [flags];
                        if (!!(flags & 2)) {
                            args.push(stream.readUI16());
                        }
                        break;
                    case 141 /* ActionWaitForFrame2 */:
                        var count = stream.readUI8();
                        args = [count];
                        break;
                    case 136 /* ActionConstantPool */:
                        var count = stream.readUI16();
                        var constantPool = [];
                        for (var i = 0; i < count; i++) {
                            constantPool.push(stream.readString());
                        }
                        args = [constantPool];
                        break;
                    case 155 /* ActionDefineFunction */:
                        var functionName = stream.readString();
                        var count = stream.readUI16();
                        var functionParams = [];
                        for (var i = 0; i < count; i++) {
                            functionParams.push(stream.readString());
                        }

                        var codeSize = stream.readUI16();
                        nextPosition += codeSize;
                        var functionBody = new AS2ActionsData(stream.readBytes(codeSize), this.dataId + '_f' + stream.position);

                        args = [functionBody, functionName, functionParams];
                        break;
                    case 148 /* ActionWith */:
                        var codeSize = stream.readUI16();
                        nextPosition += codeSize;
                        var withBody = new AS2ActionsData(stream.readBytes(codeSize), this.dataId + '_w' + stream.position);
                        args = [withBody];
                        break;
                    case 135 /* ActionStoreRegister */:
                        var register = stream.readUI8();
                        args = [register];
                        break;
                    case 142 /* ActionDefineFunction2 */:
                        var functionName = stream.readString();
                        var count = stream.readUI16();
                        var registerCount = stream.readUI8();
                        var flags = stream.readUI16();
                        var registerAllocation = [];
                        var functionParams = [];
                        for (var i = 0; i < count; i++) {
                            var register = stream.readUI8();
                            var paramName = stream.readString();
                            functionParams.push(paramName);
                            if (register) {
                                registerAllocation[register] = {
                                    type: 1 /* Argument */,
                                    name: paramName,
                                    index: i
                                };
                            }
                        }

                        var j = 1;

                        // order this, arguments, super, _root, _parent, and _global
                        if (flags & 0x0001) {
                            registerAllocation[j++] = { type: 2 /* This */ };
                        }
                        if (flags & 0x0004) {
                            registerAllocation[j++] = { type: 4 /* Arguments */ };
                        }
                        if (flags & 0x0010) {
                            registerAllocation[j++] = { type: 8 /* Super */ };
                        }
                        if (flags & 0x0040) {
                            registerAllocation[j++] = { type: 64 /* Root */ };
                        }
                        if (flags & 0x0080) {
                            registerAllocation[j++] = { type: 32 /* Parent */ };
                        }
                        if (flags & 0x0100) {
                            registerAllocation[j++] = { type: 16 /* Global */ };
                        }

                        var suppressArguments = 0;
                        if (flags & 0x0002) {
                            suppressArguments |= 2 /* This */;
                        }
                        if (flags & 0x0008) {
                            suppressArguments |= 4 /* Arguments */;
                        }
                        if (flags & 0x0020) {
                            suppressArguments |= 8 /* Super */;
                        }

                        var codeSize = stream.readUI16();
                        nextPosition += codeSize;
                        var functionBody = new AS2ActionsData(stream.readBytes(codeSize), this.dataId + '_f' + stream.position);

                        args = [
                            functionBody, functionName, functionParams, registerCount,
                            registerAllocation, suppressArguments];
                        break;
                    case 143 /* ActionTry */:
                        var flags = stream.readUI8();
                        var catchIsRegisterFlag = !!(flags & 4);
                        var finallyBlockFlag = !!(flags & 2);
                        var catchBlockFlag = !!(flags & 1);
                        var trySize = stream.readUI16();
                        var catchSize = stream.readUI16();
                        var finallySize = stream.readUI16();
                        var catchTarget = catchIsRegisterFlag ? stream.readUI8() : stream.readString();

                        nextPosition += trySize + catchSize + finallySize;

                        var tryBody = new AS2ActionsData(stream.readBytes(trySize), this.dataId + '_t' + stream.position);
                        var catchBody = new AS2ActionsData(stream.readBytes(catchSize), this.dataId + '_c' + stream.position);
                        var finallyBody = new AS2ActionsData(stream.readBytes(finallySize), this.dataId + '_z' + stream.position);

                        args = [
                            catchIsRegisterFlag, catchTarget, tryBody,
                            catchBlockFlag, catchBody, finallyBlockFlag, finallyBody];
                        break;
                    case 137 /* ActionStrictMode */:
                        var mode = stream.readUI8();
                        args = [mode];
                        break;
                }
                stream.position = nextPosition;
                return {
                    position: currentPosition,
                    actionCode: actionCode,
                    actionName: ActionNamesMap[actionCode],
                    args: args
                };
            };
            ActionsDataParser.prototype.skip = function (count) {
                var stream = this.stream;
                while (count > 0 && stream.position < stream.end) {
                    var actionCode = stream.readUI8();
                    var length = actionCode >= 0x80 ? stream.readUI16() : 0;
                    stream.position += length;
                    count--;
                }
            };
            return ActionsDataParser;
        })();
        AVM1.ActionsDataParser = ActionsDataParser;

        var ActionNamesMap = {
            0x00: 'EOA',
            0x04: 'ActionNextFrame',
            0x05: 'ActionPreviousFrame',
            0x06: 'ActionPlay',
            0x07: 'ActionStop',
            0x08: 'ActionToggleQuality',
            0x09: 'ActionStopSounds',
            0x0A: 'ActionAdd',
            0x0B: 'ActionSubtract',
            0x0C: 'ActionMultiply',
            0x0D: 'ActionDivide',
            0x0E: 'ActionEquals',
            0x0F: 'ActionLess',
            0x10: 'ActionAnd',
            0x11: 'ActionOr',
            0x12: 'ActionNot',
            0x13: 'ActionStringEquals',
            0x14: 'ActionStringLength',
            0x15: 'ActionStringExtract',
            0x17: 'ActionPop',
            0x18: 'ActionToInteger',
            0x1C: 'ActionGetVariable',
            0x1D: 'ActionSetVariable',
            0x20: 'ActionSetTarget2',
            0x21: 'ActionStringAdd',
            0x22: 'ActionGetProperty',
            0x23: 'ActionSetProperty',
            0x24: 'ActionCloneSprite',
            0x25: 'ActionRemoveSprite',
            0x26: 'ActionTrace',
            0x27: 'ActionStartDrag',
            0x28: 'ActionEndDrag',
            0x29: 'ActionStringLess',
            0x2A: 'ActionThrow',
            0x2B: 'ActionCastOp',
            0x2C: 'ActionImplementsOp',
            0x2D: 'ActionFSCommand2',
            0x30: 'ActionRandomNumber',
            0x31: 'ActionMBStringLength',
            0x32: 'ActionCharToAscii',
            0x33: 'ActionAsciiToChar',
            0x34: 'ActionGetTime',
            0x35: 'ActionMBStringExtract',
            0x36: 'ActionMBCharToAscii',
            0x37: 'ActionMBAsciiToChar',
            0x3A: 'ActionDelete',
            0x3B: 'ActionDelete2',
            0x3C: 'ActionDefineLocal',
            0x3D: 'ActionCallFunction',
            0x3E: 'ActionReturn',
            0x3F: 'ActionModulo',
            0x40: 'ActionNewObject',
            0x41: 'ActionDefineLocal2',
            0x42: 'ActionInitArray',
            0x43: 'ActionInitObject',
            0x44: 'ActionTypeOf',
            0x45: 'ActionTargetPath',
            0x46: 'ActionEnumerate',
            0x47: 'ActionAdd2',
            0x48: 'ActionLess2',
            0x49: 'ActionEquals2',
            0x4A: 'ActionToNumber',
            0x4B: 'ActionToString',
            0x4C: 'ActionPushDuplicate',
            0x4D: 'ActionStackSwap',
            0x4E: 'ActionGetMember',
            0x4F: 'ActionSetMember',
            0x50: 'ActionIncrement',
            0x51: 'ActionDecrement',
            0x52: 'ActionCallMethod',
            0x53: 'ActionNewMethod',
            0x54: 'ActionInstanceOf',
            0x55: 'ActionEnumerate2',
            0x60: 'ActionBitAnd',
            0x61: 'ActionBitOr',
            0x62: 'ActionBitXor',
            0x63: 'ActionBitLShift',
            0x64: 'ActionBitRShift',
            0x65: 'ActionBitURShift',
            0x66: 'ActionStrictEquals',
            0x67: 'ActionGreater',
            0x68: 'ActionStringGreater',
            0x69: 'ActionExtends',
            0x81: 'ActionGotoFrame',
            0x83: 'ActionGetURL',
            0x87: 'ActionStoreRegister',
            0x88: 'ActionConstantPool',
            0x89: 'ActionStrictMode',
            0x8A: 'ActionWaitForFrame',
            0x8B: 'ActionSetTarget',
            0x8C: 'ActionGoToLabel',
            0x8D: 'ActionWaitForFrame2',
            0x8E: 'ActionDefineFunction2',
            0x8F: 'ActionTry',
            0x94: 'ActionWith',
            0x96: 'ActionPush',
            0x99: 'ActionJump',
            0x9A: 'ActionGetURL2',
            0x9B: 'ActionDefineFunction',
            0x9D: 'ActionIf',
            0x9E: 'ActionCall',
            0x9F: 'ActionGotoFrame2'
        };
    })(Shumway.AVM1 || (Shumway.AVM1 = {}));
    var AVM1 = Shumway.AVM1;
})(Shumway || (Shumway = {}));
