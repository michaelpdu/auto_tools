import os
import shutil
import subprocess
import struct  
import sys
import xlwt
import time
import re
from global_config import *

def getDetectionNum(filepath):
	file = open(filepath)
	number = [0,0]
	filelist = []
	susplist = []
	str = file.readline()
	while(str!=""):
		if(str.find("Now Processing File")>=0):
			name = str.split("/")[-2]
			if not name in filelist:
				filelist.append(name)
			str = file.readline()
			index = str.find("[suspicious]")
			if(index>0):
				if not name in susplist:
					susplist.append(name)
		str = file.readline()
	number[0] = len(filelist)
	number[1] = len(susplist)
	return number

def get_detectionNum_list(filelist):
	numberlist = []
	total_list = []
	allnum = 0
	totalnum = 0
	for i in range(0,len(filelist)):
		filename = filelist[i]
		number = getDetectionNum(filename)
		total_list.append(number[0])
		totalnum += number[0]
		numberlist.append(number[1])
		allnum += number[1]
	total_list.append(totalnum)
	numberlist.append(allnum)
	return (total_list,numberlist)
	
def initFrameOfSheet2(ws):
	ws.col(1).width = 4700
	titleFont = xlwt.Font()
	titleFont.bold = True
	titelStyle = xlwt.XFStyle()
	titelStyle.font = titleFont
	alignment = xlwt.Alignment() # Create Alignment
	alignment.horz = xlwt.Alignment.HORZ_CENTER 
	alignment.vert = xlwt.Alignment.VERT_CENTER 
	titelStyle.alignment = alignment 
	ws.write(0, 2, 'Total', titelStyle)
	return 1  #return line number

def writeLeftMenuIntoSheet2(ws,line,total_number_list,menu_list,menu_type):#write sample type(such as raw,js,utf-16le) menu 
	alignment = xlwt.Alignment() # Create Alignment
	alignment.horz = xlwt.Alignment.HORZ_CENTER 
	alignment.vert = xlwt.Alignment.VERT_CENTER 
	style = xlwt.XFStyle() 
	style.alignment = alignment 
	
	list_len = len(menu_list)
	line += 1
	ws.write_merge(line,line+list_len,0,0,menu_type,style)
	for i in range(0,list_len):
		ws.write(line,1,menu_list[i])
		ws.write(line,2,total_number_list[i])
		line += 1	
	return line

def writeTopMenuIntoSheet2(ws,start_col,version):#write build version ,'Detection Number','Detection Rate' menu
	ws.col(start_col).width = 4700
	ws.col(start_col+1).width = 4700

	titleFont = xlwt.Font()
	titleFont.bold = True
	titelStyle = xlwt.XFStyle()
	titelStyle.font = titleFont
	alignment = xlwt.Alignment() # Create Alignment
	alignment.horz = xlwt.Alignment.HORZ_CENTER 
	alignment.vert = xlwt.Alignment.VERT_CENTER 
	titelStyle.alignment = alignment 
	ws.write_merge(0,0,start_col,start_col+1,version,titelStyle)
	ws.write(1, start_col, 'Detection Number', titelStyle)
	ws.write(1, start_col+1, 'Detection Rate', titelStyle)
	
def resultToExcelSheet2(ws,line,start_col,total_list,number_list):
	alignment = xlwt.Alignment() # Create Alignment
	alignment.horz = xlwt.Alignment.HORZ_RIGHT 
	alignment.vert = xlwt.Alignment.VERT_CENTER
	style = xlwt.XFStyle() 
	style.alignment = alignment 
	
	line += 1
	for i in range(0,len(number_list)):
		ws.write(line,start_col,number_list[i])
		rate = "0.0000%"
		if(total_list[i]>0):
		   rate = str('%.4f'%((float(number_list[i])/total_list[i])*100)) + "%"
		ws.write(line,start_col+1,rate,style)
		line += 1
	return line
		
def getSampleNameAndRules(filepath):
	file = open(filepath)
	fileName = []
	fileRules = []
	str = file.readline()
	while(str!=""):
		if(str.find("Now Processing File")>=0):
			name = str.split("/")[-1][0:-2]
			str = file.readline()
			index = str.find("[suspicious]")
			rules = "NULL"
			if(index>0):
			   index = str.find("Rules:")
			   index2 = str.find("Size:")
			   rules = str[index+8:index2-2]
			
			fileName.append(name)
			fileNameTemp = sorted(fileName)
			fileName = fileNameTemp
			ind = fileName.index(name)
			fileRules.insert(ind,rules)
			
		str = file.readline()
	resultlist = [fileName,fileRules]
	return resultlist

