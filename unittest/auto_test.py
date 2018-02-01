# auther = Cheng Chang(SA)
# Date = 2016.12.20
# usage : python auto_test.py
import os
import sys
import re
import unittest

def get_testcase(py_file):
    with open(py_file, 'r') as file:
        s = file.read()
        pattern = r'\bclass (\w+TestCase)\('
        return re.findall(pattern, s)

if __name__ == "__main__":
    import_templet_ = r'from TestSuite.%s import %s'
    addTest_templet_ = r'suite.addTests(unittest.TestLoader().loadTestsFromTestCase(%s))'
    suite = unittest.TestSuite()
    ut_path = os.path.split(os.path.realpath(__file__))[0]

    # all
    testsuite_path = os.path.join(ut_path, 'TestSuite')
    if len(sys.argv) == 1:
        for file in os.listdir(testsuite_path):
            file_path = os.path.join(testsuite_path, file)
            case_list = get_testcase(file_path)
            for case in case_list:
                import_ = import_templet_ % (file[:-3], case)
                exec import_
                addTest_ = addTest_templet_ % case
                exec addTest_
    # sys.argv
    else:
        for file in sys.argv[1:]:
            if not file.endswith('.py'):
                file += '.py'
            if not file.startswith('test_'):
                file = 'test_' + file
            file_path = os.path.join(testsuite_path, file)
            case_list = get_testcase(file_path)
            for case in case_list:
                import_ = import_templet_ % (file[:-3], case)
                exec import_
                addTest_ = addTest_templet_ % case
                exec addTest_            

    runner = unittest.TextTestRunner()  
    runner.run(suite)  