// --- begin of pre_script---

/**
 *  sax js - A sax-style parser for XML and HTML. <https://github.com/isaacs/sax-js>
 *  Compressed by <http://jscompress.com/>
**/
;(function(e){function n(t,r){if(!(this instanceof n))return new n(t,r);var s=this;i(s);s.q=s.c="";s.bufferCheckPosition=e.MAX_BUFFER_LENGTH;s.opt=r||{};s.opt.lowercase=s.opt.lowercase||s.opt.lowercasetags;s.looseCase=s.opt.lowercase?"toLowerCase":"toUpperCase";s.tags=[];s.closed=s.closedRoot=s.sawRoot=false;s.tag=s.error=null;s.strict=!!t;s.noscript=!!(t||s.opt.noscript);s.state=k.BEGIN;s.ENTITIES=Object.create(e.ENTITIES);s.attribList=[];if(s.opt.xmlns)s.ns=Object.create(w);s.trackPosition=s.opt.position!==false;if(s.trackPosition){s.position=s.line=s.column=0}L(s,"onready")}function r(n){var r=Math.max(e.MAX_BUFFER_LENGTH,10),i=0;for(var s=0,o=t.length;s<o;s++){var u=n[t[s]].length;if(u>r){switch(t[s]){case"textNode":O(n);break;case"cdata":A(n,"oncdata",n.cdata);n.cdata="";break;case"script":A(n,"onscript",n.script);n.script="";break;default:_(n,"Max buffer length exceeded: "+t[s])}}i=Math.max(i,u)}n.bufferCheckPosition=e.MAX_BUFFER_LENGTH-i+n.position}function i(e){for(var n=0,r=t.length;n<r;n++){e[t[n]]=""}}function a(e,t){return new f(e,t)}function f(e,t){if(!(this instanceof f))return new f(e,t);s.apply(this);this._parser=new n(e,t);this.writable=true;this.readable=true;var r=this;this._parser.onend=function(){r.emit("end")};this._parser.onerror=function(e){r.emit("error",e);r._parser.error=null};this._decoder=null;u.forEach(function(e){Object.defineProperty(r,"on"+e,{get:function(){return r._parser["on"+e]},set:function(t){if(!t){r.removeAllListeners(e);return r._parser["on"+e]=t}r.on(e,t)},enumerable:true,configurable:false})})}function x(e){return e.split("").reduce(function(e,t){e[t]=true;return e},{})}function T(e){return Object.prototype.toString.call(e)==="[object RegExp]"}function N(e,t){return T(e)?!!t.match(e):e[t]}function C(e,t){return!N(e,t)}function L(e,t,n){e[t]&&e[t](n)}function A(e,t,n){if(e.textNode)O(e);L(e,t,n)}function O(e){e.textNode=M(e.opt,e.textNode);if(e.textNode)L(e,"ontext",e.textNode);e.textNode=""}function M(e,t){if(e.trim)t=t.trim();if(e.normalize)t=t.replace(/\s+/g," ");return t}function _(e,t){O(e);if(e.trackPosition){t+="\nLine: "+e.line+"\nColumn: "+e.column+"\nChar: "+e.c}t=new Error(t);e.error=t;L(e,"onerror",t);return e}function D(e){if(!e.closedRoot)P(e,"Unclosed root tag");if(e.state!==k.TEXT)_(e,"Unexpected end");O(e);e.c="";e.closed=true;L(e,"onend");n.call(e,e.strict,e.opt);return e}function P(e,t){if(typeof e!=="object"||!(e instanceof n))throw new Error("bad call to strictFail");if(e.strict)_(e,t)}function H(e){if(!e.strict)e.tagName=e.tagName[e.looseCase]();var t=e.tags[e.tags.length-1]||e,n=e.tag={name:e.tagName,attributes:{}};if(e.opt.xmlns)n.ns=t.ns;e.attribList.length=0}function B(e){var t=e.indexOf(":"),n=t<0?["",e]:e.split(":"),r=n[0],i=n[1];if(e==="xmlns"){r="xmlns";i=""}return{prefix:r,local:i}}function j(e){if(!e.strict)e.attribName=e.attribName[e.looseCase]();if(e.attribList.indexOf(e.attribName)!==-1||e.tag.attributes.hasOwnProperty(e.attribName)){return e.attribName=e.attribValue=""}if(e.opt.xmlns){var t=B(e.attribName),n=t.prefix,r=t.local;if(n==="xmlns"){if(r==="xml"&&e.attribValue!==y){P(e,"xml: prefix must be bound to "+y+"\n"+"Actual: "+e.attribValue)}else if(r==="xmlns"&&e.attribValue!==b){P(e,"xmlns: prefix must be bound to "+b+"\n"+"Actual: "+e.attribValue)}else{var i=e.tag,s=e.tags[e.tags.length-1]||e;if(i.ns===s.ns){i.ns=Object.create(s.ns)}i.ns[r]=e.attribValue}}e.attribList.push([e.attribName,e.attribValue])}else{e.tag.attributes[e.attribName]=e.attribValue;A(e,"onattribute",{name:e.attribName,value:e.attribValue})}e.attribName=e.attribValue=""}function F(e,t){if(e.opt.xmlns){var n=e.tag;var r=B(e.tagName);n.prefix=r.prefix;n.local=r.local;n.uri=n.ns[r.prefix]||"";if(n.prefix&&!n.uri){P(e,"Unbound namespace prefix: "+JSON.stringify(e.tagName));n.uri=r.prefix}var i=e.tags[e.tags.length-1]||e;if(n.ns&&i.ns!==n.ns){Object.keys(n.ns).forEach(function(t){A(e,"onopennamespace",{prefix:t,uri:n.ns[t]})})}for(var s=0,o=e.attribList.length;s<o;s++){var u=e.attribList[s];var a=u[0],f=u[1],l=B(a),c=l.prefix,h=l.local,p=c==""?"":n.ns[c]||"",d={name:a,value:f,prefix:c,local:h,uri:p};if(c&&c!="xmlns"&&!p){P(e,"Unbound namespace prefix: "+JSON.stringify(c));d.uri=c}e.tag.attributes[a]=d;A(e,"onattribute",d)}e.attribList.length=0}e.tag.isSelfClosing=!!t;e.sawRoot=true;e.tags.push(e.tag);A(e,"onopentag",e.tag);if(!t){if(!e.noscript&&e.tagName.toLowerCase()==="script"){e.state=k.SCRIPT}else{e.state=k.TEXT}e.tag=null;e.tagName=""}e.attribName=e.attribValue="";e.attribList.length=0}function I(e){if(!e.tagName){P(e,"Weird empty close tag.");e.textNode+="</>";e.state=k.TEXT;return}if(e.script){if(e.tagName!=="script"){e.script+="</"+e.tagName+">";e.tagName="";e.state=k.SCRIPT;return}A(e,"onscript",e.script);e.script=""}var t=e.tags.length;var n=e.tagName;if(!e.strict)n=n[e.looseCase]();var r=n;while(t--){var i=e.tags[t];if(i.name!==r){P(e,"Unexpected close tag")}else break}if(t<0){P(e,"Unmatched closing tag: "+e.tagName);e.textNode+="</"+e.tagName+">";e.state=k.TEXT;return}e.tagName=n;var s=e.tags.length;while(s-->t){var o=e.tag=e.tags.pop();e.tagName=e.tag.name;A(e,"onclosetag",e.tagName);var u={};for(var a in o.ns)u[a]=o.ns[a];var f=e.tags[e.tags.length-1]||e;if(e.opt.xmlns&&o.ns!==f.ns){Object.keys(o.ns).forEach(function(t){var n=o.ns[t];A(e,"onclosenamespace",{prefix:t,uri:n})})}}if(t===0)e.closedRoot=true;e.tagName=e.attribValue=e.attribName="";e.attribList.length=0;e.state=k.TEXT}function q(e){var t=e.entity,n=t.toLowerCase(),r,i="";if(e.ENTITIES[t])return e.ENTITIES[t];if(e.ENTITIES[n])return e.ENTITIES[n];t=n;if(t.charAt(0)==="#"){if(t.charAt(1)==="x"){t=t.slice(2);r=parseInt(t,16);i=r.toString(16)}else{t=t.slice(1);r=parseInt(t,10);i=r.toString(10)}}t=t.replace(/^0+/,"");if(i.toLowerCase()!==t){P(e,"Invalid character entity");return"&"+e.entity+";"}return String.fromCharCode(r)}function R(e){var t=this;if(this.error)throw this.error;if(t.closed)return _(t,"Cannot write after close. Assign an onready handler.");if(e===null)return D(t);var n=0,i="";while(t.c=i=e.charAt(n++)){if(t.trackPosition){t.position++;if(i==="\n"){t.line++;t.column=0}else t.column++}switch(t.state){case k.BEGIN:if(i==="<"){t.state=k.OPEN_WAKA;t.startTagPosition=t.position}else if(C(l,i)){P(t,"Non-whitespace before first tag.");t.textNode=i;t.state=k.TEXT}continue;case k.TEXT:if(t.sawRoot&&!t.closedRoot){var s=n-1;while(i&&i!=="<"&&i!=="&"){i=e.charAt(n++);if(i&&t.trackPosition){t.position++;if(i==="\n"){t.line++;t.column=0}else t.column++}}t.textNode+=e.substring(s,n-1)}if(i==="<"){t.state=k.OPEN_WAKA;t.startTagPosition=t.position}else{if(C(l,i)&&(!t.sawRoot||t.closedRoot))P(t,"Text data outside of root node.");if(i==="&")t.state=k.TEXT_ENTITY;else t.textNode+=i}continue;case k.SCRIPT:if(i==="<"){t.state=k.SCRIPT_ENDING}else t.script+=i;continue;case k.SCRIPT_ENDING:if(i==="/"){t.state=k.CLOSE_TAG}else{t.script+="<"+i;t.state=k.SCRIPT}continue;case k.OPEN_WAKA:if(i==="!"){t.state=k.SGML_DECL;t.sgmlDecl=""}else if(N(l,i)){}else if(N(E,i)){t.state=k.OPEN_TAG;t.tagName=i}else if(i==="/"){t.state=k.CLOSE_TAG;t.tagName=""}else if(i==="?"){t.state=k.PROC_INST;t.procInstName=t.procInstBody=""}else{P(t,"Unencoded <");if(t.startTagPosition+1<t.position){var o=t.position-t.startTagPosition;i=(new Array(o)).join(" ")+i}t.textNode+="<"+i;t.state=k.TEXT}continue;case k.SGML_DECL:if((t.sgmlDecl+i).toUpperCase()===m){A(t,"onopencdata");t.state=k.CDATA;t.sgmlDecl="";t.cdata=""}else if(t.sgmlDecl+i==="--"){t.state=k.COMMENT;t.comment="";t.sgmlDecl=""}else if((t.sgmlDecl+i).toUpperCase()===g){t.state=k.DOCTYPE;if(t.doctype||t.sawRoot)P(t,"Inappropriately located doctype declaration");t.doctype="";t.sgmlDecl=""}else if(i===">"){A(t,"onsgmldeclaration",t.sgmlDecl);t.sgmlDecl="";t.state=k.TEXT}else if(N(p,i)){t.state=k.SGML_DECL_QUOTED;t.sgmlDecl+=i}else t.sgmlDecl+=i;continue;case k.SGML_DECL_QUOTED:if(i===t.q){t.state=k.SGML_DECL;t.q=""}t.sgmlDecl+=i;continue;case k.DOCTYPE:if(i===">"){t.state=k.TEXT;A(t,"ondoctype",t.doctype);t.doctype=true}else{t.doctype+=i;if(i==="[")t.state=k.DOCTYPE_DTD;else if(N(p,i)){t.state=k.DOCTYPE_QUOTED;t.q=i}}continue;case k.DOCTYPE_QUOTED:t.doctype+=i;if(i===t.q){t.q="";t.state=k.DOCTYPE}continue;case k.DOCTYPE_DTD:t.doctype+=i;if(i==="]")t.state=k.DOCTYPE;else if(N(p,i)){t.state=k.DOCTYPE_DTD_QUOTED;t.q=i}continue;case k.DOCTYPE_DTD_QUOTED:t.doctype+=i;if(i===t.q){t.state=k.DOCTYPE_DTD;t.q=""}continue;case k.COMMENT:if(i==="-")t.state=k.COMMENT_ENDING;else t.comment+=i;continue;case k.COMMENT_ENDING:if(i==="-"){t.state=k.COMMENT_ENDED;t.comment=M(t.opt,t.comment);if(t.comment)A(t,"oncomment",t.comment);t.comment=""}else{t.comment+="-"+i;t.state=k.COMMENT}continue;case k.COMMENT_ENDED:if(i!==">"){P(t,"Malformed comment");t.comment+="--"+i;t.state=k.COMMENT}else t.state=k.TEXT;continue;case k.CDATA:if(i==="]")t.state=k.CDATA_ENDING;else t.cdata+=i;continue;case k.CDATA_ENDING:if(i==="]")t.state=k.CDATA_ENDING_2;else{t.cdata+="]"+i;t.state=k.CDATA}continue;case k.CDATA_ENDING_2:if(i===">"){if(t.cdata)A(t,"oncdata",t.cdata);A(t,"onclosecdata");t.cdata="";t.state=k.TEXT}else if(i==="]"){t.cdata+="]"}else{t.cdata+="]]"+i;t.state=k.CDATA}continue;case k.PROC_INST:if(i==="?")t.state=k.PROC_INST_ENDING;else if(N(l,i))t.state=k.PROC_INST_BODY;else t.procInstName+=i;continue;case k.PROC_INST_BODY:if(!t.procInstBody&&N(l,i))continue;else if(i==="?")t.state=k.PROC_INST_ENDING;else t.procInstBody+=i;continue;case k.PROC_INST_ENDING:if(i===">"){A(t,"onprocessinginstruction",{name:t.procInstName,body:t.procInstBody});t.procInstName=t.procInstBody="";t.state=k.TEXT}else{t.procInstBody+="?"+i;t.state=k.PROC_INST_BODY}continue;case k.OPEN_TAG:if(N(S,i))t.tagName+=i;else{H(t);if(i===">")F(t);else if(i==="/")t.state=k.OPEN_TAG_SLASH;else{if(C(l,i))P(t,"Invalid character in tag name");t.state=k.ATTRIB}}continue;case k.OPEN_TAG_SLASH:if(i===">"){F(t,true);I(t)}else{P(t,"Forward-slash in opening tag not followed by >");t.state=k.ATTRIB}continue;case k.ATTRIB:if(N(l,i))continue;else if(i===">")F(t);else if(i==="/")t.state=k.OPEN_TAG_SLASH;else if(N(E,i)){t.attribName=i;t.attribValue="";t.state=k.ATTRIB_NAME}else P(t,"Invalid attribute name");continue;case k.ATTRIB_NAME:if(i==="=")t.state=k.ATTRIB_VALUE;else if(i===">"){P(t,"Attribute without value");t.attribValue=t.attribName;j(t);F(t)}else if(N(l,i))t.state=k.ATTRIB_NAME_SAW_WHITE;else if(N(S,i))t.attribName+=i;else P(t,"Invalid attribute name");continue;case k.ATTRIB_NAME_SAW_WHITE:if(i==="=")t.state=k.ATTRIB_VALUE;else if(N(l,i))continue;else{P(t,"Attribute without value");t.tag.attributes[t.attribName]="";t.attribValue="";A(t,"onattribute",{name:t.attribName,value:""});t.attribName="";if(i===">")F(t);else if(N(E,i)){t.attribName=i;t.state=k.ATTRIB_NAME}else{P(t,"Invalid attribute name");t.state=k.ATTRIB}}continue;case k.ATTRIB_VALUE:if(N(l,i))continue;else if(N(p,i)){t.q=i;t.state=k.ATTRIB_VALUE_QUOTED}else{P(t,"Unquoted attribute value");t.state=k.ATTRIB_VALUE_UNQUOTED;t.attribValue=i}continue;case k.ATTRIB_VALUE_QUOTED:if(i!==t.q){if(i==="&")t.state=k.ATTRIB_VALUE_ENTITY_Q;else t.attribValue+=i;continue}j(t);t.q="";t.state=k.ATTRIB;continue;case k.ATTRIB_VALUE_UNQUOTED:if(C(v,i)){if(i==="&")t.state=k.ATTRIB_VALUE_ENTITY_U;else t.attribValue+=i;continue}j(t);if(i===">")F(t);else t.state=k.ATTRIB;continue;case k.CLOSE_TAG:if(!t.tagName){if(N(l,i))continue;else if(C(E,i)){if(t.script){t.script+="</"+i;t.state=k.SCRIPT}else{P(t,"Invalid tagname in closing tag.")}}else t.tagName=i}else if(i===">")I(t);else if(N(S,i))t.tagName+=i;else if(t.script){t.script+="</"+t.tagName;t.tagName="";t.state=k.SCRIPT}else{if(C(l,i))P(t,"Invalid tagname in closing tag");t.state=k.CLOSE_TAG_SAW_WHITE}continue;case k.CLOSE_TAG_SAW_WHITE:if(N(l,i))continue;if(i===">")I(t);else P(t,"Invalid characters in closing tag");continue;case k.TEXT_ENTITY:case k.ATTRIB_VALUE_ENTITY_Q:case k.ATTRIB_VALUE_ENTITY_U:switch(t.state){case k.TEXT_ENTITY:var u=k.TEXT,a="textNode";break;case k.ATTRIB_VALUE_ENTITY_Q:var u=k.ATTRIB_VALUE_QUOTED,a="attribValue";break;case k.ATTRIB_VALUE_ENTITY_U:var u=k.ATTRIB_VALUE_UNQUOTED,a="attribValue";break}if(i===";"){t[a]+=q(t);t.entity="";t.state=u}else if(N(d,i))t.entity+=i;else{P(t,"Invalid character entity");t[a]+="&"+t.entity+i;t.entity="";t.state=u}continue;default:throw new Error(t,"Unknown state: "+t.state)}}if(t.position>=t.bufferCheckPosition)r(t);return t}e.parser=function(e,t){return new n(e,t)};e.SAXParser=n;e.SAXStream=f;e.createStream=a;e.MAX_BUFFER_LENGTH=64*1024;var t=["comment","sgmlDecl","textNode","tagName","doctype","procInstName","procInstBody","entity","attribName","attribValue","cdata","script"];e.EVENTS=["text","processinginstruction","sgmldeclaration","doctype","comment","attribute","opentag","closetag","opencdata","cdata","closecdata","error","end","ready","script","opennamespace","closenamespace"];if(!Object.create)Object.create=function(e){function t(){this.__proto__=e}t.prototype=e;return new t};if(!Object.getPrototypeOf)Object.getPrototypeOf=function(e){return e.__proto__};if(!Object.keys)Object.keys=function(e){var t=[];for(var n in e)if(e.hasOwnProperty(n))t.push(n);return t};n.prototype={end:function(){D(this)},write:R,resume:function(){this.error=null;return this},close:function(){return this.write(null)}};var s=function(){};var u=e.EVENTS.filter(function(e){return e!=="error"&&e!=="end"});f.prototype=Object.create(s.prototype,{constructor:{value:f}});f.prototype.write=function(e){if(typeof Buffer==="function"&&typeof Buffer.isBuffer==="function"&&Buffer.isBuffer(e)){if(!this._decoder){var t=require("string_decoder").StringDecoder;this._decoder=new t("utf8")}e=this._decoder.write(e)}this._parser.write(e.toString());this.emit("data",e);return true};f.prototype.end=function(e){if(e&&e.length)this.write(e);this._parser.end();return true};f.prototype.on=function(e,t){var n=this;if(!n._parser["on"+e]&&u.indexOf(e)!==-1){n._parser["on"+e]=function(){var t=arguments.length===1?[arguments[0]]:Array.apply(null,arguments);t.splice(0,0,e);n.emit.apply(n,t)}}return s.prototype.on.call(n,e,t)};var l="\r\n  ",c="0124356789",h="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",p="'\"",d=c+h+"#",v=l+">",m="[CDATA[",g="DOCTYPE",y="http://www.w3.org/XML/1998/namespace",b="http://www.w3.org/2000/xmlns/",w={xml:y,xmlns:b};l=x(l);c=x(c);h=x(h);var E=/[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;var S=/[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040\.\d-]/;p=x(p);d=x(d);v=x(v);var k=0;e.STATE={BEGIN:k++,TEXT:k++,TEXT_ENTITY:k++,OPEN_WAKA:k++,SGML_DECL:k++,SGML_DECL_QUOTED:k++,DOCTYPE:k++,DOCTYPE_QUOTED:k++,DOCTYPE_DTD:k++,DOCTYPE_DTD_QUOTED:k++,COMMENT_STARTING:k++,COMMENT:k++,COMMENT_ENDING:k++,COMMENT_ENDED:k++,CDATA:k++,CDATA_ENDING:k++,CDATA_ENDING_2:k++,PROC_INST:k++,PROC_INST_BODY:k++,PROC_INST_ENDING:k++,OPEN_TAG:k++,OPEN_TAG_SLASH:k++,ATTRIB:k++,ATTRIB_NAME:k++,ATTRIB_NAME_SAW_WHITE:k++,ATTRIB_VALUE:k++,ATTRIB_VALUE_QUOTED:k++,ATTRIB_VALUE_UNQUOTED:k++,ATTRIB_VALUE_ENTITY_Q:k++,ATTRIB_VALUE_ENTITY_U:k++,CLOSE_TAG:k++,CLOSE_TAG_SAW_WHITE:k++,SCRIPT:k++,SCRIPT_ENDING:k++};e.ENTITIES={amp:"&",gt:">",lt:"<",quot:'"',apos:"'",AElig:198,Aacute:193,Acirc:194,Agrave:192,Aring:197,Atilde:195,Auml:196,Ccedil:199,ETH:208,Eacute:201,Ecirc:202,Egrave:200,Euml:203,Iacute:205,Icirc:206,Igrave:204,Iuml:207,Ntilde:209,Oacute:211,Ocirc:212,Ograve:210,Oslash:216,Otilde:213,Ouml:214,THORN:222,Uacute:218,Ucirc:219,Ugrave:217,Uuml:220,Yacute:221,aacute:225,acirc:226,aelig:230,agrave:224,aring:229,atilde:227,auml:228,ccedil:231,eacute:233,ecirc:234,egrave:232,eth:240,euml:235,iacute:237,icirc:238,igrave:236,iuml:239,ntilde:241,oacute:243,ocirc:244,ograve:242,oslash:248,otilde:245,ouml:246,szlig:223,thorn:254,uacute:250,ucirc:251,ugrave:249,uuml:252,yacute:253,yuml:255,copy:169,reg:174,nbsp:160,iexcl:161,cent:162,pound:163,curren:164,yen:165,brvbar:166,sect:167,uml:168,ordf:170,laquo:171,not:172,shy:173,macr:175,deg:176,plusmn:177,sup1:185,sup2:178,sup3:179,acute:180,micro:181,para:182,middot:183,cedil:184,ordm:186,raquo:187,frac14:188,frac12:189,frac34:190,iquest:191,times:215,divide:247,OElig:338,oelig:339,Scaron:352,scaron:353,Yuml:376,fnof:402,circ:710,tilde:732,Alpha:913,Beta:914,Gamma:915,Delta:916,Epsilon:917,Zeta:918,Eta:919,Theta:920,Iota:921,Kappa:922,Lambda:923,Mu:924,Nu:925,Xi:926,Omicron:927,Pi:928,Rho:929,Sigma:931,Tau:932,Upsilon:933,Phi:934,Chi:935,Psi:936,Omega:937,alpha:945,beta:946,gamma:947,delta:948,epsilon:949,zeta:950,eta:951,theta:952,iota:953,kappa:954,lambda:955,mu:956,nu:957,xi:958,omicron:959,pi:960,rho:961,sigmaf:962,sigma:963,tau:964,upsilon:965,phi:966,chi:967,psi:968,omega:969,thetasym:977,upsih:978,piv:982,ensp:8194,emsp:8195,thinsp:8201,zwnj:8204,zwj:8205,lrm:8206,rlm:8207,ndash:8211,mdash:8212,lsquo:8216,rsquo:8217,sbquo:8218,ldquo:8220,rdquo:8221,bdquo:8222,dagger:8224,Dagger:8225,bull:8226,hellip:8230,permil:8240,prime:8242,Prime:8243,lsaquo:8249,rsaquo:8250,oline:8254,frasl:8260,euro:8364,image:8465,weierp:8472,real:8476,trade:8482,alefsym:8501,larr:8592,uarr:8593,rarr:8594,darr:8595,harr:8596,crarr:8629,lArr:8656,uArr:8657,rArr:8658,dArr:8659,hArr:8660,forall:8704,part:8706,exist:8707,empty:8709,nabla:8711,isin:8712,notin:8713,ni:8715,prod:8719,sum:8721,minus:8722,lowast:8727,radic:8730,prop:8733,infin:8734,ang:8736,and:8743,or:8744,cap:8745,cup:8746,"int":8747,there4:8756,sim:8764,cong:8773,asymp:8776,ne:8800,equiv:8801,le:8804,ge:8805,sub:8834,sup:8835,nsub:8836,sube:8838,supe:8839,oplus:8853,otimes:8855,perp:8869,sdot:8901,lceil:8968,rceil:8969,lfloor:8970,rfloor:8971,lang:9001,rang:9002,loz:9674,spades:9824,clubs:9827,hearts:9829,diams:9830};Object.keys(e.ENTITIES).forEach(function(t){var n=e.ENTITIES[t];var r=typeof n==="number"?String.fromCharCode(n):n;e.ENTITIES[t]=r});for(var k in e.STATE)e.STATE[e.STATE[k]]=k;k=e.STATE})(typeof exports==="undefined"?sax={}:exports)


/**
 *  xmldoc - lets you parse XML documents with ease <https://github.com/nfarina/xmldoc>
 *  Compressed by <http://jscompress.com/>
**/
;(function(){function n(e){this.name=e.name;this.attr=e.attributes||{};this.val="";this.children=[]}function r(t){t&&(t=t.toString().trim());if(!t)throw new Error("No XML to parse!");var n=e.parser(true);s(n);i=[this];n.write(t)}function s(e){e.onopentag=o;e.onclosetag=u;e.ontext=a;e.oncdata=f}function o(){i[0]._opentag.apply(i[0],arguments)}function u(){i[0]._closetag.apply(i[0],arguments)}function a(){i[0]._text.apply(i[0],arguments)}function f(){i[0]._cdata.apply(i[0],arguments)}function l(e,t){for(var n in t)if(t.hasOwnProperty(n))e[n]=t[n]}var e,t=this;if(typeof module!=="undefined"&&module.exports){e=require("sax");t=module.exports}else{e=t.sax;if(!e)throw new Error("Expected sax to be defined. Make sure you're including sax.js before this file.")}n.prototype._opentag=function(e){var t=new n(e);this.children.push(t);if(!this.firstChild)this.firstChild=t;this.lastChild=t;i.unshift(t)};n.prototype._closetag=function(){i.shift()};n.prototype._text=function(e){if(e)this.val+=e};n.prototype._cdata=function(e){if(e)this.val+=e};n.prototype.eachChild=function(e,t){for(var n=0,r=this.children.length;n<r;n++)if(e.call(t,this.children[n],n,this.children)===false)return};n.prototype.childNamed=function(e){for(var t=0,n=this.children.length;t<n;t++){var r=this.children[t];if(r.name===e)return r}};n.prototype.childrenNamed=function(e){var t=[];for(var n=0,r=this.children.length;n<r;n++)if(this.children[n].name===e)t.push(this.children[n]);return t};n.prototype.childWithAttribute=function(e,t){for(var n=0,r=this.children.length;n<r;n++){var i=this.children[n];if(t&&i.attr[e]===t||!t&&i.attr[e])return i}};n.prototype.descendantWithPath=function(e){var t=this;var n=e.split(".");for(var r=0,i=n.length;r<i;r++)if(t)t=t.childNamed(n[r]);else return undefined;return t};n.prototype.valueWithPath=function(e){var t=e.split("@");var n=this.descendantWithPath(t[0]);if(n)return t.length>1?n.attr[t[1]]:n.val};n.prototype.toString=function(){return this.toStringWithIndent("")};n.prototype.toStringWithIndent=function(e){var t="";t+=e+"<"+this.name;for(var n in this.attr)t+=" "+n+'="'+this.attr[n]+'"';var r=this.val.trim();if(r.length>25)r=r.substring(0,25).trim()+"...";if(this.children.length){t+=">\n";var i=e+"  ";if(r.length)t+=i+r+"\n";for(var s=0,o=this.children.length;s<o;s++)t+=this.children[s].toStringWithIndent(i)+"\n";t+=e+"</"+this.name+">"}else if(r.length){t+=">"+r+"</"+this.name+">"}else t+="/>";return t};l(r.prototype,n.prototype);r.prototype._opentag=function(e){if(typeof this.children==="undefined")n.call(this,e);else n.prototype._opentag.apply(this,arguments)};var i=null;t.XmlDocument=r})()


// -------  end of 3rd party libraries -------


function Plugin(name,fname,desc){
    this.name = name;
    this.filename = fname;
    this.description = desc;
}
var PluginArray = function _PluginArray(){ 
    this.toString = function(){
        return '';
    };

};
PluginArray.prototype = new Array;
var my_plugins = new PluginArray();
my_plugins.push(new Plugin('getPlusPlus for Adobe 16263','np_gp.dll','getplusplusadobe16263'));
my_plugins.push(new Plugin('Google Talk Plugin','npgoogletalk.dll','Version 1,0,21,0'));
my_plugins.push(new Plugin('Adobe Acrobat','nppdf32.dll','Adobe PDF Plug-In For Firefox and Netscape'));
my_plugins.push(new Plugin('Mozilla Default Plug-in','npnul32.dll','Default Plug-in'));
my_plugins.push(new Plugin('Microsoft Office 2003','NPOFFICE.DLL','Office Plugin for Netscape Navigator'));
my_plugins.push(new Plugin('Google Update','npGoogleOneClick8.dll','Google Update'));
my_plugins.push(new Plugin('Shockwave Flash','NPSWF32.dll','Shockwave Flash 10.0 r32'));
my_plugins.push(new Plugin('Silverlight Plug-In','npctrl.dll','3.0.50106.0'));
my_plugins.push(new Plugin('Microsoft Office Live Plug-in for Firefox','npOLW.dll','Office Live Update v1.4'));
my_plugins.push(new Plugin('Java Deployment Toolkit 6.0.140.8','npdeploytk.dll','NPRuntime Script Plug-in Library for Java(TM) Deploy'));
my_plugins.push(new Plugin('Java(TM) Platform SE 6 U14','npjp2.dll','Next Generation Java Plug-in 1.6.0_14 for Mozilla browsers'));

Number.eval = this.eval;
Number.prototype.eval = this.eval;

Date.eval = this.eval;
Date.prototype.eval = this.eval;

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

String.prototype._indexOf= String.prototype.indexOf;
String.prototype.__defineGetter__(
        "indexOf",
        function() {
            return this._indexOf.bind(this);
        }
        );

String.prototype._substr= String.prototype.substr;
String.prototype.__defineGetter__(
        "substr",
        function() {
            return this._substr.bind(this);
        }
        );

String.prototype._toUpperCase= String.prototype.toUpperCase;
String.prototype.__defineGetter__(
        "toUpperCase",
        function() {
            return this._toUpperCase.bind(this);
        }
        );

String.prototype._toLowerCase= String.prototype.toLowerCase;
String.prototype.__defineGetter__(
        "toLowerCase",
        function() {
            return this._toLowerCase.bind(this);
        }
        );

String.prototype._concat= String.prototype.concat;
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
// Array.eval = this.eval;
// Array.prototype.__defineGetter__(
        // "eval",
        // function(){
            // if (1 == this.length && "this" == this[0])             
                // return eval;
        // });

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
    if ( 0 == eval_reported ) {
        _docode_report("eval_access");
        _docode_report("eval content: " + s);
        eval_reported = 1;
    }
}

