config {
	set tmsa.decision_engine.pdf_use_yara 0
	set tmsa.decision_engine.swf_use_yara 1
	set tmsa.decision_engine.java_use_yara 0
	set tmsa.decision_engine.html_js_use_yara 1
}

html_rule {
	set JS.HeapSpray.A weight 0
	set JS.CVE-2013-2551.B weight 0
}

html_yara_rule {
	set JS.CVE-2013-2551.B confidence monitor
	set JS.HeapSpray.A confidence monitor
} 

pdf_rule {
	set exploit.cve-2009-4324.B weight 20
}

pdf_yara_rule {
	set PDF.CVE-2009-4324.B confidence monitor
	set PDF.CVE-2009-4324.B fbrate 0
}

swf_rule {
	//set swf_rule_01 property_1 1
}

swf_yara_rule {
	set PDF.CVE-2009-4324.B confidence heu_high
}

java_static_rule {
	set cve-2009-3867.4 weight 0
	set cve-2009-3867.4 feedback 0
	set cve-2009-3867.4 capture 0
}

java_dynamic_rule {
	set JAVA.CVE-2013-2471.A weight 0
}

java_yara_rule {
	set JAVA.Static.CVE-2009-3867.D confidence monitor
	set JAVA.Static.CVE-2009-3867.D fbrate 0
}