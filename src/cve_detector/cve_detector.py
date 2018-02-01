# auther = Cheng Chang(SA)
# Date = 2017/2/20
import os
import sys
import hashlib
import shutil
import time

sys.path.append("..\..")
from src.check_vt_result.vt_public import vtAPI
from third_party.wrappers.SALineup_python.pysal import *


def curr_time():
    return time.strftime("%H:%M:%S")

class CVE_Page():
    def __init__(self, file_path):
        self.file_path = file_path
        file_path_without_ext, ext = os.path.splitext(file_path)
        prefix_path, file_name = os.path.split(file_path_without_ext)
        self.md5_ = ''
        self.sha1_ = ''
        self.sal_decision_ = ''
        self.sal_rules_ = ''
        self.vt_find_flag_ = True
        self.vt_detect_rate_ = ''
        self.vt_result_ = {}

    def save_report(self, reprt_path):
        with open(reprt_path, 'w') as report:
            report.write('file_path : %s\n' % self.file_path)
            report.write('md5 : %s\n' % self.md5_)
            report.write('sha1 : %s\n' % self.sha1_)
            report.write('\n')
            report.write('sal_decision : %s\n' % self.sal_decision_)
            if self.sal_rules_:
                report.write('sal_rules : %s\n' % self.sal_rules_)
            report.write('\n')
            if self.vt_find_flag_ is True:
                report.write('vt_detected_by : %s\n' % self.vt_detect_rate_)
                for key, value in self.vt_result_.items():
                    report.write('      %s : %s\n' % (key, value))
            else:
                report.write('not found in vt')


class CVE_Detector():
    def __init__(self, sal_cmd):
        self.root_path_ = os.path.split(os.path.realpath(__file__))[0]
        self.pysalhelper = PySalHelper()
        self.vt_ = vtAPI()
        sal_cmd.append('target')
        args = self.pysalhelper.parse_cmd(sal_cmd)
        self.pysalhelper.set_args_for_sal(args)

    def clear_env(self):
        report_path = os.path.join(self.root_path_, 'report')
        if os.path.exists(report_path):
            shutil.rmtree(report_path)
        os.mkdir(report_path)

    def clear_env_after_scan(self):
        cur_path = os.getcwd()
        os.chdir(self.root_path_)
        if os.path.exists('testtmsa.log'):
            os.remove('testtmsa.log')
        os.chdir(cur_path)

    def work(self, target_path):
        self.clear_env()
        if os.path.isfile(target_path):
            self.analyze_file(target_path)
        elif os.path.isdir(target_path):
            self.analyze_dir(target_path)

    def analyze_dir(self, folder_path):
        for f in os.listdir(folder_path):
            self.analyze_file(os.path.join(folder_path, f))

    def analyze_file(self, file_path):
        print curr_time(), 'start analyze [%s]' % file_path
        cve_page = CVE_Page(file_path)
        self.sal_process(file_path, cve_page)
        self.vt_process(file_path, cve_page)
        self.dump_report(cve_page)

    def dump_report(self, cve_page):
        cur_path = os.getcwd()
        os.chdir(self.root_path_)
        path = os.path.join('report', r'report_%s.txt' % cve_page.md5_)
        cve_page.save_report(path)
        os.chdir(cur_path)

    def sal_process(self, file_path, cve_page):
        prefix_path, file_name = os.path.split(file_path)
        print curr_time(), 'sal process [%s]' % file_name
        sal_result = self.pysalhelper.scan_file(file_path=file_path)
        cve_page.sal_decision_ = DECISION_NAME[sal_result.get_decision()]
        if sal_result.get_decision() == 2:
            cve_page.sal_rules_ = ';'.join(sal_result.get_rules())

    def vt_process(self, file_path, cve_page):
        prefix_path, file_name = os.path.split(file_path)
        print curr_time(), 'virusTotal process [%s]\n' % file_name
        cve_page.md5_ = self.cal_md5(file_path)
        cve_page.sha1_ = self.cal_sha1(file_path)
        try:
            it = self.vt_.getReport(cve_page.md5_)
        except ValueError:
            print 'more than 4r/min,20s later try to reparse\n'
            time.sleep(20)
            it = self.vt_.getReport(cve_page.md5_)
        self.parse_vt_json(it, cve_page.md5_, cve_page)
        time.sleep(14)

    def cal_md5(self, file_path):
        with open(file_path,'rb') as f:
            md5obj = hashlib.md5()
            md5obj.update(f.read())
            md5 = md5obj.hexdigest()
            return md5

    def cal_sha1(self, file_path):
        with open(file_path,'rb') as f:
            sha1obj = hashlib.sha1()
            sha1obj.update(f.read())
            sha1 = sha1obj.hexdigest()
            return sha1


    def parse_vt_json(self, it, md5, cve_page):
        if it['response_code'] == 0:
            cve_page.vt_find_flag_ = False
        else:
            cve_page.vt_detect_rate_ = str(it['positives']) + '/' + str(it['total'])
            for key, value in it['scans'].items():
                if value['result'] is not None:
                    cve_page.vt_result_[key] = value['result']

"""
Usage:
    python cve_detector.py --loglevel=all --productname=sc --script_malware file/dir path

Scan file using sal and vt,generate report
    """
def main():
    sal_cmd = sys.argv[1:-1]
    cve_detector = CVE_Detector(sal_cmd)
    cve_detector.work(sys.argv[-1])


if __name__ == '__main__':
    main()
