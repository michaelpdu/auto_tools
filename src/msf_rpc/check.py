#coding=utf-8
import os
from util import init_cfg
from util.saz_extractor import *
from util.correctness_checker import *
from util.evasion_checker import *
import re, copy, logging
from util.type_parser import *

# bad design:
# 1.var postfix may be real postfix such as jar or file type like java
# 2.modify saz_extractor code for url-path dict(url_dict),which depends on the processfile method,
#   when you want to get url_dict for a file,you should create a new SazExtractor() object,call processFile method,
#   then access the url_dict
RESULT_DIR = r"C:\msf_rpc\result"
SAZ_ROOT = r"C:\msf_rpc\saz_root"
#RESULT_DIR = r"test\result"
#SAZ_ROOT = r"test\saz"
evasion = EvasionChecker()
evasion_dict = {
    'utf_16le': evasion.EVASION_UTF16_LE,
    'utf_16be': evasion.EVASION_UTF16_BE,
    'utf_32le': evasion.EVASION_UTF32_LE,
    'utf_32be': evasion.EVASION_UTF32_BE,
    'base64_plain': evasion.EVASION_BASE64_PLAIN,
    'base64_single_pad': evasion.EVASION_BASE64_PLAIN,
    'base64_double_pad': evasion.EVASION_BASE64_PLAIN,
    'random_space_injection': evasion.EVASION_BASE64_RANDOM,
    'js_escape': evasion.EVASION_JS_ESCAPE,
    'no_evasion': None
}
file_type = ["java"]
parser = TypeParser()
success_list = []
failed_list = []
missed_list = []
result_file = open("last_check_result.txt", "w")
logger = logging.getLogger('auto_collect_msf_samples')
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')  
logger.setLevel(logging.DEBUG)

fh = logging.FileHandler('log\extract.log')
fh.setFormatter(formatter)  
logger.addHandler(fh)



def plus_if_exist(file, copy_dict): # 最多加到9
    #if not os.path.exists(file):
        #return  file
    exist = False
    for key in copy_dict:
        if file == copy_dict[key]:
            exist = True
    if not exist:
        return file
    temp = file.split("\\")[-1]
    root = file[:-len(temp)]
    temp = temp.split(".")
    file_name = temp[0]
    try:
        postfix = "."+temp[1]
    except:
        postfix = ""
    #print file_name
    match = re.search("__\d$", file_name)

    if match == None:
        file_name = os.path.join(root, file_name + "__1%s" % postfix)
        return plus_if_exist(file_name, copy_dict)
    else:
        result = match.group()
        num = result.split('__')[1]
        num = int(num)
        num += 1
        file_name = file_name[:-3] + "__%d%s" % (num, postfix)
        return plus_if_exist(os.path.join(root, file_name), copy_dict)

def check_evasion(file_path, saz_name):
    temp = saz_name.split("__")
    evasion_name = temp[2]
    global evasion
    global evasion_dict
    evasion_type = evasion.getEvasionType(file_path)
    if evasion_name == "no_evasion":
        pass
    elif evasion_name in evasion_dict:
        if evasion_dict[evasion_name] != evasion_type:
            # print "unmatched evasion type in %s " % saz_name
            return False
        return True

    print "the code here should not be excuted,unknown error"

def generate_file_name(root, cve_name, saz_name, postfix, copy_dict):
    index = saz_name.rfind(".")
    file_name = saz_name[0:index]
    index = file_name.find("__")
    module_name = file_name[0:index]
    other_name = file_name[index+1:]
    temp = saz_name.split("__")
    #payload_name = temp[1]
    #evasion_name = temp[2]
    # global evasion_dict
    # if type == "no_evasion":
    #     pass
    # elif evasion_name in evasion_dict:
    #     if evasion_dict[evasion_name] != type:
    #        # print "unmatched evasion type in %s " % saz_name
    #         return False
    # else:
    #     #print "unknown evasion type in %s " % saz_name
    #     logger.critical("unknown evasion type in %s " % saz_name)
    #     if saz_name not in failed_list:
    #         failed_list.append(saz_name)
    #     return False
    if postfix in file_type: # when var postfix is java,the file don't append any postfix
        postfix = ""
    else:
        postfix = "."+postfix
    #file_name = cve_name+"__%s__%s%s" % (payload_name, evasion_name, postfix)
    file_name = "%s%s%s"%(cve_name, other_name, postfix)
    file_name = os.path.join(root, file_name)
    if postfix == "htm":
        return file_name
    return plus_if_exist(file_name, copy_dict)