var app = {
    platform:String('WIN'),
    _viewerversion:Number(8.0),
    viewerType:String('Reader'),
    viewerVariation:String('Reader'),
    capabilities:String('.obj'),
    language:String('en'),
    endPriv:true,
    toolbarVertical:true,
    toolbarHorizontal:true,
    focusRect:true,
    formsVersion: Number(8.0), // Must meet: formsVersion.toString()[0] returns "7" or "8".
    thermometer:true,
    isValidSaveLocation:true,
    printerNames:Array(),
    setTimeOut:function(txt,wait){ eval(txt); },
    clearTimeOut:function(a){},
    eval:eval,
    openInPlace: true,
    setInterval:function(txt,wait){var s="[native code]";},
    setProfile:function(txt,wait){var s="[native code]";},
    compareDocuments:String('function'), // this should be a function
    measureDialog:String('function'), // this should be a function
    alert:function alert(a){ _docode_report ("/*** app.alert " + a + "*/"); },
    alert:function alert(){ '[native code]'},
};

app.__defineGetter__(
        "viewerVersion",
        function(){
            _docode_report("getter viewerversion");
            return this._viewerversion;
        });

app.__defineSetter__(
        "viewerVersion",
        function(_value){
            this._viewerversion = _value;
        });

app.beep = function(nType) {
    return undefined;
}

