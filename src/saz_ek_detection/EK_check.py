import os,yara
from util.saz_extractor import *
from util.ek_cfg import EKCfg
import time

#support yara but not yara-python,yara is old version and unofficial python interface
#envroment: 64bit win7, 64bit python2.7 , pip install yara (32bit python will cause error )




report_path = "report.txt"
ek_cfg_path = "config/ek_rule.xml"
url_rules_path = "config/url_rules.yara"
file_rules_path = "config/file_rules.yara"
match_log_path = "match_log.txt"


class MatchResult:
    def __init__(self):
        self.domain = None
        self.ek = []

def match_EK(saz_path,temp_dir,match_file=False):
    start_ = time.time()
    saz_extractor = SazExtractor()

    if not saz_extractor.processFile(saz_path, temp_dir):
        raise ValueError("can not extract " + saz_path)
    #print "processFile %s take %s"%(os.path.basename(saz_path), time.time()-start_)
    match_log.write("processFile %s take %s\n"%(os.path.basename(saz_path), time.time()-start_))
    url_dict = saz_extractor.url_dict
    domain_dict = {}
    start_ = time.time()
    for key in url_dict:
        #print "url",key
        domain = get_domain(key)
        if domain not in domain_dict:
            domain_dict[domain] = []
        domain_dict[domain].append(key)
        #print domain
    # domain_dict["test"] = ["aaaaaaaab","bbbbcd","axbdefaqzxdahttp","hello"]
    #print "domain classify take %s"%(time.time()-start_)
    match_result_list = []
    match_start_ = time.time()
    #print domain_dict["g.bing.com"]
    for domain in domain_dict:
        #print domain_dict[domain]
        #print key
        #print "start domain %s at %s"%(key,time.time())

        yara_match_list = _match_url(domain_dict[domain])

        start_ = time.time()

        if match_file:
            file_path_list = []
            url_key = domain_dict[domain]
            for key in url_key:
                path_list = url_dict[key]
                file_path_list.extend(path_list)
            list_ = _match_file(file_path_list)
            yara_match_list.extend(list_)

        match_dict = {}# key-value:ek_name-match
        for yara_match in yara_match_list:
           tag = yara_match["rule"]
           #print domain,tag
           match_log.write("\tdomain %s match yara rule %s\n"%(domain, tag))
           match_list = ek_cfg.get_new_match(tag)
           for match in match_list:
               name = match.name
               if name not in match_dict:
                   match_dict[name] = match
               match_dict[name].check_tag(tag)

        match_re = MatchResult()
        match_re.domain = domain
        for rule_name in match_dict:
           match = match_dict[rule_name]
           if match.is_match():
               match_re.ek.append(match.name)
               match_result_list.append(match_re)

        #print "match domain %s take %s"% (domain, time.time()-start_)
    #print "match %s take %s"%(os.path.basename(saz_path), time.time()-match_start_)
    match_log.write("match %s take %s\n"%(os.path.basename(saz_path), time.time()-match_start_))
    return match_result_list


def _match_url(url_list):
    text = ""
    for url in url_list:
        text = text + url
    matches = url_rules.match(data=text)

    #print matches
    try:
        return matches["main"]
    except KeyError as e:
        if not matches:
            return []
        raise e

def _match_file(file_path_list):
    pass
    temp_path = "temp_.tempfile"
    if os.path.exists(temp_path):
        raise ValueError("Already exists temp file %s,please remove it" % temp_path)
    temp_file = open(temp_path,"w+b")
    for file_path in file_path_list:
        #print file_path
        file = open(file_path,"rb")
        temp_file.write(file.read())
        file.close()

    #zero length will cause exception
    str = temp_file.read(1)
    temp_file.close()
    matches = {}
    if len(str) != 0:
        matches = file_rules.match(filepath=temp_path)


    # if len(matches) >0 :
    #     print matches
    #     print file_path
    os.remove(temp_path)

    try:
        return matches["main"]
    except KeyError as e:
        if not matches:
            return []
        raise e

def get_domain(url):

    url = url.lower()
    if url.startswith("http"):
        index = url.find(r"//")
        url = url[index+2:]
    index = url.find(r"/")
    domain = url[:index]
    return domain

def produce_report(saz_path_list,report_path,match_file=False):
    temp_dir = "temp_.tempdir"#strange name for avoiding duplicate to existed dir
    match_dict = {"unknown":{}}#key-value: ekname-saz_file

    multi_match = {}
    for saz_path in saz_path_list:
        if os.path.isdir(saz_path):
            continue
        if not saz_path.endswith(".saz"):
            continue
        print saz_path
        result = match_EK(saz_path, temp_dir, match_file)
        #deal result,the logic is hard to understand
        #there may be mulit domain in one file, and multi ek in one domain
        name = os.path.basename(saz_path)

        ek_dict = {}#statistc multi ek matched sample
        for match in result:
            for ek in match.ek:
                if ek not in ek_dict:
                    ek_dict[ek] = True
                if ek not in match_dict:

                    match_dict[ek] = {}
                re = match_dict[ek] #key-value: file_name-domain_list
                if name not in re:
                    re[name] = []
                re[name].append(match.domain)
        if len(ek_dict) > 1:
            multi_match[name] = [ek for ek in ek_dict]
        if len(result) == 0:
            match_dict["unknown"][name] = []
    shutil.rmtree(temp_dir)

    report = open(report_path,"w+")
    for ek in match_dict:
        print "%s:"%ek
        report.write("%s:\n"%ek)
        dict_ = match_dict[ek]
        for file in dict_:
            print "\t%s:"%file
            report.write("\t%s:\n"%file)
            domain_list = dict_[file]
            for domain in domain_list:
                print "\t\t%s"%domain
                report.write("\t\t%s\n"%domain)
        print " "
        report.write("\n")
    print "multi_match:"
    report.write("multi_match:\n")
    for key in multi_match:
        print "\t%s"%key
        report.write("\t%s\n"%key)
        for ek in multi_match[key]:
            print "\t\t%s"%ek
            report.write("\t\t%s\n"%ek)

    report.close()
    return match_dict

def run(argv):
    global saz_dir, report_path, ek_cfg_path, url_rules_path, file_rules_path,match_log_path
    file_check = True
    test = False
    if len(argv) == 1:
        print "execute command: python EK_check.py [saz directory]"
        return
    if len(argv) > 1:
        if argv[1] == "test":
            test = True
            saz_dir = "test/saz"
            ek_cfg_path = "test/ek_rule.xml"
            url_rules_path = "test/url_rules.yara"
            file_rules_path = "test/file_rules.yara"
        else:
            saz_dir = argv[1]

    report_path = os.path.join(saz_dir,report_path)
    match_log_path = os.path.join(saz_dir,match_log_path)
    global ek_cfg,url_rules,file_rules,match_log
    match_log = open(match_log_path,"w+")
    start_ = time.time()
    ek_cfg = EKCfg(ek_cfg_path)
    #print "ek_cfg take %s"%(time.time()-start_)
    start_ = time.time()
    url_rules = yara.compile(filepath=url_rules_path)
    #print "yara compile take %s"%(time.time()-start_)
    file_rules = yara.compile(filepath=file_rules_path)

    saz_path_list = []
    for saz in os.listdir(saz_dir):
        saz_path = os.path.join(saz_dir, saz)
        saz_path_list.append(saz_path)

    match_dict = produce_report(saz_path_list, report_path, file_check)
    match_log.close()
    if test:
        if "test_ek" in match_dict:
            print "test success"
        else:
            print "test fail,the test saz should match test_ek"




if __name__ == "__main__":
    run(sys.argv)