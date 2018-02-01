import os
import sys
import subprocess


class FfdecHelper:
    def __init__(self):
        self.result_path = ''
        self.path = os.path.split(os.path.realpath(__file__))[0]
        self.ffdec_path = os.path.join(self.path, 'ffdec')
        self.check_env()
        self.clean_env()

    def check_env(self):
        if not os.path.exists(self.ffdec_path):
            print '[ERROR] ffdec not exists in current dir!'
            exit(0)

    def clean_env(self):
        pass

    def set_result_path(self, result_path):
        self.result_path = result_path

    def decomplie(self, file_path):
        if file_path != '' and self.result_path != '':
            ffdec_cmd = "\"%s\%s\" -export script \"%s\" \"%s\"" % (self.ffdec_path, 'ffdec.bat', self.result_path, file_path)
            proc = subprocess.Popen(ffdec_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            proc.communicate()


def print_help():
    print """
Usage:
    python decomplie_helper.py target_file folder_path

Decomplie flash file by ffdec
    """


def main():
    if not 2 <= len(sys.argv) <= 3:
        print_help()
        exit(0)
    if not os.path.exists(sys.argv[1]):
        print 'target file not exists'
        exit(0)
    helper = FfdecHelper()
    if len(sys.argv) == 3:
        helper.set_result_path(sys.argv[2])
    else:
        helper.set_result_path('result')
    helper.decomplie(sys.argv[1])


if __name__ == '__main__':
    main()
