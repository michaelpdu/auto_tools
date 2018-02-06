import os, sys, subprocess

class YaraWrapper:
    """
    """

    def __init__(self):
        self.yara_path_ = "yara32.exe"
        self.rules_ = []

    def __del__(self):
        pass

    def check_env(self):
        if not os.path.exists(self.yara_path_):
            print "[ERROR] cannot find " + self.yara_path_
            return False
        return True

    def analyze_behavior(self, rule_path, behavior_path):
        self.rules_ = []
        cmd = "%s -g %s %s" % (self.yara_path_, rule_path, behavior_path)
        print "[*] CMD: " + cmd
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
        output = proc.stdout.readlines()
        if len(output) > 0:
            for line in output:
                self.rules_.append(line.split(" ")[0])
        return self.rules_

def print_help():
    print """
Usage:
  python yara.py rule_path behavior_path
    """


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print_help()
        exit(-1)

    yara = YaraWrapper()
    if not yara.check_env():
        exit(-1)
    rules = yara.analyze_behavior(sys.argv[1], sys.argv[2])
    for rule in rules:
        print rule
