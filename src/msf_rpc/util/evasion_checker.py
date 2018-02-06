#!/usr/bin/env python
import os
import logging
class EvasionChecker:
	"""
	Description for EvasionChecker
	"""

	EVASION_NOT_FIND 			= 1
	EVASION_JS_ESCAPE 			= 2
	EVASION_BASE64_PLAIN 		= 3
	EVASION_BASE64_SINGLE_PAD 	= 4
	EVASION_BASE64_DOUBLE_PAD 	= 5
	EVASION_BASE64_RANDOM 		= 6
	EVASION_UTF16_LE 			= 7
	EVASION_UTF16_BE 			= 8
	EVASION_UTF32_LE 			= 9
	EVASION_UTF32_BE 			= 10

	def __init__(self):
		self.content = ''
		pass
	def getBase64_Num(self,ch):#get dec number from base64 encoding table, you can get it from https://zh.wikipedia.org/wiki/Base64
		ch_A = 0
		ch_a = 26
		ch_0 = 52
		if(cmp(ch,'A')>=0 and cmp(ch,'Z')<=0):
			return ch_A + ord(ch) - ord('A')
		elif(cmp(ch,'a')>=0 and cmp(ch,'z')<=0):
			return ch_a + ord(ch) - ord('a')
		elif(cmp(ch,'0')>=0 and cmp(ch,'9')<=0):
			return ch_0 + ord(ch) - ord('0')
		elif(cmp(ch,'+')==0):
			return 62
		elif(cmp(ch,'/')==0):
			return 63
		return -1
	
	def decodeBase64(self,input_str,start_index,end_index):
		destr = ''
		for i in range(start_index,end_index,4):
			numlist = []
			for j in range(0,4):
				numlist.append(self.getBase64_Num(input_str[i+j]))
				if(numlist[j]<0):
					return destr
			num = (numlist[0]<<26) + (numlist[1]<<20) + (numlist[2]<<14) + (numlist[3]<<8)
			num = (num>>8)
			temp = num
			num_3 = temp - ((num>>8)<<8)
			num = (num>>8)
			temp = num
			num_2 = temp - ((num>>8)<<8)
			num_1 = (num>>8)
			destr = destr + chr(num_1) + chr(num_2) + chr(num_3)
		return destr
	
	def decodeBase64_plain(self,input_str): 
		length = len(input_str)
		if length%4 != 0:
			input_str = input_str[0:length - length%4]
		length = len(input_str)
		return self.decodeBase64(input_str,0,length)
			
	def decodeBase64_single(self,input_str): 
		length = len(input_str)
		if length%4 != 0:
			input_str = input_str[0:length - length%4]
		length = len(input_str)
		destr = ''
		numlist = []
		for j in range(0,4):
			numlist.append(self.getBase64_Num(input_str[j]))
			if(numlist[j]<0):
				return destr
		num = (numlist[0]<<26) + (numlist[1]<<20) + (numlist[2]<<14) + (numlist[3]<<8)
		num = (num>>8)
		temp = num
		num_3 = temp - ((num>>8)<<8)
		num = (num>>8)
		temp = num
		num_2 = temp - ((num>>8)<<8)
		destr = destr + chr(num_2) + chr(num_3)#just save the second and third characters in the first three characters of input_str
		return destr + self.decodeBase64(input_str,4,length)
	
	def decodeBase64_double(self,input_str):
		length = len(input_str)
		if length%4 != 0:
			input_str = input_str[0:length - length%4]
		length = len(input_str)
		destr = ''
		numlist = []
		for j in range(0,4):
			numlist.append(self.getBase64_Num(input_str[j]))
			if(numlist[j]<0):
				return destr
		num = (numlist[0]<<26) + (numlist[1]<<20) + (numlist[2]<<14) + (numlist[3]<<8)
		num = (num>>8)
		temp = num
		num_3 = temp - ((num>>8)<<8)
		destr = destr + chr(num_3) #just save the third character in the first three characters of input_str
		return destr + self.decodeBase64(input_str,4,length)
		
	def checkBase64_keyword(self,str):
		if str.find('html')<0 and str.find('HTML')<0 and str.find('H T M L') and str.find('head')<0 and str.find('HEAD')<0 and str.find('script')<0 and str.find('SCRIPT')<0 and str.find('function')<0:
			return False
		return True
	
	def checkBase64(self,file_path): #This can only distinguish Base64_random from other Base64 
									 #encoding string, can not distinguish Base64_plain , 
									 #Base64_single ,Base64_double because they have almost the 
									 #same decoding way
		try:
			fd = open(file_path, 'rb')
			raw = fd.read(300)
			fd.close()
			index = raw.find('base64')	
			if(index>0):
				raw = raw[index+7:len(raw)]
				destr = self.decodeBase64_plain(raw)
				if(self.checkBase64_keyword(destr)==True):
					return self.EVASION_BASE64_PLAIN
				else:
					destr = self.decodeBase64_single(raw)
					if(self.checkBase64_keyword(destr)==True):
						return self.EVASION_BASE64_SINGLE_PAD
					else:
						destr = self.decodeBase64_double(raw)
						if(self.checkBase64_keyword(destr)==True):
							return self.EVASION_BASE64_DOUBLE_PAD
						else:
							return self.EVASION_BASE64_RANDOM
			return self.EVASION_NOT_FIND
		except Exception,e:
			print e
			return self.EVASION_NOT_FIND
		
	def checkUTF(self,file_path):
		try:
			fd = open(file_path, 'rb')
			raw = fd.read(12)
			fd.close()
			if(ord(raw[0]) == 0xFE and ord(raw[1]) == 0xFF):#has bom
				return self.EVASION_UTF16_BE
			elif(ord(raw[0]) == 0 and ord(raw[1]) == 0 and ord(raw[2]) == 0xFE and ord(raw[3]) == 0xFF):
				return self.EVASION_UTF32_BE
			elif(ord(raw[3]) == 0 and ord(raw[2]) == 0 and ord(raw[1]) == 0xFE and ord(raw[0]) == 0xFF):
				return self.EVASION_UTF32_LE
			elif(ord(raw[1]) == 0xFE and ord(raw[0]) == 0xFF):
				return self.EVASION_UTF16_LE
			else:
				if(ord(raw[0]) == 0 and ord(raw[1]) != 0 and ord(raw[1]) <= 0x7F and ord(raw[2]) == 0 and ord(raw[3]) != 0 and ord(raw[3]) <= 0x7F and ord(raw[4]) == 0 and ord(raw[5]) != 0 and ord(raw[5]) <= 0x7F):
					return self.EVASION_UTF16_BE
				elif(ord(raw[1]) == 0 and ord(raw[0]) != 0 and ord(raw[0]) <= 0x7F and ord(raw[3]) == 0 and ord(raw[2]) != 0 and ord(raw[2]) <= 0x7F and ord(raw[5]) == 0 and ord(raw[4]) != 0 and ord(raw[4]) <= 0x7F):
					return self.EVASION_UTF16_LE
				elif((ord(raw[0]) == 0 and ord(raw[1]) == 0 and ord(raw[2]) == 0 and ord(raw[3]) != 0 and ord(raw[3]) <= 0x7F) and (ord(raw[4]) == 0 and ord(raw[5]) == 0 and ord(raw[6]) == 0 and ord(raw[7]) != 0 and ord(raw[7]) <= 0x7F) and (ord(raw[8]) == 0 and ord(raw[9]) == 0 and ord(raw[10]) == 0 and ord(raw[11]) != 0 and ord(raw[11]) <= 0x7F)):
					return self.EVASION_UTF32_BE
				elif((ord(raw[3]) == 0 and ord(raw[2]) == 0 and ord(raw[1]) == 0 and ord(raw[0]) != 0 and ord(raw[0]) <= 0x7F) and (ord(raw[7]) == 0 and ord(raw[6]) == 0 and ord(raw[5]) == 0 and ord(raw[4]) != 0 and ord(raw[4]) <= 0x7F) and (ord(raw[11]) == 0 and ord(raw[10]) == 0 and ord(raw[9]) == 0 and ord(raw[8]) != 0 and ord(raw[8]) <= 0x7F)):
					return self.EVASION_UTF32_LE
			return self.EVASION_NOT_FIND
		except Exception,e:
			return self.EVASION_NOT_FIND
			
	def checkJSEscape(self,file_path):
		try:
			fd = open(file_path, 'rb')
			raw = fd.readline()
			fd.close()
			if raw.find('document.write(unescape(')>0:
				return self.EVASION_JS_ESCAPE
			return self.EVASION_NOT_FIND
		except Exception,e:
			return self.EVASION_NOT_FIND
			
	def getEvasionType(self, file_path):
		if not os.path.isfile(file_path):
			return -1
		type = self.checkJSEscape(file_path)
		if type == self.EVASION_NOT_FIND:
			type = self.checkBase64(file_path)
			if type == self.EVASION_NOT_FIND:
				type = self.checkUTF(file_path)
		return type
		
