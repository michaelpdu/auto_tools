import os,sys,shutil,tempfile
from unpack_helper import FlashUnpackHelper
from salineup_wrapper import SALineupWrapper
import hashlib


def md5(file_name):
    hash_md5 = hashlib.md5()
    with open(file_name, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

class AutoVerifier:
    """
    automatic tool to collect detection result based on special sample set
    """

    def __init__(self):
        self.backup_root_ = "backup"
        self.file_result_ = open("unpack_result.cvs","w")
        self.file_result_.write("file-path,file-type,decision,rules,decision-with-browser,rules-with-browser,number-of-embedded,decision-embedded,rules-embedded, embeded-md5\n")
        self.file_result_.flush()
        self.cur_raw_file_ = ""
        self.cur_beplus_log_ = ""
        self.cur_browser_behavior_ = ""
        self.cur_gen_raw_file_ = ""
        self.cur_gen_embedded_file_ = []
        self.cur_result_log_ = ""
        

    def __del__(self):
        print "clear file handler"
        self.file_result_.close()

    def clear_file_info(self):
        self.cur_raw_file_ = ""
        self.cur_beplus_log_ = ""
        self.cur_browser_behavior_ = ""
        self.cur_gen_raw_file_ = ""
        self.cur_gen_embedded_file_ = []
        self.cur_result_log_ = ""

    def is_flash_file(self, file_path):
        with open(file_path) as fh:
            sig = fh.read(3)
            if sig[1:] == "WS":
                return True
            else:
                return False

    def is_flash_ext(self, file_path):
        (path,ext) = os.path.splitext(file_path)
        if ext == ".swf":
            return True
        else:
            return False

    def get_beplus_files_in_temp_dir(self):
        ret_list = []
        temp_dir = "C:\\Temp"
        for file_name in os.listdir(temp_dir):
            if len(file_name) > 8 and file_name[0:8] == "tmbeplus":
                #print "file name: " + file_name
                full_file_path = os.path.join(temp_dir, file_name)
                ret_list.append(full_file_path)
                if file_name == "tmbeplus.log":
                    self.cur_beplus_log_ = full_file_path
                    #print "set beplus log"
                    continue
                elif file_name == "tmbeplus_behavior.xml":
                    self.cur_browser_behavior_ = full_file_path
                    #print "set browser behavior"
                    continue
                elif file_name[0:12] == "tmbeplus_raw":
                    self.cur_gen_raw_file_ = full_file_path
                    #print "set raw gen file"
                    continue
                else:
                    self.cur_gen_embedded_file_.append(full_file_path)
        return ret_list

    def backup_log_behavior(self, name, file_list):
        backup_folder = os.path.join(self.backup_root_,name)
        if os.path.exists(backup_folder):
            shutil.rmtree(backup_folder)
        os.makedirs(backup_folder)
        
        for file_path in file_list:
            shutil.move(file_path, backup_folder)

    def scan_raw_flash(self):
        sal = SALineupWrapper()
        sal.clear_env()
        decision = ""
        rules = ""
        ret_val = sal.scan_file("", self.cur_raw_file_)
        if ret_val:
            (decision, rules) = sal.get_detection_info()
        self.cur_result_log_ += ("%s,%s," % (decision,rules))

    def scan_raw_flash_with_browser_behavior(self):
        sal = SALineupWrapper()
        sal.clear_env()
        decision = ""
        rules = ""
        optional_args = "--external-behavior=\"%s\"" % self.cur_browser_behavior_
        ret_val = sal.scan_file(optional_args, self.cur_raw_file_)
        if ret_val:
            (decision, rules) = sal.get_detection_info()
        self.cur_result_log_ += ("%s,%s," % (decision,rules))

    def scan_embedded_flash(self):
        sal = SALineupWrapper()
        sal.clear_env()
        decision = ""
        rules = ""
        optional_args = "--embedded-flash=true"
        self.cur_result_log_ = self.cur_result_log_ + str(len(self.cur_gen_embedded_file_)) + ","
        for embedded_file in self.cur_gen_embedded_file_:
            ret_val = sal.scan_file(optional_args, embedded_file)
            if ret_val:
                (decision, rules) = sal.get_detection_info()
            self.cur_result_log_ += ("%s,%s,%s," % (decision,rules, md5(embedded_file)))

    def compare_raw_flash_with_generated_one(self):
        if not os.path.exists(self.cur_gen_raw_file_):
            self.cur_result_log_ += "no_gen_raw,"
            return False
        if not os.path.exists(self.cur_raw_file_):
            self.cur_result_log_ += "no_raw,"
            return False
        
        if md5(self.cur_raw_file_) == md5(self.cur_gen_raw_file_):
            self.cur_result_log_ += "equal,"
            return True
        else:
            self.cur_result_log_ += "not_equal,"
            return False

    def proc_flash_file(self, file_path):
        self.clear_file_info()
        self.cur_raw_file_ = file_path
        self.cur_result_log_ =  self.cur_result_log_ + file_path + ","
        if (self.is_flash_file(file_path)): # and self.is_flash_ext(file_path)):
            self.cur_result_log_ += "flash_file,"
            helper = FlashUnpackHelper()
            helper.processFlashInIE(file_path)
            file_list = self.get_beplus_files_in_temp_dir()
            self.compare_raw_flash_with_generated_one()
            self.scan_raw_flash()
            self.scan_raw_flash_with_browser_behavior()
            self.scan_embedded_flash()
            self.backup_log_behavior(os.path.split(file_path)[1], file_list)

            print "[*]" + self.cur_result_log_
            self.file_result_.write(self.cur_result_log_+"\n")
            self.file_result_.flush()
        else:
            self.cur_result_log_ += "not_flash_file,"


    def proc_flash_folder(self, folder_path):
        for root, dirs, files in os.walk(folder_path):
            for name in files:
                self.proc_flash_file(os.path.join(root, name))


def print_help():
    print """
Usage:
    python verifier.py [option] [target]
    
    Option:
        -f: process flash file
        -d: process flash directory
    """

if __name__ == '__main__':
    verifier = AutoVerifier()
    if len(sys.argv) != 3:
        print_help()
        exit(-1)

    if "-f" == sys.argv[1]:
        verifier.proc_flash_file(sys.argv[2])
    elif "-d" == sys.argv[1]:
        verifier.proc_flash_folder(sys.argv[2])
    else:
        print_help()
        exit(-1)
