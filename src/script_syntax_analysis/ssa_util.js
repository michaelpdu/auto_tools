module.exports.array_to_node = function array_to_node(array) {
    var ret_node = {
        "type": "ArrayExpression",
        "elements": []
    };
    if (array.length === 1)
        ret_node.elements.push({
            "type": "Literal",
            "value": array[0],
            "raw": array[0].toString()
        });
    else
        for (ele in array) {
            var a = array[ele];
            ret_node.elements.push({
                "type": "Literal",
                "value": array[ele],
                "raw": array[ele].toString()
            });
        }
    return ret_node;
};

module.exports.is_liternal_array = function is_liternal_array(node) {
    var literal_flag = true;
    for (ele in node.elements) {
        if (node.elements[ele].type !== esprima.Syntax.Literal) {
            literal_flag = false;
            break;
        }
    }
    return literal_flag;
};

module.exports.is_numnode = function is_numnode(node) {
    return (node.type === esprima.Syntax.UnaryExpression
        && node.operator === '-'
        && node.argument !== undefined
        && node.argument.type === esprima.Syntax.Literal
        && typeof node.argument.value === typeof 0)
        || (node.type === esprima.Syntax.Literal
        && typeof node.value === typeof 0);
};

module.exports.is_string = function is_string(str) {
    return (typeof str === 'string') && str.constructor === String;
};

module.exports.newarray_node_to_array_node = function newarray_node_to_array_node(node) {
    var ret_node = {
        "type": "ArrayExpression",
        "elements": []
    };
    for (ele in node.arguments) {
        ret_node.elements.push(node.arguments[ele]);
    }
    return ret_node;
};

module.exports.node_to_array = function node_to_array(node) {
    var ret_array = [];
    for (ele in node.elements) {
        ret_array.push(node.elements[ele].value);
    }
    return ret_array;
};

module.exports.numnode_to_num = function numnode_to_num(node) {
    var ret_val;
    if (node.type === esprima.Syntax.Literal)
        ret_val = node.value;
    else if (node.type === esprima.Syntax.UnaryExpression
        && node.operator === "-"
        && node.argument !== undefined
        && node.argument.type === esprima.Syntax.Literal)
        ret_val = 0 - node.argument.value;
    return ret_val;
};

module.exports.num_to_numnode = function num_to_numnode(num) {
    if (num >= 0)
        return {
            "type": "Literal",
            "value": num,
            "raw": String(num)
        };
    else return {
        "type": "UnaryExpression",
        "operator": "-",
        "argument": {
            "type": "Literal",
            "value": 0 - num,
            "raw": String(0 - num)
        }
        // "prefix": true
    };

};