 # Author: Feihao Chen
 # Date: 2016/12/22

import os
import sys
import unittest
sys.path.append("..\..")
import src.local_script_classifier.local_script_classifier as LSC

def get_parent_path(path, grade):
    if grade > 0 and path.count('\\') >= grade:
        l = path.split('\\')
        return '\\'.join(l[:0-grade])
    else:
        return path

class LocalScriptTestCase(unittest.TestCase):
    def setUp(self): 
        ut_dir = get_parent_path(os.path.split(os.path.realpath(__file__))[0], 1)
        self.sample_path_0 = os.path.join(ut_dir, 'TestSample', 'salineup_behaviour_report', 'behavior_0.xml')
        self.sample_path_1 = os.path.join(ut_dir, 'TestSample', 'salineup_behaviour_report', 'behavior_1.xml')
        self.XA = LSC.xml_analyser()
 
    def tearDown(self):  
        self.XA = None
       
    def test_is_local_script(self):
        self.XA.load_xml_file(self.sample_path_0)
        self.assertEqual(self.XA.is_local_script(), True)
        self.XA.load_xml_file(self.sample_path_1)
        self.assertEqual(self.XA.is_local_script(), False)


if __name__ == '__main__':
    unittest.main()
