# author: Feihao Chen
# date: 2017/2/20
import os, sys, shutil
import zipfile
import csv
from vt_query import *
from gsb_api import GSBHelper

def unzip_saz(input_saz, output_folder):
    if not os.path.exists(input_saz):
        print "[ERROR] cannot find input saz file, " + input_saz
        return
    if os.path.exists(output_folder):
        shutil.rmtree(output_folder)
    os.makedirs(output_folder)

    try:
        zip_file = zipfile.ZipFile(input_saz, 'r')
        zip_file.extractall(output_folder)
    except Exception as e:
        print "[ERROR] cannot unzip file:",input_saz
        print e
        pass

def get_url_list(saz_raw_dir):
    urls_to_test = []
    for root, dirs, files in os.walk(saz_raw_dir):
        for name in files:
            cur_file_path = os.path.join(root, name)
            if name.endswith('c.txt'):
                with open(cur_file_path,'r') as fh:
                    lines = fh.readlines()
                    for line in lines:
                        if line.startswith('Host:'):
                            url = line[6:-1]
                            t = url.find(':')
                            if t>-1:
                                url = url[:t]   # remove the port
                            urls_to_test.append(url)
    return set(urls_to_test)

csv_path = ''

class saz_url_analyzer():
    def __init__(self):
        self.saz_file = ''
        self.url_list = []
        self.no_report_list = []
        self.bad_url = []
        self.GH = GSBHelper()

    def parse_saz_file(self,saz_file_path):
        self.saz_file = saz_file_path.split('\\')[-1]
        unzip_saz(saz_file_path, 'out')
        self.url_list = get_url_list(os.path.join('out','raw'))
        self.no_report_list = []
        self.bad_url_list = []
        if not self.url_list:
            print 'No url is found! Please check it!'
            exit(-1)

    def get_gsb_result(self,url):
        gr = self.GH.check_url(url)
        if gr:
            return 'T' 
        elif gr == False:
            return 'F'
        else:
            return '?'

    def get_csv(self):
        if not csv_path:
            csv_name = os.path.splitext(self.saz_file)[0]+'_urls.csv'
        else:
            csv_name = csv_path
        csvfile=file(csv_name,'wb')
        writer=csv.writer(csvfile)
        writer.writerow(['url','VT-detection','GSB-listed'])

        csvfile=file(csv_name,'ab')
        writer=csv.writer(csvfile)
        with open('resp_json.log','wb') as fh:
            fh.write('')
        for url in self.url_list:
            print '\nNow scanning url: '+url
            if vt_scan(url):
                try:
                    det = vt_report(url)
                    if not det:
                        det = ['-']
                except:
                    self.no_report_list.append(url)
                    continue

                print 'Now quering GSB'
                G_result = self.get_gsb_result(url)
                writer.writerow([url,';'.join(det),G_result])
            else:
                self.bad_url_list.append(url)


        if self.no_report_list:
            for url in self.no_report_list:
                print '\nNow rechecking url: '+url
                try:
                    det = vt_report(url)
                    self.no_report_list.remove(url)
                    if not det:
                        det = ['-']
                except:
                    det = ['?']     # The VT server may fail to generate the report for the moment.

                print 'Now quering GSB'
                G_result = self.get_gsb_result(url)

                writer.writerow([url,';'.join(det),G_result])

        csvfile.close()

        if os.path.exists('bad_url_list.txt'):
            os.remove('bad_url_list.txt')
        if self.bad_url_list:
            with open('bad_url_list.txt','wb') as fh:
                fh.write('\n'.join(self.bad_url_list))

        if os.path.exists('no_report_list.txt'):
            os.remove('no_report_list.txt')
        if self.no_report_list:
            print '\nAcquiring report faild: \n'+' '.join(self.no_report_list)+r'''
Keep in mind that URLs sent using the API have the lowest scanning priority, depending on VirusTotal's load, it may take several hours before the URL is scanned.You can check it on the website later.
'''
            with open('no_report_list.txt','wb') as fh:
                fh.write('\n'.join(self.no_report_list))

def print_usage():
    print """
Usage:
    python saz_url_list.py saz_file [output_csv]
    """

if __name__ == '__main__':
    if len(sys.argv) != 3:
        if len(sys.argv) != 2:
            print_usage()
            exit(-1)
    else:
        csv_path = sys.argv[2]
    analyzer = saz_url_analyzer()
    analyzer.parse_saz_file(sys.argv[1])
    analyzer.get_csv()