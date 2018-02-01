import os, sys, hashlib

def calc_sha1(filepath):
    with open(filepath,'rb') as f:
        sha1obj = hashlib.sha1()
        sha1obj.update(f.read())
        hash = sha1obj.hexdigest()
        return hash

def rename_file(file_path):
    sha1 = calc_sha1(file_path)
    dir_path, file_name = os.path.split(file_path)
    new_file_path = os.path.join(dir_path, sha1)
    if os.path.exists(new_file_path) and file_path != new_file_path:
        os.remove(file_path)
    else:
        os.rename(file_path, os.path.join(dir_path, sha1))

def rename_files_in_dir(dir_path):
    for root, dirs, files in os.walk(dir_path):
        for name in files:
            rename_file(os.path.join(root, name))

def rename(target_path):
    if os.path.isdir(target_path):
        rename_files_in_dir(target_path)
    else:
        rename_file(target_path)

help_msg = """
Usage:
    python rename_by_sha1.py target_path

Note:
    Here target_path could be dir_path or file_path

"""

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print help_msg
        exit(-1)
    rename(sys.argv[1])