app.popUpMenu = function() {
    var s = "[native code]";
    return "function popUpMenu() {[native code]}";
};

app.endPriv = function() {
    var s = "[native code]";
    return "function endPriv() {[native code]}";
};

app.setProfile = function() {
    // var s = "[native code]";
    var s = "[setProfile]";
    return "function setProfile() {[native code]}";
};

app.getPath = function() {
    var s = "[native code]";
    return "function getPath() {[native code]}";
};

app.hideMenuItem = function() {
    var s = "[native code]";
    return "function hideMenuItem(){[native code]}";
};

app.DisablePermEnforcement = function() {
    var s = "[native code]";
    return "function DisablePermEnforcement() {[native code]}";
};

app.addSubMenu = function() {
    var s = "[native code]";
    return "function addSubMenu() {[native code]}";
};

app.goForward = function() {
    var s = "[native code]";
    return "function goForward() {[native code]}";
};

app.goBack = function() {
    var s = "[native code]";
    return "function goBack() {[native code]}";
};

app.execMenuItem = function(item) {
    var s= "[native code]";
    return "function execMenuItem() {[native code]}";
};

app.newDoc = function(item) {
    var s= "[native code]";
    return "function newDoc() {[native code]}";
};

app.openDoc = function(item) {
    var s= "[native code]";
    return "function openDoc() {[native code]}";
};

