import os, sys, shutil, re
import subprocess
import tempfile
from saz_extractor import SazExtractor

class SALineupWrapper:
    """
    """

    def __init__(self):
        self.output_ = ""
        self.de_ = None
        self.detection_list_for_saz_ = []
        self.de_file_ = open("de_file.cvs", "w")
        self.de_file_.write("file_path,decision,rules\n")

    def check_env(self):
        if not os.path.exists("SALineup.exe"):
            print "[ERROR] cannot find SALineup.exe in current directory"
            return False
        return True

    def clear_env(self):
        self.output_ = ""

    def scan_file_internal(self, arg_options, file_path):
        self.output_ = ""
        cmd = "SALineup.exe " + arg_options + " " + file_path
        print "[*] CMD: " + cmd
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
        self.output_ = proc.stdout.readlines()

    def scan_file(self, arg_options, file_path):
        (root_path, ext) = os.path.splitext(file_path)
        if ext.lower() == ".saz":
            extractor = SazExtractor()
            raw_dir_name = os.path.split(root_path)[-1]
            raw_dir_path = os.path.join(tempfile.gettempdir(), raw_dir_name)
            extractor.processFile(file_path, raw_dir_path)
            self.scan_saz_raw_dir(arg_options, raw_dir_path)
            shutil.rmtree(raw_dir_path)
            self.de_file_.write("%s,%r,%s\n" % (file_path, self.find_malicious_in_de_list(), self.get_malicious_details()))
            self.de_file_.flush()
        else:
            self.de_ = None
            self.scan_file_internal(arg_options, file_path)
            (de, rules) = self.get_detection_info()
            self.de_ = (file_path, de, rules)

    def scan_saz_raw_dir(self, arg_options, dir_path):
        self.detection_list_for_saz_ = []
        for root, dirs, files in os.walk(dir_path):
            for name in files:
                self.scan_file(arg_options, os.path.join(root, name))
                self.detection_list_for_saz_.append(self.de_)

    def scan_dir(self, arg_options, dir_path):
        for root, dirs, files in os.walk(dir_path):
            for name in files:
                try:
                    self.scan_file(arg_options, os.path.join(root, name))
                except:
                    self.de_file_.write("%s,Exception\n" % os.path.join(root, name))

    def get_detection_info(self):
        for line in self.output_:
            if line[0:9] == "Decision:":
                m = re.match(r"Decision: \[(\w+)\].*Rules: \[(.*)\]", line)
                #print "[*] Decision = " + m.group(1) + ", Rules = " + m.group(2)
                return (m.group(1), m.group(2))
        return ("", "")

    def find_malicious_in_de_list(self):
        for de in self.detection_list_for_saz_:
            if "malicious" == de[1].lower():
                return True
        return False

    def get_malicious_details(self):
        info = ""
        for de in self.detection_list_for_saz_:
            if "malicious" == de[1].lower():
                info = info + de[0] + "," + de[1] + "," + de[2] + ","
        return info

def print_help():
    print """
Usage:
    python salineup_wrapper.py [--saz] [options] [target]
    
    Option:
        --saz: scan saz file
        same with SALineup.exe
    """


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
        exit(-1)

    opt_args = ""
    for opt in sys.argv[1:-1]:
        opt_args = opt_args + opt + " "

    sal = SALineupWrapper()
    if not sal.check_env():
        exit(-1)

    sal.clear_env()
    if os.path.isfile(sys.argv[-1]):
        sal.scan_file(opt_args, sys.argv[-1])
    elif os.path.isdir(sys.argv[-1]):
        sal.scan_dir(opt_args, sys.argv[-1])
    else:
        pass

