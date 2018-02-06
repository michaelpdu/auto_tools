import os
import shutil
import subprocess
import struct  
import sys
import xlwt
import time
import re
HtmlNumber=0
JSNumber  =0
HtmlSusNumber=0
JSSusNumber  =0
EKSampleNum=0
EKSusSampleNum=0
OtherNumber  =0
EKdict={}
detaillist=[]
EKSumList=[]
Status=False#this value is to judge if has temp file(if exists temp file,that is only handle added pcap file,not all pcap file)
SALflag=True
SieMatchSalflag=False#if sal account no behavior,then sal stop reading sal.log file once
#next is sal parameter
SaHtmlSusNumber = 0
SaJSSusNumber = 0
SaEKSampleNum = 0
SaEKSusSampleNum=0
SaEKdict={}
Sadetaillist=[]
SaEKSumList=[]
class AccountEKExcel:#hui zong suoyuo de jilu
    def __init__(self,EKStyp,EKSNumber,EKDectedNumber):
        self.EKStyp = EKStyp
        self.EKSNumber = EKSNumber
        self.EKDectedNumber = EKDectedNumber
class SaAccountEKExcel:
    def __init__(self,EKStyp,EKSNumber,EKDectedNumber):
        self.EKStyp = EKStyp
        self.EKSNumber = EKSNumber
        self.EKDectedNumber = EKDectedNumber
class DetailInfo:
    def __init__(self, filepath, filetype, filestatus):
        self.path = filepath
        self.type = filetype
        self.status = filestatus
class SaDetailInfo:
    def __init__(self,filepath,filetype,filestatus):
        self.path = filepath
        self.type = filetype
        self.status = filestatus
def SIEToolCheck(inputfilepath,SIEToolPATH):
    #os.chdir(r'D:\MyWork\Job2\SIE')
    os.chdir(SIEToolPATH)
    SIEPATH="SIETool " + '"'+ inputfilepath +'"'+">" +r'sie.log'
    print SIEPATH
    SIEProcess=subprocess.Popen(SIEPATH,shell=True)
    SIEProcess.wait()
def SALToolCheck(inputfilepath,SALToolpath):
    os.chdir(SALToolpath)
    SALPATH="SALineup " + '"'+ inputfilepath +'"'+">" +r'sal.log'
    print SALPATH
    print "**************open SALineup*******************"
    SALProcess=subprocess.Popen(SALPATH,shell=True)
    SALProcess.wait()
