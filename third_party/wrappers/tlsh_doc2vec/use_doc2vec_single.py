import gensim
import os, sys
import time
import collections
import shutil
import json
from gensim.models.doc2vec import Doc2Vec, LabeledSentence

LabeledSentence = gensim.models.doc2vec.LabeledSentence


class LabeledLineSentence(object):
    def __init__(self, doc_list, labels_list):
        self.labels_list = labels_list
        self.doc_list = doc_list

    def __iter__(self):
        for i, doc in enumerate(self.doc_list):
            # yield LabeledSentence(words=doc.split(),tags=[self.labels_list[i]])
            yield gensim.models.doc2vec.TaggedDocument(gensim.utils.simple_preprocess(doc), tags=[i])


class UseDoc2vec:
    def __init__(self,dim_data):
        self.data_label = []
        self.data = []
        self.train_data = None
        self.model = None
        self.dim_data = dim_data

        self.dst_feature_file = "trainset.txt"

        self.src_path = "/home/sa_sample_set/train_test"
        self.mal_sample_path = "/home/sa_sample_set/train_test/mal_set"
        self.nor_sample_path = "/home/sa_sample_set/train_test/nor_set"
        self.validation_file_mal = "/home/sa_sample_set/validation_set/mal_set/"
        self.validation_file_nor = "/home/sa_sample_set/validation_set/nor_set/"

        #self.src_path = "/home/jiawei/use_doc2vec/train_test/"
        #self.mal_sample_path = "/home/jiawei/use_doc2vec/train_test/mal_set"
        #self.nor_sample_path = "/home/jiawei/use_doc2vec/train_test/nor_set"
        #self.validation_file_mal = "/home/jiawei/use_doc2vec/validation_test/mal_set/"
        #self.validation_file_nor = "/home/jiawei/use_doc2vec/validation_test/nor_set/"

        self.nor_feature_file_path = "/home/jiawei/use_doc2vec"
        self.mal_feature_file_path = "/home/jiawei/use_doc2vec"
        self.nor_feature_file = "/home/jiawei/use_doc2vec/nor_feature_file.txt"
        self.mal_feature_file = "/home/jiawei/use_doc2vec/mal_feature_file.txt"
        self.doc2vec_model_path = "/home/jiawei/use_doc2vec"

        self.validation_feature_file_set = []
        self.validation_feature_file_path = "/home/jiawei/use_doc2vec/"
        self.nor_split_rate = 0.7
        self.mal_split_rate = 0.7
        self.train_file_path = "/home/jiawei/use_doc2vec/"
        self.test_file_path = "/home/jiawei/use_doc2vec/"
        self.model_path = "/sa/middle_dir/test_doc2vec"

        self.doc2vec_size = 0
        self.config_file = None

    def process_train_data(self, src_train_path):
        if os.path.isdir(src_train_path):
            for root, dirs, files in os.walk(src_train_path):
                print "preprocess {}".format(root)
                for name in files:
                    file_path = os.path.join(root, name)
                    self.data_label.append(name)
                    self.data.append(open(file_path, 'r').read())
        elif os.path.isfile(src_train_path):
            self.data_label.append(src_train_path)
            self.data.append(open(src_train_path, 'r'))
        else:
            pass
        # print self.data
        # print self.data_label
        self.train_data = LabeledLineSentence(self.data, self.data_label)

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

    def extract_feature(self, src_test_path):
        feature = []
        if os.path.isdir(src_test_path):
            print "should be a file!"
            pass
        elif os.path.isfile(src_test_path):
            feature = self.model.infer_vector(gensim.utils.simple_preprocess(open(src_test_path, 'r').read()))
        else:
            pass
        feature_dict = {}
        for i in range(0, len(feature)):
            feature_dict[i] = feature[i]
        return feature_dict

    def dump_feature(self, label, src_path, dst_path):
        if not os.path.exists(dst_path):
            os.mknod(dst_path)
            os.chmod(dst_path, 777)
        with open(dst_path, 'w') as output:
            if os.path.isdir(src_path):
                for root, dirs, files in os.walk(src_path):
                    print "extract feature on {}".format(root)
                    for name in files:
                        file_path = os.path.join(root, name)
                        try:
                            features = self.extract_feature(file_path)
                            feature_line = self.convert_to_libsvm_format(label, features, file_path)
                            output.write(feature_line)
                            # print "extract feature on {}".format(file_path)
                        except Exception, e:
                            print '[ERROR] cannot extract feature on {}, exception is {}'.format(file_path, str(e))

            elif os.path.isfile(src_path):
                feature_msg = self.extract_feature(src_path)
                output.write(self.convert_to_libsvm_format(label, feature_msg, src_path))
            else:
                pass

    def dump_feature_from_validation(self):
        for next_dir in os.listdir(self.validation_file_mal):
            next_dir_path = os.path.join(self.validation_file_mal, next_dir)
            file_name = "{}.txt".format(next_dir)
            validation_file = os.path.join(self.validation_feature_file_path, file_name)
            self.dump_feature(1, next_dir_path, validation_file)
            self.validation_feature_file_set.append(validation_file)
        for next_dir in os.listdir(self.validation_file_nor):
            next_dir_path = os.path.join(self.validation_file_nor, next_dir)
            file_name = "{}.txt".format(next_dir)
            validation_file = os.path.join(self.validation_feature_file_path, file_name)
            self.dump_feature(0, next_dir_path, validation_file)
            self.validation_feature_file_set.append(validation_file)

    def collect_validation(self):
        for next_dir in os.listdir(self.validation_file_mal):
            next_dir_path = os.path.join(self.validation_file_mal, next_dir)
            file_name = "{}.txt".format(next_dir)
            validation_file = os.path.join(self.validation_feature_file_path, file_name)
            self.validation_feature_file_set.append(validation_file)
        for next_dir in os.listdir(self.validation_file_nor):
            next_dir_path = os.path.join(self.validation_file_nor, next_dir)
            file_name = "{}.txt".format(next_dir)
            validation_file = os.path.join(self.validation_feature_file_path, file_name)
            self.validation_feature_file_set.append(validation_file)


    def train_doc2vec_model(self):
        self.model = gensim.models.Doc2Vec(size=self.doc2vec_size, min_count=3, iter=200, workers=10)
        self.model.build_vocab(self.train_data)
        self.model.train(self.train_data, total_examples=self.model.corpus_count, epochs=self.model.iter)
        doc2vec_model = os.path.join(self.doc2vec_model_path,
                                     "doc2vec_{}.model".format(time.strftime('%Y%m%d%H%M%S', time.localtime())))
        self.model.save(doc2vec_model)

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
        self.test_file = os.path.join(self.test_file_path, 'test_set.txt')

        os.system('cat {} > {}'.format(nor_part_a, self.train_file))
        os.system('cat {} >> {}'.format(mal_part_a, self.train_file))
        os.system('cat {} > {}'.format(nor_part_b, self.test_file))
        os.system('cat {} >> {}'.format(mal_part_b, self.test_file))

    def merge_train_test_file(self):
        self.train_file = os.path.join(self.train_file_path, 'training_set.txt')
        self.test_file = os.path.join(self.test_file_path, 'test_set.txt')
        print "merge train and test file"
        os.system("cat {} >> {}".format(self.test_file, self.train_file))

    def train_and_score(self):
        working_dir = r"/sa/githubee/md_auto_tools/src/machine_learning/training_process"
        print '[Change Working Dir] ' + working_dir
        os.chdir(working_dir)
        cmd = 'python train_doc2vec.py {}'.format(self.train_file)
        os.system(cmd)
        print cmd

        train_file_log = os.path.join(self.train_file_path, "train_log.txt")
        cmd = 'python predict_doc2vec.py {} > {}'.format(self.train_file, train_file_log)
        os.system(cmd)
        print cmd
        #if use gridsearch,not need test file
        """   
        test_file_log = os.path.join(self.test_file_path, "test_log.txt")
        cmd = 'python predict_doc2vec.py {} > {}'.format(self.test_file, test_file_log)
        os.system(cmd)
        print cmd
        """
        for validation_file in self.validation_feature_file_set:
            try:
                root, file = os.path.split(validation_file)
                file_name, ext = os.path.splitext(file)
                log_file_name = file_name + "_log.txt"
                log_file = os.path.join(root, log_file_name)

                cmd = 'python predict_doc2vec.py {} > {}'.format(validation_file, log_file)
                os.system(cmd)
                print cmd
            except:
                print "failed"

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

    def test(self):
        return self.model.infer_vector(['html', 'br', 'body', 'head', 'a', 'div'])

    def start(self):
        self.doc2vec_size = int(self.dim_data)
        iter_str = str(self.dim_data)
        self.train_file_path = os.path.join(self.train_file_path, iter_str)
        if not os.path.exists(self.train_file_path):
            os.mkdir(self.train_file_path)
        self.test_file_path = os.path.join(self.test_file_path, iter_str)
        if not os.path.exists(self.test_file_path):
            os.mkdir(self.test_file_path)
        self.validation_feature_file_path = os.path.join(self.validation_feature_file_path, iter_str)
        if not os.path.exists(self.validation_feature_file_path):
            os.mkdir(self.validation_feature_file_path)

        self.nor_feature_file_path = os.path.join(self.nor_feature_file_path, iter_str)
        if not os.path.exists(self.nor_feature_file_path):
            os.mkdir(self.nor_feature_file_path)
        self.nor_feature_file = os.path.join(self.nor_feature_file_path, "nor_feature_file.txt")
        self.mal_feature_file_path = os.path.join(self.mal_feature_file_path, iter_str)
        if not os.path.exists(self.mal_feature_file_path):
            os.mkdir(self.mal_feature_file_path)

        self.mal_feature_file = os.path.join(self.mal_feature_file_path, "mal_feature_file.txt")
        self.doc2vec_model_path = os.path.join(self.doc2vec_model_path, iter_str)

        print "preprocess Data!"
        self.process_train_data(self.src_path)
        print "start train doc2vec model!"
        self.train_doc2vec_model()
        print "dump {}".format(self.mal_sample_path)
        self.dump_feature(1, self.mal_sample_path, self.mal_feature_file)
        print "dump {}".format(self.nor_sample_path)
        self.dump_feature(0, self.nor_sample_path, self.nor_feature_file)

        print "dump validation"
        self.dump_feature_from_validation()

        #self.collect_validation()
        self.split_file()

        self.build_train_test_set()
        #if you use gridsearch,commentate this function
        self.merge_train_test_file()
        self.train_and_score()

        self.save_model()


def print_help():
    print """
python use_doc2vec_single.py data
    """


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print_help()
    else:
        use_doc2vec = UseDoc2vec(sys.argv[1])
        use_doc2vec.start()

