import win32ui, win32gui, win32com, pythoncom, win32con
from win32com.client import Dispatch
import os, sys, time
import tempfile
import psutil
import subprocess

class FlashUnpackHelper:
    """
    """

    def __init__(self):
        pythoncom.CoInitialize()
        self.ie_name_ = "iexplore.exe"
        self.zombie_proc_id_list_ = []

    def checkEnv(self):
        pass

    def checkIEConfig(self):
        pass

    def clearEnv(self):
        self.zombie_proc_id_list_ = []

    def checkIEProcessExists(self):
        #print 'check if IE process exists'
        for proc in psutil.process_iter():
            if proc.name() == self.ie_name_:
                return True
        return False

    def terminateAllIEProcess(self):
        #print 'terminate all IE process'
        try:
            for proc in psutil.process_iter():
                if proc.name() == self.ie_name_:
                    proc.kill()
        except Exception as ex:
            print ex

    def collectZombieIE(self):
        self.terminateAllIEProcess()
        for proc in psutil.process_iter():
            if proc.name() == self.ie_name_:
                self.zombie_proc_id_list_.append(proc.pid)

    def isZombieIE(self, input_pid):
        for pid in self.zombie_proc_id_list_:
            if pid == input_pid:
                return True
        return False

    def getTargetIEProcessID(self):
        #print 'get target IE process ID'
        for proc in psutil.process_iter():
            if proc.name() == self.ie_name_ and [] == proc.children() and not self.isZombieIE(proc.pid):
                return proc.pid
        print "[ERROR] cannot find child IE process, return 0"
        return 0

    def processFlashInIE(self, flash_path):
        print "[*] Process " + flash_path
        self.clearEnv()
        if self.checkIEProcessExists():
            self.terminateAllIEProcess()
            self.collectZombieIE()

        ie = Dispatch("InternetExplorer.Application")
        ie.Visible = 0
        
        #print "Inject dll here"
        pid = self.getTargetIEProcessID()
        cmd = 'injectdll.exe beplus.dll %d' % pid
        print "[*] CMD: " + cmd
        p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        (stdoutput, erroutput) = p.communicate()
        #print stdoutput

        print "[*] Navigate to " + flash_path
        ie.Navigate(flash_path)

        time.sleep(2)

        if self.checkIEProcessExists():
            self.terminateAllIEProcess()

    def clear_beplus_files(self):
        temp_dir = tempfile.gettempdir()
        for file_name in os.listdir(temp_dir):
            if len(file_name) > 8 and file_name[0:8] == "tmbeplus":
                os.remove(os.path.join(temp_dir, file_name))

    def get_beplus_embedded_files(self):
        ret_list = []
        temp_dir = tempfile.gettempdir()
        for file_name in os.listdir(temp_dir):
            if len(file_name) > 17 and file_name[0:17] == "tmbeplus_embedded":
                ret_list.append(os.path.join(temp_dir, file_name))
        return ret_list

def print_help():
    print """
Usage:
    python unpack_helper.py [option] [target]

    Option:
        -p: process flash URI
        -k: kill all IE process
    """


if __name__ == '__main__':
    if len(sys.argv) > 3:
        print_help()
        exit(-1)

    helper = FlashUnpackHelper()
    if "-p" == sys.argv[1]:
        helper.processFlashInIE(sys.argv[2])
    elif "-k" == sys.argv[1]:
        helper.terminateAllIEProcess()
    else:
        print_help()