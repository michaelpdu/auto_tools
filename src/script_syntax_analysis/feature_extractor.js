var ssa = require("./ssa.js");
var fs = require('fs');


var words_text = fs.readFileSync("words.cfg", 'utf-8');
var key_words = words_text.split("\r\n");
var key_words_tmp = [];
for (index in key_words) {
    if (key_words[index].indexOf('//') < 0 && key_words[index])
        key_words_tmp.push(key_words[index].trim());
}
key_words = key_words_tmp;

function extract_feature(filename) {
    var feature_list = [];

    function add_feature_val(content, list, key_words) {
        for (index in key_words) {
            if (content.indexOf(key_words[index]) !== -1)
                list.push(1);
            else list.push(0);
        }
    }

    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) throw err;
        add_feature_val(data, feature_list, key_words);
        try {
            var processed_file = ssa.process_html(data);
        } catch (err) {
        }
        if (processed_file !== undefined)
            add_feature_val(processed_file, feature_list, key_words);
        else {
            // console.log("error");
            feature_list = feature_list.concat(feature_list);
        }
        console.log(feature_list);
    });
}

if (module === require.main) {
    extract_feature(process.argv[2]);
}
