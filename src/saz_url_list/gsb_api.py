# auther = Cheng Chang(SA)
# Date = 2017/2/20
import urllib2
import os
import sys
import time


class GSBHelper():
    def __init__(self):
        self.root_path_ = os.path.split(os.path.realpath(__file__))[0]
        self.url_temp_ = 'https://www.google.com/safebrowsing/diagnostic?output=jsonp&site=%s'
        self.request_header = {'accept-language':'en,zh-CN;q=0.8,zh;q=0.6','cookie':'OGPC=976493568-1:946258944-1:; NID=93=Qr5Axi_VxVmuHRphHkkpJCZ80kFlLKHvSZ6COSi_-0SrKpQ_Az5kNUSKKnp7bGvf4PfbgiQPXjH7Hp_ZY6aIwxjcDIWI-pfpiOKkW7292oNyon27zJFRl--M5X4fIvq8z-oZeIIWga7l0eO9OqKX2loBPP6-HlNU-_aTxTrRxXBWdWPuOWfptoK3VUqH','referer': 'https://www.google.com/transparencyreport/safebrowsing/diagnostic/?hl=zh-CN','user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36','x-client-data':'CJK2yQEIprbJAQjEtskBCPucygEIqZ3KAQ=='}

    def check_url(self, site):
        req = urllib2.Request(self.url_temp_ % site, None, self.request_header)
        res_timeout = 5
        try:
            resp = urllib2.urlopen(req, None, res_timeout)
        except urllib2.HTTPError:
            return False
        except Exception as e:
            cur_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
            print '%s [ERROR]%s %s' % (cur_time, e, site)
            return None
        html = resp.read()
        name_index = 'malwareListStatus": "'
        index = html.find(name_index) + len(name_index)
        if html[index] == 'l':  # mal
            return True
        else:
            return False  # normal

# cmd
# python gsb_api.py url


def main():
    if len(sys.argv) != 2:
        print 'python gsb_api.py url'
        exit(-1)
    url = sys.argv[1]
    gsbHelper = GSBHelper()
    result = gsbHelper.check_url(url)
    if result is True:
        print 'Listed'
    else:
        print 'Unlisted'


if __name__ == '__main__':
    main()
