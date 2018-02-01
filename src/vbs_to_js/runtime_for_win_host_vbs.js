function left(str, lngLen) {
    if (lngLen > 0) {
        return str.substring(0, lngLen)
    } else {
        return null
    }
}
function right(str, lngLen) {
    if (str.length - lngLen >= 0 && str.length >= 0 && str.length - lngLen <= str.length) {
        return str.substring(str.length - lngLen, str.length)
    } else {
        return null
    }
}
function mid(str, starnum, endnum) {
    if (str.length >= 0) {
        return str.substr(starnum, endnum)
    } else {
        return null
    }
}
function midb(str, starnum, endnum) {
    if (str.length >= 0) {
        return str.substr(starnum, endnum)
    } else {
        return null
    }
}
function asc(str){
    return str.charCodeAt(0)
}
function ascb(str){
    return str.charCodeAt(0)
}
function getref(func){
    return eval(func)
}
function lcase(str){
    return str.toLowerCase()
}
function ucase(str){
    return str.toUpperCase( )
}
function rnd(){
    return Math.random()
}
function len(object){
    return object.length
}
function lenb(object){
    return object.length
}
function chr(number){
    return String.fromCharCode(number)
}
function cstr(number){
    return String(cstr)
}
function lbound(array){
    return 0
}
function ubound(array){
    return array.length - 1
}
function chrw(number){
    return String.fromCharCode(number)
}
function ascw(str){
    return str.charCodeAt(0)
}
function instrrev(str1,str2){
    return str1.lastIndexOf(str2) 
}
function space(object){
    return ' '.repeat(object)
}
function split(str1,str2){
    return str1.split(str2)
}
function cdbl(number){
    return parseFloat(number)
}
function int(str){
    return Math.floor(str)
} 
function cint(str){
    return Math.round(str)
}
function isarray(object){
    return Object.prototype.toString.call(object) === '[object Array]'; 
}
function array(object){
    
}
function createobject(str){
    return new ActiveXObject(str)
}