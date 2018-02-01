import os, sys

help_msg = """
Usage:
	python remove_file_by_path.py list_file

Note:
	1. list_file contains a full file path list, such as:
		/sa/sample/normal/file_1
		/sa/sample/normal/file_2
		...
		/sa/sample/normal/file_n

"""

if len(sys.argv) != 2:
	print help_msg
	exit(-1)

with open(sys.argv[1], 'r') as fh:
	for line in fh.readlines():
		file_path = line.strip()
		if os.path.exists(file_path):
			os.remove(file_path)
		else:
			print "[ERROR] cannot find " + file_path
