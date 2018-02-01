/**
 * Created by michael_du on 8/1/2016.
 */

esprima = require("esprima");
estraverse = require("estraverse");
escodegen = require("escodegen");
cheerio = require('cheerio');


// for mult script fragment
var_decls_map = {};
func_name_list = [];

function isHtml(html_content) {
    return -1 != html_content.search(/<\s*script\s*>/);
}

function process_html(html_content) {
    var processed_file;
    if (isHtml(html_content))
    { //html
        $ = cheerio.load(html_content);

        $('script').each(function(i, elem) {
            $(this).text(process_script($(this).text()));
        });
        processed_file = $.html();
    }
    else
    { //script
        processed_file = process_script(html_content);
    }
    return processed_file;
}
//api for export
module.exports.process_html = process_html;

function process_script(script_content) {
    // console.log(script_content);
    var ast = esprima.parse(script_content);

    function search_name_in_map(name) {
        for (decl in var_decls_map) {
            if (decl == name) {
                return var_decls_map[decl];
            }
        }
        return undefined;
    }

    function search_func_name_in_list(name) {
        for (var i = 0; i < func_name_list.length; ++i) {
            if (name == func_name_list[i]) {
                return true;
            }
        }
        return false;
    }

/*
    // check if expression is undefined at two sides of BinaryExpression
    function check_binary_expression(node) {
        if (typeof node.left == 'undefined' && typeof node.right == 'undefined') {
            var ret = eval.call(global, escodegen.generate(node));
            return (typeof ret == 'undefined');
        }
        var ret_left = check_binary_expression(node.left);
        var ret_right = check_binary_expression(node.right);
        return ret_left || ret_right
    }
*/

    estraverse.traverse(ast, {
        enter: function (node, parent) {
            try {
                switch (node.type) {
                    case esprima.Syntax.VariableDeclaration: {
                        for (index in node.declarations) {
                            var decl = node.declarations[index];
                            //
                            // Sample Code:
                            // var GtDEcTuuN = WScript.CreateObject('WScript.shell');
                            // var TkTuwCGFLuv_save = GtDEcTuuN.SpecialFolders('MyDocuments');
                            //  ==>
                            // var wscript_shell_ = WScript.CreateObject('WScript.shell');
                            // var TkTuwCGFLuv_save = wscript_shell_.SpecialFolders('MyDocuments');
                            //
                            // Sample Code:
                            // var WSseCXFVG = new ActiveXObject('WbemScripting.SWbemLocator');
                            // var rXRUTkui = WSseCXFVG.ConnectServer(strComputer, 'root\\default');
                            // ==>
                            // var wbemscripting_swbemlocator_ = new ActiveXObject('WbemScripting.SWbemLocator');
                            // var rXRUTkui = wbemscripting_swbemlocator_.ConnectServer(strComputer, 'root\\default');
                            //
                            if (decl.type === esprima.Syntax.VariableDeclarator
                                && decl.init !== null
                                && ((decl.init.type === esprima.Syntax.CallExpression
                                && decl.init.callee.type === esprima.Syntax.MemberExpression
                                && decl.init.callee.object.type === esprima.Syntax.Identifier)
                                || (decl.init.type === esprima.Syntax.NewExpression))
                                && decl.init.arguments[0] !== undefined
                                && decl.init.arguments[0].type === esprima.Syntax.Literal
                                && decl.init.arguments[0].value
                                && ssa_util.is_string(decl.init.arguments[0].value)) {
                                var new_name_tmp = decl.init.arguments[0].value.toLowerCase().replace('.', '_') + '_';
                                var index = 0;
                                var new_name;
                                while (++index) {
                                    new_name = new_name_tmp + index + '_';
                                    if (search_name_in_map(new_name, var_decls_map) === undefined)
                                        break;
                                }
                                var_decls_map[decl.id.name] = new_name;
                                decl.id.name = new_name;
                            }
                            //
                            // Customized function
                            //
                            // variable declaration for function
                            // example: var f489hir = function  () {};
                            //
                            if (decl.type == esprima.Syntax.VariableDeclarator
                                && decl.id.type == esprima.Syntax.Identifier
                                && decl.init.type == esprima.Syntax.FunctionExpression) {
                                func_name_list.push(decl.id.name);
                                //escodegen.generate(decl);
                                eval.call(global, escodegen.generate(decl));
                            }
                        }
                        break;
                    }
                    case esprima.Syntax.FunctionDeclaration: {
                        //
                        // Customized function
                        //
                        // variable declaration for function
                        // example: function f489hir () {};
                        //
                        if (node.id.type == esprima.Syntax.Identifier) {
                            func_name_list.push(node.id.name);
                            //escodegen.generate(node);
                            eval.call(global, escodegen.generate(node));
                        }
                        break;
                    }
                    case esprima.Syntax.ExpressionStatement: {
                        //
                        // Sample Code:
                        // var DmYbWSaT;
                        // DmYbWSaT = new ActiveXObject('Scripting.FileSystemObject');
                        // e = new Enumerator(DmYbWSaT.Drives);
                        // ==>
                        // scripting_filesystemobject_ = new ActiveXObject('Scripting.FileSystemObject');
                        // e = new Enumerator(scripting_filesystemobject_.Drives);
                        //
                        if (node.expression.type == esprima.Syntax.AssignmentExpression
                            && node.expression.right.type == esprima.Syntax.NewExpression
                            && node.expression.right.arguments[0].type == esprima.Syntax.Literal
                            && node.expression.left.type == esprima.Syntax.Identifier
                        ) {
                            var old_name = node.expression.left.name;
                            var new_name_tmp = node.expression.right.arguments[0].value.toLowerCase().replace('.', '_') + '_';
                            var index = 0;
                            var new_name;
                            while (++index) {
                                new_name = new_name_tmp + index + '_';
                                if (search_name_in_map(new_name, var_decls_map) === undefined)
                                    break;
                            }
                            var_decls_map[old_name] = new_name;
                            node.expression.left.name = new_name;
                        }
                        //
                        // customized function, sample code:
                        // var f489hir;
                        // f489hir = function(i9j5g1mf3n) {
                        //     var j0v8n6n8oi = "",
                        //         tk89p583 = i9j5g1mf3n.match(/(..)/g);
                        //     for (var i = 0; i < tk89p583.length; i++) j0v8n6n8oi += String.fromCharCode(parseInt(tk89p583[i], 17));
                        //     return j0v8n6n8oi
                        // };
                        // wuhl3uu7 = window[f489hir("4f5e6c636a6e41686163685g3f6f63665f515g6c6d636968")]();
                        //
                        if (node.expression.type == esprima.Syntax.AssignmentExpression
                            && node.expression.right.type == esprima.Syntax.FunctionExpression) {
                            func_name_list.push(node.expression.left.name);
                            var func_decl = escodegen.generate(node);
                            eval.call(global, func_decl);
                        }
                        break;
                    }
                    case esprima.Syntax.Identifier: {
                        var new_name = search_name_in_map(node.name);
                        if (new_name != undefined) {
                            node.name = new_name;
                        }
                        break;
                    }
                }
            } catch (err) {
                console.error(err);
            }

        },
        leave: function (node, parent) {
            //console.log(node.type);
        }
    });

    //console.log(escodegen.generate(ast));
    ast = estraverse.replace(ast, {
        enter: function (node, parent) {
        },
        leave: function (node, parent) {
            switch (node.type) {
                case esprima.Syntax.CallExpression: {
                    var call_exp = escodegen.generate(node);
                    var ret_val;
                    try {
                        ret_val = eval.call(global, call_exp);
                        if (ret_val == undefined || ret_val == null) break;
                        return {
                            type: esprima.Syntax.Literal,
                            value: ret_val,
                            raw: ret_val
                        };
                    } catch (err) {
                        console.error("Error in calculate call_exp: " + err);
                    }
                    break;
                }
                case esprima.Syntax.BinaryExpression: {
                    if (node.left.type == esprima.Syntax.Literal && node.right.type == esprima.Syntax.Literal) {
                        var ret_val = eval.call(global, escodegen.generate(node));
                        if (ret_val == undefined || ret_val == null) break;
                        return {
                            type: esprima.Syntax.Literal,
                            value: ret_val,
                            raw: ret_val
                        };
                    }
                    break;
                }
                case esprima.Syntax.MemberExpression: {
                    if (node.computed == true && typeof node.property != "undefined"
                        && node.property.type != esprima.Syntax.Literal
                        && node.property.type != esprima.Syntax.Identifier) {
                        try {
                            //if (node.property.type == esprima.Syntax.BinaryExpression) {
                                // Do nothing
                                //if (true == check_binary_expression(node.property)) {
                                //    console.log("find undefined in BinaryExpression");
                                //}
                            //} else {
                                var property_exp = escodegen.generate(node.property);
                                var property_val = eval.call(global, property_exp);
                                if (property_val != undefined && property_val != null) {
                                    node.property = {
                                        type: esprima.Syntax.Literal,
                                        value: property_val,
                                        raw: property_val
                                    };
                                }
                            //}
                        } catch (err) {
                            console.error("Error in calculate property_exp: " + err);
                        }
                    }
                    break;
                }
                // case esprima.Syntax.VariableDeclaration: {
                //     break;
                // }
                default: {
                    break;
                }
            }
        }
    });

    // Output Syntax Tree
    // console.log(JSON.stringify(ast, null, 4));

    // Output JavaScript Code
    //console.log(escodegen.generate(ast));
    return escodegen.generate(ast);
}

function main(filename) {
    var fs = require('fs');
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) throw err;
        var processed_file = process_html(data);
        console.log(processed_file);
    });
}

if(module===require.main){
    main(process.argv[2]);
}

