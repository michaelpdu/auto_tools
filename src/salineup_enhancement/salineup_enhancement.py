 # Author: Feihao Chen / Chengrui Dai(SA)
 # Date: 2016/12/15
 # Modified: 2017/05/12
import os,sys
import csv
import url_rank
from behaviour_report_helper import BehaviourReportHelper
import argparse
import re
import pickle
from sklearn.datasets import load_svmlight_file
from sklearn.externals import joblib

# analysis all .xml in sys.argv[1]
# judge JS confusion and urls order
class MalDetHelper(object):
    """

    """
    def __init__(self):
        self.BRH = BehaviourReportHelper()
        self.output_feature_list = os.path.join(sys.path[0], 'output.list')
        self.output_csv = os.path.join(sys.path[0], 'output.csv')
        self.fea = []
        self.feature_path = os.path.join(sys.path[0], 'feature.list')
        self.svm_model_path = os.path.join(sys.path[0], '../train','svm_model.pkl')
        self.malicious_label = 1
        self.scaler_path = os.path.join(sys.path[0], '../train','scaler.pkl')
        self.sal_file_path = []
        self.sal_file_type = []
        self.sal_sha1 = []
        self.sal_decision = []
        csvfile=file('analysis_log.csv','wb')
        writer=csv.writer(csvfile)
        writer.writerow(['sample-path','obfuscation','URL','rank','SA_decision'])
        csvfile.close()

    def parse_cmd(self,cmd):
        if not cmd:
            print "[ERROR] cmd is empty!"
            exit(-1)
        opt = argparse.ArgumentParser(description="SALineup_enhancement")
        opt.add_argument("target")
        opt.add_argument("--extract-flash-features",action="store",help='extract flash features')
        opt.add_argument("--output", action="store",help='output')
        opt.add_argument("--predict",action="store_true",help='predict')
        opt.add_argument("--classifier", action="store", help='classifier mode')
        options = opt.parse_args(cmd)
        args = {}
        args['target'] = options.target
        if options.extract_flash_features:
            args['extract-flash-features'] = options.extract_flash_features
        if options.output:
            args['output'] = options.output
        if options.predict:
            args['predict'] = True
        if options.classifier:
            args['classifier'] = options.classifier
        return args

    def process(self, cmd='', args={}):
        if not args:
            if not cmd:
                cmd = sys.argv[1:]
            args = self.parse_cmd(cmd)
        if args.has_key('extract-flash-features'):
            if args.has_key('output'):
                self.extract_flash_features(args['extract-flash-features'],args['target'],args['output'])
            else:
                self.extract_flash_features(args['extract-flash-features'], args['target'], self.output_feature_list)
        elif args.has_key('predict'):
            if args.has_key('classifier'):
                if args.has_key('output'):
                    self.predict(args['target'],args['classifier'],args['output'])
                else:
                    self.predict(args['target'], args['classifier'])
            else:
                print "[ERROR] Please choose classifier!"
                exit(-1)
        else:
            self.dir_process(args['target'])

    def extract_flash_features(self,label,folder_path,output,scan_behavior_attr = False):
        with open(self.feature_path) as fp:
            for line in fp.readlines():
                self.fea.append(line.strip('\n'))
        if os.path.exists(output):
            os.remove(output)
        for root, sub_dirs, files in os.walk(folder_path):
            for special_file in files:
                spcial_file_dir = os.path.join(root, special_file)
                print "Extracting:[%s]" % spcial_file_dir
                with open(spcial_file_dir) as source_file:
                    tmp = []
                    result_txt = source_file.read()
                    tmp.append(str(label) + ' ')
                    total_method = re.findall(r'method info count is ([0-9]+)', result_txt)
                    valid_methond = re.findall(r'Total valid method info count is ([0-9]+)', result_txt)
                    total_class = re.findall(r'Total class info count is ([0-9]+)', result_txt)
                    if total_method:
                        total_method = [int(i) for i in total_method]
                    else:
                        total_method = []
                    if valid_methond:
                        valid_methond = [int(i) for i in valid_methond]
                    else:
                        valid_methond = []
                    if total_class:
                        total_class = [int(i) for i in total_class]
                        cnt_class = len(total_class)
                        sum_class = sum([i for i in total_class])
                    else:
                        cnt_class = 0
                        sum_class = 0
                    if ~cnt_class:
                        tmp.append('1:' + str(cnt_class) + ' ')
                    if ~sum_class:
                        tmp.append('2:' + str(sum_class) + ' ')
                    cnt_method = len(total_method) - len(valid_methond)
                    if ~cnt_method:
                        tmp.append('3:' + str(cnt_method) + ' ')
                    for tmp_valid in valid_methond:
                        del total_method[total_method.index(tmp_valid)]
                    sum_method = sum([i for i in total_method])
                    if ~sum_method:
                        tmp.append('4:' + str(sum_method) + ' ')
                    cnt_valid = len(valid_methond)
                    sum_valid = sum([i for i in valid_methond])
                    if ~cnt_valid:
                        tmp.append('5:' + str(cnt_valid) + ' ')
                    if ~sum_valid:
                        tmp.append('6:' + str(sum_valid) + ' ')
                    class_smaller_re = re.findall(r'class info count smaller than ([0-9]+)', result_txt)
                    if class_smaller_re:
                        class_smaller = class_smaller_re[0]
                        tmp.append('7:' + class_smaller + ' ')
                    else:
                        class_smaller = 0
                    class_larger_re = re.findall(r'class info count larger than ([0-9]+)', result_txt)
                    if class_larger_re:
                        class_larger = class_larger_re[0]
                        tmp.append('8:' + class_larger + ' ')
                    else:
                        class_larger = 0
                    method_larger_re = re.findall(r'method info count larger than ([0-9]+)', result_txt)
                    if method_larger_re:
                        method_larger = method_larger_re[0]
                        tmp.append('9:' + method_larger + ' ')
                    else:
                        method_larger = 0
                    valid_method_larger_re = re.findall(r'valid method info count larger than([0-9]+)', result_txt)
                    if valid_method_larger_re:
                        valid_method_larger = valid_method_larger_re[0]
                        tmp.append('10:' + valid_method_larger + ' ')
                    else:
                        valid_method_larger = 0
                    big_size_re = re.findall(r'Find big size string, length = ([0-9]+)', result_txt)
                    if big_size_re:
                        big_size = big_size_re[0]
                        tmp.append('11:' + big_size + ' ')
                    else:
                        big_size = 0
                    hex_rate_re = re.findall(r'hex rate in string =([0-9]+)', result_txt)
                    if hex_rate_re:
                        hex_rate = hex_rate_re[0]
                        tmp.append('12:' + hex_rate + ' ')
                    else:
                        hex_rate = 0
                    ana_cnt_re = re.findall(r'End to analyze one swf, count = ([0-9]+)', result_txt)
                    if ana_cnt_re:
                        ana_cnt = ana_cnt_re[-1]
                        tmp.append('13:' + ana_cnt + ' ')
                    else:
                        ana_cnt = 0
                    cnt_heap_spary = result_txt.count('heap spray')
                    if cnt_heap_spary != 0:
                        tmp.append('14:' + str(cnt_heap_spary * 10) + ' ')
                    for i in range(13, len(self.fea)):
                        cnt_tmp = result_txt.count(self.fea[i])
                        if cnt_tmp != 0 and i == 35:
                            tmp.append(str(i + 2) + ':' + str(cnt_tmp * 10) + ' ')
                            continue
                        if cnt_tmp != 0:
                            tmp.append(str(i + 2) + ':' + str(cnt_tmp) + ' ')
                    tmp = ''.join(tmp).rstrip()
                    with open(output, 'a') as out:
                        out.writelines(tmp)
                        out.write('\n')
                if scan_behavior_attr:
                    self.scan_behavior(spcial_file_dir,special_file)

    def predict(self,folder_path,classifier,output=False):
        if classifier == 'svm':
            if os.path.exists(self.output_feature_list):
                os.remove(self.output_feature_list)
            self.extract_flash_features(self.malicious_label,folder_path,self.output_feature_list,output)
            scaler = pickle.load(open(self.scaler_path, 'rb'))
            predict_x, predict_y = load_svmlight_file(self.output_feature_list, len(self.fea) + 1)
            predict_x = predict_x.todense()
            predict_x = scaler.transform(predict_x)
            clf = joblib.load(self.svm_model_path)
            result = clf.predict(predict_x)
            match = sum(result == predict_y)
            print "match rate is %.2f%% [%d / %d]" % (match * 100.00 / len(predict_y),match,len(predict_y))
            if output:
                svm_decision = self.parse_label(result)
                self.export_csv_report(svm_decision,self.sal_file_path,self.sal_file_type,self.sal_decision,self.sal_sha1,output)
                print "Report Export Complete! [%s]" % os.path.join(sys.path[0], output)
        else:
            print "[ERROR] no classifier"
            exit(-2)

    def scan_behavior(self,behavior_path,special_file):
        self.BRH.set_xml_file(behavior_path)
        self.BRH.parse_XML()
        self.sal_file_path.append(self.BRH.get_file_path())
        self.sal_file_type.append(self.BRH.get_file_type())
        try:
            behavior_shotname = special_file.split('.')[0]
            behavior_shotname = behavior_shotname.split('_')[1]
            self.sal_sha1.append(behavior_shotname)
        except Exception, e:
            self.sal_sha1.append('Null')
        self.sal_decision.append(self.BRH.get_decision())
        self.BRH.clear()

    def parse_label(self,label):
        result = []
        for each_label in label:
            if each_label == 0.0:
                result.append('Undetermined')
            else:
                result.append('Malicious')
        return result

    def export_csv_report(self,svm_decision,sal_file_path,sal_file_type,sal_decision,sal_sha1,output):
        csv_data = []
        svm_m = 0
        svm_u = 0
        sal_m = 0
        sal_u = 0
        print  "Exporting:..."
        with open(output, 'wb') as csvfile:
            spamwriter = csv.writer(csvfile, dialect='excel')
            spamwriter.writerow(['file_path', 'file_type', 'file_sha1', 'svm_result', 'sal_result'])
            for svm_d, sal_file_p, sal_file_t, sal_d, sha1 in zip(svm_decision, sal_file_path, sal_file_type,sal_decision, sal_sha1):
                tmp = []
                tmp.append(sal_file_p)
                tmp.append(sal_file_t)
                tmp.append(sha1)
                tmp.append(svm_d)
                tmp.append(sal_d)
                if svm_d == 'Malicious':
                    svm_m += 1
                else:
                    svm_u += 1
                if sal_d == 'Malicious':
                    sal_m += 1
                else:
                    sal_u += 1
                csv_data.append(tmp)
            spamwriter.writerows(csv_data)
            spamwriter.writerow('')
            spamwriter.writerow(['Malicious:', '%d(svm_result)' % svm_m, '%d(sal_result)' % sal_m])
            spamwriter.writerow(['Undetermined:', '%d(svm_result)' % svm_u, '%d(sal_result)' % sal_u])

    def url_judge(self,url_list):
        cur_no=0
        cur_url=''
        for url in url_list:
            no=url_rank.analysis_url(url)
            if no>cur_no:
                cur_no=no
                cur_url=url
        if not cur_no:
            cur_no=''
        return [cur_url,cur_no]

    def report_append(self, xml_file):
        self.BRH.set_xml_file(xml_file)
        self.BRH.parse_XML()
        cur_url,cur_no=self.url_judge(self.BRH.get_url_list())
        csvfile=file('analysis_log.csv','ab')
        writer=csv.writer(csvfile)
        writer.writerow([self.BRH.get_file_path(),str(self.BRH.get_obfuscation()),cur_url,str(cur_no),self.BRH.get_decision()])
        csvfile.close()
        self.BRH.clear()

    def dir_process(self,folder_path):
        MDH = MalDetHelper()
        for f in os.listdir(folder_path):
            filepath = os.path.join(folder_path, f)
            try:
                if 'xml' in os.path.splitext(f)[1]:
                    MDH.report_append(filepath)
            except:
                print 'Processing error: ' + f


def print_usage():
    print """
Usage:
    salineup_enhancement.py [-h] [--extract-flash-features label]
                        [--predict] [--classifier CLASSIFIER]
                        [--output OUTPUT]
                        target
    """


def main():
    mdh = MalDetHelper()
    mdh.process()

if __name__ == '__main__':
    main()
