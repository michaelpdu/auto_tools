import win32ui, win32gui, win32com, pythoncom, win32con
from win32com.client import Dispatch
import subprocess
import time
import psutil
import sys
import _winreg
import platform
import os

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

    def platformIsWinxpOrWin7(self):
        platform_info = platform.platform()
        return platform_info.startswith("Windows-7") or platform_info.startswith("Windows-XP")

    def platformIsX64(self):
        return 'PROGRAMFILES(X86)' in os.environ
        
    def injectDllOnWin8Plus(self, injected_dll):
        dll_path = os.getcwd()
        dll = os.path.join(dll_path, injected_dll)
        print dll
        key_str = None
        
        if self.platformIsX64():
            key_str = r"SOFTWARE\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Windows"
        else:
            key_str = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Windows"
        
        key = _winreg.OpenKey(_winreg.HKEY_LOCAL_MACHINE, key_str, 0, _winreg.KEY_WRITE)
        _winreg.SetValueEx(key, "AppInit_DLLs", 0, _winreg.REG_SZ, dll)
        _winreg.SetValueEx(key, "LoadAppInit_DLLs", 0, _winreg.REG_DWORD, 1)
        _winreg.CloseKey(key)
    
    def injectDllOnWin7(self, injected_dll):
        #print "Inject dll here"
        pid = self.getTargetIEProcessID()
        cmd = 'injectdll.exe %s %d' % (injected_dll, pid)
        print "[*] CMD: " + cmd
        p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        (stdoutput, erroutput) = p.communicate()
        #print stdoutput
            
            
    def clearDll(self):
        if self.platformIsWinxpOrWin7():
            pass
        else:
            key_str = None
            if self.platformIsX64():
                key_str = r"SOFTWARE\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Windows"
            else:
                key_str = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Windows"
            
            key = _winreg.OpenKey(_winreg.HKEY_LOCAL_MACHINE, key_str, 0, _winreg.KEY_WRITE)
            _winreg.SetValueEx(key, "AppInit_DLLs", 0, _winreg.REG_SZ, "")
            _winreg.SetValueEx(key, "LoadAppInit_DLLs", 0, _winreg.REG_DWORD, 0)
            _winreg.CloseKey(key)
        
    def navigateWithInjection(self, target, injected_dll):
        print "[*] Process " + target
        self.clearEnv()
        if self.checkIEProcessExists():
            self.terminateAllIEProcess()
            self.collectZombieIE()
            
        if not self.platformIsWinxpOrWin7():
            self.injectDllOnWin8Plus(injected_dll)
            
        ie = Dispatch("InternetExplorer.Application")
        ie.Visible = 1
        time.sleep(1)
        
        #inject dll here
        if self.platformIsWinxpOrWin7():
            self.injectDllOnWin7(injected_dll)

        print "[*] Navigate to " + target
        ie.Navigate(target)

        #clear dll
        self.clearDll()
        
        time.sleep(2)
        if self.checkIEProcessExists():
            self.terminateAllIEProcess()

    def processFlashInIE(self, flash_path):
        self.navigateWithInjection(flash_path, "tmbeplus.dll")

    def processURLInIE(self, url):
        self.navigateWithInjection(url, "dumppe.dll")

def print_help():
    print """
Usage:
    python unpack_helper.py [option] [target]

    Option:
        -f: process flash URI
        -u: process URL
        -k: kill all IE process
    """


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print_help()
        exit(-1)

    helper = FlashUnpackHelper()
    if "-f" == sys.argv[1]:
        helper.processFlashInIE(sys.argv[2])
    elif "-u" == sys.argv[1]:
        helper.processURLInIE(sys.argv[2])
    elif "-k" == sys.argv[1]:
        helper.terminateAllIEProcess()
    else:
        print_help()