def autocheck(inputrawfilepath,SIEToolpath,SALToolpath):
    global HtmlNumber
    global JSNumber
    global HtmlSusNumber
    global JSSusNumber
    global EKSampleNum
    global EKSusSampleNum
    global OtherNumber
    global EKdict
    global detaillist
    global EKSumList
    global SaHtmlSusNumber
    global SaJSSusNumber
    global SaEKSampleNum
    global SaEKdict
    global Sadetaillist
    global SaEKSumList
    global SaEKSusSampleNum
    global SieMatchSalflag
    global SALflag
    #InputEKPath=r'C:\Users\LUlu_zhang\Desktop\rawfile'
    #InputEKPath=inputrawfilepath
    for InputEK in os.listdir(inputrawfilepath):
        HtmlNumber  =0
        JSNumber  =0
        HtmlSusNumber=0
        JSSusNumber  =0
        EKSampleNum=0
        EKSusSampleNum=0
        OtherNumber  =0
        EKdict={}
        detaillist=[]
        SaHtmlSusNumber=0
        SaJSSusNumber =0
        SaEKSampleNum =0
        SaEKdict ={}
        Sadetaillist =[]
        SaEKSusSampleNum=0
        EKSampleNum=len(os.listdir(os.path.join(inputrawfilepath,InputEK)))
        SaEKSampleNum=len(os.listdir(os.path.join(inputrawfilepath,InputEK)))
        status=False #this value is to judge this EK folder is normal or malicious depend on once a file in this folder is malicious,this #value is change to True 
        Sastatus=False#the same as to status
        filepath=' '
        #for EKType in os.listdir(os.path.join(inputrawfilepath,InputEKPath)):
            #inputekpath=os.path.join(InputEKPath,EKType)
        for EkName in os.listdir(os.path.join(inputrawfilepath,InputEK)):
            #SIETool check EKType fold's EKName
            #print '***************************SIETool Check ', EkName, 'start***************************'
            SieMatchSalflag=False
            if SALflag==True:
                SIEToolCheck(os.path.join(os.path.join(inputrawfilepath,InputEK),EkName),SIEToolpath)
                time.sleep(3)
                SALToolCheck(os.path.join(os.path.join(inputrawfilepath,InputEK),EkName),SALToolpath)
                time.sleep(3)
                os.chdir(SIEToolpath)
                SIEfile=open(r'sie.log')
                os.chdir(SALToolpath)
                print "****************open Sal log******************"
                SALfile=open(r'sal.log')
                #find the SIE data line
                sieline=SIEfile.readline()
                sieline=SIEfile.readline()
                sieline=SIEfile.readline()
                saline=SALfile.readline()
                #find the SAL data line
                while saline:
                    matchpattern=re.findall(r'Now Processing File :',saline)
                    if matchpattern:
                        break
                    else:
                        saline=SALfile.readline()
                #find the SAL data line
                print 'start'
                while sieline:
                    endpattern=re.compile(r'DateTime')
                    endmatch =endpattern.findall(sieline)
                    if endmatch:
                        print 'xiangdeng'
                        break
                    #list=line.split(' ')
                    pattern1=re.compile(r'>>')
                    pattern2=re.compile(r'Final')
                    match1=pattern1.findall(sieline)
                    match2=pattern2.findall(sieline)
                    #if list[0]=='>>':
                    if match1:
                        pathpattern=re.compile('(\w+) (\w+) (.*) (.*)')
                        lists=pathpattern.findall(sieline)
                        siefilepath=''.join(lists[0][3])#convert list to string
                        sieline=SIEfile.readline()
                        saline=SALfile.readline()
                    #elif list[0]=='Final':
                    if match2:
                        #if has decision,then handle ,otherwise ingore
                        
                        judgedecisionpattern=re.compile(r'Final Decision')
                        decisionmatch=judgedecisionpattern.findall(saline)
                        
                        
                        siepattern=re.compile(r'\[.*?\]')
                        sielist=siepattern.findall(sieline)
                        siefiletype=''.join(sielist[1])
                        siefilestatus=''.join(sielist[0])
                        siefiletype=siefiletype[1:-1]
                        siefilestatus=siefilestatus[1:-1]
                        if decisionmatch:
                            salpattern=re.compile(r'\[.*?\]')
                            salist=salpattern.findall(saline)
                            print '$$$$$$$$$$',salist[0],'$$$$',salist[1],'$$$$$$$$$$'
                            safilestatus=''.join(salist[0])
                            safilepath=''.join(salist[1])
                            safilepath=safilepath[1:-1]
                            safilestatus=safilestatus[1:-1]
                            saline=SALfile.readline()#jump the blank line in sal.log
                            saline=SALfile.readline()
                        else:
                            safilepath=siefilepath
                            safilestatus='NO Behivor'
                            #if has no behavior , then safile stop readline once
                            #SieMatchSalflag=True
                        
                        if siefiletype =='html':
                            HtmlNumber+=1
                            if siefilestatus =='suspicious':
                                HtmlSusNumber+=1
                                status=True
                                detaillist.append(DetailInfo(siefilepath,siefiletype,siefilestatus))
                            else:
                                detaillist.append(DetailInfo(siefilepath,siefiletype,siefilestatus))
                            if safilestatus =='malicious':
                                SaHtmlSusNumber+=1
                                Sastatus=True
                                Sadetaillist.append(SaDetailInfo(safilepath,siefiletype,safilestatus))
                            else:
                                Sadetaillist.append(SaDetailInfo(safilepath,siefiletype,safilestatus))
                        elif siefiletype =='js':
                            JSNumber+=1
                            if siefilestatus =='suspicious':
                                JSSusNumber+=1
                                status=True
                                detaillist.append(DetailInfo(siefilepath,siefiletype,siefilestatus))
                            else:
                                detaillist.append(DetailInfo(siefilepath,siefiletype,siefilestatus))
                            if safilestatus =='malicious':
                                SaJSSusNumber+=1
                                Sastatus=True
                                Sadetaillist.append(SaDetailInfo(safilepath,siefiletype,safilestatus))
                            else:
                                Sadetaillist.append(SaDetailInfo(safilepath,siefiletype,safilestatus))
                        else:
                            siefiletype='other'
                            OtherNumber+=1
                            detaillist.append(DetailInfo(siefilepath,siefiletype,'----'))
                            Sadetaillist.append(SaDetailInfo(safilepath,siefiletype,'----'))
                        sieline=SIEfile.readline()
                    #if SieMatchSalflag == False:
                        #saline=SALfile.readline()
                        #SieMatchSalflag=False
                    #sieline=SIEfile.readline()
                SIEfile.close()
                SALfile.close()
                    #every loop saline always point to the line we need.
                if status == True:
                    EKSusSampleNum+=1
                    EKdict[EkName]='suspicious'
                    status=False
                else:
                    EKdict[EkName]='normal'
                if Sastatus==True:
                    SaEKSusSampleNum+=1
                    SaEKdict[EkName]='malicious'
                    Sastatus=False
                else:
                    SaEKdict[EkName]='normal'
                
            else:
                print '*******************Only run SIE engine***************'
                SIEToolCheck(os.path.join(os.path.join(inputrawfilepath,InputEK),EkName),SIEToolpath)
                time.sleep(3)
                SIEfile=open(r'sie.log')
                sieline=SIEfile.readline()
                sieline=SIEfile.readline()
                sieline=SIEfile.readline()
                print 'start'
                while sieline:
                    endpattern=re.compile('DateTime:')
                    endmatch =endpattern.findall(sieline)
                    if endmatch:
                        print 'xiangdeng'
                        break
                    #list=line.split(' ')
                    pattern1=re.compile(r'>>')
                    pattern2=re.compile(r'Final')
                    match1=pattern1.findall(sieline)
                    match2=pattern2.findall(sieline)
                    if match1:
                        pathpattern=re.compile('(\w+) (\w+) (.*) (.*)')
                        lists=pathpattern.findall(sieline)
                        siefilepath=''.join(lists[0][3])#convert list to string
                    if match2:
                        siepattern=re.compile(r'\[.*?\]')
                        sielist=siepattern.findall(sieline)
                        siefiletype=''.join(sielist[1])
                        siefilestatus=''.join(sielist[0])
                        siefiletype=siefiletype[1:-1]
                        siefilestatus=siefilestatus[1:-1]#qu [] hao
                        if siefiletype =='html':
                            HtmlNumber+=1
                            if siefilestatus =='suspicious':
                                HtmlSusNumber+=1
                                status=True
                                detaillist.append(DetailInfo(siefilepath,siefiletype,siefilestatus))
                            else:
                                detaillist.append(DetailInfo(siefilepath,siefiletype,siefilestatus))
                        elif siefiletype =='js':
                            JSNumber+=1
                            if siefilestatus =='suspicious':
                                JSSusNumber+=1
                                status=True
                                detaillist.append(DetailInfo(siefilepath,siefiletype,siefilestatus))
                            else:
                                detaillist.append(DetailInfo(siefilepath,siefiletype,siefilestatus))
                        else:
                            siefiletype='other'
                            OtherNumber+=1
                            detaillist.append(DetailInfo(siefilepath,siefiletype,'----'))
                            
                    sieline=SIEfile.readline()
                if (status==True):
                    EKSusSampleNum+=1
                    EKdict[EkName]='suspicious'
                    status=False
                else:
                    EKdict[EkName]='normal'
                SIEfile.close()
        #print '**********SIETool Check ', EkName,' Sucess**********'
        resultToExcel(InputEK)
        #put SALResult in the same excel,if SAL engine is running
        #print'***************************' ,InputEK ,'Result Excel Create Sucess*************'
        EKSumList.append(AccountEKExcel(InputEK,EKSampleNum,EKSusSampleNum))
        SaEKSumList.append(SaAccountEKExcel(InputEK,SaEKSampleNum,SaEKSusSampleNum))
