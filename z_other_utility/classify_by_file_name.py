import os,sys,shutil

def classify(action, name_list, input_dir, output_dir):
    if not os.path.exists(output_dir):
        # shutil.rmtree(output_dir)
        os.makedirs(output_dir)
    with open(name_list, "r") as list_handle:
        for name in list_handle.readlines():
            print name.rstrip()
            for item_name in os.listdir(input_dir):
                if name.rstrip() == item_name:
                    if action == "--move":
                        shutil.move(os.path.join(input_dir, item_name), os.path.join(output_dir, item_name))
                    elif action == "--copy":
                        if os.path.isfile(os.path.join(input_dir, item_name)):
                            shutil.copy(os.path.join(input_dir, item_name), os.path.join(output_dir, item_name))
                        elif os.path.isdir(os.path.join(input_dir, item_name)):
                            shutil.copytree(os.path.join(input_dir, item_name), os.path.join(output_dir, item_name))



help_msg = """
Usage:
    python classify_by_file_name.py [--copy|--move] name_list input_dir output_dir

Note:
    1. name_list is a file, which contains many file names.
        Such as:
            file_name_1
            file_name_2
            ...
            file_name_n

    2. input_dir does not contain sub-directory, and structure looks like:
        input_dir
            |- file_name_1
            |- file_name_2
            |- ...
            |- file_name_m

"""


if __name__ == "__main__":
    print "length of sys.argv = " + str(len(sys.argv))
    if len(sys.argv) != 5:
        print help_msg
        exit(-1)
    if sys.argv[1] != "--copy" and sys.argv[1] != "--move":
        print help_msg
        exit(-1)
    classify(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