if __name__ == "__main__":
	eva = EvasionChecker()
	logfile = open("log_checker.log",'w')
	input_dir = r'C:\msf_browser_samples_man\msf_html_obfuscation\ie'
	#input_dir = r'C:\msf_browser_samples_man\msf_html_obfuscation\ff'
	#input_dir = r'C:\msf_browser_samples_man\msf_activex_samples'
	print 'start ...'
	for root, dirs, files in os.walk(input_dir):
		for name in files:
			print name
			if(name[-4:] == ".saz"):
				continue
			input_file = os.path.join(root, name)
			type = eva.getEvasionType(input_file)
			if type == eva.EVASION_NOT_FIND:
				logfile.write('\n'+name+' : raw')
			elif type == eva.EVASION_JS_ESCAPE:
				logfile.write('\n'+name+' : js-escape')
			elif type == eva.EVASION_BASE64_PLAIN:
				logfile.write('\n'+name+' : base64-plain')
			elif type == eva.EVASION_BASE64_SINGLE_PAD:
				logfile.write('\n'+name+' : base64-1')
			elif type == eva.EVASION_BASE64_DOUBLE_PAD:
				logfile.write('\n'+name+' : base64-2')
			elif type == eva.EVASION_BASE64_RANDOM:
				logfile.write('\n'+name+' : base64-random')
			elif type == eva.EVASION_UTF16_LE:
				logfile.write('\n'+name+' : utf-16le')
			elif type == eva.EVASION_UTF16_BE:
				logfile.write('\n'+name+' : utf-16be')
			elif type == eva.EVASION_UTF32_LE:
				logfile.write('\n'+name+' : utf-32le')
			elif type == eva.EVASION_UTF32_BE:
				logfile.write('\n'+name+' : utf-32be')
			else:
				logfile.write('\n'+name+' : error'+'\n')
	logfile.close()
	print 'the end ...'

	
	