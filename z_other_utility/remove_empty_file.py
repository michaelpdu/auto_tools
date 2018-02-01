import os, sys, shutil

help_msg = """
Usage:
    python remove_empty_file.py src_dir

"""

if len(sys.argv) != 2:
    print help_msg
    exit(-1)

src_dir = sys.argv[1]

if not os.path.exists(src_dir):
    print 'cannot find input dir: ' + src_dir
    exit(-1)

for root, dirs, files in os.walk(src_dir):
    for name in files:
        file_path = os.path.join(root, name)
        stat_info = os.stat(file_path)
        print '{}: {}'.format(file_path, stat_info.st_size)
        if 0 == stat_info.st_size:
            os.remove(file_path)