def resultToExcel(EKtyp):
    global HtmlNumber
    global JSNumber
    global HtmlSusNumber
    global JSSusNumber
    global EKSampleNum
    global EKSusSampleNum
    global OtherNumber
    global EKdict
    global detaillist
    global Status
    #nxet is sal parameter
    global SaHtmlSusNumber
    global SaJSSusNumber
    global SaEKSampleNum
    global SaEKdict
    global Sadetaillist
    global SaEKSumList 
    global SaEKSusSampleNum
    wb = xlwt.Workbook()
    ws = wb.add_sheet(EKtyp) 
    titleFont = xlwt.Font()
    titleFont.bold = True
    titleFont.colour_index = 2
    titelStyle = xlwt.XFStyle()
    titelStyle.font = titleFont
    if SALflag==True:
        #add sal title
        print '***********add SAL title*************'
        ws.write(0, 3, 'Total EK Number:' + str(SaEKSampleNum) + '  Dectected EK Number:' + str(SaEKSusSampleNum), titelStyle)
        ws.write(3, 3, 'DECISION SAL', titelStyle)
    ws.write(0, 0, 'Total EK Number:' + str(EKSampleNum) + '  Dectected EK Number:' + str(EKSusSampleNum), titelStyle)
    ws.write(2, 0, 'Suspicious EK List', titelStyle)
    ws.write(3, 0, 'EK', titelStyle)
    ws.write(3, 1, 'DECISION SIE', titelStyle)    
    line = 4
    for i in EKdict.keys():
        ws.write(line, 0, i)
        ws.write(line, 1, EKdict[i])
        if SALflag==True:
            ws.write(line,2,i)
            ws.write(line,3,SaEKdict[i])
        line += 1
    line += 2
    oldline=line
    if SALflag==True:
        print '************add SAL data************'
        ws.write(line, 3, 'Detail Result', titelStyle)
        line += 1
        ws.write(line, 3, 'FILE TYPE', titelStyle)
        ws.write(line, 4, 'TOTAL', titelStyle)
        ws.write(line, 5, 'DETECTION', titelStyle)
        line += 1
        ws.write(line, 3, 'html')
        ws.write(line, 4, HtmlNumber)
        ws.write(line, 5, SaHtmlSusNumber)
        line += 1
        ws.write(line, 3, 'js')
        ws.write(line, 4, JSNumber)
        ws.write(line, 5, SaJSSusNumber)
        line += 1
        ws.write(line, 3, 'other')
        ws.write(line, 4, OtherNumber)
        ws.write(line, 5, '---')
        line += 2
        ws.write(line, 3, 'Detail List', titelStyle)
        line += 1
        ws.write(line, 3, 'PATH', titelStyle)
        ws.write(line, 4, 'TYPE', titelStyle)
        ws.write(line, 5, 'DECISION', titelStyle)
    line=oldline
    ws.write(line, 0, 'Detail Result', titelStyle)
    line += 1
    ws.write(line, 0, 'FILE TYPE', titelStyle)
    ws.write(line, 1, 'TOTAL', titelStyle)
    ws.write(line, 2, 'DETECTION', titelStyle)
    line += 1
    ws.write(line, 0, 'html')
    ws.write(line, 1, HtmlNumber)
    ws.write(line, 2, HtmlSusNumber)
    line += 1
    ws.write(line, 0, 'js')
    ws.write(line, 1, JSNumber)
    ws.write(line, 2, JSSusNumber)
    line += 1
    ws.write(line, 0, 'other')
    ws.write(line, 1, OtherNumber)
    ws.write(line, 2, '---')
    line += 2
    ws.write(line, 0, 'Detail List', titelStyle)
    line += 1
    ws.write(line, 0, 'PATH', titelStyle)
    ws.write(line, 1, 'TYPE', titelStyle)
    ws.write(line, 2, 'DECISION', titelStyle)
    line += 1
    oldline=line
    if SALflag==True:
        for i in Sadetaillist:
            ws.write(line,3,i.path)
            ws.write(line,4,i.type)
            ws.write(line,5,i.status)
            line+=1
    line=oldline
    for i in detaillist:
        ws.write(line, 0, i.path)
        ws.write(line, 1, i.type)
        ws.write(line, 2, i.status)
        line += 1
    #wb.save(EKtyp + '.xls')
    if Status==True:
        #os.chdir(r'D:\MyWork\Job2\NewExcelResult')
        if not os.path.exists(os.path.join(os.path.dirname(os.getcwd()),'NewExcelResult')):
            os.makedirs(os.path.join(os.path.dirname(os.getcwd()),'NewExcelResult'))
        os.chdir(os.path.join(os.path.dirname(os.getcwd()),'NewExcelResult'))
        wb.save(EKtyp +'.xls')
    else:
        #os.chdir(r'D:\MyWork\Job2\ExcelResult')
        if not os.path.exists(os.path.join(os.path.dirname(os.getcwd()),'ExcelResult')):
            os.makedirs(os.path.join(os.path.dirname(os.getcwd()),'ExcelResult'))
        os.chdir(os.path.join(os.path.dirname(os.getcwd()),'ExcelResult'))
        wb.save(EKtyp +'.xls')
    print 'end'
