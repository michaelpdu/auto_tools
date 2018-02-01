# auther = Cheng Chang(SA)
# Date = 2016/12/13
import re
import os
import sys


class APIConverter:
    def __init__(self, content = '', js_file = '', new_js_file = ''):
        self.js_file_ = js_file
        self.new_js_file = new_js_file
        self.function_file = r'api_names.cfg'
        self.function_list = []
        self.content_ = content

    def load_function_list(self):
        with open(self.function_file) as fh:
            for line in fh.readlines():
                if line.startswith('//') or len(line.strip()) == 0:
                    continue
                else:
                    self.function_list.append(line.strip())

    def work(self):
        self.content_ = open(self.js_file, 'r').read()
        self.load_function_list()
        self.convert()
        self.dump()

    def process_str(self):
        if self.content_.strip != '':
            self.load_function_list()
            self.convert()
        return self.content_

    def convert(self):
        for func in self.function_list:
            self.content_ = re.sub(r'\b' + func + r'\b', func, self.content_, flags= re.IGNORECASE)

    def dump(self):
        fh = open(self.new_js_file, 'w')
        fh.write(self.content_)
        fh.close()


def print_help():
    print """
Usage:
    python api_replace.py js_file new_js_file
    """

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print_help()
        exit(0)
    converter = APIConverter(js_file = sys.argv[1], new_js_file = sys.argv[2])
    converter.work()