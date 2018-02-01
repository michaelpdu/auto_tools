# Author:Feihao Chen
# Date:2016/12/8

import os,sys
import run
import csv

def print_usage():
    print """
Usage:
    python tool.py input_dir
    """

def folder_process(folder_path):
    csvfile=file('trendx_decision.csv','wb')
    writer=csv.writer(csvfile)
    writer.writerow(['filepath','predict_value','label'])

    m = run.JSModel() 
    for root, dirs, files in os.walk(folder_path):
        for f in files:
            filepath = os.path.join(folder_path, f)
            p_value=float(m.predictfile(filepath)[0])
            writer.writerow([filepath,str(p_value),str(1 if p_value>0.5 else 0)])


if __name__=='__main__':
    if len(sys.argv)!=2:
        print_usage()
        exit(-1)

    folder_path=sys.argv[1]
    if not os.path.exists(folder_path):
        print 'folder not exists'
        exit(0)

    folder_process(folder_path)