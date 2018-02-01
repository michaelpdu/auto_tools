# auther = Cheng Chang(SA)
# Date = 2016/12/16
import os
import sys
import shutil
from vbs2js import VBSConverter
sys.path.append("..\..")
import third_party.wrappers.SALineup_python.pysal as SA

def get_parent_path(path, grade):
    if grade > 0 and path.count('\\') >= grade:
        l = path.split('\\')
        return '\\'.join(l[:0-grade])
    else:
        return path

class VBSChecker:
    """
    """
    def __init__(self, salWrapper):
        self.root_path_ = os.path.split(os.path.realpath(__file__))[0]
        self.sal_ = salWrapper
        self.sal_opt_args_ = '--productname=sc --script-malware=true --loglevel=all '
        project_dir = get_parent_path(self.root_path_, 2)
        self.sal_path_ = os.path.join(project_dir, 'third_party', 'wrappers', 'SALineup_python')
        self.js_path_ = os.path.join(self.root_path_, 'js')

    def check_env(self):
        return True

    def clear_env(self):
        # clean up js folder
        if os.path.exists('js'):
            shutil.rmtree('js')
        os.mkdir('js')      
        # clean up result folder
        if os.path.exists('behavior'):
            shutil.rmtree('behavior')

    def process_dir(self, dir_path):
        for root, dirs, files in os.walk(dir_path):
            for name in files:
                file_path = os.path.join(root, name)
                if name.endswith('.vbs'):
                    js_file_path = os.path.join(self.js_path_, name + '.js')
                    converter = VBSConverter(file_path, js_file_path)
                    converter.convert()
                else:
                    new_js_name = os.path.join(self.js_path_,name)
                    shutil.copy2(file_path, new_js_name)
        self.process_internal(self.js_path_)

    def process_file(self, file_path):
        prefix_path, file_name = os.path.split(file_path)
        file_name_without_ext, ext = os.path.splitext(file_name)
        # vbs2js
        if ext == '.vbs':
            js_path = os.path.join(self.js_path_, file_name + '.js')
            converter = VBSConverter(file_path, js_path)
            converter.convert()
        else:
            js_path = file_path
        self.process_internal(js_path)

    def process_internal(self, js_path):
        # sal
        self.sal_.process(self.sal_opt_args_+ js_path)
        # move behavior to the current path
        behavior_path = os.path.join(self.sal_path_, 'result')
        new_behavior_path = os.path.join(self.root_path_, 'behavior')
        shutil.move(behavior_path, new_behavior_path)

        self.dump_log()

    def dump_log(self):
        log_file = os.path.join(self.root_path_, 'log.txt')
        log = open(log_file, 'w')
        log_content = ''.join(self.sal_.output_)
        log.write(log_content)
        log.close()


def print_help():
    print """
Usage:
    python vbs_checker.py vbs_file/dir
    """

def main():
    if len(sys.argv) != 2:
        print_help()
        exit(0)    
    salWrapper = SA.PySalHelper()
    vbsChecker = VBSChecker(salWrapper)
    if not vbsChecker.check_env():
        exit(-1)
    vbsChecker.clear_env()

    if os.path.isfile(sys.argv[1]):
        vbsChecker.process_file(sys.argv[1])
    elif os.path.isdir(sys.argv[1]):
        vbsChecker.process_dir(sys.argv[1])

if __name__ == '__main__':
    main()
