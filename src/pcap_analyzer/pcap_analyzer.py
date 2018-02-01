# date: 2017/02/27
# author: Feihao Chen
import os,sys,shutil
import zipfile
import urllib,urllib2
import json
import time,datetime
import csv
import hashlib
from file_type import *
sys.path.append("..\..")
import third_party.wrappers.SALineup_python.pysal as SA

def get_current_time():
    return time.strftime('%H:%M:%S',time.localtime(time.time()))

def get_respond_text(url):
    req = urllib2.Request(url)
    return urllib2.urlopen(req)

def calc_sha1(filepath):
    with open(filepath,'rb') as f:
        sha1obj = hashlib.sha1()
        sha1obj.update(f.read())
        hash = sha1obj.hexdigest()
        return hash

my_api_key = '1c61351694700b80190bcf07f3d043be0d656591919ad4f5a81836b3ae76bb87'
report_api = 'https://www.virustotal.com/vtapi/v2/file/report'
def vt_file_detected(filepath):
    time.sleep(15)
    params = {'apikey': my_api_key, 'resource': calc_sha1(filepath)}
    req = urllib2.Request(report_api, data=urllib.urlencode(params))
    try:
        the_page = urllib2.urlopen(req).read()
    except Exception as e:
        print "[ERROR] Failed to quering VT:",filepath
        print e
        return '?'
    response_dict = json.loads(the_page)
    if 1 != response_dict['response_code']:
        return '?'
    scans = response_dict.get('scans', {})
    detected_key = []
    for key in scans:
        if True == scans[key]["detected"]:
            detected_key.append(key+':'+scans[key]["result"])
    print 'VT detected on %s scanners.\n' % str(len(detected_key))
    return ';'.join(detected_key) if detected_key else '-'

class pcap_analyzer(object):
    def __init__(self):
        self.src_dir = ''
        self.unpack_dir = os.path.join('F:\\','mta_unpacked')
        self.csv = 'result.csv'
        self.sal = SA.PySalHelper()
        self.sal.set_args_for_scan({'loglevel':'all', 'productname':'sc', 'script_malware':True})

    def set_src(self,src_dir):
        self.src_dir = src_dir

    def unpack(self):
        if not os.path.isdir(self.unpack_dir):
            os.makedirs(self.unpack_dir)
        dirlist = os.listdir(self.src_dir)
        if not dirlist:
            print 'Empty destination!'
            exit(-1)
        for sub_dir in dirlist:
            in_dir = os.path.join(self.src_dir,sub_dir)
            out_dir = os.path.join(self.unpack_dir,sub_dir)
            if not os.path.exists(out_dir):
                os.makedirs(out_dir)
            print get_current_time(),'Now unpacking file on '+sub_dir
            for root, dirs, files in os.walk(in_dir):
                for name in files:
                    filename=os.path.join(root,name)
                    if name.endswith('.zip') and not name.endswith('.pcap.zip'):
                        try:
                            zip_file = zipfile.ZipFile(filename, 'r')
                            zip_file.extractall(out_dir, pwd='infected')
                        except Exception as e:
                            print "[ERROR] cannot unzip file:",name
                            print e
        print '\nUnpack successfully!'

    def csv_append(self,file_path,date=''):
        csvfile=file(self.csv,'ab')
        writer=csv.writer(csvfile)

        fn = os.path.basename(file_path)
        try:
            sal_result = self.sal.scan_file(file_path=file_path)
            res = SA.DECISION_NAME[sal_result.get_decision()]
        except Exception as e:
            print "[ERROR] SAL cannot scan file:",fn
            print e
            res = '?'
        writer.writerow([date, fn, calc_sha1(file_path), filetype(file_path), res, vt_file_detected(file_path)])

    def scan(self):
        # sal & vt
        if not os.path.exists(self.csv):
            fieldnames = ['date','filename','SHA1','file_type','sal_decision','vt_detection']
            csvfile=file(self.csv,'wb')
            writer=csv.writer(csvfile)
            writer.writerow(fieldnames)
            csvfile.close()
            begin_date = datetime.date(2013,06,17)
            print '\nInitial csvfile successfully, now scanning files...\n'
        else:
            with open(self.csv,'rb') as f:
                l = f.readlines()
            y,m,d = l[-1].split(',')[0].split('-')
            begin_date = datetime.date(int(y),int(m),int(d)) + datetime.timedelta(days=1)
            print '\nCsvfile exists, now scanning files...\n'

        dirlist = os.listdir(self.unpack_dir)
        for sub_dir in dirlist:
            y,m,d = sub_dir.split('-')
            if begin_date > datetime.date(int(y),int(m),int(d)):
                continue
            print get_current_time(),'Now scanning file on '+sub_dir
            for root, dirs, files in os.walk(os.path.join(self.unpack_dir,sub_dir)):
                for name in files:
                    if name.endswith('.pcap') or name.endswith('.csv'):
                        continue        # no need
                    file_path = os.path.join(root,name)
                    with open(file_path,'rb') as f:
                        if not f.read():
                            continue        # empty file
                    self.csv_append(file_path,date=sub_dir)

def print_usage():
    print """
Usage:
    python pcap_analyzer.py src_dir
    """

def main():
    PA = pcap_analyzer()
    PA.set_src(sys.argv[1])
    PA.unpack()
    PA.scan()

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print_usage()
        exit(-1)
    main()