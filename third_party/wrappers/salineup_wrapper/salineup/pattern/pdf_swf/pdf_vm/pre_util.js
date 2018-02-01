Number.eval = this.eval;
Number.prototype.eval = this.eval;

Date.eval = this.eval;
Date.prototype.eval = this.eval;

/**********************************************************/
String.eval = this.eval;
String.prototype.eval = this.eval;
String.charCodeAt = function(str, index) {
	return str.charCodeAt(index);
};

String.prototype._slice = String.prototype.slice;
String.prototype.__defineGetter__(
	"slice",
	function() {
		return this._slice.bind(this);
	}
);

String.eval = this.eval;
String.prototype.eval = this.eval;
String.charCodeAt = function(str, index) {
	return str.charCodeAt(index);
};

String.prototype._slice = String.prototype.slice;
String.prototype.__defineGetter__(
	"slice",
	function() {
		return this._slice.bind(this);
	}
);

// In samples:
//      09a30a37cafccc22f3bd900ab808cc2d
//      d9838f4bd4bfe8199964e381f0cb389e
// use case:
//  "re2.718281828459045place".replace(Math.E, "")
// 
// Note that Math.E is a float number, rather than a string.
//
String.replace = function(string, target, replacement) {
	//if (typeof target!="string")
	//    target = "" + target
	return string.replace(target, replacement)
}

String.prototype._indexOf = String.prototype.indexOf;
String.prototype.__defineGetter__(
	"indexOf",
	function() {
		return this._indexOf.bind(this);
	}
);

String.prototype._substr = String.prototype.substr;
String.prototype.__defineGetter__(
	"substr",
	function() {
		return this._substr.bind(this);
	}
);

String.prototype._toUpperCase = String.prototype.toUpperCase;
String.prototype.__defineGetter__(
	"toUpperCase",
	function() {
		return this._toUpperCase.bind(this);
	}
);

String.prototype._toLowerCase = String.prototype.toLowerCase;
String.prototype.__defineGetter__(
	"toLowerCase",
	function() {
		return this._toLowerCase.bind(this);
	}
);

String.prototype._concat = String.prototype.concat;
String.prototype.__defineGetter__(
	"concat",
	function() {
		return this._concat.bind(this);
	}
);



// why comment this code?
// Try following code:
// var a = [1,2,3];
// for (i in a) {
//    console.log(i);
// }
// Output:
// 1
// 2
// 3
// eval  <-- this is problem
//Array.prototype.eval = this.eval;
Array.eval = this.eval;
Array.prototype.__defineGetter__(
	"eval",
	function() {
		if (1 == this.length && "this" == this[0])
			return eval;
	});

Math.eval = this.eval;

Function.prototype.eval = this.eval;

var eval_reported = 0;

// Don't hook the eval by wrapping the original eval, this will change
// the style eval call from "direct call" to "indirect call". In some cases,
// only "direct call" make sense:
//
//      /* direct eval call */
//      function x() {
//          var a = 1;
//          eval("alert(a)");   // OK!
//      }; x();
//
//      /* indirect eval call */
//      origin_eval = eval;
//      eval = function(s) {return origin_eval(s)}
//      function y() {
//          var a = 1;
//          eval("alert(a)");   // ReferenceError: a is not defined!
//      }; y();
//
// However, PDF engine need eval content hooking, so using native layer hooking.
function beforeEval(s) {
	if (0 == eval_reported) {
		_docode_report("eval_access");
		_docode_report("eval content: " + s);
		eval_reported = 1;
	}
}