app.addMenuItem = function(item) {
    // check keyword "addMenuItem"
    var s= "[native code]";
    return "function addMenuItem() {[native code]}";
};

app.listMenuItems = function(itme) {
    // return value includes keyword "cName"
    var s= "[native code]";
    return "*cName*oChi*listMenuItems";
};

app.newCollection = function(item) 
{    
    var s= "[native code]";
    return "function newCollection() {[native code]}";
};

app.browseForDoc = function() {
    var s = "[native code]";
    return "function browseForDoc() {[native code]}";
};

app.getString = function() {
    return "function getString() {[native code]}";
};

app.mailMsg = function() {
    return "function mailMsg() {[native code]}";
};

app.response = function() {
    return "function response() {[native code]}";
};

app.removeToolButton = function() {
    return "function removeToolButton() {[native code]}";
}

app.launchURL = function() {
    return "function removeToolButton() {[native code]}";
}

app.listToolbarButtons = function(item) {
    // contain "cName"
    return ["*cName*"];
};

app.setTimeOut = function(code,millisec){
    _docode_report("call app.setTimeOut");
    setTimeout(code,millisec);
}

this.setTimeout=function(fn,time){
    eval(fn);
}

var shellcodes = new Array();

function StringNCompare( sc1, sc2, n ) {
    for ( var i = 0; i < n; i ++ ) {
        if ( sc1.charAt(i) != sc2.charAt(i) ) {
            return sc1.charCodeAt(i) - sc2.charCodeAt(i);
        }
    }

    return 0;
}

