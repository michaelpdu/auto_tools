import os
import re
#RESULT_PATH = 'D:\\result\\'
#rpath = 'C:\\Users\\chengrui_dai\\Desktop\\result\\'
#feature_path = 'D:\\TrainData\\feature'
#output_path = 'D:\\TrainData\\FeatureData'
def CreateData(result_path):
    feature=[]
    feature.append('cve')
    for root, sub_dirs, files in os.walk(result_path):
        for special_file in files:
            spcial_file_dir = os.path.join(root, special_file)
            with open(spcial_file_dir) as source_file:
                result_txt = source_file.read()
                rule = re.findall(r'<rule>(.*?)</rule>', result_txt)
                if rule:
                    for r in rule:
                        if r not in feature:
                            feature.append(r)
    return feature
def ReadFeature(feature_path):
    fea = []
    with open(feature_path) as fp:
        for line in fp.readlines():
            fea.append(line.strip('\n'))
    return fea

def CreateFeature(result_path,fea,output_path):
    for root, sub_dirs, files in os.walk(result_path):
        for special_file in files:
            spcial_file_dir = os.path.join(root, special_file)
            with open(spcial_file_dir) as source_file:
                tmp = []
                result_txt = source_file.read()
                tmp.append('1 ')
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

                sus_num_re = re.findall(r'Find suspicious number, val=([0-9]+)', result_txt)
                if sus_num_re:
                    sus_num = sus_num_re[0]
                    tmp.append('13:' + sus_num + ' ')
                else:
                    sus_num = 0

                ana_cnt_re = re.findall(r'End to analyze one swf, count = ([0-9]+)', result_txt)
                if ana_cnt_re:
                    ana_cnt = ana_cnt_re[-1]
                    tmp.append('14:' + ana_cnt + ' ')
                else:
                    ana_cnt = 0

                cnt_heap_spary = result_txt.count('heap spray')
                if cnt_heap_spary != 0:
                    tmp.append('15:' + str(cnt_heap_spary * 10) + ' ')


                for i in range(14,len(fea)):
                    cnt_tmp = result_txt.count(fea[i])
                    if cnt_tmp != 0 and i==35:
                        tmp.append(str(i+2) + ':' + str(cnt_tmp*10) + ' ')
                        continue
                    if cnt_tmp !=0:
                        tmp.append(str(i + 2) + ':' + str(cnt_tmp) + ' ')
                tmp = ''.join(tmp).rstrip()
                with open(output_path,'a') as out:
                    out.writelines(tmp)
                    out.write('\n')




if __name__ == '__main__':
    fea = ReadFeature(feature_path)
    CreateFeature(rpath,fea)
