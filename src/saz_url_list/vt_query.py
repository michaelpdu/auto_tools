'''
    author: Feihao Chen
    date: 2017/2/17

    Note that the apikey should be a secret,please replace it by your own's!
'''
import sys,os
import urllib,urllib2
import time
import json

my_api_key = '1c61351694700b80190bcf07f3d043be0d656591919ad4f5a81836b3ae76bb87'
scan_api = 'https://www.virustotal.com/vtapi/v2/url/scan'
report_api = 'https://www.virustotal.com/vtapi/v2/url/report'

def get_response(api,params):
    req = urllib2.Request(api, data=urllib.urlencode(params))
    response = urllib2.urlopen(req) 
    return response.read()

def vt_scan(url):
    params = {'apikey': my_api_key, 'url':url}
    the_page = get_response(scan_api,params)
    if the_page:
        with open('resp_json.log','ab') as fh:
            fh.write(the_page+'\n')
        response_dict = json.loads(the_page)
    else:
        time.sleep(15)      # In case of going over the frequency limited.
        return vt_scan(url)

    if response_dict['response_code'] == 1:
        print 'Url scanned successfully!'
        return True
    else:
        print response_dict['verbose_msg']
        return False

def vt_report(url):
    print 'Now acquiring the report...'

    # sleep 15 to control requests/min to API. Public APIs only allow for 4/min threshold.
    time.sleep(15)

    params = {'apikey': my_api_key, 'resource':url}
    the_page = get_response(report_api,params)
    with open('resp_json.log','ab') as fh:
        fh.write(the_page+'\n')

    response_dict = json.loads(the_page)
    scans = response_dict.get('scans', {})
    detected_key = []
    for key in scans:
        if True == scans[key]["detected"]:
            detected_key.append(key)
    return detected_key

def batch_query(urls):
    # urls should be a list
    with open('resp_json.log','wb') as fh:
        fh.write('')
    for url in urls:
        print 'Now scanning url: '+url+'\n'
        vt_scan(url)
        det = vt_report(url)
        if det:
            print 'Detected in: '+';'.join(vt_report(url))
        else:
            print 'Detected in no scanner!'

def print_usage():
    print """
Usage:
    python vt_query.py url
    """

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print_usage()
        exit(-1)

    url = sys.argv[1]
    print 'Now scanning url: '+url
    if vt_scan(url):
        det = vt_report(url)
        if det:
            print 'Detected in: '+';'.join(vt_report(url))
        else:
            print 'Detected in no scanner!'