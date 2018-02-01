# auther = Cheng Chang(SA)
# Date = 2016/11/28
import json
import urllib
import urllib2
import hashlib
import re
import sys
import time
import os
import csv


class vtHelper():
    def __init__(self, sha1_file, vt):
        self.sha1_file = sha1_file
        self.vt = vt

    def work(self):
        with open('report.csv', 'wb') as report, open(self.sha1_file, "r") as sha1s:
            writer = csv.writer(report)
            writer.writerow(['SHA1', 'Detected by', 'Sophos', 'Kaspersky', 'ESET-NOD32', 'Microsoft'])
            for sha1 in sha1s:
                sha1 = sha1.strip()
                print 'start anaylsis %s' % sha1
                md5 = self.checkMD5(sha1)
                row = []
                try:
                    row = self.parse(self.vt.getReport(md5), md5)
                except ValueError:
                    print 'more than 4r/min,20s later try to reparse'
                    time.sleep(1)
                    row = self.parse(self.vt.getReport(md5), md5)
                row.insert(0, sha1)
                writer.writerow(row)
                time.sleep(14)

    def md5sum(self, filename):
        fh = open(filename, 'rb')
        m = hashlib.md5()
        while True:
            data = fh.read(8192)
            if not data:
                break
            m.update(data)
        return m.hexdigest()

    def checkMD5(self, checkval):  # Md5 Function
        if re.match(r"([a-fA-F\d]{32})", checkval) is None:
            md5 = self.md5sum(checkval)
            return md5.upper()
        else:
            return checkval.upper()

    def parse(self, it, md5):
        if it['response_code'] == 0:
            print md5 + " -- Not Found in VT"
            return [''] * 5
        row = [str(it['positives']) + '/' + str(it['total'])]
        if 'Sophos' in it['scans']:
            row.append(str(it['scans']['Sophos']['result']))
        if 'Kaspersky' in it['scans']:
            row.append(str(it['scans']['Kaspersky']['result']))
        if 'ESET-NOD32' in it['scans']:
            row.append(str(it['scans']['ESET-NOD32']['result']))
        if 'Microsoft' in it['scans']:
            row.append(str(it['scans']['Microsoft']['result']))
        return row


class vtAPI():
    def __init__(self):
        # public api
        self.api = '835e016eefcb38be48a7dcb2723b2da0f6fa8b59fc22a38c633f986888b44215'
        self.base = 'https://www.virustotal.com/vtapi/v2/'

    def getReport(self, md5):
        param = {'resource': md5, 'apikey': self.api}
        url = self.base + "file/report"
        data = urllib.urlencode(param)
        result = urllib2.urlopen(url, data)
        jdata = json.loads(result.read())
        return jdata


def main():
    if len(sys.argv) != 2:
        print """
Usage:
    python vt_public.py sha1s.txt

Scan sha1 on VT,generate csv report
    """
        exit(0)
    else:
        if not os.path.exists(sys.argv[1]):
            print "file don't exists"
            exit(0)

    sha1_file = sys.argv[1]
    vt = vtAPI()
    vthelper = vtHelper(sha1_file, vt)
    vthelper.work()


if __name__ == '__main__':
    main()
