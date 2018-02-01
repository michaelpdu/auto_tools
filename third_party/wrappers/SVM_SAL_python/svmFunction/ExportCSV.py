import os
import csv
import time
#from testLibsvm import *
from sal_res_eachFile import *
MKPATH=".\\CSVResult"
RESULT_PATH = 'E:\\xunleidownload\\data\\data\\'
def mkdir(path):
    path = path.strip()
    path = path.rstrip("\\")
    isExists = os.path.exists(path)
    if not isExists:
        os.makedirs(path)
        print path + ' Create Success!'
        return True
    else:
        print path + ' is already exist!'
        return False
def CSVExport(path,SVMLabel,file_path_res,file_type_res,decision_res,file_sha1):
    CSVName = time.strftime('%Y_%m_%d_%H_%M_%S', time.localtime(time.time()))
    CSVData = []
    cnt = 0.0
    ssa_m = 0
    ssa_u = 0
    sal_m = 0
    sal_u = 0
    with open(path + '\\' + CSVName + '.csv', 'wb') as csvfile:
        spamwriter = csv.writer(csvfile, dialect='excel')
        spamwriter.writerow(['File_Path', 'File_Type', 'File_SHA1','SVM_Result','SAL_Result'])
        for ssa,sal_file_path, sal_file_type, decision, sha1 in zip(SVMLabel,file_path_res,file_type_res,decision_res,file_sha1):
            tmp = []
            tmp.append(sal_file_path)
            tmp.append(sal_file_type)
            tmp.append(sha1)
            tmp.append(ssa)
            tmp.append(decision)
            if ssa==decision:
                cnt = cnt + 1
            if ssa=='Malicious':
            	ssa_m = ssa_m + 1
            else:
            	ssa_u = ssa_u + 1
            if decision=='Malicious':
            	sal_m = sal_m + 1
            else:
            	sal_u = sal_u + 1
            CSVData.append(tmp)
        spamwriter.writerows(CSVData)
        spamwriter.writerow('')
        spamwriter.writerow(['Match Rate:',cnt/len(decision_res),'(%d / %d)' % (cnt,len(decision_res))])
        spamwriter.writerow(['Malicious:','%d(Svm result)' % ssa_m,'%d(SAL result)' % sal_m])
        spamwriter.writerow(['Undetermined:','%d(Svm result)' % ssa_u,'%d(SAL result)' % sal_u])


if __name__ == '__main__':
    mkdir(MKPATH)
    (file_path_res, file_type_res, decision_res,file_sha1) = sal_res_eachFile(RESULT_PATH)
    #LabelList = SVMCreate()

    CSVExport(MKPATH, decision_res,file_path_res,file_type_res,decision_res,file_sha1)

