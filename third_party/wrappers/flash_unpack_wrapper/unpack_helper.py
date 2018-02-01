import os
import sys
import subprocess
import threading
import time
import psutil
import re


def curr_time():
    return time.strftime("%H:%M:%S")


class FlashUnpackHelper:
    def __init__(self):
        self.dumpTimeout = False
        self.path = os.path.split(os.path.realpath(__file__))[0]
        self.sulo_path = os.path.join(self.path, 'sulo')
        self.des_path = self.path
        self.TIMEOUT = 30
        self.check_env()
        self.clean_env()

    def set_des_path(self, des_path):
        self.des_path = des_path

    def check_env(self):
        # check sulo
        if not os.path.exists(self.sulo_path):
            print '[ERROR] sulo not exists in current dir!'
            exit(0)

    def clean_env(self):
        # clean up dump file
        for f in os.listdir(self.des_path):
            if re.search('.*_\d$', f):
                file_name = os.path.join(self.des_path, f)
                os.remove(file_name)
                continue
            if f.startswith('dumped_flash_'):
                file_name = os.path.join(self.des_path, f)
                os.remove(file_name)               

    def dump_flash(self, file_path):
        self.dumpTimeout = False
        # f0fad08da4212cc398160c38d2ba1f8a1930cfd1  10->dump,11->no dump
        # solu_cmd = '%s\pin -t sulo.dll -- flashplayer10_3r181_23_win_sa.exe %s' % (self.sulo_path, file_path)
        solu_cmd = '%s\pin -t sulo.dll -- flashplayer11_1r102_62_win_sa_32bit.exe %s' % (self.sulo_path, file_path)
        proc = subprocess.Popen(solu_cmd)
        t = threading.Timer(self.TIMEOUT, self.kill_process, [proc])
        t.start()
        t.join()
        if self.dumpTimeout is True:
            DumpFlag = False
            for f in os.listdir(self.des_path):
                if f.startswith('dumped_flash'):
                    DumpFlag = True
                    break
            if DumpFlag is False:
                print curr_time(), 'dump timeout,give up dumping'
                return []
        embedded_list = []
        file_path_without_ext, ext = os.path.splitext(file_path)
        prefix_path, file_name = os.path.split(file_path_without_ext)
        embedded_count = 0
        for f in os.listdir(self.des_path):
            if f.startswith('dumped_flash'):
                new_name = file_name + '_%s' % embedded_count  # xxx_0
                file_path = os.path.join(self.des_path, f)
                new_file_path = os.path.join(self.des_path, new_name)
                os.rename(file_path, new_file_path)
                embedded_list.append(os.path.join(self.des_path, new_name))
                embedded_count += 1
        if embedded_count == 0:
            print curr_time(), 'no need to dump'
        else:
            print curr_time(), 'dump dembedded flash', embedded_list
        return embedded_list

    def kill_process(self, proc):
        if proc.poll() is None:
            print curr_time(), '[WARN] process taking too long to complete - kill'
            for child in psutil.Process(proc.pid).children(recursive=True):
                child.kill()
            proc.kill()
            self.dumpTimeout = True


def print_help():
    print """
Usage:
    python unpack_helper.py target

Unpack flash file by solu
    """


def main():
    if len(sys.argv) != 2:
        print_help()
        exit(0)
    if not os.path.exists(sys.argv[1]):
        print 'target file not exists'
        exit(0)
    helper = FlashUnpackHelper()
    helper.dump_flash(sys.argv[1])


if __name__ == '__main__':
    main()
