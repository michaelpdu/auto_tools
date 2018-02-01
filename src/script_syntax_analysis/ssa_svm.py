import ssa
from sklearn.externals import joblib
from pyExcelerator import *
import hashlib
import format_data
from export_csv import *


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
        self.model_path_ = os.path.join(self.root_path_,'ssa_svc_model.pkl_4')


    # def grid_search(self):
    #    # X_digits = pickle.load(open('npdata.pkl', 'rb'))
    #    #y_digits = pickle.load(open('nptarget.pkl', 'rb'))
    #     print '***grid_search***'
    #     tuned_parameters = [{'kernel': ['linear'], 'C': [5, 10, 20, 50]}]
    #     srv = svm.SVC(class_weight='balanced', cache_size=1000)
    #     skf = StratifiedKFold(n_splits=3)
    #     clf = GridSearchCV(srv, tuned_parameters, cv=skf)
    #     clf.fit(self.npd, self.npt)
    #     print "Best parameters set found on development set:"
    #     print clf.best_params_
    #     print clf.best_score_

    def predict(self,target_path,file_type):
        cur_path = os.getcwd()
        os.chdir(self.root_path_)
        self.clf_ = joblib.load(self.model_path_)
        if os.path.isfile(target_path):
            self.predict_single(target_path)
        elif os.path.isdir(target_path):
            self.predict_dir(target_path,file_type)
        os.chdir(cur_path)

    def predict_single(self,file_path):
        data = ssa.process_file(file_path)
        if int(self.clf_.predict([data])[0]) == 1:
            print 'Malicious'
        else:
            print 'Normal'

    def CalcSha1(self,file_path):
        with open(file_path,'rb') as f:
            sha1obj = hashlib.sha1()
            sha1obj.update(f.read())
            hash = sha1obj.hexdigest()
            print(hash)
            return hash

    def is_Html(self,file_path):
        fp = open(file_path, "r")
        content = fp.read()
        fp.close()
        if(re.search(r'<\s*html', content, re.I)or re.search(r'<\s*script', content, re.I) or re.search(r'<\s*body', content, re.I)):
            return True
        else:
            return False

    def predict_dir(self,dir_path,file_type):
        if (file_type == 'html' or file_type == 'js'):
            mal_count = 0
            nor_count = 0
            w = Workbook()
            ws = w.add_sheet('detect_report')
            row=1
            col=0
            ws.write(0,0,'File_Path')
            ws.write(0,1,'File_Type')
            ws.write(0,2,'File_SHA1')
            ws.write(0,3,'Detect_Result')
            for root, dirs, files in os.walk(dir_path):
                print root
                for name in files:
                    file_path=os.path.join(root, name)
                    ws.write(row,col,file_path)
                    col+=1
                    if self.is_Html(file_path):
                        ws.write(row,col,'html')
                        col+=1
                    else:
                        ws.write(row,col,'js')
                        col+=1
                    ws.write(row,col,self.CalcSha1(file_path))
                    col+=1
                    data = ssa.process_file(file_path)
                    if data is not None:
                        predict_test=self.clf_.predict([data])
                        print(predict_test)
                        if int(self.clf_.predict([data])[0]) == 1:
                            mal_count += 1
                            ws.write(row,col,'malicious')
                        else:
                            nor_count += 1
                            ws.write(row,col,'normal')
                    row+=1
                    col=0
            w.save('Detect_Report.xls')
            print "Malicious = %s\nNormal = %s" % (mal_count, nor_count)
        else:
            self.X_digits,self.y_digits=format_data.format_predict_data(dir_path)
            print len(self.y_digits)
            samples=self.clf_.predict(self.X_digits)
            right = sum(samples == self.y_digits)
            print right * 100.00 / len(self.y_digits)
            csv_report = export_csv()
            csv_path = os.path.join(sys.path[0], 'csv_report')
            csv_report.mkdir(csv_path)
            csv_report.sal_res_each_file(dir_path)
            csv_report.svm_label_parse(samples)
            csv_report.csv_svm_sal_print(csv_path)

if __name__ == '__main__':
    ssa_svm=ssa_svm()

    ssa_svm.predict(sys.argv[1],sys.argv[2])