def getSamplesNameAndRulesOfSheet1(filelist):
	#---------get sample result------------------
	name_list = []
	rules_list = []
	for i in range(0,len(filelist)):
	    result_list = getSampleNameAndRules(filelist[i])
	    name_list.append(result_list[0])
	    rules_list.append(result_list[1])
	return (name_list,rules_list)
	
def initFrameOfSheet1(ws):
	ws.col(1).width = 4000
	ws.col(2).width = 11000
	titleFont = xlwt.Font()
	titleFont.bold = True
	titelStyle = xlwt.XFStyle()
	titelStyle.font = titleFont
	alignment = xlwt.Alignment() # Create Alignment
	alignment.horz = xlwt.Alignment.HORZ_CENTER 
	alignment.vert = xlwt.Alignment.VERT_CENTER 
	titelStyle.alignment = alignment 

	ws.write(0, 0, 'Explorer', titelStyle)
	ws.write(0, 1, 'Evasion', titelStyle)
	ws.write(0, 2, 'Sample', titelStyle)
	return 1 #return line number
	
def writeLeftMenuIntoSheet1(ws,line,name_list,keylist,menu_type):#write CVE name and type(such as raw,js,utf-16le) menu
	alignment = xlwt.Alignment() # Create Alignment
	alignment.horz = xlwt.Alignment.HORZ_CENTER 
	alignment.vert = xlwt.Alignment.VERT_CENTER 
	style = xlwt.XFStyle() 
	style.alignment = alignment 

	len_list = 0
	line += 1
	line_start = line
	for i in range(0,len(name_list)):
		length = len(name_list[i])
		ws.write_merge(line,line + length,1,1,keylist[i],style)
		for j in range(0,length):
			ws.write(line, 2, name_list[i][j])
			line += 1
		line += 1;
		len_list += length		
	ws.write_merge(line_start,line_start + len_list + 1,0,0,menu_type,style)
	return line

def writeTopMenuIntoSheet1(ws,start_col,version):#write build version menu
	titleFont = xlwt.Font()
	titleFont.bold = True
	titelStyle = xlwt.XFStyle()
	titelStyle.font = titleFont
	alignment = xlwt.Alignment() # Create Alignment
	alignment.horz = xlwt.Alignment.HORZ_CENTER 
	alignment.vert = xlwt.Alignment.VERT_CENTER 
	titelStyle.alignment = alignment 
	ws.col(start_col).width = 9999
	ws.write(0, start_col, version, titelStyle)#write version
	
def resultToExcelSheet1(ws,line,start_col,rules_list):
	alignment = xlwt.Alignment() # Create Alignment
	alignment.horz = xlwt.Alignment.HORZ_CENTER 
	alignment.vert = xlwt.Alignment.VERT_CENTER 
	style = xlwt.XFStyle() 
	style.alignment = alignment 
	#-------write rules -------------------
	line += 1
	line_start = line
	for i in range(0,len(rules_list)):
		length = len(rules_list[i])
		for j in range(0,length):
			ws.write(line, start_col, rules_list[i][j])
			line += 1	
		line += 1;
	return line
		
def write_Result_Into_Excel(sheet1,sheet2,sheet1_line,sheet2_line,versionlist,resultpathlist,filenamelist,keylist,menu_list,menu_type):
	# --------write sheet1----------
	start_col = 3
	sheet1_newline = 0
	for i in range(0,len(resultpathlist)):		
		filelist = []
		for name in filenamelist:
			filelist.append(resultpathlist[i] + name)
		
		(name_list,rules_list)=getSamplesNameAndRulesOfSheet1(filelist)
		if(i==0):
			writeLeftMenuIntoSheet1(sheet1,sheet1_line,name_list,keylist,menu_type)#write CVE name and type(such as raw,js,utf-16le) menu
		writeTopMenuIntoSheet1(sheet1,start_col,versionlist[i])#write build version menu
		sheet1_newline = resultToExcelSheet1(sheet1,sheet1_line,start_col,rules_list)
		start_col += 1
		
	# --------wirte sheet2-----------
	start_col = 3
	sheet2_newline = 0
	for i in range(0,len(resultpathlist)):		
		filelist = []
		for name in filenamelist:
			filelist.append(resultpathlist[i] + name)
		
		(total_list,number_list)=get_detectionNum_list(filelist)
		if(i==0):
			writeLeftMenuIntoSheet2(sheet2,sheet2_line,total_list,menu_list,menu_type)#write sample type(such as raw,js,utf-16le) menu 
		writeTopMenuIntoSheet2(sheet2,start_col,versionlist[i])#write build version ,'Detection Number','Detection Rate' menu
		sheet2_newline = resultToExcelSheet2(sheet2,sheet2_line,start_col,total_list,number_list)
		start_col += 2
	return sheet1_newline,sheet2_newline

