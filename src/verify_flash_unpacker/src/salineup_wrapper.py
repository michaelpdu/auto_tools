import os, sys
import subprocess
import re


class SALineupWrapper:
    """
    """

    def __init__(self):
        self.output_ = ""

    def clear_env(self):
        self.output_ = ""

    def scan_file(self, arg_options, file_path):
        if not os.path.exists("SALineup.exe"):
            print "[ERROR] cannot find SALineup.exe in current directory"
            return False
        cmd = "SALineup.exe " + arg_options + " " + file_path
        print "[*] CMD: " + cmd
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
        self.output_ = proc.stdout.readlines()
        return True

    def get_detection_info(self):
        for line in self.output_:
            if line[0:9] == "Decision:":
                m = re.match(r"Decision: \[(\w+)\].*Rules: \[(.*)\]", line)
                #print "[*] Decision = " + m.group(1) + ", Rules = " + m.group(2)
                return (m.group(1), m.group(2))
        return ("", "")

def print_help():
    print """
Usage:
    python salineup_wrapper.py [options] [target]
    
    Option:
        same with SALineup.exe
    """


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
        exit(-1)

    opt_args = ""
    for opt in sys.argv[1:-1]:
        opt_args += opt
        opt_args += " "

    sal = SALineupWrapper()
    sal.clear_env()
    ret_val = sal.scan_file(opt_args, sys.argv[-1])
    if ret_val:
        (decision, rules) = sal.get_detection_info()
        print "Decision: " + decision
        print "Rules: " + rules


