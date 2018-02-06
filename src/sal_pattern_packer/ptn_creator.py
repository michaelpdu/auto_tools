import os, sys, re, zipfile
from pack import PatternPacker

def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file))


class PatternCreator:
    """
    """

    def __init__(self):
        self.pattern_base = "pattern"
        self.rankdb = 'rankdb'
        self.pre_osce_ptn_file_name = ""
        self.pre_osce_ptn_number = ""
        self.pre_uni_ptn_number = ""
        self.new_osce_ptn_number = ""
        self.new_uni_ptn_number = ""
        self.packer = PatternPacker()

    def check_env(self, is_sal_pattern):
        if is_sal_pattern and not os.path.exists(self.pattern_base):
            print "[ERROR] Cannot find pattern folder"
            return False
        if not self.search_previous_osce_pattern(is_sal_pattern):
            print "[ERROR] Cannot find previous OSCE pattern file"
            return False
        return True

    def build_auto(self, is_sal_pattern):
        self.calc_new_pattern_number()
        self.build(self.new_uni_ptn_number, self.new_osce_ptn_number, is_sal_pattern)

    def build(self, uni_pattern_version, osce_pattern_version, is_sal_pattern):
        print "build new pattern, uni_pattern_version: %s, osce_pattern_version:%s " % (uni_pattern_version, osce_pattern_version)
        if is_sal_pattern:
            # unzip previous OSCE pattern
            pre_osce_ptn_path = os.path.join(os.getcwd(), self.pre_osce_ptn_file_name)
            print "OSCE pattern: " + pre_osce_ptn_path
            pre_osce_ptn = zipfile.ZipFile(pre_osce_ptn_path)
            for file in pre_osce_ptn.namelist():
                pre_osce_ptn.extract(file, os.getcwd())
            pre_osce_ptn.close()
        
            os.remove("tmsa2.ptn")
            #
            self.packer.check_env(osce_pattern_version, is_sal_pattern)
            # use packer to generate uni-pattern file
            self.packer.modify_cfg(uni_pattern_version)
            self.packer.repack()
            # zip uni-pattern
            uni_ptn = zipfile.ZipFile(uni_pattern_version+r'_pattern_sal.zip', 'w')
            uni_ptn.write(r'tmsa2.ptn', 'tmsa2.ptn', zipfile.ZIP_DEFLATED)
            uni_ptn.close()
            os.remove("tmsa2.ptn")
            # use packer to generate osce-pattern file
            self.packer.modify_cfg(osce_pattern_version)
            self.packer.repack()
            # zip osce-pattern
            osct_ptn = zipfile.ZipFile(osce_pattern_version+r'_pattern_sal(based_on_'+uni_pattern_version+').zip', 'w')
            osct_ptn.write(r'tmsa.cfg', 'tmsa.cfg', zipfile.ZIP_DEFLATED)
            osct_ptn.write(r'tmsa.ptn', 'tmsa.ptn', zipfile.ZIP_DEFLATED)
            osct_ptn.write(r'tmsa2.ptn', 'tmsa2.ptn', zipfile.ZIP_DEFLATED)
            osct_ptn.close()
            os.remove("tmsa.cfg")
            os.remove("tmsa.ptn")
            os.remove("tmsa2.ptn")
        else:
            #
            self.packer.check_env(osce_pattern_version, is_sal_pattern)
            # use packer to generate uni-pattern file
            self.packer.modify_bep_cfg(uni_pattern_version)
            # zip uni-pattern
            uni_ptn = zipfile.ZipFile(uni_pattern_version+r'_pattern_bep.zip', 'w')
            uni_ptn.write(r'tmbep.cfg', 'tmbep.cfg', zipfile.ZIP_DEFLATED)
            zipdir(self.rankdb, uni_ptn)
            uni_ptn.close()
            # use packer to generate osce-pattern file
            self.packer.modify_bep_cfg(osce_pattern_version)
            # zip osce-pattern
            osct_ptn = zipfile.ZipFile(osce_pattern_version+r'_pattern_bep(based_on_'+uni_pattern_version+').zip', 'w')
            osct_ptn.write(r'tmbep.cfg', 'tmbep.cfg', zipfile.ZIP_DEFLATED)
            zipdir(self.rankdb, osct_ptn)
            osct_ptn.close()

    def search_previous_osce_pattern(self, is_sal_pattern):
        for name in os.listdir(os.getcwd()):
            if is_sal_pattern:
                matched = re.match(r'(?P<osce_pattern_number>2\.5\.\d{4})_pattern_sal\(based_on_(?P<uni_pattern_number>\d{6}\.0\.0)\)\.zip', name)
            else:
                matched = re.match(r'(?P<osce_pattern_number>7\.5\.\d{4})_pattern_bep\(based_on_(?P<uni_pattern_number>\d{6}\.0\.0)\)\.zip', name)
            if None != matched:
                self.pre_osce_ptn_file_name = name
                self.pre_osce_ptn_number = matched.groups()[0]
                self.pre_uni_ptn_number = matched.groups()[1]
                return True
        return False

    def calc_new_pattern_number(self):
        if self.pre_osce_ptn_number == "" or self.pre_uni_ptn_number == "":
            return False
        else:
            # calculate osce pattern
            (max_v, min_v, build_num) = self.pre_osce_ptn_number.split('.')
            build_num = str(int(build_num)+1)
            self.new_osce_ptn_number = max_v+'.'+min_v+'.'+build_num
            # calculate uni-pattern
            (max_v, min_v, build_num) = self.pre_uni_ptn_number.split('.')
            max_v = str(int(max_v)+100)
            self.new_uni_ptn_number = max_v+'.'+min_v+'.'+build_num
            return True


def print_help():
    print """
Usage-1:
    python ptn_creator.py uni_pattern_version osce_pattern_version SAL|BEP
    
    Option:
        version: specify which version do you want to modify

Usage-2:(For SAL pattern)
    python ptn_creator.py sal-auto

Usage-3:(For BEP pattern)
    python ptn_creator.py bep-auto

Step:
    1. copy pattern folder from //Core/SA_Pattern/Int/SA_Pattern-0.9-INT/SA_Pattern/src/SAL/UniPattern/pattern/ to current directory
    2. extract tmsa.cfg from previous 2.5.xxxx_pattern_sal.zip, if version is 2.5.xxxx
    3. run python ptn_creator.py uni_pattern_version osce_pattern_version
"""


if __name__ == "__main__":
    if not (len(sys.argv) == 4 or (len(sys.argv) == 2 and sys.argv[1] == 'sal-auto') 
            or (len(sys.argv) == 2 and sys.argv[1] == 'bep-auto')):
        print_help()
        exit(-1)

    ptn_creator = PatternCreator()
    if len(sys.argv) == 4:
        is_sal_pattern = "SAL" == sys.argv[3]
        if not ptn_creator.check_env(is_sal_pattern):
            exit(-1)
        ptn_creator.build(sys.argv[1], sys.argv[2], is_sal_pattern)
    elif len(sys.argv) == 2 and sys.argv[1] == 'sal-auto':
        if not ptn_creator.check_env(True):
            exit(-1)
        ptn_creator.build_auto(True)
    elif len(sys.argv) == 2 and sys.argv[1] == 'bep-auto':
        if not ptn_creator.check_env(False):
            exit(-1)
        ptn_creator.build_auto(False)
