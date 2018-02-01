import os, sys, shutil

help_msg = """
Usage:
    python copy_file_by_path.py list_file dest_dir

Note:
    1. list_file contains a full file path list, such as:
        /sa/sample/normal/file_1
        /sa/sample/normal/file_2
        ...
        /sa/sample/normal/file_n

"""

if len(sys.argv) != 3:
    print help_msg
    exit(-1)

list_file = sys.argv[1]
dest_dir = sys.argv[2]

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

with open(list_file, 'r') as fh:
    for line in fh.readlines():
        file_path = line.strip()
        if os.path.exists(file_path):
            shutil.copy2(file_path, dest_dir)
        else:
            print "[ERROR] cannot find " + file_path
