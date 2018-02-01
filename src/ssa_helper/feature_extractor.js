/**
 * Created by Leon_Zhang(SA) on 26/04/2017.
 */
var ssa = require("./ssa.js");
var fs = require('fs');



function extract_feature(filename) {
    var feature_list = [];
    var feature_list_temp = [];

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
        if (processed_file !== undefined){
            add_feature_val(processed_file, feature_list, key_words);
        }
        else {
            for(i=0;i<feature_list.length;i++){
                feature_list_temp.push(1);
            }
            feature_list = feature_list.concat(feature_list_temp);
        }
        console.log(feature_list);
    });
}

function extract_feature_new(filename) {
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) throw err;
        try {
            var processed_file = ssa.process_html(data);
        } catch (err) {
        }
        if (processed_file !== undefined){
            console.log(processed_file);
        }
        else {
            console.log("undefined");
        }

    });
}

if (module === require.main) {
    extract_feature_new(process.argv[2]);
}