function ShellcodeEquals( sc1, sc2 ) {
    var len1 = sc1.length;
    var len2 = sc2.length;

    if ( len1 != len2 )
        return false;
    var n = 20;
    if ( n > len1 )
        n = len1;

    if ( StringNCompare( sc1, sc2, n ) == 0 )
        return true;

    return false;
}

function AlreadyChecked(s) {
    for ( var i = 0; i < shellcodes.length; i ++ ) {
        if ( ShellcodeEquals( shellcodes[i], s ) )
            return true;
    }
    return false;
}

function IsShellcode(s) {
    var index = 0;

    if( s.length < 100 || s.length > 2048 )
    {
        return false;
    }

    var chr_map = new Array(256);
    for ( index=0; index < chr_map.length; index++ )
    {   
        chr_map[index] = 0;
    }

    for ( index = 0; index < s.length; index++ )
    {
        var code = s.charCodeAt(index);
        var b1 = code & 0xff;
        var b2 = (code >> 8) & 0xff;

        chr_map[b1] += 1;
        chr_map[b2] += 1;
    }

    // to many zeros
    if ( chr_map[0] >= s.length/2  ) 
        return false;

    var diff = 0;
    for( index=0; index < chr_map.length; index++ )
    {   
        if (chr_map[index] > 0)
            diff += 1;
    }

    if (diff > 15)
        return true;

    return false;
}


function HexEncode(s) {
    var result = "";
    var len = s.length;

    for ( var i = 0; i < len; i ++ ) {
        var code = s.charCodeAt(i);

        var c = (code & 0xff).toString(16);
        if ( c.length == 1 )
            c = '0' + c;

        result +=  c;

        c = ((code>>8)  & 0xff).toString(16);
        if ( c.length == 1 )
            c = '0' + c;

        result += c;
    }


    return result;
};


function HexDecode(hexString) {
    var result = "";
    if (null == hexString || "" == hexString)
        return result;

    for ( var i = 0; i < hexString.length - 1; i += 2 ) {
        var high = parseInt( hexString.charAt(i), 16 );
        var low = parseInt( hexString.charAt(i + 1), 16 );

        if ( high != NaN && low != NaN ) {
            var value = (high << 4) | (low);
            result += String.fromCharCode(value);
        } else {
            break;
        }
    }

    return result;
}


function ReportShellcode(sc) {
    _docode_report("find shellcode");
    _docode_shellcode_report(HexEncode(sc));
}

var my_unescape = this.unescape;
this.unescape = function(str) {
    var unescaped = my_unescape(str);
    if (AlreadyChecked( unescaped ) == false) {
        if(IsShellcode( unescaped ) ) {
            ReportShellcode(unescaped);
            shellcodes.push(unescaped);
        } else {
            _docode_report("unescape_access_but_not_shellcode");
        }
    }
    return unescaped;
}


var info = { title : '' };
var varRaiseSystem = {
    fileError: "",
};

var media = {
    closeReason : 1,
    raiseCode : {},
    raiseSystem : varRaiseSystem,
    newPlayer : function(a){ 
                    if (a == null){ 
                        _docode_report("js_checker_cve_2009_4324"); 
                    } 
                    else { 
                        _docode_report("media_newplayer_access"); 
                    } 
                },
    createPlayer : function(a){
                       _docode_report("media_newplayer_access");
                   },
    getPlayers : function(a) {
                     _docode_report("media_getplayers_access");
                 },
    addStockEvents : true,    
    windowType : true,    
};
var zzzannot = [];
var zzzannot2 = {};
app.doc = {
    syncAnnotScan : function(){},
    getAnnot : function(pageNo,name){
        if (name in zzzannot2){
            return zzzannot2[name];
        }
        if (zzzannot.length > pageNo){
            return zzzannot[pageNo][0]; 
        }
    },
    getAnnots : function(){ 
                    var result_annots;
                    _docode_report("get_annots_access");
                    for (var i = 0; i < arguments.length; i++){
                        var npage = -1;
                        if (typeof arguments[i] == 'number'){
                            npage = arguments[i];
                        }
                        else if ('nPage' in arguments[i]){
                            npage = arguments[i].nPage;
                        }
                        if (npage > -1){
                            if (zzzannot.length > npage){
                                //return zzzannot[npage];
                                result_annots = zzzannot[npage];
                            }
                        } else {
                            _docode_report("js_checker_cve_2009_1492");
                        }
                    }
                    if (arguments.length == 0){
                        if (zzzannot.length > 0){
                            //return zzzannot[0];
                            result_annots = zzzannot[0];
                        }
                    }


                    if ( result_annots == undefined ) {
                        result_annots = new Array(3);
                        for ( var i = 0; i < result_annots.length; i ++ )
                            result_annots[i] = {subject:'a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a'};
                    }


                    return result_annots;
                },
    Function : function(thefunc){
                   _docode_report (thefunc);
               },
    printSeps : function(){
                    if ( arguments.length == 0 ) {
                        _docode_report ("js_checker_cve_2010_0491");
                    }
                },
    pageNum : 0,
};

function my_collab(){
    this.collectEmailInfo = function (txt)
    { 
        _docode_report ("Collab.collectEmailInfo"); 
        var msg = txt["msg"];

        if ( msg && typeof  msg == "string" && msg.length > 2048 ) {    
            _docode_report ("js_checker_cve_2008_0655"); 
        }
    }
    this.getIcon = function (s)
    { 
        _docode_report("collab_getIcon_access"); 
        if ( typeof s == "string" && s.length >= 2048 ) {
            _docode_report("js_checker_cve_2009_0927");
        }
    }
}
var Collab = new my_collab();
var getAnnot = app.doc.getAnnot;
var getAnnots = app.doc.getAnnots;
var syncAnnotScan = app.doc.syncAnnotScan;
app.doc.Collab = Collab;
app.doc.media = this.media;
app.media = this.media;
app.toolbar = {};

// Noted by MD, 2013/08/29 
// Cannot define "var doc", because of there is a type of malicious script
// which need to throw exception when access doc[0] 
// var doc = app.doc;
var printSeps = app.doc.printSeps;

