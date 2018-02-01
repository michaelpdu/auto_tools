import sys,os
import unittest
import multiprocessing
import cgi
import BaseHTTPServer
import urllib,urllib2
import json

from sa import *
from ut_util import *

URL = 'http://www.abcxEsoxikdaxcis.com'

SAL_ENGINE_FILE = './ut_data/lib/libtmsa.so'
SAL_CONFIG_FILE = './ut_data/ptn/tmsa.cfg'
SAL_LOG_FILE    = './ut_data/tmsa.log'

g_sal_scanner = SALScanner(SAL_CONFIG_FILE, SAL_LOG_FILE)


class TestDecision(unittest.TestCase):

    def setUp(self):
        self.gsb_server = GSBServerAgent(10081)
        self.gsb_scanner = GSBScanner(self.gsb_server.get_query_url())
        self.sal_scanner = g_sal_scanner

    def tearDown(self):
        self.gsb_server.close()

    def test_normal(self):
        page = Page(URL, content='''<html><script>
document.write("<script src='http://www.normal.com/1.js'></scr"+"ipt>");
</script></html>
            ''')
        sal_result = self.sal_scanner.scan(page)
        self.assertEqual(sal_result.get_decision(), SA_DECISION_NORMAL)
        self.assertTrue(page.has_dynamic_link())
        result = self.gsb_scanner.scan(page)
        self.assertEqual(result.get_decision(), SA_DECISION_NORMAL)
        
    def test_malicious(self):
        page = Page(URL, content='''<html><script>
document.write("<script src='http://www.malware.com/1.js'></scr"+"ipt>");
</script></html>
            ''')
        sal_result = self.sal_scanner.scan(page)
        self.assertEqual(sal_result.get_decision(), SA_DECISION_NORMAL)
        self.assertTrue(page.has_dynamic_link())
        result = self.gsb_scanner.scan(page)
        self.assertEqual(result.get_decision(), SA_DECISION_MALICIOUS)
        info = result.to_feedback_info()
        self.assertEqual('MALICIOUS', info['decision'])
        self.assertEqual(None, info['rule'])
        self.assertEqual('GSB', info['module'])

    def test_invalid_link(self):
        page = Page(URL, content='''<html><script>
document.write("<script src='://www.malware.com/1.js'></scr"+"ipt>");
</script></html>
            ''')
        sal_result = self.sal_scanner.scan(page)
        self.assertEqual(sal_result.get_decision(), SA_DECISION_NORMAL)
        self.assertTrue(page.has_dynamic_link())
        result = self.gsb_scanner.scan(page)
        self.assertEqual(result.get_decision(), SA_DECISION_NORMAL)


if __name__=="__main__":
    unittest.main()

