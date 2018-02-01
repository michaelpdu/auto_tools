# Author = Chengrui Dai(SA)
# Date:2017/05/12
import os
import sys
import argparse
from sklearn import svm
from sklearn.datasets import load_svmlight_file
from sklearn import preprocessing
from sklearn import cross_validation
from sklearn.externals import joblib
import pickle
import time


class ModelTraining():
    def __init__(self):
        self.root_path_ = os.path.split(os.path.realpath(__file__))[0]
        self.x_train = None
        self.y_train = None
        self.x_train_model = None
        self.y_train_model = None
        self.x_test_model = None
        self.y_test_model = None
        self.topk = 3
        self.model_dict = {}
        self.rank = ['A','B','C','D','E','F','G','H']
        self.svm_model_path = os.path.join(self.root_path_,'svm_model.pkl')
        self.statistics_path = os.path.join(self.root_path_,'statistics')
        self.clear_env()

    def clear_env(self):
        for i in self.rank:
            if os.path.exists('model-' + i):
                os.remove('model-' + i)
        if os.path.exists(self.statistics_path):
            os.remove(self.statistics_path)

    def parse_cmd(self,cmd):
        if not cmd:
            print "[ERROR] cmd is empty!"
            exit(-1)
        opt = argparse.ArgumentParser(description="model_training")
        opt.add_argument("target")
        opt.add_argument("--classifier", action="store", help='classifier mode')
        options = opt.parse_args(cmd)
        args = {}
        args['target'] = options.target
        if options.classifier:
            args['classifier'] = options.classifier
        return args

    def process(self, cmd='', args={}):
        if not args:
            if not cmd:
                cmd = sys.argv[1:]
            args = self.parse_cmd(cmd)
        if args.has_key('classifier'):
            self.train(args['classifier'],args['target'])
        else:
            print "[ERROR] no classifier!"
            exit(-1)

    def train(self,classifier,train_list):
        start = time.clock()
        if classifier == "svm":
            self.x_train,self.y_train = load_svmlight_file(train_list)
            self.x_train = self.x_train.todense()
            k_fold = cross_validation.KFold(len(self.x_train), n_folds=10, shuffle=True)
            clf = svm.SVC(kernel='linear')
            count = 0
            for train_indices, test_indices in k_fold:
                count += 1
                self.x_train_model = self.x_train[train_indices]
                self.y_train_model = self.y_train[train_indices]
                self.x_test_model = self.x_train[test_indices]
                self.y_test_model = self.y_train[test_indices]
                clf.fit(self.x_train_model, self.y_train_model)
                scores = (clf.score(self.x_test_model, self.y_test_model))
                print "cross_validation training[%d]\tscore:[%f]" % (count,scores)
                model_name = self.svm_model_path + str(count)
                joblib.dump(clf, model_name)
                self.model_dict[model_name] = scores
            model_dict_sorted = sorted(self.model_dict.items(),lambda x, y: cmp(x[1], y[1]),reverse=True)
            for i in range(0,len(self.model_dict)):
                if i < self.topk:
                    print "model-[%s] has been saved" % self.rank[i]
                    os.rename(model_dict_sorted[i][0],'model-' + self.rank[i])
                    with open(self.statistics_path, 'a') as st:
                        st.writelines("%s %s" % ('model-' + self.rank[i],model_dict_sorted[i][1]))
                        st.writelines('\n')
                else:
                    os.remove(model_dict_sorted[i][0])
        else:
            print "[ERROR] no classifier"
            exit(-1)
        with open(self.statistics_path, 'a') as st:
            st.writelines("Model_Training_Time %ss" % str(time.clock() - start))
            st.writelines('\n')


def main():
    mt = ModelTraining()
    mt.process()

if __name__ == '__main__':
    main()

