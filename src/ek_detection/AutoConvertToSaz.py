import os
import sys
import time
import subprocess
import shutil
def fiddler_clear():
    #clear the sessions in the window
    p_clear = subprocess.Popen('ExecAction.exe clear', shell=True)    
    p_clear.wait()
def ConvertoSaz(InputPcapPath,OutputSaz):
    print '********************'
    for pcapfile in os.listdir(InputPcapPath):
        splitname=os.path.splitext(pcapfile)
        sazfile=splitname[0]+'.saz'
        pcapfilepath=os.path.join(InputPcapPath,pcapfile)
        sazfilepath=os.path.join(OutputSaz,sazfile)
        importCommand = 'ExecAction.exe' + ' ' + r'"import \"' + pcapfilepath + r'\""'
        print importCommand
        sazCommand = 'ExecAction.exe' + ' ' + r'"savesaz \"' + sazfilepath + r'\""'
        print sazCommand
        pImport = subprocess.Popen(importCommand, shell=True)
        pImport.wait()
        time.sleep(1)
        pSAZ = subprocess.Popen(sazCommand, shell=True)
        pSAZ.wait()
        time.sleep(1)
		#print '****************start****************'
        fiddler_clear()#how can let this function don't work in the last
def ReadPcapFile(PcapFilePath):
    print '***************************Pcap Converto Saz Start***************************'
    SAZ=os.path.dirname(PcapFilePath)
    SAZ=os.path.join(SAZ,'saz')
    if os.path.exists(SAZ):
        #print '#############Delete Saz File###############'
        #shutil.rmtree(SAZ,True)
        exit(0)
    if not os.path.exists(SAZ):
        os.mkdir(SAZ)
    for dirs in os.listdir(PcapFilePath):
        dirsname=os.path.splitext(os.path.split(os.path.join(PcapFilePath,dirs))[1])[0]
        if not os.path.exists(os.path.join(SAZ,dirsname)):
            os.mkdir(os.path.join(SAZ,dirsname))               
        ConvertoSaz(os.path.join(PcapFilePath,dirs),os.path.join(SAZ,dirsname))
    print '***************************Pcap Converto Saz Sucess***************************'
def StartFiddler(fiddlerpath):
    print '***************************Start Fiddler***************************'
    #print '####'
    fiddler=fiddlerpath + '\\'+ 'Fiddler.exe'
    fiddlerstart=subprocess.Popen(fiddler,shell=True)
	#fiddlerstart.wait()
if __name__=='__main__':
    #add a judge if pcapfolder is new,that means if there is a temp folder in pcap folder up dir.
    #arg1=fiddler path arg2=pcap path
    if len(sys.argv)==3:
        pcapupdir=os.path.dirname(sys.argv[2])
        if os.path.exists(os.path.join(pcapupdir,'temp')):
            sys.argv[2]=os.path.join(os.path.join(pcapupdir,'temp'),os.listdir(os.path.join(pcapupdir,'temp'))[0])
            StartFiddler(sys.argv[1])
            time.sleep(7)
            ReadPcapFile(sys.argv[2])
        else:
            choice=input('Continue or exit? please input Y(y) or N(n) :')
            if choice=='Y' or choice=='y':
                try:
                    StartFiddler(sys.argv[1])
                except:
                    print'Fiddler Start Failed!'
                    sys.exit(1)
                else:
                    print '***************************Fiddler Start Sucess ***************************'
                    time.sleep(5)
                    #try:
                    ReadPcapFile(sys.argv[2])
                    #except:
                     #   print 'Pcap convert to saz failed'
                     #   exit(1)
            if choice=='N' or choice=='n':
                print 'Exit!'
                sys.exit(1)
    if len(sys.argv)>0 and len(sys.argv)<3:
        argment=str(sys.argv)
        print 'argv[1] :  Fiddler path , argv[2]: Pcap path!'
        exit(1)
 
    
