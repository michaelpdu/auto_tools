#!/usr/bin/env python
import sys,os
import stat
import re
import subprocess
import shutil
from optparse import OptionParser
from ConfigParser import RawConfigParser

def ensureDir(d):
    if not os.path.isdir(d):
        os.makedirs(d)
    assert os.path.isdir(d)

def encryptFile(plain, encrypted, encrypt_cmd):
    if os.path.exists(encrypted):
        os.remove(encrypted)
    cmd = encrypt_cmd + " " + plain + " " + encrypted
    #ret = subprocess.call([cmd], shell=True)
    os.system(cmd)
    #subprocess.check_call([cmd], shell=True)
    
    #if not ret==0 or not os.path.exists(encrypted): 
    #    raise Exception("fail encrypting file! encryptor retcode: %d" % ret)

def subsituteVersion(filepath, version):
    f = open(filepath, "rb")
    content = f.read()
    f.close()
    ptn = re.compile(r'(\d{1,2}\.\d{1,4}\.)0000')
    oldVer = ptn.search(content).group() 
    content = content.replace(oldVer, version)
    f = open(filepath, "wb") 
    f.write(content) 
    f.close()

def zipDirectory(folder, zipfile):
    zipfile = os.path.abspath(zipfile)
    goback = os.getcwd()
    os.chdir(folder)
    ret = os.system('zip -r "%s" *' % zipfile)
    #ret = subprocess.call(["zip", "-r", zipfile, "*"], shell=True)
    if not ret==0:
        raise Exception("fail ziping file! retcode: %d. You may need to put a unix compatitive zip.exe to c:\\windows folder." % ret)
    os.chdir(goback)

class Task(object):
    def __init__(self, cfg_src, output, version, encrypt_mode, encrypt_cmd):
	self.cfg_src = cfg_src
        self.output = output
        self.version = version
        self.encrypt_mode = encrypt_mode
        self.encrypt_cmd = encrypt_cmd
        assert version!=None
        assert self.encrypt_mode in ["auto","none","all"]
        assert not os.path.exists(self.output), "The output directory is already existed, cannot overwrite it!"

    def prepare(self, src, dst, willEncrypt=False, willSubsituteVersion=False, srcInCurrentFolder=False):
	if srcInCurrentFolder:
            plain_file = os.path.join(os.getcwd(), src)
	else:
            plain_file = os.path.join(self.cfg_src, src)
        dest_file = os.path.join(self.output, dst)
        dest_file_tmp = dest_file + ".tmp"

        ensureDir(os.path.dirname(dest_file))
        shutil.copyfile(plain_file, dest_file_tmp)
        os.chmod(dest_file_tmp, stat.S_IWRITE | stat.S_IREAD)

        if self.version and willSubsituteVersion:
            subsituteVersion(dest_file_tmp, self.version)

        if self.encrypt_mode=="all" or self.encrypt_mode=="auto" and willEncrypt:
            encryptFile(dest_file_tmp, dest_file, self.encrypt_cmd)
            os.remove(dest_file_tmp)
            pass
        else:
            os.rename(dest_file_tmp, dest_file)

class SALTask(Task):
    def __init__(self, ptn_src, cfg_src, output, version, encrypt_mode, encrypt_cmd):
        Task.__init__(self, cfg_src, output, version, encrypt_mode, encrypt_cmd)
        self.ptn_src = ptn_src

    def copyPtn(self, src_folder):
        pattern_folder = os.path.join(self.ptn_src, src_folder)
	dest_folder = os.path.join(os.getcwd(), 'pattern')

	# check if pattern folder already exists
	if os.path.exists(dest_folder):
	    shutil.rmtree(dest_folder)

	# copy pattern folder from P4 to working dir
	shutil.copytree(pattern_folder, dest_folder)

    def packPtn(self):
	ret = os.system('SALineup.exe -p pattern tmsa.ptn 2>&1>nul')
    	if not ret==0:
            raise Exception("fail to pack! retcode: %d. You may need to put a SALineup.exe and tmsa.dll in current folder" % ret)
			


class BEPTask(Task):
    pass