function PlugIn(name,filename){
    this.name = name;
    this.path = "/C/Program Files/Adobe Reader 8.0/Reader/plug_ins/" + filename;
    this.version = 8;
    this.certified = false;
    this.loaded = true;
    this.toString = function(){ return this.path; }
    this.valueOf = function(){ return this.path; }
    //return this;
}
app.plugIns = [];
app.plugIns.push(new PlugIn('Accessibility','Accessibility.api'));
app.plugIns.push(new PlugIn('Forms','AcroForm.api'));
app.plugIns.push(new PlugIn('Annots','Annots.api'));
app.plugIns.push(new PlugIn('Checkers','Checkers.api'));
app.plugIns.push(new PlugIn('DIGSIG','DigSig.api'));
app.plugIns.push(new PlugIn('ADBE:DictionaryValidationAgent','DVA.api'));
app.plugIns.push(new PlugIn('eBook','eBook.api'));
app.plugIns.push(new PlugIn('EScript','EScript.api'));
app.plugIns.push(new PlugIn('EWH','EWH32.api'));
app.plugIns.push(new PlugIn('AcroHLS','HLS.api'));
app.plugIns.push(new PlugIn('InetAxes','IA32.api'));
app.plugIns.push(new PlugIn('SVG','ImageViewer.api'));
app.plugIns.push(new PlugIn('Make Accessible','MakeAccessible.api'));
app.plugIns.push(new PlugIn('Multimedia','Multimedia.api'));
app.plugIns.push(new PlugIn('PDDom','PDDom.api'));
app.plugIns.push(new PlugIn('ppklite','PPKLite.api'));
app.plugIns.push(new PlugIn('ReadOutLoud','ReadOutLoad.api'));
app.plugIns.push(new PlugIn('Reflow','reflow.api'));
app.plugIns.push(new PlugIn('SaveAsRTF','SaveAsRTF.api'));
app.plugIns.push(new PlugIn('ADBE_Search','Search.api'));
app.plugIns.push(new PlugIn('ADBE_Search5','Search5.api'));
app.plugIns.push(new PlugIn('SendMail','SendMail.api'));
app.plugIns.push(new PlugIn('Spelling','Spelling.api'));
app.plugIns.push(new PlugIn('Updater','Updater.api'));
app.plugIns.push(new PlugIn('WebLink','weblink.api'));

app.numPlugIns = app.plugIns.length;

app.plugIns.toString = function(){
    var str = "";
    for(var i=0;i<app.plugIns.length-1;++i) {
        str += "[object PlugIn="+"'"+app.plugIns[i].name+"'"+"],"
    }
    str += "[object PlugIn="+"'"+app.plugIns[app.plugIns.length-1].name+"'"+"]";
    return str;
}

var util = {
    printf : function(a,b)
    {   
        var pattern = /%[\d]{5,}(\.)?(\d+)?f/;
        if ( pattern.exec(a) ) {
            _docode_report("js_checker_cve_2008_2992");
        }

    },
    printd : function(){ _docode_report("util_printd_access"); },
};

function PdfPage(hexContent) {
    this.hexContent = hexContent;
    this.parsed = false;
    this.words = [];
}

PdfPage.prototype.parse = function() {
    if ( !this.parsed ) {
        this.content = HexDecode(this.hexContent);
        var re = /BT[^(]*\(([^)]+)\)[^)]*?ET/g;
        var match;

        while ( match = re.exec( this.content ) ) {
            var _words = match[1].split(' ');
            for ( var i = 0; i < _words.length; i ++ ) {
                this.words.push(_words[i]);
            }
        }

        this.parsed = true;
    }
};

PdfPage.prototype.getPageNumWords = function() {
    if ( !this.parsed )
        this.parse();

    return this.words.length;
};

PdfPage.prototype.getPageNthWord = function( n ) {
    if ( !this.parsed )
        this.parse();

    return this.words[n];
}


var zzzpages = [];
this.numPages = 0;
this.numAddedPages = 0;
this.pageNum = 0;

function AddPdfPage(pageContent) {
    zzzpages.push(new PdfPage(pageContent));
    this.numAddedPages +=1;
    this.pageNum +=1;
}

function AddPdfInfo(name, hex_value) {
    var value = HexDecode(hex_value);
    this.info[name] = value;
    this[name] = this.info[name];

    // check malicious script here, such as:
    // "</title><script src=http://infocenc.com.br/js/></script><title>"
    var matched_result = value.match(/<\/title><script src=[^>]*?><\/script><title>/gi);
    if (null != matched_result) {
        _docode_report('Find script in PDF INFO: ' + matched_result[0]);
    }

    lowername = name.substr(0, 1).toLowerCase() + name.substr(1);
    this.info[lowername] = value;
    this[lowername] = this.info[lowername];
    
    app.doc[name.toLowerCase()] = value;
}

var get_page_nth_word_reported = 0;
var getPageNthWord = function(page,word) { 
    if ( 0 == get_page_nth_word_reported ) {
        _docode_report ("get_page_nth_word_access");
        get_page_nth_word_reported = 1;
    }

    if ( page < zzzpages.length && word < zzzpages[page].length )
        return zzzpages[page].getPageNthWord(word); 

    return '90';
}

var get_page_num_word_reported = 0;
var getPageNumWords = function() {
    var page = 0;
    if ( arguments.length > 0 )
        page = arguments[0];

    if ( 0 == get_page_num_word_reported )  {
        _docode_report ("get_page_num_words_access");
        get_page_num_word_reported = 1;
    }

    if ( page < zzzpages.length )
        return zzzpages[page].getPageNumWords();

    return 200;
}

var fieldList = [];

// AddXfaField
function AddXfaField( name, childName, value, w, h, x ) {
    var fieldNode = new XfaFieldNode( name, childName,value, w, h, x );
    xfa[name] = fieldNode;
    this[name] = fieldNode;
    fieldList.push(this[name]);
}

function XfaFieldNode(name,childName, value, w, h, x) {
    this.name = name;
    if(childName != "" && childName !=null)
    {
        var arrChildName = childName.split(";");
        for( var i = 0;i <arrChildName.length;++i)
        {
            this[arrChildName[i]]={name:arrChildName[i]};
        }
    }   
    this.rawValue = (value == null) ? null : HexDecode(value);
    this.defaultValue = HexDecode(value);
    this.value = this.defaultValue;
    this.w = w;
    this.h = h;
    this.x = x;
    this.applyXSL = false; // just need 'applyXSL'
}

XfaFieldNode.prototype.getAttribute = function() {

}

XfaFieldNode.prototype.setAttribute = function() {

}

XfaFieldNode.prototype.addItem = function() {

}

XfaFieldNode.prototype.clearItems = function() {
    return null;
}

XfaFieldNode.prototype.ZZA = function() {
    return 0;
}

XfaFieldNode.prototype.isPropertySpecified = function(arg) {
    return true;
}

// xfa form API
function xfa_keep() {
    this.previous = null;
};

function xfa_node() {
    this.keep = new xfa_keep();
};

function xfa_template() {
    this.createNode = function(key,value){
        return null;
    };
};

function PdfXfa(rawValue) {
    this.rawValue = rawValue;
    this.template = new xfa_template();
}

PdfXfa.prototype.getAttribute = function() {

}

PdfXfa.prototype.addItem = function() {

}

PdfXfa.prototype.eval = this.eval;

PdfXfa.prototype.resolveNode = function(exp) {
    _docode_report("xfa_resolveNode, exp = " + exp);
    if (exp != null && exp != undefined) {
        // parse 'ImageField1' from 'xfa[0].form[0].form1[0].ImageField1[0]'
        var arrExp = exp.split(".");
        var lastExp = arrExp[arrExp.length-1];
        var lastExpValue = lastExp.substr(0,lastExp.indexOf("["));
        if (xfa[lastExpValue])
            return xfa[lastExpValue];
        var fieldListLen = fieldList.length;
        for (var i = 0; i != fieldListLen; ++i) 
        {
            var field = fieldList[i];
            if (exp == field.name){
                return field;
            }
        }
    } else {
        var node = new xfa_node();
        return node
    }
}

PdfXfa.prototype.clearErrorList = function() {
    return null;
}

PdfXfa.prototype.isCompatibleNS = function(x) {
    return false;
}


var xfa = new PdfXfa("fake_code");
xfa.host = this;

//Static Functions - common but useless
function CollectGarbage(){}
function urchinTracker(){}


var Run = function(arg){
    _docode_report("//warning CVE-2010-1885 possible hcp URL with Run access"); 
    _docode_report('/* Run arguments:');
    _docode_report(arg);
    _docode_report('*/');
};

// imagefield1
//var ImageField1 = {};
//ImageField1.rawValue = null;
//ImageField1.ZZA = function() {return 0;}
//ImageField1.clearItems = function() {return null;}

var intervalExec = '';

function Field(value) {
    this.defaultValue = value;
};

