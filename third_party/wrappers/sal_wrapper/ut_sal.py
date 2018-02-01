import sys,os
import unittest

from sa import *
from sa_sal_api import *

SAL_ENGINE_FILE = './ut_data/lib/libtmsa.so'
SAL_CONFIG_FILE = './ut_data/ptn/tmsa.cfg'
SAL_LOG_FILE    = './ut_data/tmsa.log'

URL = 'http://www.abcxEsoxikdaxcis.com'

scanner = SALScanner(SAL_CONFIG_FILE, SAL_LOG_FILE)

def sample(rpath):
    return os.path.join("./ut_data/sample", rpath)

class TestDecision(unittest.TestCase):
    '''
    '''
    def test_normal(self):
        page = Page(URL, content_file=sample("normal.html"))
        result = scanner.scan(page)
        self.assertEqual(SA_DECISION_NORMAL, result.get_decision())

    def test_monitoring(self):
        page = Page(URL, content_file=sample("06bd.html"))
        result = scanner.scan(page)
        self.assertEqual(SA_DECISION_MONITORING, result.get_decision())
        info = result.to_feedback_info()
        self.assertEqual('MONITORING', info['decision'])

    def test_malicious(self):
        page = Page(URL, content_file=sample("cd9a.html"))
        result = scanner.scan(page)
        self.assertEqual(SA_DECISION_MALICIOUS, result.get_decision())
        info = result.to_feedback_info()
        self.assertEqual('MALICIOUS', info['decision'])


class TestCategory(unittest.TestCase):

    def test_exploit(self):
        page = Page(URL, content_file=sample("cd9a.html"))
        result = scanner.scan(page)
        self.assertEqual(SA_CATEGORY_EXPLOIT, result.get_category())

    def test_phishing(self):
        page = Page(URL, content_file=sample("paypal2.htm"))
        result = scanner.scan(page)
        self.assertEqual(SA_CATEGORY_PHISHING, result.get_category())

class TestFiletype(unittest.TestCase):

    def test_html(self):
        page = Page(URL, content_file=sample("cd9a.html"))
        result = scanner.scan(page)
        self.assertEqual(u"html", page.get_filetype())

    def test_pdf(self):
        page = Page(URL, content_file=sample("038b.pdf"))
        result = scanner.scan(page)
        self.assertEqual(u"pdf", page.get_filetype())

    def test_swf(self):
        page = Page(URL, content_file=sample("7cf6.swf"))
        result = scanner.scan(page)
        self.assertEqual(u"swf", page.get_filetype())

    def test_java(self):
        page = Page(URL, content_file=sample("06a4.jar"))
        result = scanner.scan(page)
        self.assertEqual(u"jar", page.get_filetype())

class TestRules(unittest.TestCase):

    def test_basic(self):
        page = Page(URL, content_file=sample("cd9a.html"))
        result = scanner.scan(page)
        self.assertEqual([u'Dynamic Script/Generic/JS.GenericCK.A', 
                          u'Dynamic Script/Specific/JS.BlackholeKit.F', 
                          u'Dynamic Script/Specific/JS.CoolEK.D', 
                          u'Dynamic Script/Specific/JS.GenericEK.A', 
                          u'Dynamic Script/Specific/JS.BlackholeKit.M'],
                         result.get_rules())
        info = result.to_feedback_info()
        self.assertEqual(";".join(
                         [u'Dynamic Script/Generic/JS.GenericCK.A', 
                          u'Dynamic Script/Specific/JS.BlackholeKit.F', 
                          u'Dynamic Script/Specific/JS.CoolEK.D', 
                          u'Dynamic Script/Specific/JS.GenericEK.A', 
                          u'Dynamic Script/Specific/JS.BlackholeKit.M']),
                         info['rule'])

    def test_java_rule(self):
        page = Page(URL, content_file=sample("06a4.jar"))
        result = scanner.scan(page)
        self.assertEqual([u'cve-2013-1493.1', u'cve-2013-1493.2'],
                         result.get_rules())
        info = result.to_feedback_info()
        self.assertEqual(";".join(
                         [u'cve-2013-1493.1', u'cve-2013-1493.2']),
                         info['rule'])

class TestModule(unittest.TestCase):

    def test_basic(self):
        page = Page(URL, content_file=sample("cd9a.html"))
        result = scanner.scan(page)
        self.assertEqual(u"DynamicScriptAnalyzer", result.get_module())
        info = result.to_feedback_info()
        self.assertEqual('SAL/DynamicScriptAnalyzer', info['module'])

class TestDynamicLinks(unittest.TestCase):

    def test_html(self):
        page = Page(URL, content_file=sample("gsb01.html"))
        result = scanner.scan(page)
        self.assertEqual([u'http://www.imlink.com/a.js'], page.get_dynamic_links())


if __name__=="__main__":
    unittest.main()