def prepareForSALTi6(task):
    task.prepare('conf/desp.ptn', 'conf/desp.ptn', True, False)
    task.prepare('conf/map.ptn', 'conf/map.ptn', True, False)
    task.prepare('conf/tmpl.ptn', 'conf/tmpl.ptn', True, False)
    task.prepare('conf/url.ptn', 'conf/url.ptn', True, False)

    task.prepare('nsfilter/ns.model', 'nsfilter/ns.model', True, False)
    task.prepare('nsfilter/ns_html.model', 'nsfilter/ns_html.model', True, False)
    task.prepare('nsfilter/vr.db', 'nsfilter/vr.db', True, False)
    task.prepare('nsfilter/vr_html.db', 'nsfilter/vr_html.db', True, False)
    task.prepare('nsfilter/wd.db', 'nsfilter/wd.db', True, False)
    task.prepare('nsfilter/wd_html.db', 'nsfilter/wd_html.db', True, False)

    task.prepare('Rank/a.db', 'Rank/a.db', False, False)
    task.prepare('Rank/b.db', 'Rank/b.db', False, False)
    task.prepare('Rank/c.db', 'Rank/c.db', False, False)
    task.prepare('Rank/d.db', 'Rank/d.db', False, False)

    task.prepare('ha.ptn', 'ha.ptn', True, False)
    task.prepare('sa.ptn', 'sa.ptn', True, True)
    task.prepare('tmsa.cfg', 'tmsa.cfg', True, True)


def prepareForSALExceptTi6(task):
    task.copyPtn('pattern')
    task.packPtn()
    task.prepare('tmsa.ptn', 'tmsa.ptn', False, False, True)
    task.prepare('tmsa.cfg', 'tmsa.cfg', True, True)

def prepareForBEP(task):
    task.prepare('tmbep.cfg', 'tmbep.cfg', True, True)
    task.prepare('NormalFilter/pattern/raw/ns.model', 'nsfilter/ns.model', True, False)
    task.prepare('NormalFilter/pattern/raw/ns_html.model', 'nsfilter/ns_html.model', True, False)
    task.prepare('NormalFilter/pattern/raw/vr.db', 'nsfilter/vr.db', True, False)
    task.prepare('NormalFilter/pattern/raw/vr_html.db', 'nsfilter/vr_html.db', True, False)
    task.prepare('NormalFilter/pattern/raw/wd.db', 'nsfilter/wd.db', True, False)
    task.prepare('NormalFilter/pattern/raw/wd_html.db', 'nsfilter/wd_html.db', True, False)
    task.prepare('alexa_rank/a.db', 'rankdb/a.db', False, False)
    task.prepare('alexa_rank/b.db', 'rankdb/b.db', False, False)
    task.prepare('alexa_rank/c.db', 'rankdb/c.db', False, False)
    task.prepare('alexa_rank/d.db', 'rankdb/d.db', False, False)

def make_sal_unipattern():
    dest_folder = os.path.join(os.getcwd(), 'pattern')
	# check if pattern folder already exists
    if os.path.exists(dest_folder):
        shutil.rmtree(dest_folder)

    # copy pattern folder from P4 to working dir
    shutil.copytree(os.path.join(options.ptn_src, 'pattern'), dest_folder)
	
    cfg_file = os.path.join(dest_folder, "tmsa.cfg")
    os.chmod(cfg_file, stat.S_IWRITE | stat.S_IREAD)
    subsituteVersion(cfg_file, options.version)
    
    ret = os.system('SALineup.exe -p pattern tmsa2.ptn 2>&1>nul')
    if not ret==0:
        raise Exception("fail to pack! retcode: %d. You may need to put a SALineup.exe and tmsa.dll in current folder" % ret)
	
    zipfile = os.path.join(options.output, "%s_pattern_sal"%options.version)
    zipfile = zipfile + ".zip"
    ret = os.system('zip -r "%s" tmsa2.ptn' % zipfile)
    if not ret==0:
        raise Exception("fail ziping file! retcode: %d. You may need to put a unix compatitive zip.exe to c:\\windows folder." % ret)
		
		
	
# main ------------------------------------------------------------------
SALProject = ["sal_ti6", "sal_ti7", "sal_ti8", "sal_ti9", "sal_production", "sal_unipattern", "sal_osce11_sp1", "sal_sandcastle", "sal_ddei", "sal_iws", "sal_hc", "sal_staging"]
BEPProject = ["bep_ti6", "bep_ti7", "bep_ti8", "bep_ti9", "bep_sandcastle"]

parser = OptionParser()

help = '''The project name, it may be sal3.0, bep8.0'''
parser.add_option("-p", "--project", dest="project", help=help)

help = '''cfg source, separated from tmsa.ptn'''
parser.add_option("-s", "--cfg-src", dest="cfg_src", help=help)

help = '''ptn source, separated from tmsa.cfg'''
parser.add_option("-t", "--ptn-src", dest="ptn_src", help=help)

