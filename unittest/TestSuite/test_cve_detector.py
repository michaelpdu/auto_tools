# auther = Cheng Chang(SA)
# Date = 2017/2/23
# usage : python test_cve_detector.py -h
import os
import sys
import shutil
import unittest
sys.path.append("..\..")
from src.cve_detector.cve_detector import CVE_Detector

def get_parent_path(path, grade):
    if grade > 0 and path.count('\\') >= grade:
        l = path.split('\\')
        return '\\'.join(l[:0-grade])
    else:
        return path

class CVEDetectorTestCase(unittest.TestCase):
    def setUp(self):
        sal_cmd = ['--loglevel=all', '--productname=sc', '--script_malware']
        self.detector_ = CVE_Detector(sal_cmd)
        self.detect_path_ = self.detector_.root_path_
        ut_dir = get_parent_path(os.path.split(os.path.realpath(__file__))[0], 1)
        self.sample_path_ = os.path.join(ut_dir, 'TestSample', 'normal_localscript_js')

    def tearDown(self):
        if os.path.exists(os.path.join(self.detect_path_, 'report')):
            shutil.rmtree(os.path.join(self.detect_path_, 'report'))

    def testAnalyzeDir(self):
        dir_path = self.sample_path_
        self.detector_.work(dir_path)
        for file_name in os.listdir(dir_path):
            file_name_without_ext = os.path.splitext(file_name)[0]            
            flag = os.path.exists(os.path.join(self.detect_path_, 'report'))
            self.assertEqual(flag, True)  

def main():
    unittest.main()

if __name__ == "__main__":
    main()