def check_saz(saz_file, result_dir, check=True):
    copy_dict = {}
    #saz_name = (saz_file.split('\\')[-1]).split(".")[0]
    temp = os.path.basename(saz_file)
    saz_name =  temp[0:temp.rfind(".")]
    temp = saz_name.split('__')
    module_name = temp[0]
    evasion_name = temp[2]
    #evasion_name = "no evasion"
    global evasion_dict
    if evasion_name not in evasion_dict:
        print "evasion %s"%evasion_name
        print "unknown evasion type in %s " % saz_name
        logger.critical("unknown evasion type in %s " % saz_name)
        if saz_name not in failed_list:
            failed_list.append(saz_name)
        return False

    cve_number = init_cfg.getCveNumber(module_name)
    if cve_number == False:
        if saz_name not in missed_list:
            missed_list.append(saz_name)
        return False
    success_dir = os.path.join(result_dir, "success")
    if not os.path.exists(success_dir):
        os.makedirs(success_dir)
    saz_extractor = SazExtractor()
    if not saz_extractor.processFile(saz_file, result_dir):
        return False
    temp = saz_extractor.url_dict
    url_dict = {}
    #print temp
    for key in temp:

        list_ = temp[key]
        temp2_ = key.split(r"//")
        url_ = temp2_[1].split("?")[0]
        url_ = url_.split("#")[0]
        if url_ not in url_dict:
            url_dict[url_] = []
        url_dict[url_].extend(list_)
    #print url_dict
    global evasion
    global parser
    html_match = CorrectnessChecker()

    module_dir = os.path.join(result_dir, saz_name)
    #print "\n"
    #print saz_file
    #print cve_number, ":"
    logger.info("extract %s" % saz_file)
    logger.info("CVE %s" % cve_number)
    pf_list = init_cfg.getFileList(module_name)
    for i in range(len(pf_list)):
        pf_list[i] = pf_list[i].lower()
    target_set = copy.copy(pf_list)
    if init_cfg.getModulePattern(module_name):
        target_set.append("htm")
        pf_list.append("htm")
    for key in url_dict:
        file_path_array = url_dict[key]
        for file_path in file_path_array:
            file = os.path.basename(file_path)
            if not key.endswith("/"):
                temp = key.split("/")
                file = temp[-1]
            #file_path = os.path.join(root, file)
            postfix = ""
            dest_dir = os.path.join(success_dir, module_name)

            if saz_name.find("no_evasion") > 0:
                #evasion_type = "no_evasion"
                if html_match.checkCorrectness(module_name, file_path):
                    postfix = "htm"
            else:
                #evasion_type = evasion.getEvasionType(file_path)
                if check_evasion(file_path, saz_name):
                    postfix = "htm"
                    #if generate_file_name(dest_dir, cve_number, saz_name, "htm", evasion_type):
                    #postfix = "htm"
            if not postfix:
                try:
                    i_ = file.rfind(".")
                    if i_ == -1:
                        raise IndexError
                    postfix = file[i_+1:]
                    #postfix = file.split(".")[1]
                    postfix = postfix.lower()
                    match = re.search("\d+_$", postfix)
                    if match is not None:
                        #print "file:%s"%file
                        #print "postfix:%s"%postfix
                        print "the code here should not be reach"
                        str_ = match.group()
                        length = len(str_)
                        postfix = postfix[:-length]
                    if postfix not in pf_list:
                        postfix = ""
                        raise IndexError
                except IndexError:
                    # no postfix, check file type according to its content
                    pass
                    postfix = parser.get_file_type(file_path)
                    #print "type parser %s as %s" % (file, postfix)
                    logger.info("type parser %s as %s" % (file, postfix))
                    postfix = postfix.lower()
                    if postfix == "flash":
                        postfix = "swf"
                    if postfix not in pf_list:
                        postfix = ""

            if postfix in pf_list:
                if postfix in target_set:
                    target_set.remove(postfix)
                dest_file = generate_file_name(dest_dir, cve_number, saz_name, postfix, copy_dict)
                #print "move %s as %s" % (file, postfix)
                logger.info("copy %s as %s" % (file, postfix))
                #construct copy_dict
                if not check:
                    copy_dict[file_path] = dest_file


    if len(target_set) > 0:
        print "incomplete saz file %s:" % saz_name
        logger.critical("incomplete saz file %s:" % saz_name)
        miss = ""
        for type in target_set:
            miss = type + " "
        print "not find ", miss
        logger.critical("not find %s" % miss)
        #print "stop move saz"
        if saz_name not in failed_list:
            failed_list.append(saz_name)
        # if not check:
        #     shutil.rmtree(dest_dir)
        return


    if saz_name not in failed_list:
        if saz_name not in success_list:
            success_list.append(saz_name)
    if not check:
        #print "move:"
        #print saz_file
        #print "to:"
        #print dest_dir
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        for key in copy_dict:
            shutil.copy(key, copy_dict[key])
        index = saz_name.find("__")
        target_name = "%s%s.saz"%(cve_number, saz_name[index+1:])
        #target_name = "%s__%s__%s.saz" % (cve_number, temp[1], temp[2])
        target_saz = os.path.join(dest_dir, target_name)
        #shutil.copy(saz_file, target_saz)
        shutil.move(saz_file, target_saz)
    shutil.rmtree(module_dir) # remove tmep dir