help = '''The directory that generated pattern files will put in. For pattern release, its the root directory of pattern package. For engine release, its the output/.../bin directory.'''
parser.add_option("-o", "--output", dest="output", help=help)

help = '''If specified, the private version number will be replaced with given version number. Version number is the build number, not full version, for example "1136". If not specified, the pattern files remains no change.'''
parser.add_option("-v", "--version", dest="version", help=help)

help = '''"auto": encrypt default specified pattern files, (Default). "none" do not encrypt any pattern files. "all": encrypt all pattern files.'''
parser.add_option("-e", "--encrypt", dest="encrypt", help=help, default="auto")

help = '''The shell command for encrypt files. The command will be used as "<encrypt-cmd> <plain_file_in> <encrypted_file_out>"'''
parser.add_option("-c", "--encrypt-cmd", dest="encrypt_cmd", help=help)

help = '''Enable zip pattern files, default is not zip.'''
parser.add_option("", "--no-zip", dest="zip", help=help, action="store_false", default=True)

options,args = parser.parse_args()

##test sal and bep
config = RawConfigParser()
config.read("prepare-pattern.ini")
if options.project in SALProject and not options.ptn_src:
    options.ptn_src = config.get(options.project, "ptn-src")
if not options.cfg_src: options.cfg_src = config.get(options.project, "cfg-src")
if not options.output: options.output = config.get(options.project, "output")
if not options.encrypt_cmd: options.encrypt_cmd = config.get(options.project, "encrypt-cmd")

if options.project in SALProject:
    assert options.ptn_src
assert options.cfg_src
assert options.output
assert options.encrypt_cmd

assert options.project in SALProject or options.project in BEPProject, "project type '%s' do not exists!" % options.project

if options.project == "sal_ti6":
    options.output = os.path.join(options.output, "%s_pattern_sal"%options.version)
    t = SALTask(options.ptn_src, \
        options.cfg_src, \
        options.output, \
        options.version, \
        options.encrypt, \
        options.encrypt_cmd)
    prepareForSALTi6(t)
elif options.project == "sal_ti7" \
        or options.project == "sal_production" \
        or options.project == "sal_osce" \
        or options.project == "sal_osce11_sp1" \
        or options.project == "sal_hc" \
        or options.project == "sal_ddei" \
        or options.project == "sal_iws" \
		or options.project == "sal_sandcastle" \
		or options.project == "sal_ti8" \
		or options.project == "sal_ti9" \
        or options.project == "sal_staging":
    options.output = os.path.join(options.output, "%s_pattern_sal"%options.version)
    t = SALTask(options.ptn_src, \
        options.cfg_src, \
        options.output, \
        options.version, \
        options.encrypt, \
        options.encrypt_cmd)
    prepareForSALExceptTi6(t)
elif options.project == "sal_unipattern":
    make_sal_unipattern();
	

if options.project == "sal_ddei" or options.project == "sal_iws":
        old_cfg_file_name = os.path.join(options.output, "tmsa.cfg")
        old_ptn_file_name = os.path.join(options.output, "tmsa.ptn")
        new_cfg_file_name = old_cfg_file_name + "."
        new_ptn_file_name = old_ptn_file_name + "."
        new_cfg_file_name = new_cfg_file_name + options.version
        new_ptn_file_name = new_ptn_file_name + options.version
        #print('old_ptn_file_name: %s' %old_ptn_file_name)
        #print('new_ptn_file_name: %s' %new_ptn_file_name)
        #print('old_cfg_file_name: %s' %old_cfg_file_name)
        #print('new_cfg_file_name: %s' %new_cfg_file_name)
        os.rename(old_cfg_file_name, new_cfg_file_name)
        os.rename(old_ptn_file_name, new_ptn_file_name)
	
elif options.project == "bep_ti6" or options.project == "bep_ti7" or options.project == "bep_ti8" or options.project == "bep_ti9"or options.project == "bep_sandcastle":
    options.output = os.path.join(options.output, "%s_pattern_bep"%options.version)
    t = BEPTask(options.cfg_src, \
        options.output, \
        options.version, \
        options.encrypt, \
        options.encrypt_cmd)
    prepareForBEP(t)
else:
    assert False, "project type '%s' do not exists!" % options.project

if options.zip:
    output = options.output
    output_zip = output + ".zip"
    assert not os.path.exists(output_zip), "The output zip file is already exists, can not overwrite it!"
    zipDirectory(output, output_zip)
    shutil.rmtree(output)


