# auther = Cheng Chang(SA)
# Date = 2016.12.20
# usage : python test_flash_cve_detector.py -h
import os
import sys
import unittest
sys.path.append("..\..")
from src.flash_cve_detector.flash_cve_detector import FlashDetector

def get_parent_path(path, grade):
    if grade > 0 and path.count('\\') >= grade:
        l = path.split('\\')
        return '\\'.join(l[:0-grade])
    else:
        return path

class FlashDetectorTestCase(unittest.TestCase):
    def setUp(self):
        self.detector = FlashDetector()
        self.detect_path_ = self.detector.root_path
        ut_dir = get_parent_path(os.path.split(os.path.realpath(__file__))[0], 1)
        self.sample_path = os.path.join(ut_dir, 'TestSample', 'normal_swf')

    def tearDown(self):
        self.detector = None
        os.remove('calltrace.txt')
        os.remove('pintool.log')

    def testAnalyzeFile(self):
        file_path = os.path.join(self.sample_path, '7_.swf')
        self.detector.work(file_path)
        file_name = os.path.split(file_path)[1]
        file_name_without_ext = os.path.splitext(file_name)[0]
        flag = os.path.exists(os.path.join(self.detect_path_, 'result', file_name_without_ext ,'behavior.log'))
        self.assertEqual(flag, True)  

    def testAnalyzeDir(self):
        dir_path = self.sample_path
        self.detector.work(dir_path)
        for file_name in os.listdir(dir_path):
            file_name_without_ext = os.path.splitext(file_name)[0]            
            flag = os.path.exists(os.path.join(self.detect_path_, 'result', file_name_without_ext ,'behavior.log'))
            self.assertEqual(flag, True)  

def main():
    unittest.main()

if __name__ == "__main__":
    main()
