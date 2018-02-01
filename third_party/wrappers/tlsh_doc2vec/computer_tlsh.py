import os,sys
import tlsh
import collections
import shutil
import time

class UseTlsh:
    def __init__(self):
        self.nor_feature_file = "/home/jiawei/use_tlsh/nor_feature_file.txt"
        self.mal_feature_file = "/home/jiawei/use_tlsh/mal_feature_file.txt"
        self.nor_split_rate = 0.7
        self.mal_split_rate = 0.7
        self.mal_sample_path = "/home/sa_sample_set/train_test/mal_set"
        self.nor_sample_path = "/home/sa_sample_set/train_test/nor_set"
        self.train_file_path = "/home/jiawei/use_tlsh/"
        self.test_file_path = "/home/jiawei/use_tlsh/"
        self.validation_feature_file_path = "/home/jiawei/use_tlsh/"
        self.train_file = None
        self.test_file = None
        self.validation_file_mal = "/home/sa_sample_set/validation_set/mal_set/"
        self.validation_file_nor = "/home/sa_sample_set/validation_set/nor_set/"
        self.validation_feature_file_set = []

        self.model_path = "/sa/middle_dir/test_tlsh"


    def compute_1(self,path):
        with open(path, 'rb') as f:
            data = f.read()
            hs = tlsh.hash(data)
        return hs

    def compute_2(self,path):
        h = tlsh.Tlsh()
        with open(path, 'rb') as f:
            for buf in iter(lambda: f.read(512), b''):
                h.update(buf)
        h.final()
        return h.hexdigest()

    def convert_to_libsvm_format(self, label, features, comments):
        feature_msg = ''
        if isinstance(features, dict):
            ordered_features = collections.OrderedDict(sorted(features.items()))
            for i in ordered_features:
                value = ordered_features[i]
                if float(value) > 0:
                    feature_msg += '{}:{} '.format(i, value)
        else:
            feature_msg = features
        return '{} {} # {}\n'.format(label, feature_msg, comments)

    def extract_feature(self,file_path):
        file_tlsh = self.compute_1(file_path)
        file_tlsh_list = list(file_tlsh.strip())
        file_tlsh_dict = {}
        for i in range(0,len(file_tlsh_list)):
            file_tlsh_dict[i] = int(file_tlsh_list[i],16)
        return file_tlsh_dict

    def extract_label(self,file_path):
        normal_num = file_path.count('normal')
        malicious_num = file_path.count('malicious')
        if normal_num < malicious_num:
            label = 1
        else:
            label = 0
        return label

    def dump_feature(self,label,src_path,dst_path):
        with open(dst_path, 'w') as output:
            if os.path.isdir(src_path):
                for root, dirs, files in os.walk(src_path):
                    for name in files:
                        file_path = os.path.join(root, name)
                        try:
                            features = self.extract_feature(file_path)
                            feature_line = self.convert_to_libsvm_format(label, features, file_path)
                            output.write(feature_line)
                        except Exception,e:
                            print '[ERROR] cannot extract feature on {}, exception is {}'.format(file_path, str(e))

            elif os.path.isfile(src_path):
                feature_msg = self.extract_feature(src_path)
                output.write(self.convert_to_libsvm_format(label, feature_msg,src_path))
            else:
                pass

    def build_train_test_set(self):
        parent_dir, filename = os.path.split(self.nor_feature_file)
        filename_wo_ext, ext = os.path.splitext(filename)
        nor_part_a = os.path.join(parent_dir, filename_wo_ext + '_random_{}_group_a{}'.format(self.nor_split_rate, ext))
        nor_part_b = os.path.join(parent_dir, filename_wo_ext + '_random_{}_group_b{}'.format(self.nor_split_rate, ext))

        parent_dir, filename = os.path.split(self.mal_feature_file)
        filename_wo_ext, ext = os.path.splitext(filename)
        mal_part_a = os.path.join(parent_dir, filename_wo_ext + '_random_{}_group_a{}'.format(self.mal_split_rate, ext))
        mal_part_b = os.path.join(parent_dir, filename_wo_ext + '_random_{}_group_b{}'.format(self.mal_split_rate, ext))

        self.train_file = os.path.join(self.train_file_path, 'training_set.txt')
        self.test_file = os.path.join(self.test_file_path,'test_set.txt')

        os.system('cat {} > {}'.format(nor_part_a, self.train_file))
        os.system('cat {} >> {}'.format(mal_part_a, self.train_file))
        os.system('cat {} > {}'.format(nor_part_b, self.test_file))
        os.system('cat {} >> {}'.format(mal_part_b, self.test_file))

    def split_file(self):
        working_dir = r"/sa/githubee/md_auto_tools/src/machine_learning/preprocess"
        print '[Change Working Dir] ' + working_dir
        os.chdir(working_dir)

        cmd = 'python split.py {} {}'.format(self.nor_feature_file, self.nor_split_rate)
        print '[Split Set] ' + cmd
        os.system(cmd)
        cmd = 'python split.py {} {}'.format(self.mal_feature_file, self.mal_split_rate)
        print '[Split Set] ' + cmd
        os.system(cmd)

    def dump_feature_from_validation(self):
        for next_dir in os.listdir(self.validation_file_mal):
            next_dir_path = os.path.join(self.validation_file_mal,next_dir)
            file_name = "{}.txt".format(next_dir)
            validation_file = os.path.join(self.validation_feature_file_path,file_name)
            self.dump_feature(1, next_dir_path, validation_file)
            self.validation_feature_file_set.append(validation_file)
        for next_dir in os.listdir(self.validation_file_nor):
            next_dir_path = os.path.join(self.validation_file_nor,next_dir)
            file_name = "{}.txt".format(next_dir)
            validation_file = os.path.join(self.validation_feature_file_path,file_name)
            self.dump_feature(0, next_dir_path, validation_file)
            self.validation_feature_file_set.append(validation_file)
    def save_model(self):
        try:
            model_path = os.path.join(self.model_path, 'xgb.model')
            while 1:
                if os.path.exists(model_path):
                    html_size1 = os.path.getsize(model_path)
                    time.sleep(3)
                    html_size2 = os.path.getsize(model_path)
                    print "model_size1 is %d,model_size2 is %d,delta is %d", (
                    html_size1, html_size2, html_size2 - html_size1)
                    if (html_size2 == html_size1):
                        break
            print "get model from", model_path
            shutil.copy2(model_path, self.train_file_path)
        except:
            print "save model failed!"


    def train_and_score(self):
        working_dir = r"/sa/githubee/md_auto_tools/src/machine_learning/training_process"
        print '[Change Working Dir] ' + working_dir
        os.chdir(working_dir)

        cmd = 'python train_tlsh.py {}'.format(self.train_file)
        os.system(cmd)
        cmd = 'python predict_tlsh.py {}'.format(self.train_file)
        os.system(cmd)
        cmd = 'python predict_tlsh.py {}'.format(self.test_file)
        os.system(cmd)

        for validation_file in self.validation_feature_file_set:
            try:
                cmd = 'python predict_tlsh.py {}'.format(validation_file)
                os.system(cmd)
            except:
                print "predict validation failed!"


    def start(self):
        print "dump {}".format(self.mal_sample_path)
        self.dump_feature(1,self.mal_sample_path,self.mal_feature_file)
        print "dump {}".format(self.nor_sample_path)
        self.dump_feature(0,self.nor_sample_path,self.nor_feature_file)

        print "dump validation"
        self.dump_feature_from_validation()

        self.split_file()

        self.build_train_test_set()

        self.train_and_score()
        self.save_model()




def print_help():
    print """
python computer_tlsh.py 
    """

if __name__ == "__main__":
    if len(sys.argv) != 1:
        print_help()
    else:
        use_tlsh = UseTlsh()
        use_tlsh.start()
