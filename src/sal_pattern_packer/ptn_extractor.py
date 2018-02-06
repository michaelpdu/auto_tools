import os, sys, re, shutil, zipfile
from pack import PatternPacker

class PatternExtractor:
    """
    """

    def __init__(self):
        self.re_ptn_format_ = re.compile(r'\d{1,6}\.\d\.\d{1,4}_pattern_.*\.zip')
        self.zip_file_list_ = []

    def check_env(self):
        for root, dirs, files in os.walk(os.getcwd()):
            for name in files:
                matched_list = re.findall(self.re_ptn_format_, name)
                if len(matched_list) == 1:
                    self.zip_file_list_.append(name)
        if len(self.zip_file_list_) == 0:
            return False
        else:
            return True

    def decrypt_file(self, cfg_file):
        if not os.path.exists(cfg_file):
            print '[Decrypt File] Cannot find ' + cfg_file
            return
        cmd = 'SALineup.exe -d "%s"' % cfg_file
        print '[Decrypt File] CMD: ' + cmd
        os.system(cmd)

    def unzip_ptn(self, ptn_file):
        if not os.path.exists(ptn_file):
            print '[Unzip Pattern File] Cannot find ' + ptn_file
            return

        cmd = 'SALineup.exe -u "%s" "%s"' % (ptn_file, os.path.dirname(ptn_file))
        print '[Unzip Pattern File] CMD: ' + cmd
        os.system(cmd)

    def process(self):
        for item in self.zip_file_list_:
            (dir_name, ext) = os.path.splitext(item)
            if os.path.exists(dir_name):
                shutil.rmtree(dir_name)
            os.makedirs(dir_name)

            print '[*] Unzip pattern zip file'
            fh = open(item, 'rb')
            z = zipfile.ZipFile(fh)
            for file_name in z.namelist():
                z.extract(file_name, dir_name)
                print 'extract %s to %s' % (file_name, dir_name)
            fh.close()

            if '_pattern_sal' in dir_name:
                if dir_name.startswith('2.5.'):
                    self.decrypt_file(os.path.join(dir_name, 'tmsa.cfg'))
                self.unzip_ptn(os.path.join(dir_name, 'tmsa2.ptn'))
            else:
                self.decrypt_file(os.path.join(dir_name, 'tmbep.cfg'))

def print_help():
    print """
Usage:
    python ptn_extractor.py

    Step:
        1. copy pattern zip file from //Core/SA_Pattern/Int/SA_Pattern-0.9-INT/SA_Pattern/src/SAL/UniPattern/pattern/ to current directory
        2. run python ptn_extractor.py
    """

if __name__ == "__main__":
    ptn_extractor = PatternExtractor()
    if not ptn_extractor.check_env():
        exit(-1)

    ptn_extractor.process()
