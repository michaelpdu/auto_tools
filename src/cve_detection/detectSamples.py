import os

def cmdFirefox(samplerootpath,salineupdir,resultpath):
	firefox_sample = samplerootpath + "/firefox/"
	firefox_result = resultpath + "/firefox/"
	if(os.path.exists(firefox_result)==False):
		os.makedirs(firefox_result)
	# firefox sample
	firefox_base64_1 = firefox_sample + "base64_1/"
	firefox_base64_2 = firefox_sample + "base64_2/"
	firefox_base64_plain = firefox_sample + "base64_plain/"
	firefox_base64_random = firefox_sample + "base64_random/"
	firefox_js = firefox_sample + "js/"
	firefox_raw = firefox_sample + "raw/"
	firefox_utf_16be = firefox_sample + "utf_16be/"
	firefox_utf_16le = firefox_sample + "utf_16le/"
	firefox_utf_32be = firefox_sample + "utf_32be/"
	firefox_utf_32le = firefox_sample + "utf_32le/"
	
	# firefox cmd
	firefox_base64_1_cmd = " sh ./SALineup.sh "+ firefox_base64_1 +" > " + firefox_result +"firefox_base64_1.txt  && "
	firefox_base64_2_cmd = " sh ./SALineup.sh  "+ firefox_base64_2 +" > " + firefox_result +"firefox_base64_2.txt  && "
	firefox_base64_plain_cmd = " sh ./SALineup.sh  "+ firefox_base64_plain +" > " + firefox_result +"firefox_base64_plain.txt  && "
	firefox_base64_random_cmd = " sh ./SALineup.sh  "+ firefox_base64_random +" > " + firefox_result +"firefox_base64_random.txt  && "
	firefox_js_cmd = " sh ./SALineup.sh  "+ firefox_js +" > " + firefox_result +"firefox_js.txt  && "
	firefox_raw_cmd = " sh ./SALineup.sh  "+ firefox_raw +" > " + firefox_result +"firefox_raw.txt  && "
	firefox_utf_16be_cmd = " sh ./SALineup.sh  "+ firefox_utf_16be +" > " + firefox_result +"firefox_utf_16be.txt  && "
	firefox_utf_16le_cmd = " sh ./SALineup.sh  "+ firefox_utf_16le +" > " + firefox_result +"firefox_utf_16le.txt  && "
	firefox_utf_32be_cmd = " sh ./SALineup.sh  "+ firefox_utf_32be +" > " + firefox_result +"firefox_utf_32be.txt  && "
	firefox_utf_32le_cmd = " sh ./SALineup.sh  "+ firefox_utf_32le +" > " + firefox_result +"firefox_utf_32le.txt "
	
	firefox_cmd1 = firefox_base64_1_cmd + firefox_base64_2_cmd + firefox_base64_plain_cmd + firefox_base64_random_cmd + firefox_js_cmd
	firefox_cmd2 = firefox_raw_cmd + firefox_utf_16be_cmd + firefox_utf_16le_cmd + firefox_utf_32be_cmd + firefox_utf_32le_cmd
	return firefox_cmd1+firefox_cmd2

def cmdIE(samplerootpath,salineupdir,resultpath):
	ie_sample = samplerootpath + "/ie/"
	ie_result = resultpath + "/ie/"
	if(os.path.exists(ie_result)==False):
		os.makedirs(ie_result)
	# ie sample
	ie_js = ie_sample + "js/"
	ie_raw = ie_sample + "raw/"
	ie_utf_16be = ie_sample + "utf_16be/"
	ie_utf_16le = ie_sample + "utf_16le/"
	ie_utf_32be = ie_sample + "utf_32be/"
	ie_utf_32le = ie_sample + "utf_32le/"

	#ie cmd
	ie_js_cmd = " sh ./SALineup.sh  "+ ie_js +" > " + ie_result +"ie_js.txt  && "
	ie_raw_cmd = " sh ./SALineup.sh  "+ ie_raw +" > " + ie_result +"ie_raw.txt  && "
	ie_utf_16be_cmd = " sh ./SALineup.sh  "+ ie_utf_16be +" > " + ie_result +"ie_utf_16be.txt  && "
	ie_utf_16le_cmd = " sh ./SALineup.sh  "+ ie_utf_16le +" > " + ie_result +"ie_utf_16le.txt  && "
	ie_utf_32be_cmd = " sh ./SALineup.sh  "+ ie_utf_32be +" > " + ie_result +"ie_utf_32be.txt  && "
	ie_utf_32le_cmd = " sh ./SALineup.sh  "+ ie_utf_32le +" > " + ie_result +"ie_utf_32le.txt "	
	ie_cmd = ie_js_cmd + ie_raw_cmd + ie_utf_16be_cmd + ie_utf_16le_cmd + ie_utf_32be_cmd + ie_utf_32le_cmd
	return ie_cmd

def cmdActivex(samplerootpath,salineupdir,resultpath):
	sample = samplerootpath + "/activex/"
	result = resultpath + "/activex/"
	if(os.path.exists(result)==False):
		os.makedirs(result)
	# activex sample
	js = sample + "js/"
	raw = sample + "raw/"
	#activex cmd
	js_cmd = " sh ./SALineup.sh  "+ js +" > " + result +"activex_js.txt  && "
	raw_cmd = " sh ./SALineup.sh  "+ raw +" > " + result +"activex_raw.txt "
	cmd = js_cmd + raw_cmd
	return cmd
	
def detectSamples(workpath,samplerootpath,salineupdir,version,ie_sign,firefox_sign,activex_sign):#detect ie if ie_sign == True, detect firefox if firefox_sign == True ,detect activex if activex_sign == True
	resultpath = workpath + "/result/"+version
	#start to detect samples( ie | firefox  | activex )
	cmd0 = "cd "+ salineupdir
	cmd = cmd0 
	if ie_sign==True:
		cmd = cmd + "  &&  "+ cmdIE(samplerootpath,salineupdir,resultpath)
	if firefox_sign==True:
		cmd = cmd + "  &&  "+ cmdFirefox(samplerootpath,salineupdir,resultpath)
	if activex_sign==True:
		cmd = cmd + "  &&  "+ cmdActivex(samplerootpath,salineupdir,resultpath)	
	print("Start to run SALineup...")
	os.system(cmd)
