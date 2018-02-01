import sys
import json
import urllib
import urllib2
import time
import csv
import requests
import urllib3

urllib3.disable_warnings()

APIKEY = 'f556c7d2d7bd9ad9d9a72ce156d8c25f5700c134bdff005c8e28c0f0e9512895'

class VirusTotalChecker:
    """"""
    def __init__(self, csv_report):
        self.csv_report_ = csv_report

    def check_file_sha1(self, sha1_str):
        is_multiple = True
        if len(sha1_str.split(',')) <= 1:
            is_multiple = False
        params = {'resource': sha1_str, 'apikey': APIKEY, 'allinfo': 1}
        headers = {'X-Vtd': 'mode=cache1st&max-age=86400'}
        response = requests.get('https://www.virustotal.com/vtapi/v2/file/report', params=params, headers=headers,
                                verify=False)
        if response.status_code == 200:
            response_json = response.json()
            if not is_multiple:
                # if single, VT return dict
                # if multiple, VT return list
                # to sync format, add list to response
                return [response_json]
            else:
                return response_json
        else:
            print response.status_code, "error code"
        return None

    def check_group_sha1(self, sha1_list):
        response_list = self.check_file_sha1(','.join(sha1_list))
        for response in response_list:
            response_code = response['response_code']
            sha1 = response['resource']
            if response_code == 0:
                # cannot find in VirusTotal
                self.csv_writer_.writerow([sha1, '', '', '', '', '', '', '', '', '', '', '', ''])
            else:
                file_type = response['type']
                positives = response['positives']
                total = response['total']
                eset_node32_result = 'None'
                try:
                    eset_node32_result = response['scans']['ESET-NOD32']['result']
                    if None == eset_node32_result:
                        eset_node32_result = 'None'
                except:
                    pass
                f_secure_result = 'None'
                try:
                    f_secure_result = response['scans']['F-Secure']['result']
                    if None == f_secure_result:
                        f_secure_result = 'None'
                except:
                    pass
                fortinet_result = 'None'
                try:
                    fortinet_result = response['scans']['Fortinet']['result']
                    if None == fortinet_result:
                        fortinet_result = 'None'
                except:
                    pass
                kaspersky_result = 'None'
                try:
                    kaspersky_result = response['scans']['Kaspersky']['result']
                    if None == kaspersky_result:
                        kaspersky_result = 'None'
                except:
                    pass
                macafee_result = 'None'
                try:
                    macafee_result = response['scans']['MacAfee']['result']
                    if None == macafee_result:
                        macafee_result = 'None'
                except:
                    pass
                microsoft_result = 'None'
                try:
                    microsoft_result = response['scans']['Microsoft']['result']
                    if None == microsoft_result:
                        microsoft_result = 'None'
                except:
                    pass
                sophos_result = 'None'
                try:
                    sophos_result = response['scans']['Sophos']['result']
                    if None == sophos_result:
                        sophos_result = 'None'
                except:
                    pass
                symantec_result = 'None'
                try:
                    symantec_result = response['scans']['Symantec']['result']
                    if None == symantec_result:
                        symantec_result = 'None'
                except:
                    pass
                trendmicro_result = 'None'
                try:
                    trendmicro_result = response['scans']['TrendMicro']['result']
                    if None == trendmicro_result:
                        trendmicro_result = 'None'
                except:
                    pass
                self.csv_writer_.writerow([sha1, file_type, positives, total, eset_node32_result, f_secure_result,
                                       fortinet_result, kaspersky_result, macafee_result, microsoft_result,
                                       sophos_result, symantec_result, trendmicro_result])

    def query(self, sha1_list_file):
        with open(self.csv_report_, 'wb') as report:
            self.csv_writer_ = csv.writer(report)
            self.csv_writer_.writerow(
                ['SHA1', 'File Type', 'Positive', 'Total', 'ESET-NOD32', 'F-Secure', 'Fortinet', 'Kaspersky', 'MacAfee',
                 'Microsoft', 'Sophos', 'Symantec', 'TrendMicro'])

            with open(sha1_list_file, 'rb') as fh:
                lines = fh.readlines()
                sha1_list = []
                i = 0
                for line in lines:
                    if i % 25 == 0 and i != 0:
                        print ">> query index = {}".format(i)
                        self.check_group_sha1(sha1_list)
                        del sha1_list[:]
                    sha1_list.append(line.strip())
                    i += 1
                if len(sha1_list) > 0:
                    self.check_group_sha1(sha1_list)
                    del sha1_list[:]

help_msg = """
Usage:
    python check_vt_private.py sha1_list_file csv_report_file
"""

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print help_msg
        exit(-1)
    vt_checker = VirusTotalChecker(sys.argv[2])
    vt_checker.query(sys.argv[1])
