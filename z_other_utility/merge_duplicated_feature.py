import time
import os
import shutil
import hashlib
import sys

class MergeLabel:
    def __init__(self):
        self.feature_set = {}
        self.repetition_dir = r".\repetition"
        self.src_file = None
        self.dst_file = None
        self.mergeflag = True
        if self.mergeflag is False:
            if os.path.exists(self.dst_file):
                os.remove(self.dst_file)
            if os.path.exists(self.repetition_dir):
                if os.listdir(self.repetition_dir) is not None:
                    shutil.rmtree(self.repetition_dir)
                    os.makedirs(self.repetition_dir)
                    os.chmod(self.repetition_dir, 0o777)
            else:
                os.makedirs(self.repetition_dir)
                os.chmod(self.repetition_dir, 0o777)
        else:
            if os.path.exists(self.repetition_dir) is None:
                os.makedirs(self.repetition_dir)
                os.chmod(self.repetition_dir, 0o777)

    def lineinfile(self,PATH):
        file = open(PATH)
        for line in file:
            line_split0 = line.split('#')[0]
#            line_split1 = line.split('#')[1]
            line_label_tmp = line_split0.split(' ',1)[0]
            line_feature_tmp = line_split0.split(' ',1)[1]
            line_label = int(line_label_tmp.strip())
            line_feature = line_feature_tmp.strip()
            print line_label,line_feature
#            line_feature_ = line_feature.replace(':','_')
            line_feature_sha1 = hashlib.sha1(line_feature).hexdigest()
            if line_feature_sha1 not in self.feature_set.keys():
                self.feature_set[line_feature_sha1] = 1
                with open(self.dst_file, 'ab+') as fh:
                    fh.writelines(line )
            else:
                self.feature_set[line_feature_sha1] += 1
            line_feature_path = os.path.join(self.repetition_dir, line_feature_sha1 + '.txt')
            with open(line_feature_path, 'ab+') as fh:
                fh.writelines(line)

    def delete_oneline(self,DIR):
        for file_name_tmp in os.listdir(DIR):
            file_name = file_name_tmp.split('.txt')[0]
            if file_name in self.feature_set.keys():
                if self.feature_set[file_name] == 1:
                    os.remove(os.path.join(DIR,file_name_tmp))

help_msg="""
    Usage:
        python merge_duplicated_feature.py srcfile dstfile repetition_dir
    Note:
        1.srcfile is a file ,which may have the samples with the same features
        
"""

if __name__ == '__main__':
    starttime = time.time()
    mergelabel = MergeLabel()
#    mergelabel.src_file = "training_set.txt"
    mergelabel.dst_file = "training_set_result.txt"
    mergelabel.repetition_dir = r".\repetition"
    mergelabel.src_file = sys.argv[1]
    mergelabel.dst_file = sys.argv[2]
    mergelabel.repetition_dir = sys.argv[3]
    mergelabel.lineinfile(mergelabel.src_file)
    mergelabel.delete_oneline(mergelabel.repetition_dir)
    endtime = time.time()
    interval_time = endtime - starttime
    print "interval time is %f " % (interval_time)







