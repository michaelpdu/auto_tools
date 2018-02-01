/*
add some comments here
*/

rule unicode_in_js_code
{
    meta:
        description = "search number of \\u00xx is larger than "
        date = "2017-07-11"
    strings:
        $a = "\\u00" nocase
    condition:
        #a > 150
}

rule decode_by_array_in_vbs
{
    meta:
        description = "search number of regexp is larger than 50"
        date = "2017-07-11"
    strings:
        $a = /&\w{1,5}\(/ nocase
    condition:
        #a > 500
}