#*******account all the EKsample excel in the SumResult.xls************    
def AllTheExcelResult():
    wb = xlwt.Workbook()
    ws = wb.add_sheet('SumResult')
    titleFont = xlwt.Font()
    titleFont.bold = True
    titleFont.colour_index = 2
    titelStyle = xlwt.XFStyle()
    titelStyle.font = titleFont
    if SALflag==True:
        ws.write(0,5,'EKType',titelStyle)
        ws.write(1,6,'SAL',titelStyle)
        ws.write(0,6,'EKNumber',titelStyle)
        ws.write(0,7,'EKDectedNumber',titelStyle)
    ws.write(0,0,'EKType',titelStyle)
    ws.write(1,1,'SAL',titelStyle)
    ws.write(0,1,'EKNumber',titelStyle)
    ws.write(0,2,'EKDectedNumber',titelStyle)
    line=3
    oldline=line
    for k in EKSumList:
        ws.write(line,0,k.EKStyp)
        ws.write(line,1,k.EKSNumber)
        ws.write(line,2,k.EKDectedNumber)
        line+=1
    line=oldline
    if SALflag==True:
        for k in SaEKSumList:
            ws.write(line,5,k.EKStyp)
            ws.write(line,6,k.EKSNumber)
            ws.write(line,7,k.EKDectedNumber)
            line+=1
    if Status==True:
        #wb.save(r'D:\MyWork\Job2\NewExcelResult\SumResult'+'.xls')
        if not os.path.exists(os.path.join(os.path.dirname(os.getcwd()),'NewExcelResult')):
            os.makedirs(os.path.join(os.path.dirname(os.getcwd()),'NewExcelResult'))
        os.chdir(os.path.join(os.path.dirname(os.getcwd()),'NewExcelResult'))
        wb.save('SumResult '+' .xls')
    else:
        #wb.save(r'D:\MyWork\Job2\ExcelResult\SumResult'+'.xls')
        if not os.path.exists(os.path.join(os.path.dirname(os.getcwd()),'ExcelResult')):
            os.makedirs(os.path.join(os.path.dirname(os.getcwd()),'ExcelResult'))
        os.chdir(os.path.join(os.path.dirname(os.getcwd()),'ExcelResult'))
        wb.save('SumResult '+' .xls')
