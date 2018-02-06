import os,sys,shutil

def classify(action, name_list, input_dir, output_dir):
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
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


def print_help():
    print """
Usage:
  python classify_by_name.py [--copy|--move] name_list input_dir output_dir
    """

if __name__ == "__main__":
    print "length of sys.argv = " + str(len(sys.argv))
    if len(sys.argv) != 5:
        print_help()
        exit(-1)
    if sys.argv[1] != "--copy" and sys.argv[1] != "--move":
        print_help()
        exit(-1)
    classify(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])