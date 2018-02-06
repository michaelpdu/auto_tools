import os, sys

for root, dirs, files in os.walk(sys.argv[1]):
    for name in files:
        file_path = os.path.join(root, name)
        with open(file_path) as fh:
            content = fh.read().lower()
            if "<html" in content:
                if "<script" in content:
                    pass
                else:
                    print "DELETE: " + file_path
                    os.remove(file_path)
            else:
                pass

