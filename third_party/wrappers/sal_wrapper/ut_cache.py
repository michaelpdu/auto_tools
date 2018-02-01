import unittest
import memcache
import subprocess
import time

from sa import *
from ut_util import *


class TestFilterByDecisionType(unittest.TestCase):
    '''Verify that only certain types of decision of scan result will be cached.
    So far only normal decision will.
    '''
    def setUp(self):
        self.mcsrv = MemcachedAgent(11211)
        self.cache = ResultCache([self.mcsrv.get_server_string()])
        url = "http://www.abcdefg.com"
        html_with_scripts = "<script>var a;</script>"
        # a page that meet cache criteria
        self.page = Page(url, content=html_with_scripts)

    def tearDown(self):
        self.mcsrv.close()

    def test_normal_result(self):
        result = NormalResult(SA_DECISION_NORMAL, SA_CATEGORY_NORMAL)
        self.assertTrue(self.cache.cache_scan_result(self.page, result))

    def test_monitoring_result(self):
        result = NormalResult(SA_DECISION_MONITORING, SA_CATEGORY_NORMAL)
        self.assertTrue(not self.cache.cache_scan_result(self.page, result))

    def test_malicious_result(self):
        result = NormalResult(SA_DECISION_MALICIOUS, SA_CATEGORY_NORMAL)
        self.assertTrue(not self.cache.cache_scan_result(self.page, result))


class TestFilterByPage(unittest.TestCase):
    '''Verify that only html with script will be cached.
    '''
    def setUp(self):
        self.mcsrv = MemcachedAgent(11211)
        self.cache = ResultCache([self.mcsrv.get_server_string()])
        # a scan result that meet cache criteria
        self.result = NormalResult(SA_DECISION_NORMAL, SA_CATEGORY_NORMAL)
        self.url = "http://www.abcdefg.com"

    def tearDown(self):
        self.mcsrv.close()

    def test_plain_text(self):
        page = Page(self.url, content='''hello world!''')
        self.assertTrue(not self.cache.cache_scan_result(page, self.result))

    def test_html_without_script(self):
        page = Page(self.url, content='''<html>aaaaaaa</html>''')
        self.assertTrue(not self.cache.cache_scan_result(page, self.result))

    def test_html_with_script(self):
        page = Page(self.url, content='''<script>aaaaaaa</script>''')
        self.assertTrue(self.cache.cache_scan_result(page, self.result))

    def test_html_with_script_src(self):
        page = Page(self.url, content='''<script src='http://qq.com'></script>''')
        self.assertTrue(self.cache.cache_scan_result(page, self.result))


class TestMatchCache(unittest.TestCase):
    '''Verify that only certain format of content will be cached.
    '''
    def setUp(self):
        self.mcsrv = MemcachedAgent(11211)
        self.cache = ResultCache([self.mcsrv.get_server_string()])
        self.result = NormalResult(SA_DECISION_NORMAL, SA_CATEGORY_NORMAL)
        self.url = "http://www.abcdefg.com"
        self.content = 'aaa<script src="1.js"></script>xx'

    def tearDown(self):
        self.mcsrv.close()

    def assertMatch(self, page1, page2):
        # make sure no cache for page2
        self.assertTrue(not self.cache.query_scan_result(page2))
        # cache page1
        self.assertTrue(self.cache.cache_scan_result(page1, self.result))
        # make sure exists cache for page2
        self.assertTrue(self.cache.query_scan_result(page2))

    def assertNotMatch(self, page1, page2):
        # make sure no cache for page2
        self.assertTrue(not self.cache.query_scan_result(page2))
        # cache page1
        self.assertTrue(self.cache.cache_scan_result(page1, self.result))
        # make sure exists cache for page2
        self.assertTrue(not self.cache.query_scan_result(page2))

    def test_all_the_same(self):
        page1 = Page(self.url, content='''aaa<script>var i=1</script>''')
        page2 = Page(self.url, content='''aaa<script>var i=1</script>''')
        self.assertMatch(page1, page2)

    def test_inline_script_P(self):
        page1 = Page(self.url, content='''aaa<script>var i=1</script>''')
        page2 = Page(self.url, content='''bbb<script>var i=1</script>''')
        self.assertMatch(page1, page2)

    def test_inline_script_N(self):
        page1 = Page(self.url, content='''aaa<script>var i=1</script>''')
        page2 = Page(self.url, content='''bbb<script>var i=2</script>''')
        self.assertNotMatch(page1, page2)

    def test_multiple_scripts(self):
        page1 = Page(self.url, content='''aaa<script>var i=1</script>xxxxxxsoz<script>var i=1</script>''')
        page2 = Page(self.url, content='''aaa<script>var i=1</script>xx99999999xsoz<script>var i=1</script>''')
        self.assertMatch(page1, page2)

    def test_truncated_script(self):
        page1 = Page(self.url, content='''aaa<script>var i=1<script>aaaaaaa</script>''')
        page2 = Page(self.url, content='''aaa<script>var J=2<script>aaaaaaa</script>''')
        self.assertNotMatch(page1, page2)

    def test_src_script_P(self):
        page1 = Page(self.url, content='''aaa<script src="1.js"></script>xx''')
        page2 = Page(self.url, content='''bbb<script src="1.js"></script>xx''')
        self.assertMatch(page1, page2)

    def test_src_script_N(self):
        page1 = Page(self.url, content='''aaa<script src="1.js"></script>xx''')
        page2 = Page(self.url, content='''bbb<script src="2.js"></script>xx''')
        self.assertNotMatch(page1, page2)

    def test_url_P1(self):
        page1 = Page('http://www.abc.com/news/a.php', content=self.content)
        page2 = Page('http://www.abc.com/news/a.php', content=self.content)
        self.assertMatch(page1, page2)

    def test_url_P2(self):
        page1 = Page('http://www.abc.com/news/a.php', content=self.content)
        page2 = Page('http://www.abc.com/p.jsp', content=self.content)
        self.assertMatch(page1, page2)

    def test_url_N(self):
        page1 = Page('http://www.exy.com/news/a.php', content=self.content)
        page2 = Page('http://www.abc.com/p.jsp', content=self.content)
        self.assertNotMatch(page1, page2)

    def test_multiline_script(self):
        page1 = Page(self.url, content='''aaa
        <script>
        var a=1;
        </script>xx''')
        page2 = Page(self.url, content='''bbb
        <script>
        var a=2;
        </script>xx''')
        self.assertNotMatch(page1, page2)

if __name__=="__main__":
    unittest.main()

