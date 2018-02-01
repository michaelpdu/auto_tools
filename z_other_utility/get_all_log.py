import os, shutil, sys
import datetime
work_dir = r'Z:\NSSLab_Samples'
#work_dir = r'D:\\'
dst_dir = 'url_log'

def get_log_date(str_date):
    date_dir = os.path.join(work_dir, str_date)
    if not os.path.isdir(date_dir):
        return
    for each_nssid in os.listdir(date_dir):
        nssid_dir = os.path.join(date_dir, each_nssid)
        if not os.path.isdir(nssid_dir):
            continue
        url_log_path = os.path.join(nssid_dir, each_nssid+'_url.log')
        dst_path = os.path.join(dst_dir, each_nssid+'_url.log')
        if os.path.exists(url_log_path) and not os.path.exists(dst_path):
            shutil.copy2(url_log_path, dst_path)

if not os.path.exists(dst_dir):
    os.makedirs(dst_dir)

if __name__ == '__main__':
    sdate_str = sys.argv[1]
    edate_str = datetime.datetime.now().strftime("%Y%m%d")
    
    sdate = datetime.datetime.strptime(sdate_str,"%Y%m%d")
    edate = datetime.datetime.strptime(edate_str,"%Y%m%d")
    idate = sdate
    while idate <= edate:
        str_date = idate.strftime("%Y%m%d")
        print str_date
        get_log_date(str_date)
        idate += datetime.timedelta(days=1)
    