def check_dir(input_dir, result_dir, check=True):
    if check:
        print "-----------------execute check------------------------------------"
        logger.info("-----------------execute check------------------------------------")
    else:
        print "-----------------execute check and extract------------------------"
        logger.info("-----------------execute check and extract------------------------")
    if not os.path.exists(input_dir):
        print "not find %s" % input_dir
        return False
    for root, dirs, files in os.walk(input_dir):
        for file in files:
            file = os.path.join(root, file)
            check_saz(file, result_dir, check)
    print "\n"
    print "-------------------------------result-----------------------------"
    logger.info("-------------------------------result-----------------------------")
    print "success list:"
    result_file.write("success list:\n")
    logger.info("success list")
    for str in success_list:
        print str
        logger.info(str)
        result_file.write(str + "\n")
    print "\nfailed list:"
    result_file.write("\nfailed list:\n")
    logger.info("failed list")
    for str in  failed_list:
        print str
        result_file.write(str + "\n")
        logger.info(str)
    print "\nnot find config list:\n"
    result_file.write("\nnot find config list:\n")
    logger.info("not find config list")
    for str in  missed_list:
        print str
        result_file.write(str + "\n")
        logger.info(str)
    print "\ncheck the log for more detail information"

def run(argv):
    if len(argv) > 1:
        arg = argv[1]
        if arg == "check":
            #print "try"
            check_dir(SAZ_ROOT, RESULT_DIR, True)


        elif arg == "extract":
            #print "extract"
            check_dir(SAZ_ROOT, RESULT_DIR, False)

        else:
            print "unknown parameter %s,please input check or extract" % arg
        sys.exit(0)
    check_dir(SAZ_ROOT, RESULT_DIR, True)
if "__main__" == __name__ :
    #print len(sys.argv)
    #print sys.argv
    run(sys.argv)
    #print init_cfg.getModulePattern("adobe_flash_pcre")

