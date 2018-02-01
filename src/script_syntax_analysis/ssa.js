/**
 * Created by michael_du on 8/1/2016.
 */
esprima = require("esprima");
estraverse = require("estraverse");
escodegen = require("escodegen");
cheerio = require('cheerio');
ssa_util = require('./ssa_util');

//const
const library_id_list = ["Math", "window"];

var_decls_map = {}; // for mult script fragment
var_literal_map = {};
func_return_literal_map = {};

function isHtml(html_content) {
    return -1 !== html_content.search(/<\s*script/i) || -1 !== html_content.search(/<\s*body/i)
        || -1 !== html_content.search(/<\s*html/i);
}

function process_html(html_content) {
    var processed_file;
    if (isHtml(html_content)) { //html
        $ = cheerio.load(html_content);

        $('script').each(function (i, elem) {
            $(this).text(process_script($(this).text()));
        });
        processed_file = $.html();
    }
    else { //script
        processed_file = process_script(html_content);
        processed_file = process_script(processed_file);//
    }
    return processed_file;
}
//api for export
module.exports.process_html = process_html;

function process_script(script_content) {
    var ast = esprima.parse(script_content);

    function search_name_in_map(name, map) {
        for (decl in map) {
            if (decl === name) {
                return map[decl];
            }
        }
        return undefined;
    }

    function search_name_in_list(name, list) {
        for (var i = 0; i < list.length; ++i) {
            if (name === list[i]) {
                return true;
            }
        }
        return false;
    }

    ast = estraverse.replace(ast, {
        enter: function (node, parent) {
        },
        leave: function (node, parent) {
            try {
                var ret_val;
                var case_flag = false;
                switch (node.type) {
                    case esprima.Syntax.AssignmentExpression: {
                        if (node.left.type === esprima.Syntax.Identifier
                            && node.operator === "=") {
                            if (node.right.type === esprima.Syntax.Literal)
                                var_literal_map[node.left.name] = node.right.value;
                            else if (node.right.type === esprima.Syntax.UnaryExpression
                                && node.right.argument !== undefined
                                && node.right.argument.type === esprima.Syntax.Literal) {
                                switch (node.right.operator) {
                                    case("-"): {
                                        var_literal_map[node.left.name] = 0 - node.right.argument.value;
                                        break;
                                    }
                                }
                            }
                        }
                        break;
                    }
                    case esprima.Syntax.ArrayExpression: {
                        if (node.elements.length === 1
                            && parent.type === esprima.Syntax.MemberExpression) {
                            return node.elements[0];
                        }
                        break;
                    }
                    case esprima.Syntax.BinaryExpression: {
                        var left, right;
                        if (node.left.type === esprima.Syntax.Literal)
                            left = node.left.value;
                        else if (ssa_util.is_numnode(node.left))
                            left = ssa_util.numnode_to_num(node.left);
                        if (node.right.type === esprima.Syntax.Literal)
                            right = node.right.value;
                        else if (ssa_util.is_numnode(node.right))
                            right = ssa_util.numnode_to_num(node.right);
                        if (left !== undefined && right !== undefined) {
                            switch (node.operator) {
                                case("+"): {
                                    ret_val = left + right;
                                    case_flag = true;
                                    break;
                                }
                                case("-"): {
                                    ret_val = left - right;
                                    case_flag = true;
                                    break;
                                }
                                case("*"): {
                                    ret_val = left * right;
                                    case_flag = true;
                                    break;
                                }
                                case("/"): {
                                    ret_val = left / right;
                                    case_flag = true;
                                    break;
                                }
                                case("!="): {
                                    ret_val = left !== right;
                                    case_flag = true;
                                    break;
                                }
                                case("=="): {
                                    ret_val = left === right;
                                    case_flag = true;
                                    break;
                                }
                            }
                            // console.log(node);
                            if (parent.type === esprima.Syntax.VariableDeclarator
                                && parent.id !== undefined
                                && parent.id.type === esprima.Syntax.Identifier)
                                var_literal_map[parent.id.name] = ret_val;
                            else if (parent.type === esprima.Syntax.AssignmentExpression
                                && parent.left !== undefined
                                && parent.left.type === esprima.Syntax.Identifier)
                                var_literal_map[parent.left.name] = ret_val;
                        }
                        break;
                    }
                    case esprima.Syntax.CallExpression: {
                        var args = node.arguments;
                        var args_len = args.length;
                        if (node.callee.type === esprima.Syntax.Identifier
                            && node.callee.property === undefined) {
                            if (search_name_in_map(node.callee.name, func_return_literal_map) !== undefined) {
                                ret_val = func_return_literal_map[node.callee.name];
                                case_flag = true;
                            }
                            //built-in api
                            else {
                                if (args_len === 1
                                    && args[0].type === esprima.Syntax.Literal) {
                                    switch (node.callee.name) {
                                        case ("parseInt"): {  //window.X
                                            ret_val = parseInt(args[0].value);
                                            case_flag = true;
                                            break;
                                        }
                                        case ("parseFloat"): {
                                            ret_val = parseFloat(args[0].value);
                                            case_flag = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        // convert to property
                        if (node.callee.type === esprima.Syntax.MemberExpression
                            && node.callee.property !== "undefined"
                            && (node.callee.property.type === esprima.Syntax.Literal
                            || node.callee.property.type === esprima.Syntax.Identifier)) {
                            var mem_express = node.callee;
                            var property;
                            // window["parseInt"]()  <->  window.parInt()
                            if (mem_express.property.type === esprima.Syntax.Literal)
                                property = mem_express.property.value;
                            else
                                property = mem_express.property.name;

                            //Array
                            if (mem_express.object.type === esprima.Syntax.ArrayExpression
                                && ssa_util.is_liternal_array(mem_express.object)) {
                                var tmp_array = ssa_util.node_to_array(mem_express.object);
                                switch (property) {
                                    case ("join"): {
                                        if (args_len === 1
                                            && args[0].type === esprima.Syntax.Literal) {
                                            ret_val = tmp_array.join(node.arguments[0].value);
                                            case_flag = true;
                                        }
                                        break;
                                    }
                                }
                            }
                            //String
                            else if (ssa_util.is_string(mem_express.object.value)
                                && mem_express.object.type === esprima.Syntax.Literal) {
                                ret_val = mem_express.object.value;
                                switch (property) {
                                    case ("charAt"): {
                                        if (ssa_util.is_numnode(args[0])) {
                                            ret_val = ret_val.charAt(ssa_util.numnode_to_num(args[0]));
                                            case_flag = true;
                                        }
                                        break;
                                    }
                                    case ("charCodeAt"): {
                                        if (ssa_util.is_numnode(args[0])) {
                                            ret_val = ret_val.charCodeAt(ssa_util.numnode_to_num(args[0]));
                                            case_flag = true;
                                        }
                                        break;
                                    }
                                    case ("concat"): {
                                        if (args_len !== 0) {
                                            var str_list = [];
                                            var flag = true;
                                            for (index in args) {
                                                if (args[index].type !== esprima.Syntax.Literal) {
                                                    flag = false;
                                                    break;
                                                }
                                                str_list.push(args[index].value);
                                            }
                                            if (flag === true) {
                                                ret_val = ret_val.concat(str_list.join(""));
                                                case_flag = true;
                                            }
                                        }
                                        break;
                                    }
                                    case ("indexOf"): {
                                        if (args_len === 1
                                            && args[0].type === esprima.Syntax.Literal) {
                                            ret_val = ret_val.indexOf(args[0].value);
                                            case_flag = true;
                                        }
                                        else if (args_len === 2
                                            && args[0].type === esprima.Syntax.Literal
                                            && ssa_util.is_numnode(args[1])) {
                                            ret_val = ret_val.indexOf(args[0].value,
                                                ssa_util.numnode_to_num(args[1]));
                                            case_flag = true;
                                        }
                                        break;
                                    }
                                    case ("match"): {
                                        if (args[0].type === esprima.Syntax.Literal) {
                                            ret_val = ret_val.match(args[0].value);
                                            if (ret_val !== null)
                                                return ssa_util.array_to_node(ret_val);
                                        }
                                        break;
                                    }
                                    case ("replace"): {
                                        if (args_len === 2
                                            && args[0].type === esprima.Syntax.Literal
                                            && args[1].type === esprima.Syntax.Literal) {
                                            ret_val = ret_val.replace(args[0].value, args[1].value);
                                            case_flag = true;
                                        }
                                        break;
                                    }
                                    case ("substr"): {
                                        if (args_len === 1
                                            && ssa_util.is_numnode(args[0])) {
                                            ret_val = ret_val.substr(ssa_util.numnode_to_num(args[0]));
                                            case_flag = true;
                                        }
                                        else if (args_len === 2
                                            && ssa_util.is_numnode(args[0])
                                            && ssa_util.is_numnode(args[1])) {
                                            ret_val = ret_val.substr(ssa_util.numnode_to_num(args[0]),
                                                ssa_util.numnode_to_num(args[1]));
                                            case_flag = true;
                                        }
                                        break;
                                    }
                                    case ("substring"): {
                                        if (args_len === 1
                                            && args[0].type === esprima.Syntax.Literal) {
                                            ret_val = ret_val.substring(args[0].value);
                                            case_flag = true;
                                        }
                                        else if (args_len === 2
                                            && args[0].type === esprima.Syntax.Literal
                                            && args[1].type === esprima.Syntax.Literal) {
                                            ret_val = ret_val.substring(args[0].value, args[1].value);
                                            case_flag = true;
                                        }
                                        break;
                                    }
                                    case ("valueOf"): {
                                        if (args_len === 0) {
                                            ret_val = ret_val.valueOf();
                                            case_flag = true;
                                        }
                                        break;
                                    }
                                }
                            }
                            //Library like Math
                            else if (mem_express.object.type === esprima.Syntax.Identifier) {
                                switch (mem_express.object.name) {
                                    case ("Math"): {
                                        if (args_len === 1
                                            && ssa_util.is_numnode(args[0])) {
                                            var v = ssa_util.numnode_to_num(args[0]);
                                            switch (property) {
                                                case("cos"): {
                                                    ret_val = Math.cos(v);
                                                    case_flag = true;
                                                    break;
                                                }
                                                case("sin"): {
                                                    ret_val = Math.sin(v);
                                                    case_flag = true;
                                                    break;
                                                }
                                                case("log"): {
                                                    ret_val = Math.log(v);
                                                    case_flag = true;
                                                    break;
                                                }
                                                case("exp"): {
                                                    ret_val = Math.exp(v);
                                                    case_flag = true;
                                                    break;
                                                }
                                                case("acos"): {
                                                    ret_val = Math.acos(v);
                                                    case_flag = true;
                                                    break;
                                                }
                                            }
                                        }
                                        else {
                                            switch (property) {
                                                case("pow"): {
                                                    if (args_len === 2
                                                        && ssa_util.is_numnode(args[0])
                                                        && ssa_util.is_numnode(args[1])) {
                                                        ret_val = Math.pow(args[0].value, args[1].value);
                                                        case_flag = true;
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                        break;
                                    }
                                    case ("String"): {
                                        switch (property) {
                                            case ("fromCharCode"): {
                                                if (args_len !== 0) {
                                                    var str_list = [];
                                                    var flag = true;
                                                    for (index in args) {
                                                        if (args[index].type !== esprima.Syntax.Literal
                                                            && !ssa_util.is_numnode(args[index])) {
                                                            flag = false;
                                                            break;
                                                        }
                                                        str_list.push(args[index].value);
                                                    }
                                                    if (flag === true) {
                                                        tmp = "String.fromCharCode(" + str_list.join(",") + ")";
                                                        ret_val = eval(tmp);
                                                        case_flag = true;
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                        break;
                                    }
                                    case ("window"): {
                                        if (args_len === 1
                                            && args[0].type === esprima.Syntax.Literal) {
                                            switch (property) {
                                                case ("parseInt"): {
                                                    ret_val = parseInt(args[0].value);
                                                    case_flag = true;
                                                    break;
                                                }
                                                case ("parseFloat"): {
                                                    ret_val = parseFloat(args[0].value);
                                                    case_flag = true;
                                                    break;
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                        }

                        break;
                    }
                    case esprima.Syntax.FunctionDeclaration: {
                        if (node.id.type === esprima.Syntax.Identifier) {
                            for (stat in node.body.body) {
                                if (node.body.body[stat].type === esprima.Syntax.ReturnStatement
                                    && node.body.body[stat].argument !== undefined
                                    && node.body.body[stat].argument !== null
                                    && node.body.body[stat].argument.type !== null
                                    && node.body.body[stat].argument.type === esprima.Syntax.Literal)
                                    func_return_literal_map[node.id.name] = node.body.body[stat].argument.value;
                            }
                        }
                        break;
                    }
                    // following case is wrong if the var isn't a const
                    case esprima.Syntax.Identifier: {
                        if (search_name_in_map(node.name, var_literal_map) !== undefined) {
                            var ret_val = var_literal_map[node.name];
                            var case_flag = false;
                            if ((parent.type === esprima.Syntax.BinaryExpression
                                || (parent.type === esprima.Syntax.AssignmentExpression
                                && parent.operator === "="))
                                && node !== parent.left) {
                                case_flag = true;
                            }
                            else if (ssa_util.is_string(ret_val) === true
                                && (parent.type === esprima.Syntax.MemberExpression
                                || parent.type === esprima.Syntax.CallExpression)) {
                                case_flag = true;
                            }
                            if (case_flag === true)
                                return {
                                    type: esprima.Syntax.Literal,
                                    value: ret_val,
                                    raw: ret_val
                                };
                        }
                        break;
                    }
                    case esprima.Syntax.LogicalExpression: {
                        if (node.left.type === esprima.Syntax.Literal
                            && node.right.type === esprima.Syntax.Literal) {
                            switch (node.operator) {
                                case '&&': {
                                    ret_val = node.left.value && node.right.value;
                                    case_flag = true;
                                    break;
                                }
                                case '||': {
                                    ret_val = node.left.value || node.right.value;
                                    case_flag = true;
                                    break;
                                }
                            }
                        }
                        else if (node.left.type === esprima.Syntax.Literal
                            && Boolean(node.left.value) === true)
                            return node.right;
                        break;
                    }
                    case esprima.Syntax.MemberExpression: {
                        //Array
                        if (node.object.type === esprima.Syntax.ArrayExpression
                            && node.property !== null
                            && node.object.elements.length >= 0) { //[1,2][1]
                            if (node.property.type === esprima.Syntax.Literal
                                && typeof node.property.value === typeof 0
                                && node.object.elements[node.property.value] !== undefined) {
                                return node.object.elements[node.property.value];
                            }
                            else if (node.property.type === esprima.Syntax.Identifier) {
                                if (node.property.name === "length") {
                                    ret_val = node.object.elements.length;
                                    case_flag = true;
                                }
                            }
                        }
                        //Library
                        else if (node.object.type === esprima.Syntax.Identifier
                            && node.property !== undefined
                            && (node.property.type === esprima.Syntax.Literal
                            || node.property.type === esprima.Syntax.Identifier)) {
                            var property;
                            if (node.property.type === esprima.Syntax.Literal)
                                property = node.property.value;
                            else
                                property = node.property.name;
                            switch (node.object.name) {
                                case ("Math"): {
                                    switch (property) {
                                        case("PI"): {
                                            ret_val = Math.PI;
                                            case_flag = true;
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        break;
                    }
                    case esprima.Syntax.NewExpression: { // new Array(1,2) -> [1,2]
                        if (node.callee !== undefined
                            && node.callee.type === esprima.Syntax.Identifier) {
                            if (node.callee.name === "Array") {
                                return ssa_util.newarray_node_to_array_node(node);
                            }
                            else if (node.arguments[0] !== undefined
                                && node.callee.name === "String")
                                return {
                                    "type": "Literal",
                                    "value": node.arguments[0].value,
                                    "raw": node.arguments[0].raw
                                }
                        }
                        break;
                    }
                    case esprima.Syntax.VariableDeclarator : {
                        if (node.id.type === esprima.Syntax.Identifier
                            && node.init !== undefined
                            && node.init !== null) {
                            if (node.init.type === esprima.Syntax.Literal)
                                var_literal_map[node.id.name] = node.init.value;
                            else if (ssa_util.is_numnode(node.init.type)) {
                                var_literal_map[node.id.name] = 0 - node.init.argument.value;
                            }
                        }
                        break;
                    }
                }
                if (case_flag === true) {
                    if (ret_val < 0)
                        return ssa_util.num_to_numnode(ret_val);
                    return {
                        type: esprima.Syntax.Literal,
                        value: ret_val,
                        raw: ret_val
                    };
                }
            } catch (err) {
                console.error(err);
            }
        }
    });
    // Output Syntax Tree
    // console.log(JSON.stringify(ast, null, 10));

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

if (module === require.main) {
    main(process.argv[2]);
}

