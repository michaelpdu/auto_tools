import os, sys, shutil

help_msg = """
Usage:
    python remove_file_by_sha1.py src_dir sha1_list_file

"""

if len(sys.argv) != 3:
    print help_msg
    exit(-1)

src_dir = sys.argv[1]
sha1_list_file = sys.argv[2]

if not os.path.exists(src_dir):
    print 'cannot find input dir: ' + src_dir
    exit(-1)

sha1_list = []
with open(sha1_list_file, 'rb') as fh:
    for line in fh.readlines():
        sha1_list.append(line.strip())

for root, dirs, files in os.walk(src_dir):
    for name in files:
        if name in sha1_list:
            file_path = os.path.join(root, name)
            print 'remove file: {}'.format(file_path)
            os.remove(file_path)
