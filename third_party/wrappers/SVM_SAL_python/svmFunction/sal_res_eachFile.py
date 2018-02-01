import os
import re
RESULT_PATH = 'E:\\xunleidownload\\data\\data\\'
def sal_res_eachFile(filepath):
    for root, sub_dirs, files in os.walk(filepath):
        file_sha1 = []
        file_path_res = []
        file_type_res = []
        decision_res = []
        for special_file in files:
            try:
                shotname = special_file.split('.')[0]
                shotname = shotname.split('_')[1]
                file_sha1.append(shotname)
            except Exception,e:
                file_sha1.append('Null')
            spcial_file_dir = os.path.join(root, special_file)
            with open(spcial_file_dir) as source_file:
                result_txt = source_file.read()
                file_path = re.findall(r'<file_path>(.*?)</file_path>', result_txt)
                if file_path:
                    file_path_res.append(file_path[0])
                else:
                    file_path_res.append('Null')
                file_type = re.findall(r'<file_type>(.*?)</file_type>', result_txt)
                if file_type:
                    file_type_res.append(file_type[0])
                else:
                    file_type_res.append('Null')
                decision = re.findall(r'<decision>(.*?)</decision>',result_txt)
                if decision:
                    decision_res.append(decision[0])
                else:
                    decision_res.append('Null')

    return file_path_res,file_type_res,decision_res,file_sha1




if __name__ == '__main__':
    sal_res_eachFile(RESULT_PATH)
