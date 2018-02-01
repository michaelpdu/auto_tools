import os, sys, magic


def process_file(file_path):
    print "{}|{}|{}".format(file_path, magic.from_file(file_path, mime=True), magic.from_file(file_path))

def process_dir(dir_path):
    for root, dirs, files in os.walk(dir_path):
        for name in files:
            process_file(os.path.join(root, name))

def process(target_path):
    if os.path.isdir(target_path):
        process_dir(target_path)
    else:
        process_file(target_path)

if __name__ == '__main__':
    process(sys.argv[1])



