 # Author: Feihao Chen / Chengrui Dai(SA)
 # Date: 2016/12/15
 # Modified: 2017/05/12

import re
import xml.etree.cElementTree as ET

class BehaviourReportHelper(object):
    """

    """
    def __init__(self,xml_file = ''):
        self.xml_file = xml_file
        self.root = None
        self.file_path = ''
        self.sha1 = ''
        self.decision = ''
        self.rules = ''
        self.behaviour = ''
        self.feature_dict = {}
        self.is_local = False
        self.obfuscation = False
        self.url_list = []
        self.file_type = ''

    def clear(self):
        self.xml_file = ''
        self.root = None
        self.file_path = ''
        self.sha1 = ''
        self.decision = ''
        self.rules = ''
        self.behaviour = ''
        self.feature_dict = {}
        self.is_local = False
        self.obfuscation = False
        self.url_list = []
        self.file_type = ''

    def set_xml_file(self, xml_file):
        self.xml_file = xml_file

    def parse_XML(self):
        #print "Parsing:[%s]" % self.xml_file
        try:
            tree = ET.parse(self.xml_file)
        except Exception:
            with open(self.xml_file) as source_file:
                result_txt = source_file.read()
                file_path = re.findall(r'<file_path>(.*?)</file_path>', result_txt)
                if file_path:
                    self.file_path = file_path[0]
                else:
                    self.file_path = "NULL"
                file_type = re.findall(r'<file_type>(.*?)</file_type>', result_txt)
                if file_type:
                    self.file_type = file_type[0]
                else:
                    self.file_type = "NULL"
                decision = re.findall(r'<decision>(.*?)</decision>', result_txt)
                if decision:
                    self.decision = decision[0]
                else:
                    self.decision = "NULL"
            return
        self.root = tree.getroot()
        self.parse_base_info()
        self.parse_internal()

    def parse_base_info(self):
        for e in self.root:
            if e.tag == 'file_path':
                self.file_path = e.text
            elif e.tag == 'sha1':
                self.sha1 = e.text
            elif e.tag == 'decision':
                self.decision = e.text
            elif e.tag == 'matched_rules':
                self.rules = ';'.join(x.text for x in e)
            elif e.tag == 'file_type':
                self.file_type = e.text

    def parse_internal(self):
        self.extract_behavior()
        # judge whether it's a local script
        if self.check_local_script_feature() and not self.check_browser_feature():
            self.is_local = True
        self.other_features()
        # judge whether obfuscation exists
        if self.feature_dict.has_key('\\bwindow\.[a-z0-9]+'):
            if 'window.eval' == self.feature_dict['\\bwindow\.[a-z0-9]+']:
                self.obfuscation = True
        # drag URLs out
        self.count_url()

    def extract_behavior(self):
        label=0
        for e in self.root:
            if e.tag == 'evidence':
                if e.attrib['type']=='javascript' and '// This is JS Runtime file' in e[2].text:
                    label=1
                    continue
                if e.attrib['type']=='javascript_behaviour' and label==1:
                    label=0
                    continue
                self.behaviour = self.behaviour + e[-1].text.lower()

    def add_feature_exists(self,feature):
        self.feature_dict[feature] = 1 if re.search(feature,self.behaviour)!=None else 0

    def add_feature_matched(self,feature):
        self.feature_dict[feature] = ';'.join(set(re.findall(feature,self.behaviour)))

    def check_local_script_feature(self):
        self.add_feature_exists(r'/*@cc_on')
        self.add_feature_exists('wscript.shell')
        self.add_feature_exists('shell.application')
        self.add_feature_exists('scripting.filesystemobject')
        flag=0
        flag+=self.feature_dict[r'/*@cc_on']
        flag+=self.feature_dict['wscript.shell']
        flag+=self.feature_dict['shell.application']
        flag+=self.feature_dict['scripting.filesystemobject']
        return True if flag>0 else False

    def check_browser_feature(self):
        self.add_feature_matched('\\bwindow\.[a-z0-9]+')
        self.add_feature_matched('\\bdocument\.[a-z0-9]+')
        self.add_feature_matched('\\bwindow\[[a-z0-9]+\]')
        self.add_feature_matched('\\bdocument\[[a-z0-9]+\]')
        self.add_feature_exists('getElementsByTagName')
        self.add_feature_exists('getElementById')
        self.add_feature_exists('<div')
        self.add_feature_exists('\\bconsole\.')
        self.add_feature_exists('parentNode')
        self.add_feature_exists('\s\$\.')
        flag=0
        if self.feature_dict['\\bwindow\.[a-z0-9]+'] and self.feature_dict['\\bwindow\.[a-z0-9]+']!='window.eval':
            flag+=1
        if self.feature_dict['\\bdocument\.[a-z0-9]+']:
            flag+=1
        if self.feature_dict['\\bwindow\[[a-z0-9]+\]'] and self.feature_dict['\\bwindow\[[a-z0-9]+\]']!='window[eval]':
            flag+=1
        if self.feature_dict['\\bdocument\[[a-z0-9]+\]']:
            flag+=1
        flag+=self.feature_dict['getElementsByTagName']
        flag+=self.feature_dict['getElementById']
        flag+=self.feature_dict['<div']
        flag+=self.feature_dict['\\bconsole\.']
        flag+=self.feature_dict['parentNode']
        flag+=self.feature_dict['\s\$\.']
        return True if flag>0 else False

    def other_features(self):
        self.add_feature_exists('xmlhttp')
        self.add_feature_exists('adodb.stream')

    def count_url(self):
        line_list=self.root[-1][-1].text.split('\n')
        for line in line_list[2:]:
            if line.find(' URL =')!=-1:
                start=line.find(' URL =')+7
                if line[start:start+4]=='http':
                    start=start+7              #pass http://
                    end=line.find('/',start)     
                    if end ==-1:
                        end=line.find('\"',start)
                else:           #other url
                    end=line.find('\"',start)
                self.url_list.append(line[start:end])

    def get_file_path(self):
        return self.file_path

    def get_sha1(self):
        return self.sha1

    def get_decision(self):
        return self.decision

    def get_rules(self):
        return self.rules

    def get_feature_dict(self):
        return self.feature_dict

    def get_is_local(self):
        return self.is_local

    def get_obfuscation(self):
        return self.obfuscation

    def get_url_list(self):
        return self.url_list

    def get_file_type(self):
        return self.file_type