def writeIEResult(versionlist,resultpathlist,excelfile,sheet1,sheet2,sheet1_line,sheet2_line):
	filenamelist = ["ie_raw.txt","ie_js.txt","ie_utf_16be.txt","ie_utf_16le.txt","ie_utf_32be.txt","ie_utf_32le.txt"]
	keylist = ["raw","js","utf_16be","utf_16le","utf_32be","utf_32le"]
	menu_list = ["CVE raw samples","JS escape samples","UTF-16-BE","UTF-16-LE","UTF-32-BE","UTF-32-LE","All IE Samples"]
	menu_type = 'IE' 
	filepath = []
	for i in range(0,len(resultpathlist)):		
		filepath.append(resultpathlist[i] + "/ie/")
	(sheet1_line,sheet2_line)=write_Result_Into_Excel(sheet1,sheet2,sheet1_line,sheet2_line,versionlist,filepath,filenamelist,keylist,menu_list,menu_type)
	return (sheet1_line,sheet2_line)
	
def writeFirefoxResult(versionlist,resultpathlist,excelfile,sheet1,sheet2,sheet1_line,sheet2_line):
	filenamelist = ["firefox_raw.txt","firefox_js.txt","firefox_utf_16be.txt","firefox_utf_16le.txt","firefox_utf_32be.txt","firefox_utf_32le.txt","firefox_base64_plain.txt","firefox_base64_1.txt","firefox_base64_2.txt","firefox_base64_random.txt"]
	keylist = ["raw","js","utf_16be","utf_16le","utf_32be","utf_32le","base64_plain","base64_1","base64_2","base64_random"]
	menu_list = ["CVE raw samples","JS escape samples","UTF-16-BE","UTF-16-LE","UTF-32-BE","UTF-32-LE","Base64-plain","Base64-1","Base64-2","Base64-Random","All FF Samples"]
	menu_type = 'Firefox'
	filepath = []
	for i in range(0,len(resultpathlist)):		
		filepath.append(resultpathlist[i] + "/firefox/")
	(sheet1_line,sheet2_line)=write_Result_Into_Excel(sheet1,sheet2,sheet1_line,sheet2_line,versionlist,filepath,filenamelist,keylist,menu_list,menu_type)
	return (sheet1_line,sheet2_line)

def writeActivexResult(versionlist,resultpathlist,excelfile,sheet1,sheet2,sheet1_line,sheet2_line):
	filenamelist = ["activex_raw.txt","activex_js.txt"]
	keylist = ["raw","js"]
	menu_list = ["CVE raw samples","JS escape samples","All Activex Samples"]
	menu_type = 'Activex' 
	filepath = []
	for i in range(0,len(resultpathlist)):		
		filepath.append(resultpathlist[i] + "/activex/")
	(sheet1_line,sheet2_line)=write_Result_Into_Excel(sheet1,sheet2,sheet1_line,sheet2_line,versionlist,filepath,filenamelist,keylist,menu_list,menu_type)
	return (sheet1_line,sheet2_line)
	
def writeToExcel(versionlist,resultpathlist,excelfile,ie_sign,firefox_sign,activex_sign):
	wb = xlwt.Workbook()
	sheet1 = wb.add_sheet(u'sheet1',cell_overwrite_ok=True)
	initFrameOfSheet1(sheet1)
	sheet2 = wb.add_sheet(u'sheet2',cell_overwrite_ok=True)
	initFrameOfSheet2(sheet2)
	sheet1_line = 0
	sheet2_line = 1
	if ie_sign==True:
		(sheet1_line,sheet2_line)=writeIEResult(versionlist,resultpathlist,excelfile,sheet1,sheet2,sheet1_line,sheet2_line)
	if firefox_sign==True:
		(sheet1_line,sheet2_line)=writeFirefoxResult(versionlist,resultpathlist,excelfile,sheet1,sheet2,sheet1_line,sheet2_line)
	if activex_sign==True:
		(sheet1_line,sheet2_line)=writeActivexResult(versionlist,resultpathlist,excelfile,sheet1,sheet2,sheet1_line,sheet2_line)
	
	wb.save(excelfile)
    
if __name__ == '__main__':
	config_file = r"config.cfg"
	po = GlobalConfig(config_file)
	build_num = po.getBuildNumber()
	workpath = po.getWorkPath()
	excelfile = workpath + "/result/" + po.getExcelName()+".xls"
	versionlist = []
	resultpathlist = []
	for i in range(1,build_num+1):
		version = po.getBuildVersion(i)
		versionlist.append(version)
		resultpathlist.append(workpath+"/result/"+version)
	
	ie_sign = po.getTargetIE()
	firefox_sign = po.getTargetFirefox()
	activex_sign = po.getTargetActivex()
	writeToExcel(versionlist,resultpathlist,excelfile,ie_sign,firefox_sign,activex_sign)
	print "yes"
        
         
        
    
