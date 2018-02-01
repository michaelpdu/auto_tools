import MySQLdb
import os
import csv
import re
import sys

class FindNssidEk:
    def __init__(self):
        self.filename_nssid = {}
        self.nssid_ek = {}
        self.name = None
        self.nssid = None
        self.ek = None
        self.url_pattern = 'url_pattern.txt'

    def MatchNssid(self,DIR,NssidName):
        ek_pattern = None
        match_flag = 0
        for file_name_tmp in os.listdir(DIR):
            file_name_split = file_name_tmp.split('_url.log')[0]
            if file_name_split == NssidName:
                file_name = os.path.join(DIR, file_name_tmp)
                file_to_read = open(file_name, 'r')
                for file_line_tmp in file_to_read:
                    file_line = file_line_tmp.split()[0]
                    #    print file_line,len(file_line)
                    url_pattern_read = open(self.url_pattern, 'r')
                    for url_pattern_line_tmp in url_pattern_read:
                        url_pattern_line = url_pattern_line_tmp.split()[1]
                        ek_pattern_tmp = url_pattern_line_tmp.split()[0]
                        pattern = re.compile(url_pattern_line)
                        match_result = pattern.match(file_line)
                        if match_result is not None:
                            match_flag = 1
                            ek_pattern_tmp2 = ek_pattern_tmp.split('URL_')[1]
                            ek_pattern = ek_pattern_tmp2.split('_')[0]
                            print file_line, url_pattern_line, ek_pattern
                            break
                    if match_flag == 1:
                        break
                    url_pattern_read.close()
                file_to_read.close()
            if match_flag == 1:
                break
        return ek_pattern

    def MysqlFindDir(self, DIR):
        for name in os.listdir(DIR):
            print name
            sql = "SELECT nssid FROM caws_dailydetail WHERE sha1 = '%s' " % (name)
            cursor.execute(sql)
            nssid = cursor.fetchone()
            if nssid is None:
                sql = "SELECT nssid FROM frs_dailydetail WHERE sha1 = '%s' " % (name)
                cursor.execute(sql)
                nssid = cursor.fetchone()
            print "nssid  is : %s " % nssid

            if nssid is not None:
                self.filename_nssid[name] = nssid
                sql = "SELECT ek FROM tb_saz_sample WHERE saz_id = '%s' " % (nssid)
                cursor.execute(sql)
                ek = cursor.fetchone()
                print "ek  is : %s " % ek
                if ek is not None:
                    self.nssid_ek[nssid] = ek
        return self.filename_nssid, self.nssid_ek

    def MysqlFindName(self, name):
        self.name = name
        print "name is : %s" % self.name
        sql = "SELECT nssid FROM caws_dailydetail WHERE sha1 = '%s' " % (self.name)
        cursor.execute(sql)
        self.nssid = cursor.fetchone()

        if self.nssid is None:
            sql = "SELECT nssid FROM frs_dailydetail WHERE sha1 = '%s' " % (self.name)
            cursor.execute(sql)
            self.nssid = cursor.fetchone()

        if self.nssid is not None:
            print "nssid  is : %s " % self.nssid
            sql = "SELECT ek FROM tb_saz_sample WHERE saz_id = '%s' " % (self.nssid)
            cursor.execute(sql)
            self.ek = cursor.fetchone()
#            print "ek  is : %s " % self.ek
        return self.name, self.nssid

help_msg = """
Usage:
    python find_nssid_ek.py filename
    
    Note:
    filename is a file that contains sha1
    before running this program you need url_pattern.txt 
    and a file named url_log created by running get_all_log.py 
"""

if __name__ == '__main__':
    MAL_SAMPLE_DIR = '/sa/sample/html/mal_test'
    db = MySQLdb.connect("10.64.24.44", "test", "111111", "detectiontest")
    cursor = db.cursor()
    find_nssid_ek = FindNssidEk()
    filename = sys.argv[1]
#    filename = 'D:\\total.txt'
    path_nsslab = '.\url_log'
    file_to_read = open(filename, 'r')
    while 1:
        line_n = file_to_read.readline()
        if not line_n:
            break
        line = line_n.strip()
        name, nssid= find_nssid_ek.MysqlFindName(line)
        if nssid is not None:
            print type(nssid[0]),len(nssid[0])
            ek = find_nssid_ek.MatchNssid(path_nsslab,nssid[0])
            with open('result.csv', 'ab+') as f:
                writer = csv.writer(f)
                writer.writerow([name,nssid[0],ek])
    db.close()


