# date: 2017/02/22
# author: Feihao Chen
import os,sys,shutil
import urllib2
import datetime

def get_respond_text(url):
    req = urllib2.Request(url)
    return urllib2.urlopen(req)

class mta_spider(object):
    def __init__(self):
        self.url_base = 'http://malware-traffic-analysis.net/'
        self.storage_dir = os.path.join('F:','mta')
        self.last_scan_date = ['2013','06','17']

    def check_environment(self):
        if not os.path.isdir(self.storage_dir):
            print 'The storage directory doen\'t exist!\nInitializing now...'
            try:
                os.makedirs(self.storage_dir)
                with open(os.path.join(self.storage_dir,'update.dat'),'wb') as f:
                    f.write('-'.join(self.last_scan_date))
                os.makedirs(os.path.join(self.storage_dir,'downloads'))
                print 'Initialzing completed.\n'
            except:
                print 'Initialzing failed!'
                exit(-1)
        else:
            if not os.path.exists(os.path.join(self.storage_dir,'update.dat')):
                print 'File \'update.dat\' missed, recreating now!'
                with open(os.path.join(self.storage_dir,'update.dat'),'wb') as f:
                    f.write('-'.join(self.last_scan_date))
            else:
                with open(os.path.join(self.storage_dir,'update.dat'),'rb') as f:
                    ds = f.read().strip()
                    self.last_scan_date = ds.split('-')
            if not os.path.isdir(os.path.join(self.storage_dir,'downloads')):
                os.makedirs(os.path.join(self.storage_dir,'downloads'))

    def download_by_day(self,str_day,res_html):
        dir_by_day = os.path.join(self.storage_dir,'downloads',str_day)
        the_page = res_html.readlines()

        zip_list = set()
        for line in the_page:
            if line.find('href=')>0:
                s = line.find(r'href="')
                e = line.find(r'"',s+6)
                href = line[s+6:e]
                if href.endswith('.zip'):
                    zip_list.add(href)

        if zip_list and not os.path.isdir(dir_by_day):
            os.makedirs(dir_by_day)
        for zipfile in zip_list:
            try:
                response = get_respond_text(self.url_base+'/'.join(str_day.split('-'))+'/'+zipfile)
            except urllib2.HTTPError:
                print 'Downloading failed: '+zipfile+'    <<<CHECK HERE!'
                response = ''
            with open(os.path.join(dir_by_day,zipfile.replace('/','_')),'w') as fh:
                fh.write(response.read())
        print 'Download completely on '+str_day

    def update_info(self,str_day):
        with open(os.path.join(self.storage_dir,'update.dat'),'wb') as f:
            f.write(str_day)

    def download(self):
        y,m,d = self.last_scan_date
        begin = datetime.date(int(y),int(m),int(d)) + datetime.timedelta(days=1)
        end = datetime.date.today()
        for i in range((end - begin).days+1):
            day = begin + datetime.timedelta(days=i)
            str_day = day.strftime("%Y-%m-%d")
            try:
                response = get_respond_text(self.url_base+day.strftime("%Y/%m/%d"))
            except urllib2.HTTPError:
                print 'No file found on '+str_day
                self.update_info(str_day)
                continue
            self.download_by_day(str_day,response)
            self.update_info(str_day)

def main():
    MS = mta_spider()
    MS.check_environment()
    MS.download()
    print 'Task completed,now killing the progress.'
    exit(-1)

if __name__ == '__main__':
    if len(sys.argv) != 1:
        print 'Argument out of range!'
        exit(-1)
    main()