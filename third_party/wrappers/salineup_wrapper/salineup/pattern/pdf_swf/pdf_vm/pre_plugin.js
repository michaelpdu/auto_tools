function Plugin(name, fname, desc) {
	this.name = name;
	this.filename = fname;
	this.description = desc;
}
var PluginArray = function _PluginArray() {
	this.toString = function() {
		return '';
	};

};
PluginArray.prototype = new Array;
var my_plugins = new PluginArray();
my_plugins.push(new Plugin('getPlusPlus for Adobe 16263', 'np_gp.dll', 'getplusplusadobe16263'));
my_plugins.push(new Plugin('Google Talk Plugin', 'npgoogletalk.dll', 'Version 1,0,21,0'));
my_plugins.push(new Plugin('Adobe Acrobat', 'nppdf32.dll', 'Adobe PDF Plug-In For Firefox and Netscape'));
my_plugins.push(new Plugin('Mozilla Default Plug-in', 'npnul32.dll', 'Default Plug-in'));
my_plugins.push(new Plugin('Microsoft Office 2003', 'NPOFFICE.DLL', 'Office Plugin for Netscape Navigator'));
my_plugins.push(new Plugin('Google Update', 'npGoogleOneClick8.dll', 'Google Update'));
my_plugins.push(new Plugin('Shockwave Flash', 'NPSWF32.dll', 'Shockwave Flash 10.0 r32'));
my_plugins.push(new Plugin('Silverlight Plug-In', 'npctrl.dll', '3.0.50106.0'));
my_plugins.push(new Plugin('Microsoft Office Live Plug-in for Firefox', 'npOLW.dll', 'Office Live Update v1.4'));
my_plugins.push(new Plugin('Java Deployment Toolkit 6.0.140.8', 'npdeploytk.dll', 'NPRuntime Script Plug-in Library for Java(TM) Deploy'));
my_plugins.push(new Plugin('Java(TM) Platform SE 6 U14', 'npjp2.dll', 'Next Generation Java Plug-in 1.6.0_14 for Mozilla browsers'));