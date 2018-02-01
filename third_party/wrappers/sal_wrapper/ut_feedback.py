import sys,os
import unittest
import multiprocessing
import cgi
import BaseHTTPServer
import urllib,urllib2

from sa import *
from ut_util import *


class FakeSALScanner:

    def __init__(self, engine_version, pattern_version):
        self.engine_version = engine_version
        self.pattern_version = pattern_version

    def get_engine_version(self):
        return self.engine_version

    def get_pattern_version(self):
        return self.pattern_version


class FakeResult(ScanResult):

    def __init__(self):
        self.decision = SA_DECISION_MALICIOUS
        self.rules = [u'Dynamic Script/Specific/JS.BlackholeKit.F', 
                      u'Dynamic Script/Specific/JS.GenericEK.A', 
                      u'Dynamic Script/Specific/JS.BlackholeKit.M']
        self.module = u'DynamicScriptAnalyzer'
        self.filetype = u'html'
        self.behavior_report = u'<report>this is fake behavior report</report>'
        self._engine_version = '3.0.1001'
        self._pattern_version = '2.05.1001'

    def get_decision(self):
        return self.decision

    def get_module(self):
        return self.module

    def get_rules(self):
        return self.rules

    def get_filetype(self):
        return self.filetype

    def get_behavior_report(self):
        return self.behavior_report

    def get_engine_version(self):
        return self._engine_version

    def get_pattern_version(self):
        return self._pattern_version


    def to_feedback_info(self, info={}):
        info['decision'] = DECISION_NAME[self.get_decision()]
        info['rule'] = ";".join(self.get_rules())
        info['module'] = "SAL/" + self.get_module()
        info['engine_version'] = self.get_engine_version()
        info['pattern_version'] = self.get_pattern_version()
        return info

## Test Cases

class TestFeedbackInfo(unittest.TestCase):

    def setUp(self):
        # start feedback server
        self.feedback_server = FeedbackServerAgent(8002)

        # create feedback manager
        self.feedback_manager = FeedbackManager(self.feedback_server.get_post_url())

        self.default_url = "http://www.aa88saa.com/a.js"
        self.default_content = '<html>default html</html>'
        self.default_page = Page(self.default_url, content=self.default_content)
        self.default_result = FakeResult()

    def tearDown(self):
        self.feedback_server.close()
    

    def test_field_date(self):
        download_time = time.time()
        page = Page(self.default_url, content=self.default_content,
                                      download_time=download_time)
        check_date = time.strftime('%Y-%m-%d %H:%M:%S', 
                                   time.gmtime(download_time))

        self.feedback_manager.feedback(self.default_page, self.default_result)
        info, content, behavior = self.feedback_server.get_next_feedback()
        self.assertEqual(check_date, info['date'])

    def test_field_url(self):
        page = Page(self.default_url, content=self.default_content)

        self.feedback_manager.feedback(page, self.default_result)
        info, content, behavior = self.feedback_server.get_next_feedback()
        self.assertEqual(info['url'], self.default_url)

    def test_field_versions(self):
        result = FakeResult()
        result._engine_version = '3.0.1028'
        result._pattern_version = '2.05.1301'
        self.feedback_manager.feedback(self.default_page, result)
        info, content, behavior = self.feedback_server.get_next_feedback()
        self.assertEqual(info['engine_version'], '3.0.1028')
        self.assertEqual(info['pattern_version'], '2.05.1301')
                         
    def test_field_decision(self):
        result = FakeResult()
        result.decision = SA_DECISION_MALICIOUS
        self.feedback_manager.feedback(self.default_page, result)
        info, content, behavior = self.feedback_server.get_next_feedback()
        self.assertEqual(info['decision'], 'MALICIOUS')

        result = FakeResult()
        result.decision = SA_DECISION_MONITORING
        self.feedback_manager.feedback(self.default_page, result)
        info, content, behavior = self.feedback_server.get_next_feedback()
        self.assertEqual(info['decision'], 'MONITORING')

    def test_other_fields(self):
        self.feedback_manager.feedback(self.default_page, self.default_result)
        info, content, behavior = self.feedback_server.get_next_feedback()
        self.assertEqual(info['referer'], None)
        self.assertEqual(info['solution'], 'SA')
        self.assertEqual(info['browser'], None)
        self.assertEqual(info['user_action'], None)
        self.assertEqual(info['peer_ip'], None)


if __name__ == "__main__":
    unittest.main()

