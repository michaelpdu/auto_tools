import os, sys, shutil, tempfile, subprocess, threading, psutil
from unpack_helper import FlashUnpackHelper
from yara_wrapper import YaraWrapper

class FlashChecker:
    """
    """

    def __init__(self):
        self.ffdec_path_ = "C:\\Program Files (x86)\\FFDec\\ffdec.bat"
        self.decompiled_dir_ = "decompiled_dir"
        self.yara_rule_ = "rules.yar"
        self.log_handle_ = open("detection.log", "w")
        self.dump_embedded_flash_ = True
        self.yara_wrapper_ = YaraWrapper()
        self.timeout_ = False

    def __del__(self):
        pass

    def check_env(self):
        if not os.path.exists(self.yara_rule_):
            print "[ERROR] cannot find " + self.yara_rule_
            return False
        if not os.path.exists(self.ffdec_path_):
            print "[ERROR] cannot find " + self.ffdec_path_
            return False
        return self.yara_wrapper_.check_env()

    def clear_env(self):
        if os.path.exists(self.decompiled_dir_):
            shutil.rmtree(self.decompiled_dir_)
        for item in os.listdir(tempfile.gettempdir()):
            item_path = os.path.join(tempfile.gettempdir(),item)
            if os.path.isfile(item_path):
                try:
                    os.remove(item_path)
                except:
                    pass

    def set_dump_embedded_flash(self, val):
        self.dump_embedded_flash_ = val

    def kill_process(self, proc):
        if proc.poll() is None:
            print '[WARN] process taking too long to complete--terminating'
            self.timeout_ = True
            for child in psutil.Process(proc.pid).children(recursive=True):
                print "[WARN] kill child process"
                child.kill()
            proc.kill()

    def export_action_script(self, file_path):
        if os.path.exists(self.decompiled_dir_):
            shutil.rmtree(self.decompiled_dir_)
        os.makedirs(self.decompiled_dir_)

        ffdec_cmd = "\"%s\" -export all \"%s\" \"%s\"" % (self.ffdec_path_, self.decompiled_dir_, file_path)
        print "[*] " + ffdec_cmd
        proc = subprocess.Popen(ffdec_cmd, stdout=subprocess.PIPE)
        t = threading.Timer( 10.0, self.kill_process, [proc] )
        t.start()
        t.join()

    def analyze_internal(self, file_path):
        self.timeout_ = False
        self.export_action_script(file_path)

        print "[INFO] begin to analyze action script"
        if not os.path.exists(os.path.join(self.decompiled_dir_, "scripts")):
            print "[WARN] cannot export scripts from " + file_path
            self.log_handle_.write("%s#%r#%s\n" % (file_path, self.timeout_, "no_script"))
            self.log_handle_.flush()
            return

        decompiled_path = os.path.join(self.decompiled_dir_, "all_decompiled_code.as")
        with open(decompiled_path, "a") as fh_output:
            for root, dirs, files in os.walk(os.path.join(self.decompiled_dir_, "scripts")):
                for name in files:
                    print "add content: " + os.path.join(root, name)
                    with open(os.path.join(root, name), "r") as fh:
                        fh_output.write(fh.read() + "\n")   

        matched_rules = self.yara_wrapper_.analyze_behavior(self.yara_rule_, decompiled_path)
        print "Matched Rules: " + str(matched_rules)
        self.log_handle_.write("%s#%r#%s\n" % (file_path,self.timeout_,str(matched_rules)))
        self.log_handle_.flush()

    def analyze_file(self, file_path):
        if not os.path.exists(file_path):
            print "[ERROR] Cannot find " + file_path
            return

        sig = ""
        with open(file_path, "r") as fh:
            sig = fh.read(3).upper()
            fh.close()
        if sig[1:3] != "WS":
            print "[ERROR] Cannot find flash signature"
            return

        (file_path_without_ext, ext) = os.path.splitext(file_path)
        (prefix_path, file_name) = os.path.split(file_path_without_ext)

        if ext.lower() != ".swf":
            os.rename(file_path, file_path+".swf")
            file_path += ".swf"

        embedded_list = []

        if self.dump_embedded_flash_:
            helper = FlashUnpackHelper()
            helper.processFlashInIE(file_path)
            embedded_list = helper.get_beplus_embedded_files()
            #print "embedded list:\n"
            #print embedded_list

        if len(embedded_list) == 0:
            print "[INFO] cannot find embedded flash, process original flash"
            self.analyze_internal(file_path)
        else:
            for em in embedded_list:
                print "[INFO] process embedded flash: " + em
                self.analyze_internal(em)

    def analyze_dir(self, dir_path):
        for root, dirs, files in os.walk(dir_path):
            for name in files:
                self.analyze_file(os.path.join(root, name))

def print_help():
    print """
Usage:
  python flash_cve_checker.py [-d] target_path

  Option:
    -d: dump embedded flash
    """


if __name__ == "__main__":
    if len(sys.argv) != 2 and len(sys.argv) != 3:
        print_help()
        exit(-1)
    target_path = ""
    dump_embedded_flash = True
    if len(sys.argv) == 2:
        dump_embedded_flash = False
        target_path = sys.argv[1]
    elif len(sys.argv) == 3 and sys.argv[1] == "-d":
        dump_embedded_flash = True
        target_path = sys.argv[2]
    else:
        print_help()
        exit(-1)
    checker = FlashChecker()
    if not checker.check_env():
        exit(-1)
    checker.clear_env()
    checker.set_dump_embedded_flash(dump_embedded_flash)
    if os.path.isfile(target_path):
        checker.analyze_file(target_path)
    elif os.path.isdir(target_path):
        checker.analyze_dir(target_path)
    else:
        print "[ERROR] unknown path type, " + target_path


