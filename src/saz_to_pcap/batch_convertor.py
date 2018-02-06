#!/usr/bin/python
from optparse import OptionParser
import os,sys

single_convertor_path = r'fiddler2pcap_fix.py'

def proc_single_file(ifile, ofile):
    cmd = "python %s -i %s -o %s --saz --src=10.1.1.101" % (single_convertor_path,ifile,ofile)
    print '>>> CMD: %s' % cmd
    os.system(cmd)

def proc_multi_files(idir, odir):
    if not os.path.exists(odir):
        os.makedirs(odir)
    for root, dirs, files in os.walk(idir):
        for name in files:
            osubdir = root.replace(idir,odir)
            if not os.path.exists(osubdir):
                os.makedirs(osubdir)
            (filename, fileext) = os.path.splitext(name)
            if fileext == '.saz':
            	print 'filename = %s' % filename
                proc_single_file(os.path.join(root,name), os.path.join(osubdir,filename+'.pcap'))

if __name__ == '__main__':
    parser = OptionParser()
    parser.add_option("--ifile", dest="input_file", type="string", help="SAZ file path")
    parser.add_option("--idir", dest="input_dir", type="string", help="SAZ file dir")
    parser.add_option("--ofile", dest="output_file", type="string", help="PCAP file path")
    parser.add_option("--odir", dest="output_dir", type="string", help="PCAP file dir")

    (options, args) = parser.parse_args()
    if options == [] or (not options.input_file and not options.input_dir):
        print parser.print_help()
        sys.exit(-1)
    elif options.input_file and os.path.exists(options.input_file):
        ifile = options.input_file
        if options.output_file:
            ofile = options.output_file
        else:
            filename, fileext = os.path.splitext(options.input_file)
            print 'filename = %s' % filename
            print 'fileext = %s' % fileext
            ofile = filename + ".pcap"
        proc_single_file(ifile, ofile)
    elif options.input_dir and os.path.exists(options.input_dir):
        idir = options.input_dir
        if options.output_dir:
            odir = options.output_dir
        else:
            ofile = options.input_dir
        proc_multi_files(idir, odir)
    else:
        pass

