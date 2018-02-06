import os
import sys
import subprocess
import time
#SIETool=r'D:\MyWork\Job1\work3\CHECK_SIE\SIE_WIN32_EXE'
def CreateExcel(rawfilepath,SIEToolPATH,SALineupPath):
        os.chdir(r'D:\MyWork\Job2')
        excelpath='python AutoCheckAndWriteToExcel2.py'+' '+ rawfilepath + ' ' + SIEToolPATH + ' ' + SALineupPath
        print excelpath
        p=subprocess.Popen(excelpath,shell=True)
        p.wait()
        time.sleep(1)
if __name__=="__main__":
    #argv[1]:rawfilepath
    #argv[2]:SIETool path
    if len(sys.argv)==4:
        CreateExcel(sys.argv[1],sys.argv[2],sys.argv[3])
    elif len(sys.argv)>0 and len(sys.argv)<4:
        print 'Not Enough Argument!,the first argument is rawfilepath ,the sencond argumen is SIEToolPATH'
        sys.exit(1)
