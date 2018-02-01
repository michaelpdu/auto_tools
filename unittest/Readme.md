自动化测试
python auto_test.py 
全部测试
python auto_test.py flash_cve_detector ..
指定程序测试



测试的用例按照unittest规范来写，用例放在TestSuite目录下，命名test_XX.py,XX为测试的程序在src中的名字
需要用到的sample按文件格式放到TestSample中