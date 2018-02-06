import os, sys, stat

class PatternPacker:
    """
    """

    def __init__(self):
        self.salineup = "SALineup.exe"
        self.tmsa = "tmsa32.dll"
        self.tmwk = "tmwk32.dll"
        self.ptn_folder = "pattern"
        self.cfg_file = os.path.join("pattern","tmsa.cfg")
        self.old_cfg_file = "tmsa.cfg"
        self.alexa_db_folder = "rankdb"
        self.bep_cfg_file = "tmbep.cfg"

    def check_env(self, version, is_sal_pattern):
        if not os.path.exists(self.salineup):
            print "[ERROR] Cannot find SALineup.exe"
            return False
        elif not os.path.exists(self.tmsa):
            print "[ERROR] Cannot find tmsa32.dll"
            return False
        elif not os.path.exists(self.tmwk):
            print "[ERROR] Cannot find tmwk32.dll"
            return False
        else:
            if is_sal_pattern:
                if not os.path.exists(self.ptn_folder):
                    print "[ERROR] Cannot find 'pattern' folder"
                    return False
                elif not os.path.exists(self.cfg_file):
                    print "[ERROR] Cannot find 'pattern\\tmsa.cfg'"
                    return False
                elif "2.5" in version and not os.path.exists(self.old_cfg_file):
                    print "[ERROR] Cannot find tmsa.cfg for OSCE pattern"
                    return False
            else:
                if not os.path.exists(self.alexa_db_folder):
                    print "[ERROR] Cannot find 'rankdb' folder"
                    return False
                elif not os.path.exists(self.bep_cfg_file):
                    print "[ERROR] Cannot find 'tmbep.cfg' file"
                    return False
            return True

    def modify_cfg(self, version):
        tmp_cfg = "tmsa_temp.cfg"
        self.modify_version_in_tmsa_cfg(version, tmp_cfg, self.cfg_file)
        if "2.5" in version:
            os.chmod(self.old_cfg_file, stat.S_IWRITE)
            cmd_decrypt_cfg = "%s -d tmsa.cfg tmsa.cfg" % self.salineup
            os.system(cmd_decrypt_cfg)
            self.modify_version_in_tmsa_cfg(version, tmp_cfg, self.old_cfg_file)
            cmd_encrypt_cfg = "%s -e tmsa.cfg tmsa.cfg" % self.salineup
            os.system(cmd_encrypt_cfg)
            #os.chmod(self.old_cfg_file, stat.S_IREAD)

    def modify_bep_cfg(self, version):
        tmp_cfg = 'tmbep_temp.cfg'
        os.chmod(self.bep_cfg_file, stat.S_IWRITE)
        cmd_decrypt_cfg = "%s -d tmbep.cfg tmbep.cfg" % self.salineup
        os.system(cmd_decrypt_cfg)
        self.modify_version_in_tmsa_cfg(version, tmp_cfg, self.bep_cfg_file)
        cmd_encrypt_cfg = "%s -e tmbep.cfg tmbep.cfg" % self.salineup
        os.system(cmd_encrypt_cfg)

    def modify_version_in_tmsa_cfg(self, version, tmp_cfg, tmsa_cfg):
        with open(tmp_cfg, "w") as output:
            with open(tmsa_cfg, "r") as input:
                for line in input.readlines():
                    if "<version>" not in line:
                        output.write(line)
                    else:
                        output.write("    <version>"+version+"</version>\n")
        os.chmod(tmsa_cfg, stat.S_IWRITE)
        os.remove(tmsa_cfg)
        os.rename(tmp_cfg, tmsa_cfg)
        #os.chmod(tmsa_cfg, stat.S_IREAD)

    def repack(self):
        cmd = "%s -p %s tmsa2.ptn" % (self.salineup, self.ptn_folder)
        os.system(cmd)

def print_help():
    print """
Usage:
    python pack.py version SAL|BEP
    
    Option:
        version: specify which version do you want to modify

    Step:
        1. copy pattern folder from //Core/SA_Pattern/Int/SA_Pattern-0.9-INT/SA_Pattern/src/SAL/UniPattern/pattern/ to current directory
        2. extract tmsa.cfg from previous 2.5.xxxx_pattern_sal.zip, if version is 2.5.xxxx
        3. run python pack.py version_number
    """


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print_help()
        exit(-1)

    packer = PatternPacker()
    if not packer.check_env(sys.argv[1], sys.argv[2] == "SAL"):
        exit(-1)

    if sys.argv[2] == "SAL":
        packer.modify_cfg(sys.argv[1])
        packer.repack()
    else:
        packer.modify_bep_cfg(sys.argv[1])

