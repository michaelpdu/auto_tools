import os
import ssa
import numpy as np
import pickle
from sklearn.externals import joblib
from sklearn import *
from pyExcelerator import *
import format_data
class ssa_svm:
    def __init__(self):
        self.root_path_ = os.path.split(os.path.realpath(__file__))[0]
        self.data = []
        self.target = []
        self.mal_vector=[]
        self.nor_vector=[]
        self.npd = None
        self.npt = None
        self.npd_test = None
        self.npt_test = None
        self.clf_ = None
        self.X_digits=None
        self.y_digits=None
        self.X_digits_train_model=None
        self.y_digits_train_model=None
        self.X_digits_test_model=None
        self.y_digits_test_model=None
        self.scaler = None
        self.model_path_ = os.path.join(self.root_path_,'ssa_svc_model.pkl')

    def learning(self,m_path_list,n_path_list,file_type):
        if (file_type == 'html' or file_type == 'js'):
            self.collect_vector(m_path_list,n_path_list)
            #cmd = r"kernel='linear', C=50, class_weight='balanced', cache_size=1000"
            self.k_fold_training(True,file_type)


        else:
            X_digits,y_digits,scaler=format_data.format_train_data(m_path_list,n_path_list)
            self.X_digits=X_digits
            self.y_digits=y_digits
            self.scaler = scaler
            self.k_fold_training(True,file_type)


    def collect_vector(self,m_path_list,n_path_list):
        mal_vector = ssa.process_dir(m_path_list)
        nor_vector = ssa.process_dir(n_path_list)
        self.data = mal_vector
        self.target = [1]*len(mal_vector)
        self.data.extend(nor_vector)
        print len(self.data)
        self.target.extend([0]*len(nor_vector))
        print len(self.target)

        X_digits = np.array(self.data, dtype=np.float64, order='C')
        y_digits = np.array(self.target, dtype=np.float64, order='C')

        self.X_digits=X_digits
        self.y_digits=y_digits
        pickle.dump(self.X_digits, open(r'X_digits.pkl', 'wb'),-1)
        pickle.dump(self.y_digits, open(r'y_digits.pkl', 'wb'),-1)


    def k_fold_training(self,shuffle,file_type):
        i = 0
        self.X_digits = pickle.load(open('X_digits.pkl', 'rb'))
        self.y_digits = pickle.load(open('y_digits.pkl', 'rb'))
        k_fold = cross_validation.KFold(len(self.X_digits), n_folds=10,shuffle=shuffle)
        for train_indices, test_indices in k_fold:
            print('Train: %s | test: %s' % (train_indices, test_indices))
        if (file_type == 'html' or file_type == 'js'):
            clf = svm.SVC(kernel='linear', class_weight={0:30})
        else:
            clf = svm.SVC(kernel='linear', class_weight={0:40})
        maxscores=0.0
        for train_indices, test_indices in k_fold:
            print(train_indices)
            print(test_indices)
            self.X_digits_train_model=self.X_digits[train_indices]
            self.y_digits_train_model=self.y_digits[train_indices]
            self.X_digits_test_model=self.X_digits[test_indices]
            self.y_digits_test_model=self.y_digits[test_indices]
            self.dump_model()
            self.load_model()
            clf.fit(self.npd, self.npt)
            scores=(clf.score(self.npd_test,self.npt_test))
            print(scores)
            if scores>=maxscores:
                joblib.dump(clf, r'ssa_svc_model.pkl' + '_' + str(i))
                i = i + 1
                print(self.X_digits_train_model)
                print(self.y_digits_train_model)
                maxscores=scores

    def dump_model(self):
        pickle.dump(self.X_digits_train_model, open(r'npdata.pkl', 'wb'),-1)
        pickle.dump(self.y_digits_train_model, open(r'nptarget.pkl', 'wb'),-1)
        pickle.dump(self.X_digits_test_model, open(r'npdata_test.pkl', 'wb'),-1)
        pickle.dump(self.y_digits_test_model, open(r'nptarget_test.pkl', 'wb'),-1)


    def load_model(self):
        self.npd = pickle.load(open('npdata.pkl', 'rb'))
        self.npt = pickle.load(open('nptarget.pkl', 'rb'))
        self.npd_test = pickle.load(open('npdata_test.pkl', 'rb'))
        self.npt_test = pickle.load(open('nptarget_test.pkl', 'rb'))



if __name__ == '__main__':

    ssa_svm=ssa_svm()

    ssa_svm.learning(sys.argv[1],sys.argv[2],sys.argv[3])

