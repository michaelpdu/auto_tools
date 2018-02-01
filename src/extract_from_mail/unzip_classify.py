import os, sys, shutil, zipfile
import binascii, re

def check_file_type(content, length):
    hexdata = binascii.hexlify(content)
    if hexdata.startswith(r''):
        pass

def unzip(input_folder, output_folder):
    if not os.path.exists(input_folder):
        print "[ERROR] cannot find input folder, " + input_folder
        return
    if os.path.exists(output_folder):
        shutil.rmtree(output_folder)
    os.makedirs(output_folder)

    for root, dirs, files in os.walk(input_folder):
        for name in files:
            cur_file_path = os.path.join(root, name)
            cur_root, ext = os.path.splitext(cur_file_path)
            if '.zip' == ext:
                try:
                    zip_file = zipfile.ZipFile(cur_file_path, 'r')
                    zip_file.extractall(output_folder)
                except Exception as e:
                    print "[ERROR] cannot unzip file:",name
                    print e
                    continue


def print_usage():
    print """
Usage:
    python unzip_classify.py input_dir output_dir
    """

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print_usage()
        exit(-1)
    unzip(sys.argv[1], sys.argv[2])