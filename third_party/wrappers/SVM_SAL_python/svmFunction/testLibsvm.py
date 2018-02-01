# -*- coding: utf-8 -*-
import os
from CreateData import *
#os.chdir('E:\\md_auto_tools\md_auto_tools\\third_party\wrappers\\SALineup_python\\TrainData')
from svmutil import *

def SVMCreate(data_path,model_path):
    y, x = svm_read_problem(data_path)  # 读入训练数据
    #yt, xt = svm_read_problem('E:\\md_auto_tools\md_auto_tools\\third_party\wrappers\\SALineup_python\\TrainData\\test.1')  # 训练测试数据
    #m = svm_train(y, x)  # 训练
    m = svm_load_model(model_path)
    p_label, p_acc, p_vals = svm_predict(y, x, m)  # 测试

    #p_label, p_acc, p_vals = svm_predict(yt, xt, m)  # 测试
    b_label = []
    for label in p_label:
    	if label == 0.0:
    		b_label.append('Undetermined')
    	else:
    		b_label.append('Malicious')


    return b_label

if __name__ == '__main__':
    SVMCreate('E:\\md_auto_tools\\md_auto_tools\\third_party\\wrappers\\SAL_SVM_python\\TrainData\\FeatureData','E:\\md_auto_tools\\md_auto_tools\\third_party\\wrappers\\SAL_SVM_python\\TrainData\\Svm_0426.model')


