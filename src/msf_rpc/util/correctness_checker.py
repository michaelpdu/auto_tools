#!/usr/bin/env python
import os
import re
import init_cfg
class CorrectnessChecker:
	"""
	Description for CorrectnessChecker
	"""

	def __init__(self):
		pass
	
	def matchByActivexMatchPattern(self,rawfile_str):
		if(rawfile_str.find('classid=\'clsid:')>=0):
			return True
		elif(rawfile_str.find('classid="clsid:')>=0):
			return True
		elif(rawfile_str.find('CLASSID="CLSID:')>=0):
			return True
		elif(rawfile_str.find('CLASSID="clsid:')>=0):
			return True
		elif(rawfile_str.find('classid="CLSID:')>=0):
			return True
		return False
		
	def matchByMatch_Pattern_cfg(self,module_name,rawfile_str):

		regex = init_cfg.getModulePattern(module_name)
		if(regex!=False):
			if re.search(regex,rawfile_str):
				return True
		return False
	
	def checkCorrectness(self,module_name,input_raw_file):
		if(os.path.exists(input_raw_file)==False) or (os.path.exists(input_raw_file)==False):
			return False
		file = open(input_raw_file,'rb')
		rawfile_str = file.read()
		file.close()
		#if(self.matchByActivexMatchPattern(rawfile_str)==False):
		if(self.matchByMatch_Pattern_cfg(module_name,rawfile_str)==False):
			return False
		return True
	
	
	
if __name__ == '__main__':
	logfile = open("log_checker.log",'w')
	corr = CorrectnessChecker()
	input_dir = r'C:\msf_browser_samples_man\msf_html_obfuscation\ie'
	#input_dir = r'C:\msf_browser_samples_man\msf_html_obfuscation\ff'
	#input_dir = r'C:\msf_browser_samples_man\msf_activex_samples'
	print 'start ...'
	for root, dirs, files in os.walk(input_dir):
		for dir in dirs:
			for root1, dirs1, files1 in os.walk(os.path.join(root,dir)): 
				for f in files1:
					if(f[-3:]!='saz'):
						if(f.find('.')==len(dir)):
							file = os.path.join(root1,f)
							result = corr.checkCorrectness(dir,file)
							if(result==True):
								logfile.write('\n'+f+': content is right')
							else:
								logfile.write('\n'+f+': content is wrong')
	logfile.close()
	print 'the end...'