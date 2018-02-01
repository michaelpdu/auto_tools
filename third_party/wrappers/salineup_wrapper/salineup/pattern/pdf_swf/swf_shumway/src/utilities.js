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
///<reference path='avm2/references.ts' />

var Shumway;
(function (Shumway) {
    (function (CharacterCodes) {
        CharacterCodes[CharacterCodes["_0"] = 48] = "_0";
        CharacterCodes[CharacterCodes["_1"] = 49] = "_1";
        CharacterCodes[CharacterCodes["_2"] = 50] = "_2";
        CharacterCodes[CharacterCodes["_3"] = 51] = "_3";
        CharacterCodes[CharacterCodes["_4"] = 52] = "_4";
        CharacterCodes[CharacterCodes["_5"] = 53] = "_5";
        CharacterCodes[CharacterCodes["_6"] = 54] = "_6";
        CharacterCodes[CharacterCodes["_7"] = 55] = "_7";
        CharacterCodes[CharacterCodes["_8"] = 56] = "_8";
        CharacterCodes[CharacterCodes["_9"] = 57] = "_9";
    })(Shumway.CharacterCodes || (Shumway.CharacterCodes = {}));
    var CharacterCodes = Shumway.CharacterCodes;

    /**
    * The buffer length required to contain any unsigned 32-bit integer.
    */
    /* @const */ Shumway.UINT32_CHAR_BUFFER_LENGTH = 10;
    /* @const */ Shumway.UINT32_MAX = 0xFFFFFFFF;
    /* @const */ Shumway.UINT32_MAX_DIV_10 = 0x19999999;
    /* @const */ Shumway.UINT32_MAX_MOD_10 = 0x5;

    function isString(value) {
        return typeof value === "string";
    }
    Shumway.isString = isString;

    function isFunction(value) {
        return typeof value === "function";
    }
    Shumway.isFunction = isFunction;

    function isNumber(value) {
        return typeof value === "number";
    }
    Shumway.isNumber = isNumber;

    function isNumberOrString(value) {
        return typeof value === "number" || typeof value === "string";
    }
    Shumway.isNumberOrString = isNumberOrString;

    function isObject(value) {
        return typeof value === "object" || typeof value === 'function';
    }
    Shumway.isObject = isObject;

    function toNumber(x) {
        return +x;
    }
    Shumway.toNumber = toNumber;

    function isNumericString(value) {
        // ECMAScript 5.1 - 9.8.1 Note 1, this expression is true for all
        // numbers x other than -0.
        return String(Number(value)) === value;
    }
    Shumway.isNumericString = isNumericString;

    /**
    * Whether the specified |value| is a number or the string representation of a number.
    */
    function isNumeric(value) {
        if (typeof value === "number") {
            return true;
        } else if (typeof value === "string") {
            return isIndex(value) || isNumericString(value);
        } else {
            Debug.notImplemented(typeof value);
        }
    }
    Shumway.isNumeric = isNumeric;

    /**
    * Whether the specified |value| is an unsigned 32 bit number expressed as a number
    * or string.
    */
    function isIndex(value) {
        // js/src/vm/String.cpp JSFlatString::isIndexSlow
        // http://dxr.mozilla.org/mozilla-central/source/js/src/vm/String.cpp#474
        var index = 0;
        if (typeof value === "number") {
            index = (value | 0);
            if (value === index && index >= 0) {
                return true;
            }
            return value >>> 0 === value;
        }
        if (typeof value !== "string") {
            return false;
        }
        var length = value.length;
        if (length === 0) {
            return false;
        }
        if (value === "0") {
            return true;
        }

        // Is there any way this will fit?
        if (length > Shumway.UINT32_CHAR_BUFFER_LENGTH) {
            return false;
        }
        var i = 0;
        index = value.charCodeAt(i++) - 48 /* _0 */;
        if (index < 1 || index > 9) {
            return false;
        }
        var oldIndex = 0;
        var c = 0;
        while (i < length) {
            c = value.charCodeAt(i++) - 48 /* _0 */;
            if (c < 0 || c > 9) {
                return false;
            }
            oldIndex = index;
            index = 10 * index + c;
        }

        /*
        * Look out for "4294967296" and larger-number strings that fit in UINT32_CHAR_BUFFER_LENGTH.
        * Only unsigned 32-bit integers shall pass.
        */
        if ((oldIndex < Shumway.UINT32_MAX_DIV_10) || (oldIndex === Shumway.UINT32_MAX_DIV_10 && c <= Shumway.UINT32_MAX_MOD_10)) {
            return true;
        }
        return false;
    }
    Shumway.isIndex = isIndex;

    function isNullOrUndefined(value) {
        return value == undefined;
    }
    Shumway.isNullOrUndefined = isNullOrUndefined;

    (function (Debug) {
        function backtrace() {
            try  {
                throw new Error();
            } catch (e) {
                return e.stack ? e.stack.split('\n').slice(2).join('\n') : '';
            }
        }
        Debug.backtrace = backtrace;

        function error(message) {
            if (!inBrowser) {
                warn(Debug.backtrace());
            }
            throw new Error(message);
        }
        Debug.error = error;

        function assert(condition) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if (condition === "") {
                condition = true;
            }
            if (!condition) {
                var message = Array.prototype.slice.call(arguments);
                message.shift();
                Debug.error(message.join(""));
            }
        }
        Debug.assert = assert;

        function assertNotImplemented(condition, message) {
            if (!condition) {
                Debug.error("NotImplemented: " + message);
            }
        }
        Debug.assertNotImplemented = assertNotImplemented;

        function warning(message) {
            release || warn(message);
        }
        Debug.warning = warning;

        function notUsed(message) {
            release || Debug.assert(false, "Not Used " + message);
        }
        Debug.notUsed = notUsed;

        function notImplemented(message) {
            release || Debug.assert(false, "Not Implemented " + message);
        }
        Debug.notImplemented = notImplemented;

        function somewhatImplemented(message) {
            Debug.warning("somewhatImplemented: " + message);
        }
        Debug.somewhatImplemented = somewhatImplemented;

        function unexpected(message) {
            Debug.assert(false, "Unexpected: " + message);
        }
        Debug.unexpected = unexpected;
    })(Shumway.Debug || (Shumway.Debug = {}));
    var Debug = Shumway.Debug;

    function getTicks() {
        return performance.now();
    }
    Shumway.getTicks = getTicks;

    (function (ArrayUtilities) {
        /**
        * Pops elements from a source array into a destination array. This avoids
        * allocations and should be faster. The elements in the destination array
        * are pushed in the same order as they appear in the source array:
        *
        * popManyInto([1, 2, 3], 2, dst) => dst = [2, 3]
        */
        function popManyInto(src, count, dst) {
            release || assert(src.length >= count);
            for (var i = count - 1; i >= 0; i--) {
                dst[i] = src.pop();
            }
            dst.length = count;
        }
        ArrayUtilities.popManyInto = popManyInto;
    })(Shumway.ArrayUtilities || (Shumway.ArrayUtilities = {}));
    var ArrayUtilities = Shumway.ArrayUtilities;

    (function (ObjectUtilities) {
        function boxValue(value) {
            if (Shumway.isNullOrUndefined(value) || Shumway.isObject(value)) {
                return value;
            }
            return Object(value);
        }
        ObjectUtilities.boxValue = boxValue;

        function toKeyValueArray(object) {
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var array = [];
            for (var k in object) {
                if (hasOwnProperty.call(object, k)) {
                    array.push([k, object[k]]);
                }
            }
            return array;
        }
        ObjectUtilities.toKeyValueArray = toKeyValueArray;

        function hasOwnProperty(object, name) {
            return Object.prototype.hasOwnProperty.call(object, name);
        }
        ObjectUtilities.hasOwnProperty = hasOwnProperty;

        function createEmptyObject() {
            return Object.create(null);
        }
        ObjectUtilities.createEmptyObject = createEmptyObject;

        function createMap() {
            return Object.create(null);
        }
        ObjectUtilities.createMap = createMap;

        function createArrayMap() {
            return [];
        }
        ObjectUtilities.createArrayMap = createArrayMap;

        function defineReadOnlyProperty(object, name, value) {
            Object.defineProperty(object, name, {
                value: value,
                writable: false,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineReadOnlyProperty = defineReadOnlyProperty;

        function getOwnPropertyDescriptors(object) {
            var o = ObjectUtilities.createMap();
            var properties = Object.getOwnPropertyNames(object);
            for (var i = 0; i < properties.length; i++) {
                o[properties[i]] = Object.getOwnPropertyDescriptor(object, properties[i]);
            }
            return o;
        }
        ObjectUtilities.getOwnPropertyDescriptors = getOwnPropertyDescriptors;

        function cloneObject(object) {
            var clone = ObjectUtilities.createEmptyObject();
            for (var property in object) {
                clone[property] = object[property];
            }
            return clone;
        }
        ObjectUtilities.cloneObject = cloneObject;

        function copyProperties(object, template) {
            for (var property in template) {
                object[property] = template[property];
            }
        }
        ObjectUtilities.copyProperties = copyProperties;

        function getLatestGetterOrSetterPropertyDescriptor(object, name) {
            var descriptor = {};
            while (object) {
                var tmp = Object.getOwnPropertyDescriptor(object, name);
                if (tmp) {
                    descriptor.get = descriptor.get || tmp.get;
                    descriptor.set = descriptor.set || tmp.set;
                }
                if (descriptor.get && descriptor.set) {
                    break;
                }
                object = Object.getPrototypeOf(object);
            }
            return descriptor;
        }
        ObjectUtilities.getLatestGetterOrSetterPropertyDescriptor = getLatestGetterOrSetterPropertyDescriptor;

        function defineNonEnumerableGetterOrSetter(obj, name, value, isGetter) {
            var descriptor = ObjectUtilities.getLatestGetterOrSetterPropertyDescriptor(obj, name);
            descriptor.configurable = true;
            descriptor.enumerable = false;
            if (isGetter) {
                descriptor.get = value;
            } else {
                descriptor.set = value;
            }
            Object.defineProperty(obj, name, descriptor);
        }
        ObjectUtilities.defineNonEnumerableGetterOrSetter = defineNonEnumerableGetterOrSetter;

        function defineNonEnumerableGetter(obj, name, getter) {
            Object.defineProperty(obj, name, {
                get: getter,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineNonEnumerableGetter = defineNonEnumerableGetter;

        function defineNonEnumerableSetter(obj, name, setter) {
            Object.defineProperty(obj, name, {
                set: setter,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineNonEnumerableSetter = defineNonEnumerableSetter;

        function defineNonEnumerableProperty(obj, name, value) {
            Object.defineProperty(obj, name, {
                value: value,
                writable: true,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineNonEnumerableProperty = defineNonEnumerableProperty;

        function defineNonEnumerableForwardingProperty(obj, name, otherName) {
            Object.defineProperty(obj, name, {
                get: FunctionUtilities.makeForwardingGetter(otherName),
                set: FunctionUtilities.makeForwardingSetter(otherName),
                writable: true,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineNonEnumerableForwardingProperty = defineNonEnumerableForwardingProperty;

        function defineNewNonEnumerableProperty(obj, name, value) {
            release || assert(!Object.prototype.hasOwnProperty.call(obj, name), "Property: " + name + " already exits.");
            ObjectUtilities.defineNonEnumerableProperty(obj, name, value);
        }
        ObjectUtilities.defineNewNonEnumerableProperty = defineNewNonEnumerableProperty;
    })(Shumway.ObjectUtilities || (Shumway.ObjectUtilities = {}));
    var ObjectUtilities = Shumway.ObjectUtilities;

    (function (FunctionUtilities) {
        function makeForwardingGetter(target) {
            return new Function("return this[\"" + target + "\"]");
        }
        FunctionUtilities.makeForwardingGetter = makeForwardingGetter;

        function makeForwardingSetter(target) {
            return new Function("value", "this[\"" + target + "\"] = value;");
        }
        FunctionUtilities.makeForwardingSetter = makeForwardingSetter;

        /**
        * Attaches a property to the bound function so we can detect when if it
        * ever gets rebound.
        */
        function bindSafely(fn, object) {
            release || Debug.assert(!fn.boundTo && object);
            var f = fn.bind(object);
            f.boundTo = object;
            return f;
        }
        FunctionUtilities.bindSafely = bindSafely;
    })(Shumway.FunctionUtilities || (Shumway.FunctionUtilities = {}));
    var FunctionUtilities = Shumway.FunctionUtilities;

    (function (StringUtilities) {
        function toSafeString(value) {
            if (typeof value === "string") {
                return "\"" + value + "\"";
            }
            if (typeof value === "number" || typeof value === "boolean") {
                return String(value);
            }
            return typeof value;
        }
        StringUtilities.toSafeString = toSafeString;

        function toSafeArrayString(array) {
            var str = [];
            for (var i = 0; i < array.length; i++) {
                str.push(toSafeString(array[i]));
            }
            return str.join(", ");
        }
        StringUtilities.toSafeArrayString = toSafeArrayString;

        function utf8decode(str) {
            var bytes = new Uint8Array(str.length * 4);
            var b = 0;
            for (var i = 0, j = str.length; i < j; i++) {
                var code = str.charCodeAt(i);
                if (code <= 0x7f) {
                    bytes[b++] = code;
                    continue;
                }

                if (0xD800 <= code && code <= 0xDBFF) {
                    var codeLow = str.charCodeAt(i + 1);
                    if (0xDC00 <= codeLow && codeLow <= 0xDFFF) {
                        // convert only when both high and low surrogates are present
                        code = ((code & 0x3FF) << 10) + (codeLow & 0x3FF) + 0x10000;
                        ++i;
                    }
                }

                if ((code & 0xFFE00000) !== 0) {
                    bytes[b++] = 0xF8 | ((code >>> 24) & 0x03);
                    bytes[b++] = 0x80 | ((code >>> 18) & 0x3F);
                    bytes[b++] = 0x80 | ((code >>> 12) & 0x3F);
                    bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
                    bytes[b++] = 0x80 | (code & 0x3F);
                } else if ((code & 0xFFFF0000) !== 0) {
                    bytes[b++] = 0xF0 | ((code >>> 18) & 0x07);
                    bytes[b++] = 0x80 | ((code >>> 12) & 0x3F);
                    bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
                    bytes[b++] = 0x80 | (code & 0x3F);
                } else if ((code & 0xFFFFF800) !== 0) {
                    bytes[b++] = 0xE0 | ((code >>> 12) & 0x0F);
                    bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
                    bytes[b++] = 0x80 | (code & 0x3F);
                } else {
                    bytes[b++] = 0xC0 | ((code >>> 6) & 0x1F);
                    bytes[b++] = 0x80 | (code & 0x3F);
                }
            }
            return bytes.subarray(0, b);
        }
        StringUtilities.utf8decode = utf8decode;

        function utf8encode(bytes) {
            var j = 0, str = "";
            while (j < bytes.length) {
                var b1 = bytes[j++] & 0xFF;
                if (b1 <= 0x7F) {
                    str += String.fromCharCode(b1);
                } else {
                    var currentPrefix = 0xC0;
                    var validBits = 5;
                    do {
                        var mask = (currentPrefix >> 1) | 0x80;
                        if ((b1 & mask) === currentPrefix)
                            break;
                        currentPrefix = (currentPrefix >> 1) | 0x80;
                        --validBits;
                    } while(validBits >= 0);

                    if (validBits <= 0) {
                        // Invalid UTF8 character -- copying as is
                        str += String.fromCharCode(b1);
                        continue;
                    }
                    var code = (b1 & ((1 << validBits) - 1));
                    var invalid = false;
                    for (var i = 5; i >= validBits; --i) {
                        var bi = bytes[j++];
                        if ((bi & 0xC0) != 0x80) {
                            // Invalid UTF8 character sequence
                            invalid = true;
                            break;
                        }
                        code = (code << 6) | (bi & 0x3F);
                    }
                    if (invalid) {
                        for (var k = j - (7 - i); k < j; ++k) {
                            str += String.fromCharCode(bytes[k] & 255);
                        }
                        continue;
                    }
                    if (code >= 0x10000) {
                        str += String.fromCharCode((((code - 0x10000) >> 10) & 0x3FF) | 0xD800, (code & 0x3FF) | 0xDC00);
                    } else {
                        str += String.fromCharCode(code);
                    }
                }
            }
            return str;
        }
        StringUtilities.utf8encode = utf8encode;

        // https://gist.github.com/958841
        function base64ArrayBuffer(arrayBuffer) {
            var base64 = '';
            var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

            var bytes = new Uint8Array(arrayBuffer);
            var byteLength = bytes.byteLength;
            var byteRemainder = byteLength % 3;
            var mainLength = byteLength - byteRemainder;

            var a, b, c, d;
            var chunk;

            for (var i = 0; i < mainLength; i = i + 3) {
                // Combine the three bytes into a single integer
                chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

                // Use bitmasks to extract 6-bit segments from the triplet
                a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
                b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
                c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
                d = chunk & 63; // 63 = 2^6 - 1

                // Convert the raw binary segments to the appropriate ASCII encoding
                base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
            }

            // Deal with the remaining bytes and padding
            if (byteRemainder == 1) {
                chunk = bytes[mainLength];

                a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

                // Set the 4 least significant bits to zero
                b = (chunk & 3) << 4; // 3 = 2^2 - 1

                base64 += encodings[a] + encodings[b] + '==';
            } else if (byteRemainder == 2) {
                chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

                a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
                b = (chunk & 1008) >> 4; // 1008 = (2^6 - 1) << 4

                // Set the 2 least significant bits to zero
                c = (chunk & 15) << 2; // 15 = 2^4 - 1

                base64 += encodings[a] + encodings[b] + encodings[c] + '=';
            }
            return base64;
        }
        StringUtilities.base64ArrayBuffer = base64ArrayBuffer;

        function escapeString(str) {
            if (str !== undefined) {
                str = str.replace(/[^\w$]/gi, "$"); /* No dots, colons, dashes and /s */
                if (/^\d/.test(str)) {
                    str = '$' + str;
                }
            }
            return str;
        }
        StringUtilities.escapeString = escapeString;

        /**
        * Workaround for max stack size limit.
        */
        function fromCharCodeArray(buffer) {
            var str = "", SLICE = 1024 * 16;
            for (var i = 0; i < buffer.length; i += SLICE) {
                var chunk = Math.min(buffer.length - i, SLICE);
                str += String.fromCharCode.apply(null, buffer.subarray(i, i + chunk));
            }
            return str;
        }
        StringUtilities.fromCharCodeArray = fromCharCodeArray;

        var _encoding = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_';
        function variableLengthEncodeInt32(n) {
            var e = _encoding;
            var bitCount = (32 - IntegerUtilities.leadingZeros(n));
            assert(bitCount <= 32, bitCount);
            var l = Math.ceil(bitCount / 6);

            // Encode length followed by six bit chunks.
            var s = e[l];
            for (var i = l - 1; i >= 0; i--) {
                var offset = (i * 6);
                s += e[(n >> offset) & 0x3F];
            }
            release || assert(StringUtilities.variableLengthDecodeInt32(s) === n, n + " : " + s + " - " + l + " bits: " + bitCount);
            return s;
        }
        StringUtilities.variableLengthEncodeInt32 = variableLengthEncodeInt32;

        function toEncoding(n) {
            return _encoding[n];
        }
        StringUtilities.toEncoding = toEncoding;

        function fromEncoding(s) {
            var c = s.charCodeAt(0);
            var e = 0;
            if (c >= 65 && c <= 90) {
                return c - 65;
            } else if (c >= 97 && c <= 122) {
                return c - 71;
            } else if (c >= 48 && c <= 57) {
                return c + 4;
            } else if (c === 36) {
                return 62;
            } else if (c === 95) {
                return 63;
            }
            assert(false, "Invalid Encoding");
        }
        StringUtilities.fromEncoding = fromEncoding;

        function variableLengthDecodeInt32(s) {
            var l = StringUtilities.fromEncoding(s[0]);
            var n = 0;
            for (var i = 0; i < l; i++) {
                var offset = ((l - i - 1) * 6);
                n |= StringUtilities.fromEncoding(s[1 + i]) << offset;
            }
            return n;
        }
        StringUtilities.variableLengthDecodeInt32 = variableLengthDecodeInt32;
    })(Shumway.StringUtilities || (Shumway.StringUtilities = {}));
    var StringUtilities = Shumway.StringUtilities;

    (function (HashUtilities) {
        var _md5R = new Uint8Array([
            7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
            5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
            4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
            6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21]);

        var _md5K = new Int32Array([
            -680876936, -389564586, 606105819, -1044525330, -176418897, 1200080426,
            -1473231341, -45705983, 1770035416, -1958414417, -42063, -1990404162,
            1804603682, -40341101, -1502002290, 1236535329, -165796510, -1069501632,
            643717713, -373897302, -701558691, 38016083, -660478335, -405537848,
            568446438, -1019803690, -187363961, 1163531501, -1444681467, -51403784,
            1735328473, -1926607734, -378558, -2022574463, 1839030562, -35309556,
            -1530992060, 1272893353, -155497632, -1094730640, 681279174, -358537222,
            -722521979, 76029189, -640364487, -421815835, 530742520, -995338651,
            -198630844, 1126891415, -1416354905, -57434055, 1700485571, -1894986606,
            -1051523, -2054922799, 1873313359, -30611744, -1560198380, 1309151649,
            -145523070, -1120210379, 718787259, -343485551]);

        function hashBytesTo32BitsMD5(data, offset, length) {
            var r = _md5R;
            var k = _md5K;
            var h0 = 1732584193, h1 = -271733879, h2 = -1732584194, h3 = 271733878;

            // pre-processing
            var paddedLength = (length + 72) & ~63;
            var padded = new Uint8Array(paddedLength);
            var i, j, n;
            for (i = 0; i < length; ++i) {
                padded[i] = data[offset++];
            }
            padded[i++] = 0x80;
            n = paddedLength - 8;
            while (i < n) {
                padded[i++] = 0;
            }
            padded[i++] = (length << 3) & 0xFF;
            padded[i++] = (length >> 5) & 0xFF;
            padded[i++] = (length >> 13) & 0xFF;
            padded[i++] = (length >> 21) & 0xFF;
            padded[i++] = (length >>> 29) & 0xFF;
            padded[i++] = 0;
            padded[i++] = 0;
            padded[i++] = 0;

            // chunking
            // TODO ArrayBuffer ?
            var w = new Int32Array(16);
            for (i = 0; i < paddedLength;) {
                for (j = 0; j < 16; ++j, i += 4) {
                    w[j] = (padded[i] | (padded[i + 1] << 8) | (padded[i + 2] << 16) | (padded[i + 3] << 24));
                }
                var a = h0, b = h1, c = h2, d = h3, f, g;
                for (j = 0; j < 64; ++j) {
                    if (j < 16) {
                        f = (b & c) | ((~b) & d);
                        g = j;
                    } else if (j < 32) {
                        f = (d & b) | ((~d) & c);
                        g = (5 * j + 1) & 15;
                    } else if (j < 48) {
                        f = b ^ c ^ d;
                        g = (3 * j + 5) & 15;
                    } else {
                        f = c ^ (b | (~d));
                        g = (7 * j) & 15;
                    }
                    var tmp = d, rotateArg = (a + f + k[j] + w[g]) | 0, rotate = r[j];
                    d = c;
                    c = b;
                    b = (b + ((rotateArg << rotate) | (rotateArg >>> (32 - rotate)))) | 0;
                    a = tmp;
                }
                h0 = (h0 + a) | 0;
                h1 = (h1 + b) | 0;
                h2 = (h2 + c) | 0;
                h3 = (h3 + d) | 0;
            }
            return h0;
        }
        HashUtilities.hashBytesTo32BitsMD5 = hashBytesTo32BitsMD5;

        function hashBytesTo32BitsAdler(data, offset, length) {
            var a = 1;
            var b = 0;
            var end = offset + length;
            for (var i = offset; i < end; ++i) {
                a = (a + (data[i] & 0xff)) % 65521;
                b = (b + a) % 65521;
            }
            return (b << 16) | a;
        }
        HashUtilities.hashBytesTo32BitsAdler = hashBytesTo32BitsAdler;
    })(Shumway.HashUtilities || (Shumway.HashUtilities = {}));
    var HashUtilities = Shumway.HashUtilities;

    (function (IntegerUtilities) {
        function bitCount(i) {
            i = i - ((i >> 1) & 0x55555555);
            i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
            return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
        }
        IntegerUtilities.bitCount = bitCount;

        function ones(i) {
            i = i - ((i >> 1) & 0x55555555);
            i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
            return ((i + (i >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
        }
        IntegerUtilities.ones = ones;

        function leadingZeros(i) {
            i |= (i >> 1);
            i |= (i >> 2);
            i |= (i >> 4);
            i |= (i >> 8);
            i |= (i >> 16);
            return 32 - IntegerUtilities.ones(i);
        }
        IntegerUtilities.leadingZeros = leadingZeros;

        function trailingZeros(i) {
            return IntegerUtilities.ones((i & -i) - 1);
        }
        IntegerUtilities.trailingZeros = trailingZeros;

        function getFlags(i, flags) {
            var str = "";
            for (var i = 0; i < flags.length; i++) {
                if (i & (1 << i)) {
                    str += flags[i] + " ";
                }
            }
            if (str.length === 0) {
                return "";
            }
            return str.trim();
        }
        IntegerUtilities.getFlags = getFlags;

        function isPowerOfTwo(x) {
            return x && ((x & (x - 1)) === 0);
        }
        IntegerUtilities.isPowerOfTwo = isPowerOfTwo;
    })(Shumway.IntegerUtilities || (Shumway.IntegerUtilities = {}));
    var IntegerUtilities = Shumway.IntegerUtilities;

    var IndentingWriter = (function () {
        function IndentingWriter(suppressOutput, outFn) {
            if (typeof suppressOutput === "undefined") { suppressOutput = false; }
            this._tab = "  ";
            this._padding = "";
            this._suppressOutput = suppressOutput;
            this._out = outFn || IndentingWriter._consoleOutFn;
        }
        IndentingWriter.prototype.writeLn = function (str) {
            if (!this._suppressOutput) {
                this._out(this._padding + str);
            }
        };

        IndentingWriter.prototype.writeLns = function (str) {
            var lines = str.split("\n");
            for (var i = 0; i < lines.length; i++) {
                this.writeLn(lines[i]);
            }
        };

        IndentingWriter.prototype.debugLn = function (str) {
            this.colorLn(IndentingWriter.PURPLE, str);
        };

        IndentingWriter.prototype.yellowLn = function (str) {
            this.colorLn(IndentingWriter.YELLOW, str);
        };

        IndentingWriter.prototype.greenLn = function (str) {
            this.colorLn(IndentingWriter.GREEN, str);
        };

        IndentingWriter.prototype.redLn = function (str) {
            this.colorLn(IndentingWriter.RED, str);
        };

        IndentingWriter.prototype.colorLn = function (color, str) {
            if (!this._suppressOutput) {
                if (!inBrowser) {
                    this._out(this._padding + color + str + IndentingWriter.ENDC);
                } else {
                    this._out(this._padding + str);
                }
            }
        };

        IndentingWriter.prototype.enter = function (str) {
            if (!this._suppressOutput) {
                this._out(this._padding + str);
            }
            this.indent();
        };

        IndentingWriter.prototype.leaveAndEnter = function (str) {
            this.leave(str);
            this.indent();
        };

        IndentingWriter.prototype.leave = function (str) {
            this.outdent();
            if (!this._suppressOutput) {
                this._out(this._padding + str);
            }
        };

        IndentingWriter.prototype.indent = function () {
            this._padding += this._tab;
        };

        IndentingWriter.prototype.outdent = function () {
            if (this._padding.length > 0) {
                this._padding = this._padding.substring(0, this._padding.length - this._tab.length);
            }
        };

        IndentingWriter.prototype.writeArray = function (arr, detailed, noNumbers) {
            if (typeof detailed === "undefined") { detailed = false; }
            if (typeof noNumbers === "undefined") { noNumbers = false; }
            detailed = detailed || false;
            for (var i = 0, j = arr.length; i < j; i++) {
                var prefix = "";
                if (detailed) {
                    if (arr[i] === null) {
                        prefix = "null";
                    } else if (arr[i] === undefined) {
                        prefix = "undefined";
                    } else {
                        prefix = arr[i].constructor.name;
                    }
                    prefix += " ";
                }
                var number = noNumbers ? "" : ("" + i).padRight(' ', 4);
                this.writeLn(number + prefix + arr[i]);
            }
        };
        IndentingWriter.PURPLE = '\033[94m';
        IndentingWriter.YELLOW = '\033[93m';
        IndentingWriter.GREEN = '\033[92m';
        IndentingWriter.RED = '\033[91m';
        IndentingWriter.ENDC = '\033[0m';
        IndentingWriter._consoleOutFn = inBrowser ? console.info.bind(console) : print;
        return IndentingWriter;
    })();
    Shumway.IndentingWriter = IndentingWriter;

    /**
    * Insertion sort SortedList backed by a linked list.
    */
    var SortedListNode = (function () {
        function SortedListNode(value, next) {
            this.value = value;
            this.next = next;
        }
        return SortedListNode;
    })();

    var SortedList = (function () {
        function SortedList(compare) {
            release || assert(compare);
            this._compare = compare;
            this._head = null;
            this._length = 0;
        }
        SortedList.prototype.push = function (value) {
            release || assert(value !== undefined);
            this._length++;
            if (!this._head) {
                this._head = new SortedListNode(value, null);
                return;
            }

            var curr = this._head;
            var prev = null;
            var node = new SortedListNode(value, null);
            var compare = this._compare;
            while (curr) {
                if (compare(curr.value, node.value) > 0) {
                    if (prev) {
                        node.next = curr;
                        prev.next = node;
                    } else {
                        node.next = this._head;
                        this._head = node;
                    }
                    return;
                }
                prev = curr;
                curr = curr.next;
            }
            prev.next = node;
        };

        /**
        * Visitors can return RETURN if they wish to stop the iteration or DELETE if they need to delete the current node.
        * NOTE: DELETE most likley doesn't work if there are multiple active iterations going on.
        */
        SortedList.prototype.forEach = function (visitor) {
            var curr = this._head;
            var last = null;
            while (curr) {
                var result = visitor(curr.value);
                if (result === SortedList.RETURN) {
                    return;
                } else if (result === SortedList.DELETE) {
                    if (!last) {
                        curr = this._head = this._head.next;
                    } else {
                        curr = last.next = curr.next;
                    }
                } else {
                    last = curr;
                    curr = curr.next;
                }
            }
        };

        SortedList.prototype.isEmpty = function () {
            return !this._head;
        };

        SortedList.prototype.pop = function () {
            if (!this._head) {
                return undefined;
            }
            this._length--;
            var ret = this._head;
            this._head = this._head.next;
            return ret.value;
        };

        SortedList.prototype.contains = function (value) {
            var curr = this._head;
            while (curr) {
                if (curr.value === value) {
                    return true;
                }
                curr = curr.next;
            }
            return false;
        };

        SortedList.prototype.toString = function () {
            var str = "[";
            var curr = this._head;
            while (curr) {
                str += curr.value.toString();
                curr = curr.next;
                if (curr) {
                    str += ",";
                }
            }
            str += "]";
            return str;
        };
        SortedList.RETURN = 1;
        SortedList.DELETE = 2;
        return SortedList;
    })();
    Shumway.SortedList = SortedList;

    /** @const */ var CIRCULAR_BUFFER_MASK = 0xFFF;
    /** @const */ var CIRCULAR_BUFFER_SIZE = 4096;

    var CircularBuffer = (function () {
        function CircularBuffer(Type) {
            this.index = 0;
            this.start = 0;
            this.array = new Type(CIRCULAR_BUFFER_SIZE);
        }
        CircularBuffer.prototype.get = function (i) {
            return this.array[i];
        };

        CircularBuffer.prototype.forEachInReverse = function (visitor) {
            if (this.isEmpty()) {
                return;
            }
            var i = this.index === 0 ? CIRCULAR_BUFFER_SIZE - 1 : this.index - 1;
            while (i !== this.start) {
                if (visitor(this.array[i], i)) {
                    break;
                }
                i = i === 0 ? CIRCULAR_BUFFER_SIZE - 1 : i - 1;
            }
        };

        CircularBuffer.prototype.write = function (value) {
            this.array[this.index] = value;
            this.index = (this.index + 1) & CIRCULAR_BUFFER_MASK;
            if (this.index === this.start) {
                this.start = (this.start + 1) & CIRCULAR_BUFFER_MASK;
            }
        };

        CircularBuffer.prototype.isFull = function () {
            return ((this.index + 1) & CIRCULAR_BUFFER_MASK) === this.start;
        };

        CircularBuffer.prototype.isEmpty = function () {
            return this.index === this.start;
        };
        return CircularBuffer;
    })();
    Shumway.CircularBuffer = CircularBuffer;
})(Shumway || (Shumway = {}));

//["000", "4294967296", 4294967290, "4294967290", "4294967290", "1234",12345, "i","", "123.456", "-4", "0x2", "123456789123467", "4294967296"].forEach(function (x) {
//  log("V: " + x + ": " + Shumway.isIndex(x) + " " + Shumway.isIndex2(x));
//});
var assert = Shumway.Debug.assert;
var IndentingWriter = Shumway.IndentingWriter;