def DeleteTempFolder(temppath):
    print'**********************DeleteTempFolder************************'
    if Status==True:
        if os.path.exists(os.path.dirname(temppath)):
            shutil.rmtree(os.path.dirname(temppath),True)
        else:
            print 'temp folder already delete!'
    else:
        if os.path.exists(os.path.join(os.path.dirname(temppath),'temp')):
            shutil.rmtree(os.path.join(os.path.dirname(temppath),'temp'),True)
        else:
            print 'temp folder already delete!'
def copytree(src, dst, symlinks=False):  
    names = os.listdir(src)  
    if not os.path.isdir(dst):  
        os.makedirs(dst)         
    errors = []  
    for name in names:  
        srcname = os.path.join(src, name)  
        dstname = os.path.join(dst, name)  
        try:  
            if symlinks and os.path.islink(srcname):  
                linkto = os.readlink(srcname)  
                os.symlink(linkto, dstname)  
            elif os.path.isdir(srcname):  
                copytree(srcname, dstname, symlinks)  
            else:  
                if os.path.isdir(dstname):  
                    os.rmdir(dstname)  
                elif os.path.isfile(dstname):  
                    os.remove(dstname)  
                shutil.copy2(srcname, dstname)  
        except (IOError, os.error) as why:  
            errors.append((srcname, dstname, str(why)))   
        except OSError as err:  
            errors.extend(err.args[0])  
    try:  
        shutil.copystat(src, dst)  
    except WindowsError:  
        pass  
    except OSError as why:  
        errors.extend((src, dst, str(why)))  
    if errors:  
        raise Error(errors)  
        
