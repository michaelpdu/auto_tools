import sys,os,copy
def init_conf(path):
    file = open(path)
    global module_dict
    count = 0
    cur_module = ""
    module = None
    for line in file.readlines():
        count += 1
        if line.startswith("#"):
            continue
        line = line.strip()
        if len(line) == 0:
            continue
        index = line.find(":")
        temp = []
        temp.append(line[:index].strip())
        temp.append(line[index+1:].strip())
        if temp[0] == "module":

            if temp[1] in module_dict:
                print "repeat module name at line %d " % count
                sys.exit(0)
            else:
                if cur_module:
                    check(module_dict[cur_module], cur_module)
                cur_module = temp[1]
                module_dict[temp[1]] = {}
                module = module_dict[temp[1]]
        elif temp[0] == "CVE":
            CVE = temp[1].split(",")
            module["CVE"] = []
            for str in CVE:
                str = str.strip()
                module["CVE"].append(str)
        elif temp[0] == "file":
            file = temp[1].split(",")
            module["file"] = []
            for str in file:
                str = str.strip()
                if len(str) > 0: # the file vlaue may be ""
                    module["file"].append(str)
        elif temp[0] == "pattern":
            module["pattern"] = temp[1].strip()
        else:
            print "unknown line %d" % count
            sys.exit(0)
    #print module_dict

def check(module, module_name):
    incomplete = False
    if "CVE" not in module:
        incomplete = True
    if "pattern" not in module:
        incomplete = True
    if "file" not in module:
        incomplete = True
    if incomplete:
        print "incomplete module %s" % module_name
        sys.exit(0)

def getCveNumber(module_name):
    global module_dict
    try:
        CVE = module_dict[module_name]["CVE"][0]
        return CVE
    except Exception,e:
        logfile = open(r"log\log_msf_info.log", 'a')
        logfile.write('msf_info.cfg, can not find :'+module_name+'\n')
        logfile.close()
        return False
def getFileList(module_name):
    global module_dict
    try:
        file_list = module_dict[module_name]["file"]
        return copy.copy(file_list)
    except Exception,e:
        logfile = open(r"log\log_msf_info.log", 'a')
        logfile.write('msf_info.cfg, can not find :'+module_name+'\n')
        logfile.close()
        return False

def getModulePattern(module_name):
    global module_dict
    try:
        #pattern = (self.config.get('pattern', (cve_number.strip()))).strip()
        pattern = module_dict[module_name]["pattern"]
        if len(pattern) == 0:
            return False
        return pattern
    except Exception,e:
        logfile = open(r"log\log_match_pattern.log", 'a')
        logfile.write('match_pattern.cfg,can not find :'+module_name+'\n')
        logfile.close()
        return False

module_dict = {}
init_conf("saz_check.cfg")
print 1
