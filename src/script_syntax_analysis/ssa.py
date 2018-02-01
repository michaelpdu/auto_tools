# auther = Cheng Chang(SA)
# Date = 2017/4/7
import os
import sys
import subprocess

ssa_path = os.path.split(os.path.realpath(__file__))[0]

def work(target_path):
    if os.path.isfile(target_path):
        process_file(target_path)
    elif os.path.isdir(target_path):
        process_dir(target_path)

def process_dir(dir_path):
    data = []
    for root, dirs, files in os.walk(dir_path):
        print root
        for name in files:
            l = process_file(os.path.join(root, name))
            if l is not None:
                data.append(l)
    return data

def process_file(filename):
    cur_path = os.getcwd()
    os.chdir(ssa_path)
    cmd = r"node feature_extractor.js %s" % filename
    node_pro = subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    cout = node_pro.communicate()
    os.chdir(cur_path)
    # process result
    result = []
    if cout[1]=='':
        cout = cout[0].strip("[]\n ")
        try:
            for ele in cout.split(",\n "):
                ele=int(ele)
                if ele ==0 or ele ==1:
                    result.append(ele)
                else:
                    print "ERROR!" + filename
                    return None
            return result
        except Exception as e:
            print "[ERROR1] " + filename
            print e
    else:
        print "[ERROR2] " + filename
        print cout[1]

def print_help():
    print """
Usage:
    python ssa.py target_file
    """

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print_help()
        exit(0)
    if not os.path.exists(sys.argv[1]):
        print 'target file not exists'
        exit(0)
    work(sys.argv[1])