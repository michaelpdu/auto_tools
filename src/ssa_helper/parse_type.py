# Author = Chengrui Dai(SA)
import os
import struct
import sys
import shutil
import argparse

class ParseType(object):
    """

    """
    def __init__(self):
        self.root_path_ = os.path.split(os.path.realpath(__file__))[0]
        self.type_path = os.path.join(self.root_path_,r'type')
        self.default_output = os.path.join(self.root_path_,r'samples')

    def parse_cmd(self,cmd):
        if not cmd:
            print "[ERROR] cmd is empty!"
            exit(-1)
        opt = argparse.ArgumentParser(description="Parse Type")
        opt.add_argument("target")
        opt.add_argument("--output", action="store",help='output')
        options = opt.parse_args(cmd)
        args = {}
        args['target'] = options.target
        if options.output:
            args['output'] = options.output
        return args

    def process(self, cmd='', args={}):
        if not args:
            if not cmd:
                cmd = sys.argv[1:]
            args = self.parse_cmd(cmd)
        if args.has_key('output'):
            self.dir_type(args['target'],args['output'])
        else:
            print "123"
            self.dir_type(args['target'], self.default_output)

    def typelist(self):
        type_list = []
        with open(r'type', 'r') as ty:
            for line in ty.readlines():
                type_list.append(line.strip('\n'))
        return type_list

    def bytes2hex(self,bytes):
        num = len(bytes)
        hexstr = u""
        for i in range(num):
            t = u"%x" % bytes[i]
            if len(t) % 2:
                hexstr += u"0"
            hexstr += t
        return hexstr.upper()

    def file_type(self,filename,output):
        binfile = open(filename, 'rb')
        tl = self.typelist()
        ftype = 'unknown'
        numOfBytes = 4
        binfile.seek(0)
        try:
            hbytes = struct.unpack_from("B" * numOfBytes, binfile.read(numOfBytes))
            f_hcode = self.bytes2hex(hbytes)
            if f_hcode in tl:
                self.copy_file(filename,output)
            elif f_hcode not in tl and f_hcode not in test:
                pass
            binfile.close()
            return ftype
        except Exception, e:
            pass

    def dir_type(self,folder_path,output):
        for root, sub_dirs, files in os.walk(folder_path):
                for special_file in files:
                    spcial_file_dir = os.path.join(root, special_file)
                    self.file_type(spcial_file_dir,output)

    def copy_file(self,src,des):
        if not os.path.exists(des):
            os.path.exists(des)
            os.makedirs(des)
        name = src.split('\\')[-1]
        shutil.copyfile(src,os.path.join(des,name))


def main():
    pt = ParseType()
    pt.process()

if __name__ == '__main__':
    main()

