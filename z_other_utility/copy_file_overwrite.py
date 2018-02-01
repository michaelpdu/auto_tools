import os, sys, shutil

def copy_file(src_dir, dest_dir):
    for root, dirs, files in os.walk(src_dir):
        for name in files:
            shutil.copy2(os.path.join(root, name), dest_dir)

help_msg = """
Usage:
    python copy.py src_dir dest_dir
"""

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print help_msg
        exit(-1)
    if not os.path.exists(sys.argv[2]):
        os.makedirs(sys.argv[2])
    copy_file(sys.argv[1], sys.argv[2])    


