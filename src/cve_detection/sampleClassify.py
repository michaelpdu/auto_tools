import os 
import shutil    

def createFirefoxDir(output_dir):
	os.mkdir(output_dir+"/firefox")
	os.mkdir(output_dir+"/firefox/base64_1")
	os.mkdir(output_dir+"/firefox/base64_2")
	os.mkdir(output_dir+"/firefox/base64_plain")
	os.mkdir(output_dir+"/firefox/base64_random")
	os.mkdir(output_dir+"/firefox/js")
	os.mkdir(output_dir+"/firefox/raw")
	os.mkdir(output_dir+"/firefox/utf_16be")
	os.mkdir(output_dir+"/firefox/utf_16le")
	os.mkdir(output_dir+"/firefox/utf_32be")
	os.mkdir(output_dir+"/firefox/utf_32le")

def createIEDir(output_dir):
	os.mkdir(output_dir+"/ie")
	os.mkdir(output_dir+"/ie/js")
	os.mkdir(output_dir+"/ie/raw")
	os.mkdir(output_dir+"/ie/utf_16be")
	os.mkdir(output_dir+"/ie/utf_16le")
	os.mkdir(output_dir+"/ie/utf_32be")
	os.mkdir(output_dir+"/ie/utf_32le")

def createActivexDir(output_dir):
	os.mkdir(output_dir+"/activex")
	os.mkdir(output_dir+"/activex/js")
	os.mkdir(output_dir+"/activex/raw")
	
def initDirectory(output_dir):
	if not os.path.exists(output_dir):
		os.makedirs(output_dir)
	else:
		shutil.rmtree(output_dir)
		os.makedirs(output_dir)
	
def moveFirfoxSample(ffdir):
	for f in os.listdir(ffdir):
		fdir = os.path.join(ffdir,f)
		for fi in os.listdir(fdir):
			if(fi[-3:]=="saz"):
				continue
			file = os.path.join(fdir,fi)
			if(os.path.isfile(file)):
				index = fi.find("base64-single")
				if(index>0):
					wdir = output_dir+"/firefox/base64_1/"+f
				else:
					index = fi.find("base64-dou")
					if(index>0):
						wdir = output_dir+"/firefox/base64_2/"+f 
					else:
						index = fi.find("base64-plain")
						if(index>0):
							wdir = output_dir+"/firefox/base64_plain/"+f
						else:
							index = fi.find("base64-random")
							if(index>0):
								wdir = output_dir+"/firefox/base64_random/"+f
							else:
								index = fi.find("escape")
								if(index>0):
									wdir = output_dir+"/firefox/js/"+f
								else:
									index = fi.find("utf-16le")
									if(index>0):
										wdir = output_dir+"/firefox/utf_16le/"+f
									else:
										index = fi.find("utf-16be")
										if(index>0):
											wdir = output_dir+"/firefox/utf_16be/"+f
										else:
											index = fi.find("utf-32le")
											if(index>0):
												wdir = output_dir+"/firefox/utf_32le/"+f
											else:
												index = fi.find("utf-32be")
												if(index>0):
													wdir = output_dir+"/firefox/utf_32be/"+f
												else:
													wdir = output_dir+"/firefox/raw/"+f
				if(os.path.exists(wdir)==False):
					os.mkdir(wdir)
				shutil.copyfile(file,wdir+"/"+fi) 
									
def moveIESample(iedir):
	for f in os.listdir(iedir):
		fdir = os.path.join(iedir,f)
		for fi in os.listdir(fdir):
			if(fi[-3:]=="saz"):
				continue
			file = os.path.join(fdir,fi)
			if(os.path.isfile(file)):
				index = fi.find("escape")
				if(index>0):
					wdir = output_dir+"/ie/js/"+f
				else:
					index = fi.find("utf-16le")
					if(index>0):
						wdir = output_dir+"/ie/utf_16le/"+f
					else:
						index = fi.find("utf-16be")
						if(index>0):
							wdir = output_dir+"/ie/utf_16be/"+f
						else:
							index = fi.find("utf-32le")
							if(index>0):
								wdir = output_dir+"/ie/utf_32le/"+f
							else:
								index = fi.find("utf-32be")
								if(index>0):
									wdir = output_dir+"/ie/utf_32be/"+f
								else:
									wdir = output_dir+"/ie/raw/"+f
				if(os.path.exists(wdir)==False):
					os.mkdir(wdir)
				shutil.copyfile(file,wdir+"/"+fi)
									
def moveActivexSample(activexdir):
	for f in os.listdir(activexdir):
		fdir = os.path.join(activexdir,f)
		for fi in os.listdir(fdir):
			if(fi[-3:]=="saz"):
				continue
			file = os.path.join(fdir,fi)
			if(os.path.isfile(file)):
				index = fi.find("escape")
				if(index>0):
					wdir = output_dir+"/activex/js/"+f
				else:
					wdir = output_dir+"/activex/raw/"+f
				if(os.path.exists(wdir)==False):
					os.mkdir(wdir)
				shutil.copyfile(file,wdir+"/"+fi)

def start(input_firefox_dir,input_ie_dir,input_activex_dir,output_dir):
	initDirectory(output_dir)
	createFirefoxDir(output_dir)
	moveFirfoxSample(input_firefox_dir)
	createIEDir(output_dir)
	moveIESample(input_ie_dir)
	createActivexDir(output_dir)
	moveActivexSample(input_activex_dir)
	
	
if __name__ == '__main__':
	input_firefox_dir = "/home/SAL_CVE/sample/msf_html_obfuscation/ff"
	input_ie_dir = "/home/SAL_CVE/sample/msf_html_obfuscation/ie"
	input_activex_dir = "/home/SAL_CVE/sample/msf_activex_samples/"
	output_dir = "/home/SAL_CVE/sample/sample/"
	start(input_firefox_dir,input_ie_dir,input_activex_dir,output_dir)
	print "ok......"





										
