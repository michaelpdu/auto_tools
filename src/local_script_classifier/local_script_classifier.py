 # Author: Feihao Chen
 # Date: 2016/12/15

import os,sys
import csv
import subprocess
sys.path.append("..\..")
import utility.behaviour_report_helper as BR
import third_party.wrappers.SALineup_python.pysal as SA

def get_parent_path(path, grade):
    if grade > 0 and path.count('\\') >= grade:
        l = path.split('\\')
        return '\\'.join(l[:0-grade])
    else:
        return path

class xml_analyser(object):
    """

    """
    def __init__(self):
        self.EBF = BR.ExtractBehaviourFeature()
        self.fieldnames = ['name','is_local','decision','rules','/*@cc_on','wscript.shell','shell.application','scripting.filesystemobject',\
'window.xxx','document.xxx','xmlhttp','adodb.stream','getElementsByTagName','getElementById','<div','console','parentNode',\
'window[xxx]','document[xxx]','$.']

    def load_xml_file(self, xml_file):
        self.EBF.clear()
        self.EBF.set_xml_file(xml_file)
        self.EBF.load_behaviour()
        
        self.EBF.append_local_script_feature()
        self.EBF.append_browser_script_feature()
        self.EBF.append_other_features()

    def get_fieldnames(self):
        return self.fieldnames

    def check_local_script_feature(self):
        flag=0
        flag+=self.EBF.get_feature_dict()[r'/*@cc_on']
        flag+=self.EBF.get_feature_dict()['wscript.shell']
        flag+=self.EBF.get_feature_dict()['shell.application']
        flag+=self.EBF.get_feature_dict()['scripting.filesystemobject']
        return True if flag>0 else False

    def check_browser_script_feature(self):
        flag=0
        if self.EBF.get_feature_dict()['\\bwindow\.[a-z0-9]+'] and self.EBF.get_feature_dict()['\\bwindow\.[a-z0-9]+']!='window.eval':
            flag+=1
        if self.EBF.get_feature_dict()['\\bdocument\.[a-z0-9]+']:
            flag+=1
        if self.EBF.get_feature_dict()['\\bwindow\[[a-z0-9]+\]'] and self.EBF.get_feature_dict()['\\bwindow\[[a-z0-9]+\]']!='window[eval]':
            flag+=1
        if self.EBF.get_feature_dict()['\\bdocument\[[a-z0-9]+\]']:
            flag+=1
        flag+=self.EBF.get_feature_dict()['getElementsByTagName']
        flag+=self.EBF.get_feature_dict()['getElementById']
        flag+=self.EBF.get_feature_dict()['<div']
        flag+=self.EBF.get_feature_dict()['\\bconsole\.']
        flag+=self.EBF.get_feature_dict()['parentNode']
        flag+=self.EBF.get_feature_dict()['\s\$\.']
        return True if flag>0 else False

    def is_local_script(self):
        if self.check_local_script_feature() and not self.check_browser_script_feature():
            return True
        else:
            return False

    def report_append(self):
        csvfile=file('report.csv','ab')
        writer=csv.writer(csvfile)
        writer.writerow([\
self.EBF.get_file_path(),
self.is_local_script(),
self.EBF.get_decision(),
self.EBF.get_rules(),
self.EBF.get_feature_dict()[r'/*@cc_on'],
self.EBF.get_feature_dict()['wscript.shell'],
self.EBF.get_feature_dict()['shell.application'],
self.EBF.get_feature_dict()['scripting.filesystemobject'],
self.EBF.get_feature_dict()['\\bwindow\.[a-z0-9]+'],
self.EBF.get_feature_dict()['\\bdocument\.[a-z0-9]+'],
self.EBF.get_feature_dict()['xmlhttp'],
self.EBF.get_feature_dict()['adodb.stream'],
self.EBF.get_feature_dict()['getElementsByTagName'],
self.EBF.get_feature_dict()['getElementById'],
self.EBF.get_feature_dict()['<div'],
self.EBF.get_feature_dict()['\\bconsole\.'],
self.EBF.get_feature_dict()['parentNode'],
self.EBF.get_feature_dict()['\\bwindow\[[a-z0-9]+\]'],
self.EBF.get_feature_dict()['\\bdocument\[[a-z0-9]+\]'],
self.EBF.get_feature_dict()['\s\$\.']])
        csvfile.close()
        self.EBF.clear()

def print_usage():
    print """
Usage:
    python local_script.py script_path/dir
    """

def process_single_script(target_path):
    salineup = SA.PySalHelper()
    salineup.clear_env()
    salineup.process('--productname=sc --script-malware=true --loglevel=debug '+target_path)
    
    XA = xml_analyser()
    cur_path = get_parent_path(sys.path[0],2)
    result_dir = os.path.join(cur_path,'third_party','wrappers','SALineup_python','result')

    last_modified_date = 0
    last_behavior = ''
    for behavior in os.listdir(result_dir):
        behavior_path = os.path.join(result_dir, behavior)
        mtime = os.path.getmtime(behavior_path)
        if (mtime > last_modified_date):
            last_modified_date, last_behavior = mtime, behavior_path
    XA.load_xml_file(last_behavior)
    if XA.is_local_script():
        print '\nIt\'s local script!'
    else:
        print '\nIt\'s not local script!'

# form a csv file to show the features
def process_script_dir(target_path):
    __console__= sys.stdout
    salineup = SA.PySalHelper()
    with open('SAL.log', 'w') as sys.stdout:
        salineup.clear_env()
        salineup.process('--productname=sc --script-malware=true --loglevel=debug '+target_path)
    
    sys.stdout = __console__
    XA = xml_analyser()
    csvfile=file('report.csv','wb')
    writer=csv.writer(csvfile)
    writer.writerow(XA.get_fieldnames())
    csvfile.close()
    cur_path = get_parent_path(sys.path[0],2)
    result_dir = os.path.join(cur_path,'third_party','wrappers','SALineup_python','result')

    for f in os.listdir(result_dir):
        filepath = os.path.join(result_dir, f)
        try:
            if 'xml' in os.path.splitext(f)[1]:
                XA.load_xml_file(filepath)
                XA.report_append()
        except:
            print 'processing error: ' + f

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print_usage()
        exit(-1)

    target_path = sys.argv[1]

    if os.path.isfile(target_path):
        process_single_script(target_path)
    else:
        process_script_dir(target_path)
