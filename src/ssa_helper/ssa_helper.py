# Author = Chengrui Dai(SA)
import yara
import subprocess
import os
import argparse
import sys
import csv
import hashlib
import time
from sklearn import svm
from sklearn.datasets import load_svmlight_file
from sklearn import preprocessing
from sklearn import cross_validation
from sklearn.externals import joblib

class SSAHelper(object):
    """

    """
    def __init__(self):
        self.root_path_ = os.path.split(os.path.realpath(__file__))[0]
        #self.feature_length = 128
        self.feature_length = 1000
        self.feature_list = r'feature_list'
        self.yara_path = r'ssa_rules.yar'
        self.deobfuscate = r'node feature_extractor.js '
        self.topk = 3
        self.rank = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        self.statistics_path = os.path.join(self.root_path_, 'statistics')
        self.predict_label = 1
        self.predict_list = r'predict_list'
        self.file_path = []
        self.file_sha1 = []
        self.file_type = 'html/javascript'
        self.clear_env()

    def clear_env(self):
        if os.path.exists(self.feature_list):
            os.remove(self.feature_list)
        if os.path.exists(self.predict_list):
            os.remove(self.predict_list)

    def parse_cmd(self,cmd):
        if not cmd:
            print "[ERROR] cmd is empty!"
            exit(-1)
        opt = argparse.ArgumentParser(description="SSA Helper")
        opt.add_argument("target")
        opt.add_argument("--extract-js-features",action="store",help='extract js features')
        opt.add_argument("--output", action="store",help='output')
        opt.add_argument("--predict",action="store_true",help='predict')
        opt.add_argument("--classifier", action="store", help='classifier mode')
        options = opt.parse_args(cmd)
        args = {}
        args['target'] = options.target
        if options.extract_js_features:
            args['extract-js-features'] = options.extract_js_features
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
        if args.has_key('extract-js-features'):
            if args.has_key('output'):
                self.extract_js_features(args['extract-js-features'],args['target'],args['output'])
            else:
                self.extract_js_features(args['extract-js-features'], args['target'], self.feature_list)
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
            print "[ERROR] Please Check Parameter"
            exit(-1)

    def extract_js_features(self,label,folder_path,output):
        if os.path.isfile(folder_path):
            self.file_path.append(folder_path)
            self.file_sha1.append(self.cal_sha1(folder_path))
            self.extract_js_features_file(label,folder_path,output)
            return
        for root, sub_dirs, files in os.walk(folder_path):
            for special_file in files:
                spcial_file_dir = os.path.join(root, special_file)
                self.file_path.append(spcial_file_dir)
                self.file_sha1.append(self.cal_sha1(spcial_file_dir))
                self.extract_js_features_file(label,spcial_file_dir,output)

    def extract_js_features_file(self,label,file_path,output):
        print "Extracting:[%s]" % file_path
        with open(output, 'a') as fl:
            fl.writelines(str(label) + ' ')
        rules = yara.compile(self.yara_path)
        matches = rules.match(file_path)
        for m in matches:
            with open(output, 'a') as fl:
                fl.writelines(str(m.meta['index']) + ':1 ')

        cmd = self.deobfuscate + file_path
        node_pro = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        cout = node_pro.communicate()
        if cout[0].rstrip() != "undefined":
            matches = rules.match(data=cout[0].rstrip())
            for m in matches:
                with open(output, 'a') as fl:
                    fl.writelines(str(m.meta['index'] + self.feature_length) + ':1 ')
        else:
            with open(output, 'a') as fl:
                for i in range(1, self.feature_length + 1):
                    fl.writelines(str(i + self.feature_length) + ':1 ')

        with open(output, 'a') as fl:
            fl.writelines('# ' + file_path)
            fl.writelines('\n')

    def parse_label(self,label):
        result = []
        for each_label in label:
            if int(each_label) == 0:
                result.append('Undetermined')
            else:
                result.append('Malicious')
        return result

    def cal_sha1(self,file_path):
        with open(file_path,'rb') as f:
            sha1obj = hashlib.sha1()
            sha1obj.update(f.read())
            hash1 = sha1obj.hexdigest()
            return hash1

    def predict(self,folder_path,classifier,output=False):
        if classifier == 'svm':
            with open(self.statistics_path, 'a') as st:
                st.writelines("\n====================================\n")
                st.writelines("Predicting Time: ")
                st.writelines(time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(time.time())))
                st.writelines('\n')
            self.extract_js_features(self.predict_label,folder_path,self.predict_list)
            predict_x, predict_y = load_svmlight_file(self.predict_list, 2 * self.feature_length)
            predict_x = predict_x.todense()
            for i in range(0,self.topk):
                model_path = 'model-' + self.rank[i]
                clf = joblib.load(model_path)
                start = time.clock()
                result = clf.predict(predict_x)
                end = time.clock()
                match = sum(result == predict_y)
                print "[%s] match rate is %.2f%% [%d / %d]" % (model_path,match * 100.00 / len(predict_y),match,len(predict_y))
                with open(self.statistics_path,'a') as st:
                    st.writelines("%s %.2f%% %d/%d %ss" % (model_path,match * 100.00 / len(predict_y),match,len(predict_y),str(end-start)))
                    st.writelines('\n')
                if output:
                    svm_decision = self.parse_label(result)
                    self.export_csv_report(svm_decision,self.file_path,self.file_sha1,model_path + output)
                    print "Report Export Complete! [%s]" % os.path.join(sys.path[0], model_path + output)
        else:
            print "[ERROR] no classifier"
            exit(-2)

    def export_csv_report(self,svm_decision,file_path,file_sha1,output):
        csv_data = []
        with open(output, 'wb') as csvfile:
            spamwriter = csv.writer(csvfile, dialect='excel')
            spamwriter.writerow(['file_path', 'file_type', 'file_sha1', 'svm_result'])
            for svm_d, file_p, file_s in zip(svm_decision,file_path,file_sha1):
                tmp = []
                tmp.append(file_p)
                tmp.append(self.file_type)
                tmp.append(file_s)
                tmp.append(svm_d)
                csv_data.append(tmp)
            spamwriter.writerows(csv_data)


def print_usage():
    print """
Usage:
    ssa_helper.py [-h] [--extract-js-features label]
                        [--output OUTPUT]
                        target
    """


def main():
    ssh = SSAHelper()
    ssh.process()

if __name__ == '__main__':
    main()