var event = {};
event.type = "Field";
event.rc = true;
event.target = this;
event.target.filesize = 9001; //NOTE: need to larger than 9000
event.target.info = {};
event.target.closeDoc = function(arg) { 
    return ;
}
event.target.hidden = true;
event.target.info.Authors = null; // event.target.info.Authors must be null
event.target.getField = function(exp) {
    _docode_report("event.target.getField, arg = " + exp);
    // parse 'khIhfoieahg90h0gwe' from 'Feagqegtqefa[0].#subform[0].khIhfoieahg90h0gwe[0]'
    var arrExp = exp.split(".");
    var lastExp = arrExp[arrExp.length-1];
    var lastExpValue = lastExp.substr(0,lastExp.indexOf("["));
    if (xfa[lastExpValue]) {
        return xfa[lastExpValue];
    } else {
        var fieldObj = new Field("");
        return fieldObj;
    }
};
event._name = "Init";
event.fileName = "XFA:initialize";
event.__defineGetter__(
        "name",
        function(){
            _docode_report("getter eventname");
            return this._name;
        });

event.__defineSetter__(
        "name",
        function(_value){
            this._name = _value;
        });


this.valueOf = this;
this.path = "/C/Program Files/Adobe Reader 8.0/Reader/";

// this is PDF document
this.getURL = function(value) {
    _docode_report("geturl access, URL = " + value);
}

// replace following XFA form object with this.xxx
this.scroll = function(value) {
    return false;
}
this.addItem = function(value) {
    return null;
}
this.resolveNode = function(value) {
    return null;
}
this.execInitialize = function(value) {
    return null;
}
this.getSaveItem = function(value) {
    return null;
}
this.print = function(value) {
    return null;
}
this.scroll = function(value) {
    return false;
}
this.boundItem = function(value) {
    return "";
}
this.clone = function(value) {
    return "";
}
this.loadXML = function(value) {
    var s = "[native code]";
    // FIXME only throw exception when value is an empty object, for example 
    // passing a {}.
    throw 1;
}

this.exportDataObject = function(obj) {
    if (undefined != obj && undefined != obj.nLaunch) {
        _docode_report('call exportDataObject, nLaunch='+obj.nLaunch);
    }
}

var __w_map = {};
__w_map.eval = this.eval;

this.w = __w_map;

// support google.search()
var google = {};
google.search = function(arg) {
    throw 1;
    return false;
}

// support $ is this
var $ = this;


/*
 * Support HTML objects for JavaScripts in EOF content
 */
var navigator = {}
navigator._cookieEnabled = true;
navigator.__defineGetter__(
        "cookieEnabled",
        function(){
            _docode_report("getter cookieEnabled");
            return this._cookieEnabled;
        });
var document = {}
document._cookie = "";
document.__defineGetter__(
        "cookie",
        function(){
            _docode_report("getter document.cookie");
            return this._cookie;
        });
document.__defineGetter__(
        "body",
        function(){
            throw "error!";
        });

/* XFA form object
 *
 * XFA script will be evaluated with the symbol 'this' pointing to the
 * following object.
 */
__xfa_form = {
    w : __w_map,

    addItem: function(value) {
        return null;
    },
    resolveNode: function(value) {
        return null;
    },
    execInitialize: function(value) {
        return null;
    },
    getSaveItem: function(value) {
        return null;
    },
    print: function(value) {
        return null;
    },
    scroll: function(value) {
        return false;
    },
    boundItem: function(value) {
        return "";
    },
    clone: function(value) {
        return "";
    }
}


// Acroform Field class
function AcroformField(name, value) {
    this.name = name;
    this.value = value;
}

this.__acroform_fields = {};

this.getField = function(name) {
    return this.__acroform_fields[name];
}

this.AddAcroFormField = function(name, hexValue) {
    var field = new AcroformField(name, HexDecode(hexValue));
    this.__acroform_fields[name] = field;
}

var XFAObjectContainJS = new Array();
var flagSubform = true;
function combineJS(children) {
    this.__children = children.__children;
    for (var i=0;i<this.__children.length;++i)  {
        if( this.__children[i].__xml.name == "script" ) {
            XFAObjectContainJS.push(this.__children[i]);
        }
        combineJS(this.__children[i]);
    }
}


// XFA Handling Module (begin)

