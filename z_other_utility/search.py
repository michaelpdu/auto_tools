import yara, os, sys

class YaraSearcher:
    """search file by YARA rules"""
    def __init__(self, feature_rules):
        self.yara_rules_ = yara.compile(source=feature_rules)
        self.matched_feature_index_map_ = {}

    def analyze_nsslab_dir(self, dir, start_from):
        for item in os.listdir(dir):
            target = os.path.join(dir,item)
            if os.path.isdir(target):
                if int(item.split('_')[0]) >= int(start_from):
                    print ">>> analyze {}".format(target)
                    self.analyze_dir_recursive(target)

    def analyze_dir_recursive(self, dir):
        for root, dirs, files in os.walk(dir):
            for name in files:
                self.analyze_file(os.path.join(root, name))

    def analyze_file(self, file_path):
        with open(file_path, 'rb') as fh:
            content = fh.read()
        matched_rules = self.yara_rules_.match(data=content)
        if matched_rules:
            print "{}: {}".format(file_path, matched_rules)

help_msg = """
Usage:
    python search.py target-dir [start-from-date]

For Example:
    1. search NSSLab_Samples folder by yara rules
    > python search.py "\\10.64.24.44\e$\NSSLab_Samples\"

    2. search NSSLab_Samples folder by yara rules, and start from 20170101
    > python search.py "\\10.64.24.44\e$\NSSLab_Samples\" "20170101"

"""

if __name__ == '__main__':
    try:
        with open('search.yar', 'rb') as fh:
            search_rules = fh.read()
        yara_searcher = YaraSearcher(search_rules)
        if len(sys.argv) == 2:
            yara_searcher.analyze_dir_recursive(sys.argv[1])
        elif len(sys.argv) == 3:
            yara_searcher.analyze_nsslab_dir(sys.argv[1], sys.argv[2])
        else:
            print help_msg
    except Exception,e:
        print help_msg
        print str(e)
