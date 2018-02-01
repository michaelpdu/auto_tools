# auther = Cheng Chang(SA)
# add svm function by Chengrui Dai(SA)
# Date = 2017/1/12
import os,sys
import logging
import argparse
from sa_sal_api import *
from sa import *
from sal_utility import *
from svmFunction.ExportCSV import *
from svmFunction.CreateData import *
from svmFunction.testLibsvm import *
reload(sys)
sys.setdefaultencoding('utf-8')


class PySalHelper():
    def __init__(self):
        init_sa_logger()
        self.root_path_ = os.path.split(os.path.realpath(__file__))[0]
        SAL_CONFIG_FILE = 'tmsa2.ptn'
        SAL_LOG_FILE    = 'tmsa.log'
        self.scanner_ = SALScanner(SAL_CONFIG_FILE, SAL_LOG_FILE)
        logger.info("Initialize PYSAL done")

    def check_env(self):
        cur_path = os.getcwd()
        os.chdir(self.root_path_)
        # dll
        # ptn
        if os.path.exists('_tmsa_upv2_debug_'):
            if not os.path.exists('pattern'):
                raise SALException("pattern dir not exists")
        else:
            if not os.path.exists('tmsa2.ptn'):
                raise SALException("tmsa2.ptn not exists")
        os.chdir(cur_path)

    def parse_cmd(self, cmd):
        if not cmd:
            raise SALException("cmd is empty")
        # parse arguments
        opt = argparse.ArgumentParser(description="SALineup Implemented By Python")
        opt.add_argument("target")
        ###
        opt.add_argument("-d", action="store", dest='decrypt')
        opt.add_argument("-e", action="store", dest='encrypt')
        opt.add_argument("-p", action="store", dest='pack')
        opt.add_argument("-u", action="store", dest='unpack')
        opt.add_argument("-svm", action="store", help='Use svm or not')
        opt.add_argument("--loglevel", action="store", type=str, help="(off | fatal | error | warn | info | debug | trace | all), info is the default log level")
        opt.add_argument("--productname", action="store", type=str, help="(sc|ti9)")
        opt.add_argument("--script_malware",action="store_true", help="Force Rescan with Current A/V Definitions")

        options= opt.parse_args(cmd)

        args = {}
        args['target'] = options.target
        if options.pack:
            args['p'] = options.pack
        elif options.unpack:
            args['u'] = options.unpack
        elif options.encrypt:
            args['e'] = options.encrypt
        elif options.decrypt:
            args['d'] = options.decrypt
        elif options.svm:
            args['svm'] = options.svm
        else:
            args['loglevel'] = options.loglevel
            args['productname'] = options.productname
            args['script_malware'] = options.script_malware
        return args

    def process(self, cmd='', args={}):
        cur_path = os.getcwd()
        os.chdir(self.root_path_)
        if not args:
            if not cmd:
                cmd = sys.argv[1:]
            args = self.parse_cmd(cmd)
        if args.has_key('p'):
            self.pack(args['p'], args['target'])
        elif args.has_key('u'):
            self.unpack(args['u'], args['target'])
        elif args.has_key('e'):
            self.encrypt(args['e'], args['target'])
        elif args.has_key('d'):
            self.decrypt(args['d'], args['target'])
        elif args.has_key('svm'):
            self.FileSvmExport(args['target'],args['svm'])
        else:
            target = args['target']
            self.set_args_for_sal(args)
            if os.path.isdir(target):
                self.scan_dir(target)
            elif os.path.isfile(target):
                self.scan_file(target)
        os.chdir(cur_path)


    def set_args_for_sal(self, args={}):
        self.scanner_.set_args(args['loglevel'], args['productname'], args['script_malware'])

    def scan_file(self, file_path):
        print 'Now Processing File : [%s]' % file_path
        page = Page(content_file=file_path)
        result = self.scanner_.scan(page)
        if isinstance(result, NormalResult):
            print 'Decision: [%s] on File: [%s] Rules: [] Size: %s\n' %  \
            (DECISION_NAME[result.get_decision()], file_path, os.path.getsize(file_path))
        elif isinstance(result, SALScanResult):
            rules = ''
            if result.get_rules():
                rules =  ';'.join(result.get_rules())
            print 'Decision: [%s] on File: [%s] Rules: [%s] Size: %s\n' %  \
            (DECISION_NAME[result.get_decision()], file_path, rules, os.path.getsize(file_path))
            self.save_behavior_report(page, result)
        else:
            print '[ERROR]UNKNOWN ERROR'
        return result

    def scan_dir(self, dir_path):
        mal_count = 0
        nor_count = 0
        mon_count = 0
        total_count = 0
        rules = {}
        for root, dirs, files in os.walk(dir_path):
            for name in files:
                file_path = os.path.join(root, name)
                result = self.scan_file(file_path)
                decision = result.get_decision()
                total_count += 1
                if decision == 0:
                    nor_count +=1 
                else:
                    if decision == 1:
                        mon_count += 1
                    elif decision == 2:
                        mal_count += 1
                    rulex = result.get_rules()
                    for rule in rulex:
                        if rules.has_key(rule):
                            rules[rule] += 1
                        else:
                            rules[rule] = 1
        self.print_summary(mal_count, nor_count, mon_count, total_count, rules)


    def print_summary(self, mal_count, nor_count, mon_count, total_count, rules):
        count_by_rules = ''
        for k, v in rules.iteritems():
            count_by_rules += '[%s]=[%s]\n' % (k, v)

        print '''
---------------execution summary:---------------------
Pattern Version: %s
Actually processed file count: %s
Big size file count: 
Total input file count: %s
------------------------------------------------------

Statistics Info :
Scan All Count=[%s]
Scan All Cost=
AS3 File Count=
Count By Diagnosis
[Malicious]=[%s]
[Monitoring]=[%s]
[Normal]=[%s]

Count By Rules
%s
        ''' % (self.scanner_.get_pattern_version(), total_count, total_count, total_count, mal_count, mon_count, nor_count, count_by_rules)        

    def save_behavior_report(self, page, result):
        behavior_report_dir = os.path.join(self.root_path_, 'result')       
        if not os.path.exists(behavior_report_dir):
            os.mkdir(behavior_report_dir)
        report_name = r'behavior_%s.xml' % md5sum(page.get_content())
        # add file name into report
        file_path = page.get_path()
        extra_info_node = {'file_path':file_path}
        report = result.get_behavior_report()
        report = self.add_extra_info_node(report, extra_info_node)
        # write into file
        report_path = os.path.join(behavior_report_dir,report_name)
        open(report_path, 'w').write(report)

    def add_extra_info_node(self, xml, extra_info_node):
        # add file path node
        content_tmp = r'<%s>%s</%s>'
        file_path = content_tmp % ('file_path', extra_info_node['file_path'], 'file_path')
        xml = xml.replace('<report>\n', '<report>\n%s\n' % file_path, 1)
        return xml

    def pack(self, pack_in_path="pattern", pack_out_path="tmsa2.ptn"):
        if not os.path.exists(pack_in_path):
            raise SALException("Cant find pattern dir!")
        if os.path.exists(pack_out_path):
            os.remove(pack_out_path)
        SALHelper_Pack(pack_in_path, pack_out_path)

    def unpack(self, pattern_file="tmsa2.ptn", pattern_out_dir="pattern"):
        if not os.path.exists(pattern_file):
            raise SALException("Cant find pattern_file!")
        if os.path.exists(pattern_out_dir):
            shutil.rmtree(pattern_out_dir)
        SALHelper_Unpack(pattern_file, pattern_out_dir)

    def encrypt(self, sourceFile, destFile):
        if not os.path.exists(sourceFile):
            raise SALException("Cant find sourceFile!")
        if isinstance(sourceFile, str):
            sourceFile = sourceFile.decode("UTF8")
        if isinstance(destFile, str):
            destFile = destFile.decode("UTF8")
        SALHelper_EncryptAndDecryptPattern("e", sourceFile, destFile)

    def decrypt(self, sourceFile, destFile):
        if not os.path.exists(sourceFile):
            raise SALException("Cant find sourceFile!")
        if isinstance(sourceFile, str):
            sourceFile = sourceFile.decode("UTF8")
        if isinstance(destFile, str):
            destFile = destFile.decode("UTF8")        
        SALHelper_EncryptAndDecryptPattern("d", sourceFile, destFile)


    #author = Chengrui Dai(SA)
    def FileSvmExport(self,behavior_report_dir,file_type):
        if not os.path.exists(behavior_report_dir):
            print '[ERROR] No Result!'
            exit(0)
        #create csv_result_dir
        csv_result = os.path.join(self.root_path_, 'CSVResult')
        mkdir(csv_result)
        LabelList = []
        if file_type == 'swf':
            feature_path = os.path.join(self.root_path_, 'TrainData\\feature_20170419')
            #return feature list
            fea = ReadFeature(feature_path)
            output_path = os.path.join(self.root_path_, 'TrainData\\FeatureData')
            if os.path.exists(output_path):
                os.remove(output_path)
            #create svm_format file in order to use the svm_model
            CreateFeature(behavior_report_dir,fea,output_path)

            model_path = os.path.join(self.root_path_, 'TrainData\\Svm_0419_new_new.model')
            #use the svm_model to predict data
            LabelList = SVMCreate(output_path,model_path)
        elif file_type == 'html':
            feature_path = os.path.join(self.root_path_, 'TrainData\\feature_html')
            fea = ReadFeature(feature_path)
            output_path = os.path.join(self.root_path_, 'TrainData\\FeatureData')
            if os.path.exists(output_path):
                os.remove(output_path)
            CreateFeature(behavior_report_dir,fea,output_path)
            model_path = os.path.join(self.root_path_, 'TrainData\\SimpleSvm_html.model')
            LabelList = SVMCreate(output_path,model_path)
        else:
            print '[ERROR] Not Defined!'
            exit(0)
        #return sal_result
        (file_path_res, file_type_res, decision_res, file_sha1) = sal_res_eachFile(behavior_report_dir)
        #export csv_file to compare svm_result with sal_result
        CSVExport(MKPATH, LabelList, file_path_res, file_type_res, decision_res, file_sha1)
        print 'FileSvmExport Complete!'


# cmd
# python pysal.py --loglevel=all --script_malware target

def main():
    pysalhelper = PySalHelper()
    pysalhelper.process()


if __name__ == '__main__':
    main()