def UpdateSazAndRaw(TempPath):
    print '*********************UpdateSazAndRaw*************************'
    TempSazPath=os.path.join(TempPath,'saz')
    TempRawPath=os.path.join(TempPath,'rawfile')
    OldSazPath=os.path.join(os.path.dirname(TempPath),'saz')
    OldRawPath=os.path.join(os.path.dirname(TempPath),'rawfile')
    for sazitem in os.listdir(TempSazPath):
        if sazitem in os.listdir(OldSazPath):
            for sazitemfile in os.listdir(os.path.join(TempSazPath,sazitem)):
                print sazitemfile
                print os.path.join(os.path.join(TempSazPath,sazitem),sazitemfile)
                shutil.copy(os.path.join(os.path.join(TempSazPath,sazitem),sazitemfile),os.path.join(OldSazPath,sazitem))
        else:
            if not os.path.exists(os.path.join(OldSazPath,sazitem)):
                os.makedirs(os.path.join(OldSazPath,sazitem))
            copytree(os.path.join(TempSazPath,sazitem),os.path.join(OldSazPath,sazitem))
    for rawitem in os.listdir(TempRawPath):
        if rawitem in os.listdir(OldRawPath):
            for rawitemfile in os.listdir(os.path.join(TempRawPath,rawitem)):
                print os.path.join(os.path.join(TempRawPath,rawitem),rawitemfile)
                copytree(os.path.join(TempRawPath,rawitem),os.path.join(OldRawPath,rawitem))
        else:
            if not os.path.exists(os.path.join(OldSazPath,rawitem)):
                os.makedirs(os.path.join(OldSazPath,rawitem))
            copytree(os.path.join(TempRawPath,rawitem),os.path.join(OldRawPath,rawitem))

    
    
if __name__ == '__main__':
    #argv[1]:rawfile path argv[2]:SIETool path,argv[3]:SALTool path
    #this place add a selector : if rawfile path include temp,then is new rawfile, create excel in NewExcelResult folder,otherwise in ExcelResult
    print'                      ***************************************                             '
    tpath=os.path.join(os.path.dirname(sys.argv[1]),'temp')
    if os.path.exists(tpath):
        Status=True
        sys.argv[1]=os.path.join(tpath,'rawfile')
        print '*************************** The Excel Create Start***************************'
        try:
            autocheck(sys.argv[1],sys.argv[2],sys.argv[3])
        except:
            print 'Check rawfile Failed!'
            exit(1)
        else:    
            print '*************************** The Excel Create Sucess***************************'
            time.sleep(3)
            try:
                AllTheExcelResult() 
            except:
                print 'Sum Excel acquire failed!'
                sys.exit(1)
            else:
                print '***************************Gather Excel Create Sucess***************************' 
                #Before delete temp folder , need to update sazfolder and rawfilefolder
                #UpdateExcel(sys.argv[2])
                time.sleep(3)
                try:
                    UpdateSazAndRaw(tpath)
                except:
                    print 'Update Saz and Raw failed!'
                    exit(1)
                else:
                    time.sleep(3)
                    try:
                        DeleteTempFolder(sys.argv[1])
                    except:
                        print 'Delete Temp Folder Failed'
                        exit(1)
    else:
        sys.argv[1]=os.path.join(os.path.dirname(sys.argv[1]),'rawfile')
        print '*************************** The Excel Create Start***************************'
        autocheck(sys.argv[1],sys.argv[2],sys.argv[3])
        print '*************************** The Excel Create Sucess***************************'
        time.sleep(3)
        AllTheExcelResult()     
        print '***************************Gather Excel Create Sucess***************************' 
        #Before delete temp folder , need to update sazfolder and rawfilefolder
        #UpdateExcel(sys.argv[2])
        time.sleep(3)
        DeleteTempFolder(sys.argv[1])
    

        
         
        
    