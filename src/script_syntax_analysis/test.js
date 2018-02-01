var should = require("should");
var ssa = require("./ssa.js");
var fs = require("fs");

function search_keyword(processed_file, key_words) {
    for (key_word in key_words) {
        if (processed_file.indexOf(key_words[key_word]) === -1) {
            console.log('**'+processed_file+'**');
            console.log('**'+key_words[key_word]+'**');
            return false;
        }
    }
    return true;
}

describe("JS", function () {
    it("string_concat.js", function (done) {
        fs.readFile("./ut/samples/string_concat.js", "utf8", function (err, data) {
            if (err) throw err;
            var processed_file = ssa.process_html(data);
            var correct = search_keyword(processed_file, ["createElement", "text/javascript"]);
            correct.should.be.true();
            done();
        });
    });
    it("function_return_literal.js", function (done) {
        fs.readFile("./ut/samples/function_return_literal.js", "utf8", function (err, data) {
            if (err) throw err;
            var processed_file = ssa.process_html(data);
            var correct = search_keyword(processed_file, ["var a = 3"]);
            correct.should.be.true();
            done();
        });
    });
    it("logical_express.js", function (done) {
        fs.readFile("./ut/samples/logical_express.js", "utf8", function (err, data) {
            if (err) throw err;
            var processed_file = ssa.process_html(data);
            var correct = search_keyword(processed_file, ["sXq = 'length'","twSq = 'length'"]);
            correct.should.be.true();
            done();
        });
    });
    it("binary_expression.js", function (done) {
        fs.readFile("./ut/samples/binary_expression.js", "utf8", function (err, data) {
            if (err) throw err;
            var processed_file = ssa.process_html(data);
            var correct = search_keyword(processed_file, ["(true)"]);
            correct.should.be.true();
            done();
        });
    });
    it("array_str_compute.js", function (done) {
        fs.readFile("./ut/samples/array_str_compute.js", "utf8", function (err, data) {
            if (err) throw err;
            var processed_file = ssa.process_html(data);
            var correct = search_keyword(processed_file, ["Variableprot = 'prototype'","symarxx0123[0] = 'ent'"]);
            correct.should.be.true();
            done();
        });
    });
});

// describe("HTML", function () {
//     it("mult_script.html", function (done) {
//         fs.readFile("./ut/samples/mult_script.html", "utf8", function (err, data) {
//             if (err) throw err;
//             var processed_file = ssa.process_html(data);
//             var correct = search_keyword(processed_file, ["wscript_shell_1_", "mydocuments_1_"]);
//             correct.should.be.true();
//             done();
//         });
//     });
// });