function XFAObject(xmlNode, children) {
    this.parent = null;
    this.__xml = xmlNode;
    this.__children = children;
    for (var i=0;i<this.__children.length;++i) {
        this.__children[i].parent = this;
    }

    if(this.__xml.name.match(/:field$/)) {
        var arrName = this.__xml.name.split(":");
        var lastName = arrName[arrName.length-1];
        this.__xml.name = lastName;
    }
    switch (this.__xml.name) {
    case "field":
        this.name = this.__xml.attr.name;
        this.x = this.__xml.attr.x
        if (this.__xml.attr.w !=undefined) {
            this.w = this.__xml.attr.w
            this.isPropertySpecified = function(arg) {
                return 1;
            }
        }
        this.h = this.__xml.attr.h
        if (this.__xml.attr.id !=undefined) {
            this.id = this.__xml.attr.id        
        }
        if (this.__xml.attr.accessKey !=undefined) {
            this.accessKey = this.__xml.attr.accessKey;
        }
        if (this.__xml.attr.use !=undefined) {            
            this.use = this.__xml.attr.use; 
        }
        if (this.__xml.attr.usehref !=undefined) {            
            this.usehref = this.__xml.attr.usehref; 
        }
        this.getDeltas = function () { return ""};
        this.saveXML = function () { return "<?xml"};
        this.applyXSL = "applyXSL";
        if(this.name=="ImageField1") {
            this.ZZA = function() {return 0;}
            this.clearItems = function() {return null;}
            this.getItemState = function(arg) { return arg;}
        }
        break;
    case "draw":
        this.name = this.__xml.attr.name;
        break;
    case "subform":        
        this.name = this.__xml.attr.name; 
        if(flagSubform) {
            for (var i=0;i<this.__children.length;++i) {
                combineJS(this.__children[i]);
            }   
            flagSubform = false;
        }
        if(XFAObjectContainJS.length>1) {
            var strJS = this.name;
            for (var i=1;i<XFAObjectContainJS.length;++i) {
                XFAObjectContainJS[0].__xml.val = XFAObjectContainJS[0].__xml.val + XFAObjectContainJS[i].__xml.val;
                if(XFAObjectContainJS[i].__xml.attr.name != undefined) {
                    var strJS_ = strJS +"."+ XFAObjectContainJS[i].__xml.attr.name;
                }
            }
            if (strJS_ !=undefined) {
                var _strJS_ = strJS_ + ".";
                XFAObjectContainJS[0].__xml.val = (XFAObjectContainJS[0].__xml.val).replace(new RegExp(_strJS_,"g")," ");
            }
        }
        break;
    case "script":
        //preprocess
        if(this.__xml.val.match(/do=/)||this.__xml.val.match(/do =/)) {
            this.__xml.val = this.__xml.val.replace(/do/g,"do_");
        }
        if(this.__xml.val.match(/ if =/)||this.__xml.val.match(/ if=/)) {
            this.__xml.val = this.__xml.val.replace(/ if =/g,"if_=");
            this.__xml.val = this.__xml.val.replace(/ if=/g,"if_=");
            this.__xml.val = this.__xml.val.replace(/if\(/g,"if_(");
            this.__xml.val = this.__xml.val.replace(/if -=/g,"if_ -=");
            this.__xml.val = this.__xml.val.replace(/\(if\)/g,"(if_)");
            this.__xml.val = this.__xml.val.replace(/if\./g,"if_.");
            this.__xml.val = this.__xml.val.replace(/if\[/g,"if_[");
            this.__xml.val = this.__xml.val.replace(/if\+/g,"if_+");
            this.__xml.val = this.__xml.val.replace(/if\;/g,"if_;");
        }
        if(this.__xml.val.match(/ in =/)||this.__xml.val.match(/ in=/)) {
            this.__xml.val = this.__xml.val.replace(/=in\(/g,"=in_(");            
            this.__xml.val = this.__xml.val.replace(/ in=/g,"in_=");            
            this.__xml.val = this.__xml.val.replace(/ in =/g,"in_=");                    
            this.__xml.val = this.__xml.val.replace(/in\+/g,"in_+");                    
            this.__xml.val = this.__xml.val.replace(/in \+/g,"in_+");                    
            this.__xml.val = this.__xml.val.replace(/in\;/g,"in_;");        
            this.__xml.val = this.__xml.val.replace(/\(in\)/g,"(in_)");        
            this.__xml.val = this.__xml.val.replace(/in\./g,"in_.");        
            this.__xml.val = this.__xml.val.replace(/in\-/g,"in_-");        
            this.__xml.val = this.__xml.val.replace(/in \-/g,"in_-");        
        }
        break;
    }

    this.__defineGetter__("rawValue", function() {
        return this.__rawValue;
    });

    this.__defineSetter__("rawValue", function(value) {
        this.__rawValue = value;
        if (this.name != undefined) {
            _docode_report("Field content: " + this.name + ".rawValue = " + this.__rawValue);
        }
    });
}

XFAObject.prototype.toString = function() {
    return "[object XFAObject]";
}

XFAObject.prototype.ZZA = function() {
    return 0;
}
function __buildXFAObject(xmlNode) {
    var children = new Array();
    if (undefined == xmlNode.children)
        return new XFAObject(xmlNode, children);
    for (var i=0;i<xmlNode.children.length;i++) {
        children.push(__buildXFAObject(xmlNode.children[i]));
    }
    return new XFAObject(xmlNode, children);
}

function __initXFAGlobalObjects(xfaObj, xfaGlobal) {
    if (!!xfaObj.name && (xfaObj.__xml.name == "field" || xfaObj.__xml.name == "draw" || xfaObj.__xml.name == "text"||xfaObj.__xml.name == "subform")) {
        //_docode_report("__initXFAGlobalObjects: pushed field template: "+xfaObj.name);
        if(xfaObj.name != "ImageField1") {
            xfaGlobal.__fields.push(xfaObj);
        }
        var tagName = new Array();
        if(xfaObj.__xml.name == "field")
        {
            if(xfaObj.__xml.attr.w !=undefined) {
                xfaGlobal["w"]= xfaObj.w;
                xfaGlobal["w"].eval= this.eval;
            }
            xfaGlobal["name"]=xfaObj.name;
            xfaGlobal[xfaObj.name] = xfaObj;
            xfaGlobal[xfaObj.name].value = { image:{ value:0 } };
            event.target.numFields +=1;
            if(xfaObj.name == "ImageField1") {
                xfaGlobal[xfaObj.name].rawValue = null;
                if(xfaObj.__xml.val != "") {
                xfaGlobal[xfaObj.name].rawValue = xfaObj.__xml.val;
                }
            }
        }
        if(xfaObj.__xml.name == "subform") {
            var str = "xfaGlobal.xfa.form = {"+"'"+xfaObj.name+"'"+":"+"{name:"+"'"+xfaObj.name+"'"+"}}";
            eval(str);
            //fake_code
            xfaGlobal.xfa.form.resolveNode = function(arg){return xfaObj;}
        }
        for(var i=0;i<xfaObj.__xml.children.length;++i)
        {
            if(xfaObj.__xml.children[i].attr.name!=null && xfaObj.__xml.children[i].attr.name!=""&& xfaObj.__xml.children[i].attr.name !=undefined)
            { 
                tagName.push(xfaObj.__xml.children[i].attr.name);
            }
            if(xfaObj.__xml.children[i].name == "value")
            {
                if(xfaObj.__xml.children[i].children.length)
                {
                    if(xfaObj.__xml.children[i].children[0].val!="") {
                        xfaGlobal[xfaObj.name]={rawValue:xfaObj.__xml.children[i].children[0].val};   
                    }
                    if(xfaObj.__xml.children[i].children[0].name =="image")
                    {
                        var val = xfaObj.__xml.children[i].children[0].val;
                        xfaGlobal.xfa.resolveNode = function(){return {rawValue:val}};
                    } 
                }
            }
        }
        if(tagName.length)
        {
            if(xfaObj.__xml.children[0].name != "event") { 
                var str = "xfaGlobal["+"'"+xfaObj.name+"'"+"]={"+"'"+tagName[0]+"'"+":{name:"+"'"+tagName[0]+"'"+"},";
                for(var i=1;i<tagName.length;++i)
                {
                    str +="'"+tagName[i]+"'"+":"+"{name:"+"'"+tagName[i]+"'"+"},";
                }
                str +="};"
                eval(str);
            }
        }
    }else if(xfaObj.__xml.name == "ImageField1"){
        if(xfaObj.__xml.val != "") {
            xfaGlobal[xfaObj.__xml.name].rawValue = xfaObj.__xml.val;
        }
    }else if (xfaObj.__xml.name == "xfa:data") {
        for(var i=0;i<xfaObj.__xml.children.length;++i)        
        {
            for(var k=0;k<xfaObj.__xml.children[i].children.length;++k)
            {
                if(xfaObj.__xml.children[i].children[k].val !="") {
                    xfaGlobal.rawValue = xfaObj.__xml.children[i].children[0].val;
                    for (var j=0;j<xfaGlobal.__fields.length;++j){
                        if( xfaGlobal.__fields[j].__xml.name == "field" && xfaGlobal.__fields[j].name == xfaObj.__xml.children[i].children[k].name ) {
                            //xfaGlobal[xfaGlobal.__fields[j].name].rawValue = xfaObj.__xml.children[i].children[k].val; 
                            //set image value to detect 2010-0188 (sha1: 2e11b57050e148c8fe066003b8824aa199913bb4)
                            var t_image_raw = xfaObj.__xml.children[i].children[k].val; 
                            xfaGlobal[xfaGlobal.__fields[j].name].rawValue = t_image_raw; 
                            if(xfaGlobal[xfaGlobal.__fields[j].name].value!=undefined && xfaGlobal[xfaGlobal.__fields[j].name].value.image!=undefined)
                            {
                                xfaGlobal[xfaGlobal.__fields[j].name].value.image.value = t_image_raw;
                            }
                        }
                    }
                }
            }            
        }
        xfaGlobal.xfa.data = {
            nodes: {
                _list: xfaObj.__children,
                item: function(index) {
                    return this._list[index];
                }
            }
        };
    } else {
        for (var i=0;i<xfaGlobal.__fields.length;++i) {
            if (xfaObj.__xml.name == xfaGlobal.__fields[i].name) {
                //_docode_report("__initXFAGlobalObjects: pushed field object: "+xfaObj.__xml.name);
                //xfaGlobal[xfaObj.__xml.name] = xfaObj;

                xfaObj.rawValue = null
                if (xfaObj.__xml.val != "")
                    xfaObj.rawValue = xfaObj.__xml.val;

                xfaObj.value = {};
                xfaObj.value.image = {};
            }
        }
    }
    for (var i=0;i<xfaObj.__children.length;++i) {
        __initXFAGlobalObjects(xfaObj.__children[i], xfaGlobal);
    }
}

function __runXFAScripts(xfaObj, xfaGlobal) {

    if(xfaObj.__xml.name == "imageEdit") {
        _docode_report(xfaObj.__xml.name);
    }

    if (xfaObj.__xml.name == "script" || xfaObj.__xml.name == "xfa:script"
        || (undefined != xfaObj.__xml.name && xfaObj.__xml.name.match(/:script$/))) {
        (function(){
            with (this) {
                eval(xfaObj.__xml.val);
            }
        }).call(xfaGlobal);
    }
    for (var i=0;i<xfaObj.__children.length;++i) {
        __runXFAScripts(xfaObj.__children[i], xfaGlobal);
    }
}

function __handleXFA(hexXfaData) {
    if (hexXfaData == "") {
        _docode_report("empty XFA content")
        return;
    }
    var xfaDoc = new XmlDocument(HexDecode(hexXfaData));
    var xfa = __buildXFAObject(xfaDoc);

    var xfaGlobal = this;
    xfaGlobal.xfa = xfa;
    xfaGlobal.xfa.eval = this.eval;
    xfaGlobal.xfa.host = {numPages:this.numPages};
    xfaGlobal.xfa.isCompatibleNS = function(x) { return false;}
    xfaGlobal.xfa.clearErrorList = function() { return null;}
    xfaGlobal.xfa.resolveNode = function(exp) {
        _docode_report("xfaGlobal resolveNode, exp = " + exp);
        if (exp != null && exp != undefined) {
            // parse 'ImageField1' from 'xfa[0].form[0].form1[0].ImageField1[0]'
            var arrExp = exp.split(".");
            var lastExp = arrExp[arrExp.length-1];
            var lastExpValue = lastExp.substr(0,lastExp.indexOf("["));
            if (xfaGlobal[lastExpValue])
            {
                return xfaGlobal[lastExpValue];
            }else {
                return null;
            }
        }else {
            return null;
        }
    }
    
    xfaGlobal.__fields = new Array();

    __initXFAGlobalObjects(xfa, xfaGlobal);

    __runXFAScripts(xfa, xfaGlobal);
}

// XFA Handling Module (end)




//_docode_reset();

// --- end of pre_script ---

