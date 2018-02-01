import sys,os
import re
import unittest
import json
import signal
from ut_util import *


RATING_PHISHING         = '75'
RATING_MALICIOUS        = '79'
RATING_UNKNOWN          = '90'

SCORE_MALICIOUS         = '49'
SCORE_PHISHING          = '49'
SCORE_SUSPICIOUS        = '65'
SCORE_UNKNOWN           = '71'
SCORE_NORMAL            = '81'

RET_URL_UNKNOWN         = 1
RET_URL_MALICIOUS       = 4
RET_URL_PHISHING        = 3

RET_MISS_KEY                            = -1
RET_CONTENT_NOT_EXIST                   = -200
RET_URL_INFO_ALREADY_EXISTED            = -201
RET_URL_INFO_NOT_MATCH_ANALYZE_POLICY   = -202

RET_ENG_ABORTED                         = -1000

class OdinSACommonTestCase(unittest.TestCase):

    def validate_stats(self, stats, checking_stats_metric):
        check_keys = [u"slope", u"unit", u"group", u"name", u"data_type", u"tmax", u"stat_type", u"dmax", u"value"]
        check_keys.sort()
        self.assertNotEqual(stats, None)
        self.assertEqual(type(stats), list)
        for stat in stats:
            self.assertEqual(type(stat), dict)
            keys = stat.keys()
            keys.sort()
            self.assertEqual(keys, check_keys)
            if stat['name'].endswith(checking_stats_metric):
                return
        self.fail("'%s' does not match any of %s" % (checking_stats_metric, 
                ", ".join(["'"+stat['name']+"'" for stat in stats])))


class TestMissContentFile(OdinSACommonTestCase):

    def setUp(self):
        # StatsD
        self.statsd = StatsD_Agent(10000)

        user_conf = "/trend/odin/conf/odin_sa_user_test.conf"
        d = {}
        write_user_conf(user_conf, d)
        self.sa = OdinSA_Mocker(user_conf, mpu_enable=True)
        self.input = self.sa.get_input_pipe()
        self.output = self.sa.get_output_line_queue()

        self.msg_tmpl = {
            "url": "http://www.test1234.com/a.html",
            "vsapi_tftd.cat": "TXT",
            "content.dir": "/tmp/sa_mock",
            "content.filename": "123412341234_not_exists_12341234123412",
            "magic_tftd.desc": "text/html"
        }

    def tearDown(self):
        self.sa.close()
        self.statsd.close()

    def test_01(self):
        msg = self.msg_tmpl.copy()
        print >>self.input, json.dumps([msg])

        data = json.loads(self.output.get(True, 5))
        self.assertEqual(type(data), list)
        self.assertEqual(data[0]['sa.skip'], True)
        self.assertEqual(data[0]['sa.ret'], RET_CONTENT_NOT_EXIST)

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 1)
        self.validate_stats(stats, "odin_sa.processed")
        #self.validate_stats(stats, "odin_sa.valid")

class TestMessageMissKey(OdinSACommonTestCase):

    def setUp(self):
        # StatsD
        self.statsd = StatsD_Agent(10000)

        user_conf = "/trend/odin/conf/odin_sa_user_test.conf"
        d = {}
        write_user_conf(user_conf, d)
        self.sa = OdinSA_Mocker(user_conf, mpu_enable=True)
        self.input = self.sa.get_input_pipe()
        self.output = self.sa.get_output_line_queue()

        self.msg_tmpl = {
            "url": "http://www.test1234.com/a.html",
            "vsapi_tftd.cat": "TXT",
            "content.dir": "/tmp/sa_mock",
            "content.filename": "15d7ae4c17b242d988c76d8099ba77450482310b",
            "magic_tftd.desc": "text/html"
        }

    def tearDown(self):
        self.sa.close()
        self.statsd.close()

    def assertMissKey(self, output_data, miss_key):
        data = json.loads(output_data)
        self.assertEqual(type(data), list)
        self.assertEqual(data[0]['sa.skip'], True)
        self.assertEqual(data[0]['sa.miss_key'], miss_key)
        self.assertEqual(data[0]['sa.ret'], RET_MISS_KEY)

    def test_01(self):
        '''No url, expect: skip
        '''
        msg = self.msg_tmpl.copy()
        del msg['url']
        print >>self.input, json.dumps([msg])
        self.assertMissKey(self.output.get(True, 5), "url")

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 2)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.miss_key")

    def test_02(self):
        '''No content.dir, expect: skip
        '''
        msg = self.msg_tmpl.copy()
        del msg['content.dir']
        print >>self.input, json.dumps([msg])
        self.assertMissKey(self.output.get(True, 5), "content.dir")

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 2)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.miss_key")

    def test_03(self):
        '''No content.filename, expect: skip
        '''

        msg = self.msg_tmpl.copy()
        del msg['content.filename']
        print >>self.input, json.dumps([msg])
        self.assertMissKey(self.output.get(True, 5), "content.filename")

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 2)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.miss_key")

    def test_04(self):
        '''No vsapi_tftd.cat, expect: skip
        '''
        msg = self.msg_tmpl.copy()
        del msg['vsapi_tftd.cat']
        print >>self.input, json.dumps([msg])
        self.assertMissKey(self.output.get(True, 5), "vsapi_tftd.cat")

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 2)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.miss_key")

    def test_05(self):
        '''No magic_tftd.desc, expect: skip
        '''
        msg = self.msg_tmpl.copy()
        del msg['magic_tftd.desc']
        print >>self.input, json.dumps([msg])
        self.assertMissKey(self.output.get(True, 5), "magic_tftd.desc")

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 2)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.miss_key")


class TestAnalyzePolicy(OdinSACommonTestCase):

    def setUp(self):
        # StatsD
        self.statsd = StatsD_Agent(10000)

        user_conf = "/trend/odin/conf/odin_sa_user_test.conf"
        d = {}
        write_user_conf(user_conf, d)
        self.sa = OdinSA_Mocker(user_conf, mpu_enable=True)
        self.input = self.sa.get_input_pipe()
        self.output = self.sa.get_output_line_queue()

        content_dir, content_filename = link_sample("blank.html")

        self.msg_tmpl = {
            "url": "http://www.test1234.com/a.html",
            "vsapi_tftd.cat": "TXT",
            "content.dir": content_dir,
            "content.filename": content_filename,
            "magic_tftd.desc": "text/html"
        }

    def tearDown(self):
        self.sa.close()
        self.statsd.close()

    def assertPolicyAllowed(self, output_data):
        data = json.loads(output_data)
        self.assertEqual(type(data), list)
        self.failIf('sa.skip' in data[0])
        self.failIfEqual(data[0]['sa.ret'], RET_URL_INFO_NOT_MATCH_ANALYZE_POLICY)

    def assertPolicyDenied(self, output_data):
        data = json.loads(output_data)
        self.assertEqual(type(data), list)
        self.assertEqual(data[0]['sa.skip'], True)
        self.assertEqual(data[0]['sa.ret'], RET_URL_INFO_NOT_MATCH_ANALYZE_POLICY)

    def test_p_01(self):
        '''vsapi_tftd.cat is TXT: allow
        '''
        msg = self.msg_tmpl.copy()
        msg['vsapi_tftd.cat'] = 'TXT'
        print >>self.input, json.dumps([msg])
        self.assertPolicyAllowed(self.output.get(True, 5))

    def test_p_02(self):
        '''magic_tftd.desc is 'application/pdf': allow
        '''
        msg = self.msg_tmpl.copy()
        msg['vsapi_tftd.cat'] = 'BIN'
        msg['magic_tftd.desc'] = 'application/pdf'
        print >>self.input, json.dumps([msg])
        self.assertPolicyAllowed(self.output.get(True, 5))

    def test_p_03(self):
        '''magic_tftd.desc is 'application/x-shockwave-flash': allow
        '''
        msg = self.msg_tmpl.copy()
        msg['vsapi_tftd.cat'] = 'BIN'
        msg['magic_tftd.desc'] = 'application/x-shockwave-flash'
        print >>self.input, json.dumps([msg])
        self.assertPolicyAllowed(self.output.get(True, 5))

    def test_p_04(self):
        '''magic_tftd.desc is 'application/zip': allow
        '''
        msg = self.msg_tmpl.copy()
        msg['vsapi_tftd.cat'] = 'BIN'
        msg['magic_tftd.desc'] = 'application/zip'
        print >>self.input, json.dumps([msg])
        self.assertPolicyAllowed(self.output.get(True, 5))

    def test_n_01(self):
        '''magic_tftd.desc is 'pdf': deny
        '''
        msg = self.msg_tmpl.copy()
        msg['vsapi_tftd.cat'] = 'BIN'
        msg['magic_tftd.desc'] = 'pdf'
        print >>self.input, json.dumps([msg])
        self.assertPolicyDenied(self.output.get(True, 5))

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 2)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.policy_denied")

class TestAnalyzePolicy2(OdinSACommonTestCase):
    '''Analyze policy is configurable, the following cases test
    the scenarios about changing the analyze policy.
    '''
    
    def setUp(self):
        # StatsD
        self.statsd = StatsD_Agent(10000)

        content_dir, content_filename = link_sample("blank.html")
        self.msg_tmpl = {
            "url": "http://www.test1234.com/a.html",
            "content.dir": content_dir,
            "content.filename": content_filename,
        }

    def config_odin_sa(self, user_conf_dict={}):
        user_conf = "/trend/odin/conf/odin_sa_user_test.conf"
        write_user_conf(user_conf, user_conf_dict)
        self.sa = OdinSA_Mocker(user_conf, mpu_enable=True)
        self.input = self.sa.get_input_pipe()
        self.output = self.sa.get_output_line_queue()

    def tearDown(self):
        self.sa.close()

    def assertPolicyAllowed(self, output_data):
        data = json.loads(output_data)
        self.assertEqual(type(data), list)
        self.failIf('sa.skip' in data[0])
        self.failIfEqual(data[0]['sa.ret'], RET_URL_INFO_NOT_MATCH_ANALYZE_POLICY)

    def assertPolicyDenied(self, output_data):
        data = json.loads(output_data)
        self.assertEqual(type(data), list)
        self.assertEqual(data[0]['sa.skip'], True)
        self.assertEqual(data[0]['sa.ret'], RET_URL_INFO_NOT_MATCH_ANALYZE_POLICY)

    def assertMissKey(self, output_data, miss_key):
        data = json.loads(output_data)
        self.assertEqual(type(data), list)
        self.assertEqual(data[0]['sa.skip'], True)
        self.assertEqual(data[0]['sa.miss_key'], miss_key)
        self.assertEqual(data[0]['sa.ret'], RET_MISS_KEY)

    def test_allow_nothing(self):
        '''Allow nothing
        '''
        # Empty analyze_policy
        uc = {}
        uc['odin_sa.analyze_policy'] = {
            'allow': {
            }
        }
        self.config_odin_sa(uc)

        msg = self.msg_tmpl.copy()
        print >>self.input, json.dumps([msg])
        self.assertPolicyDenied(self.output.get(True, 5))

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 2)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.policy_denied")

    def test_allow_custom_key(self):
        '''Allow a custom key
        '''
        # A custom entry in analyze_policy
        uc = {}
        uc['odin_sa.analyze_policy'] = {
            'allow': {
                'custom_policy': 'custom_value',
            }
        }
        self.config_odin_sa(uc)

        # Pass
        msg = self.msg_tmpl.copy()
        msg['custom_policy'] = 'custom_value'
        print >>self.input, json.dumps([msg])
        self.assertPolicyAllowed(self.output.get(True, 5))

        stats = self.statsd.get_next_stats(timeout=5)
            
        # Fail
        msg = self.msg_tmpl.copy()
        print >>self.input, json.dumps([msg])
        self.assertMissKey(self.output.get(True, 5), 'custom_policy')

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 2)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.miss_key")

        # Fail
        msg = self.msg_tmpl.copy()
        msg['custom_policy'] = 'bad_value'
        print >>self.input, json.dumps([msg])
        self.assertPolicyDenied(self.output.get(True, 5))

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 2)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.policy_denied")


class TestScanFlow(OdinSACommonTestCase):

    def setUp(self):
        # Feedback Server
        self.fbsrv = FeedbackServerAgent(8001)

        # GSB Server
        self.gsbsrv = GSBServerAgent(10080)

        # StatsD
        self.statsd = StatsD_Agent(10000)

        user_conf = "/trend/odin/conf/odin_sa_user_test.conf"
        d = {}
        d['odin_sa.feedback.enable'] = True
        d['odin_sa.feedback.post_url'] = self.fbsrv.get_post_url()
        d['odin_sa.feedback.feedback_monitoring'] = True
        d['odin_sa.gsb.enable'] = True
        d['odin_sa.gsb.query_url'] = self.gsbsrv.get_query_url()
        write_user_conf(user_conf, d)

        self.sa = OdinSA_Mocker(user_conf, mpu_enable=True)
        self.input = self.sa.get_input_pipe()
        self.output = self.sa.get_output_line_queue()

    def tearDown(self):
        self.sa.close()
        self.fbsrv.close()
        self.gsbsrv.close()
        self.statsd.close()

    def validateOutputMessage(self, msg):
        self.assertTrue('sa.s_time' in msg)
        self.assertTrue('sa.e_time' in msg)
        self.assertTrue('sa.ret' in msg)

        if msg['sa.rating'] != RATING_UNKNOWN:
            self.assertTrue('sa.ptn' in msg)
            self.assertTrue('sa.virus.name' in msg)
            self.assertTrue(re.match(r'gsb', msg['sa.ptn']) or \
                            re.match(r'sal-[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4}-[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4}', msg['sa.ptn']))
        else:
            self.assertFalse('sa.ptn' in msg)
            self.assertFalse('sa.virus.name' in msg)

    def validateFeedback(self, feedback, msg_out, sample_file, \
                               ignore_version=False):
        info = feedback[0]
        content = feedback[1]
        self.assertEqual(info['url'], msg_out['url'])

        if info['decision'] == "MALICIOUS":
            self.assertTrue(msg_out['sa.rating'] == "79" or \
                            msg_out['sa.rating'] == "75")
        else:
            self.assertTrue(msg_out['sa.rating'] == "90")

        # engine/pattern valid?
        if not ignore_version:
            self.assertTrue(
                    re.match(r'[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4}', 
                             info['engine_version']), 
                    info['engine_version'])
            self.assertTrue(
                    re.match(r'[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4}', 
                             info['pattern_version']), 
                    info['pattern_version'])

        # content equal?
        with open(sample_file, "rb") as f:
            sample_content = f.read()
            self.assertEqual(content, sample_content)

    def test_cached_normal(self):
        '''Matched by cache
        '''
        # Prepare Environment
        mcsrv = MemcachedAgent(11211)

        msg_in = build_message_from_sample("scanflow/cached.html",'HTML')

        # 1st scan
        print >>self.input, json.dumps([msg_in])
        self.output.get(True, 5)

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 3)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.valid")
        self.validate_stats(stats, "odin_sa.normal")

        # 2nd scan
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        self.validateOutputMessage(msg_out)
        self.assertEqual(msg_out['sa.ret'], RET_URL_INFO_ALREADY_EXISTED)
        self.assertEqual(msg_out['sa.rating'], RATING_UNKNOWN)
        self.assertEqual(msg_out['sa.score'], SCORE_UNKNOWN)

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 4)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.valid")
        self.validate_stats(stats, "odin_sa.normal")
        self.validate_stats(stats, "odin_sa.normal.cached")

        mcsrv.close()

    def test_sal_malicious_exploit(self):
        '''SAL detected as malicious (exploit)
        '''
        msg_in = build_message_from_sample(
                                    "scanflow/sal_mal_exploit.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        self.validateOutputMessage(msg_out)
        self.assertEqual(msg_out['sa.ret'], RET_URL_MALICIOUS)
        self.assertEqual(msg_out['sa.rating'], RATING_MALICIOUS)
        self.assertEqual(msg_out['sa.score'], SCORE_MALICIOUS)

        feedback = self.fbsrv.get_next_feedback(timeout=5)
        self.validateFeedback(feedback, msg_out, pick_sample("scanflow/sal_mal_exploit.html"))
        info = feedback[0]
        self.assertTrue(info['module'].startswith("SAL"))

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 4)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.valid")
        self.validate_stats(stats, "odin_sa.malicious")
        self.validate_stats(stats, "odin_sa.malicious.sal")

    def test_sal_malicious_phishing(self):
        '''SAL detected as malicious (phishing)
        '''
        msg_in = build_message_from_sample(
                                    "scanflow/sal_mal_phishing.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        self.validateOutputMessage(msg_out)
        self.assertEqual(msg_out['sa.ret'], RET_URL_PHISHING)
        self.assertEqual(msg_out['sa.rating'], RATING_PHISHING)
        self.assertEqual(msg_out['sa.score'], SCORE_MALICIOUS)

        feedback = self.fbsrv.get_next_feedback(timeout=5)
        self.validateFeedback(feedback, msg_out, pick_sample("scanflow/sal_mal_phishing.html"))
        info = feedback[0]
        self.assertTrue(info['module'].startswith("SAL"))

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 4)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.valid")
        self.validate_stats(stats, "odin_sa.malicious")
        self.validate_stats(stats, "odin_sa.malicious.sal")

    def test_gsb_malicious_exploit(self):
        '''GSB detected as malicious (exploit)
        '''
        msg_in = build_message_from_sample(
                                    "scanflow/gsb_mal_exploit.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        self.validateOutputMessage(msg_out)
        self.assertEqual(msg_out['sa.ret'], RET_URL_MALICIOUS)
        self.assertEqual(msg_out['sa.rating'], RATING_MALICIOUS)
        self.assertEqual(msg_out['sa.score'], SCORE_MALICIOUS)

        feedback = self.fbsrv.get_next_feedback(timeout=5)
        self.validateFeedback(feedback, msg_out, pick_sample("scanflow/gsb_mal_exploit.html"), ignore_version=True)
        info = feedback[0]
        self.assertTrue(info['module'].startswith("GSB"))

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 3)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.valid")
        self.validate_stats(stats, "odin_sa.malicious")

    def test_gsb_malicious_phishing(self):
        '''GSB detected as malicious (phishing)
        '''
        msg_in = build_message_from_sample(
                                    "scanflow/gsb_mal_phishing.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        self.validateOutputMessage(msg_out)
        self.assertEqual(msg_out['sa.ret'], RET_URL_PHISHING)
        self.assertEqual(msg_out['sa.rating'], RATING_PHISHING)
        self.assertEqual(msg_out['sa.score'], SCORE_MALICIOUS)

        feedback = self.fbsrv.get_next_feedback(timeout=5)
        self.validateFeedback(feedback, msg_out, pick_sample("scanflow/gsb_mal_phishing.html"), ignore_version=True)
        info = feedback[0]
        self.assertTrue(info['module'].startswith("GSB"))

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 3)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.valid")
        self.validate_stats(stats, "odin_sa.malicious")

    def test_gsb_malicious_sal_monitoring(self):
        '''GSB detected as malicious while SAL monitoring
        '''
        msg_in = build_message_from_sample(
                                    "scanflow/gsb_mal_sal_mon.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        self.validateOutputMessage(msg_out)
        self.assertEqual(msg_out['sa.ret'], RET_URL_MALICIOUS)
        self.assertEqual(msg_out['sa.rating'], RATING_MALICIOUS)
        self.assertEqual(msg_out['sa.score'], SCORE_MALICIOUS)

        # feedback of SAL monitoring
        feedback = self.fbsrv.get_next_feedback(timeout=5)
        info = feedback[0]
        self.assertEqual(info['url'], msg_out['url'])
        self.assertEqual(info['decision'], 'MONITORING')
        self.assertTrue(info['module'].startswith("SAL"))

        # feedback of GSB malicious
        feedback = self.fbsrv.get_next_feedback(timeout=5)
        self.validateFeedback(feedback, msg_out, pick_sample("scanflow/gsb_mal_sal_mon.html"), ignore_version=True)
        info = feedback[0]
        self.assertTrue(info['module'].startswith("GSB"))

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 4)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.valid")
        self.validate_stats(stats, "odin_sa.malicious")
        self.validate_stats(stats, "odin_sa.monitoring.sal")

    def test_normal(self):
        '''Both SAL and GSB not detected
        '''
        msg_in = build_message_from_sample(
                                    "scanflow/normal.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        self.validateOutputMessage(msg_out)
        self.assertEqual(msg_out['sa.ret'], RET_URL_UNKNOWN)
        self.assertEqual(msg_out['sa.rating'], RATING_UNKNOWN)
        self.assertEqual(msg_out['sa.score'], SCORE_UNKNOWN)

        # Assert no feedback
        empty = False
        try:
            feedback = self.fbsrv.get_next_feedback(timeout=5)
        except Queue.Empty, ex:
            empty = True
        self.assertTrue(empty)
            
        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 3)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.valid")
        self.validate_stats(stats, "odin_sa.normal")

    def test_normal_sal_monitoring(self):
        '''GSB not detected while SAL monitoring
        '''
        msg_in = build_message_from_sample(
                                    "scanflow/normal_sal_mon.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        self.validateOutputMessage(msg_out)
        self.assertEqual(msg_out['sa.ret'], RET_URL_UNKNOWN)
        self.assertEqual(msg_out['sa.rating'], RATING_UNKNOWN)
        self.assertEqual(msg_out['sa.score'], SCORE_UNKNOWN)

        # feedback of SAL monitoring
        feedback = self.fbsrv.get_next_feedback(timeout=5)
        info = feedback[0]
        self.assertEqual(info['url'], msg_out['url'])
        self.assertEqual(info['decision'], 'MONITORING')
        self.assertTrue(info['module'].startswith("SAL"))
        with open(pick_sample("scanflow/normal_sal_mon.html"), "rb") as f:
            feedback_content = feedback[1]
            sample_content = f.read()
            self.assertEqual(feedback_content, sample_content)

        stats = self.statsd.get_next_stats(timeout=5)
        self.assertEqual(len(stats), 4)
        self.validate_stats(stats, "odin_sa.processed")
        self.validate_stats(stats, "odin_sa.valid")
        self.validate_stats(stats, "odin_sa.normal")
        self.validate_stats(stats, "odin_sa.monitoring.sal")


class TestConfiguration(OdinSACommonTestCase):

    def setUp(self):
        # Feedback Server
        self.fbsrv = FeedbackServerAgent(8001)
        # GSB Server
        self.gsbsrv = GSBServerAgent(10080)

    def tearDown(self):
        self.sa.close()
        self.fbsrv.close()
        self.gsbsrv.close()

    def config_odin_sa(self, user_conf_dict={}):
        user_conf = "/trend/odin/conf/odin_sa_user_test.conf"
        write_user_conf(user_conf, user_conf_dict)
        self.sa = OdinSA_Mocker(user_conf)
        self.input = self.sa.get_input_pipe()
        self.output = self.sa.get_output_line_queue()

    def test_feedback_enable(self):
        '''Enable feedback, expect got feedback
        '''
        d = {}
        d['odin_sa.feedback.enable'] = True
        d['odin_sa.feedback.post_url'] = self.fbsrv.get_post_url()
        self.config_odin_sa(d)

        msg_in = build_message_from_sample(
                                    "scanflow/sal_mal_exploit.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        empty = False
        try:
            feedback = self.fbsrv.get_next_feedback(timeout=5)
        except Queue.Empty, ex:
            empty = True
        self.assertFalse(empty)

    def test_feedback_disable(self):
        '''Disable feedback, expect no feedback
        '''
        d = {}
        d['odin_sa.feedback.enable'] = False
        d['odin_sa.feedback.post_url'] = self.fbsrv.get_post_url()
        self.config_odin_sa(d)

        msg_in = build_message_from_sample(
                                    "scanflow/sal_mal_exploit.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        empty = False
        try:
            feedback = self.fbsrv.get_next_feedback(timeout=5)
        except Queue.Empty, ex:
            empty = True
        self.assertTrue(empty)

    def test_gsb_enable(self):
        '''Enable GSB, expect detect
        '''
        d = {}
        d['odin_sa.gsb.enable'] = True
        d['odin_sa.gsb.query_url'] = self.gsbsrv.get_query_url()
        self.config_odin_sa(d)

        msg_in = build_message_from_sample(
                                    "scanflow/gsb_mal_exploit.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        self.assertEqual(msg_out['sa.ret'], RET_URL_MALICIOUS)
        self.assertEqual(msg_out['sa.rating'], RATING_MALICIOUS)
        self.assertEqual(msg_out['sa.score'], SCORE_MALICIOUS)

    def test_gsb_disable(self):
        '''Disable GSB, expect not detect
        '''
        d = {}
        d['odin_sa.gsb.enable'] = False
        d['odin_sa.gsb.query_url'] = self.gsbsrv.get_query_url()
        self.config_odin_sa(d)

        msg_in = build_message_from_sample(
                                    "scanflow/gsb_mal_exploit.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        self.assertEqual(msg_out['sa.ret'], RET_URL_UNKNOWN)
        self.assertEqual(msg_out['sa.rating'], RATING_UNKNOWN)
        self.assertEqual(msg_out['sa.score'], SCORE_UNKNOWN)

    def test_cache_enabled(self):
        mcsrv = MemcachedAgent(11211)

        d = {}
        d['odin_sa.cache.enable'] = True
        d['odin_sa.cache.expire'] = 1000
        d['odin_sa.cache.query_url'] = [mcsrv.get_server_string(),]
        self.config_odin_sa(d)

        msg_in = build_message_from_sample("scanflow/cached.html",'HTML')

        # 1st scan
        print >>self.input, json.dumps([msg_in])
        self.output.get(True, 3)

        # 2nd scan
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 3))[0]
        self.assertEqual(msg_out['sa.ret'], RET_URL_INFO_ALREADY_EXISTED)
        self.assertEqual(msg_out['sa.rating'], RATING_UNKNOWN)

    def test_cache_disabled(self):
        mcsrv = MemcachedAgent(11211)

        d = {}
        d['odin_sa.cache.enable'] = False
        d['odin_sa.cache.expire'] = 1000
        d['odin_sa.cache.query_url'] = [mcsrv.get_server_string(),]
        self.config_odin_sa(d)

        msg_in = build_message_from_sample("scanflow/cached.html",'HTML')

        # 1st scan
        print >>self.input, json.dumps([msg_in])
        self.output.get(True, 3)

        # 2nd scan
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 3))[0]
        self.assertNotEqual(msg_out['sa.ret'], RET_URL_INFO_ALREADY_EXISTED)
        self.assertEqual(msg_out['sa.rating'], RATING_UNKNOWN)

    def test_cache_expiration(self):
        '''Cache expirted
        '''
        mcsrv = MemcachedAgent(11211)

        d = {}
        d['odin_sa.cache.expire'] = 4
        d['odin_sa.cache.query_url'] = [mcsrv.get_server_string(),]
        self.config_odin_sa(d)

        msg_in = build_message_from_sample("scanflow/cached.html",'HTML')

        # 1st scan
        print >>self.input, json.dumps([msg_in])
        self.output.get(True, 3)

        # 2nd scan
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 3))[0]
        self.assertEqual(msg_out['sa.ret'], RET_URL_INFO_ALREADY_EXISTED)
        self.assertEqual(msg_out['sa.rating'], RATING_UNKNOWN)
        self.assertEqual(msg_out['sa.score'], SCORE_UNKNOWN)

        # 3rd scan
        time.sleep(5)
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 3))[0]
        self.assertEqual(msg_out['sa.ret'], RET_URL_UNKNOWN)
        self.assertEqual(msg_out['sa.rating'], RATING_UNKNOWN)
        self.assertEqual(msg_out['sa.score'], SCORE_UNKNOWN)

        mcsrv.close()

    def test_feedback_monitoring_enable(self):
        '''Enable feedback_monitoring, expect monitoring to be feedback
        '''
        d = {}
        d['odin_sa.feedback.enable'] = True
        d['odin_sa.feedback.feedback_monitoring'] = True
        d['odin_sa.feedback.post_url'] = self.fbsrv.get_post_url()
        self.config_odin_sa(d)

        msg_in = build_message_from_sample(
                                    "scanflow/normal_sal_mon.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        # feedback of SAL monitoring
        feedback = self.fbsrv.get_next_feedback(timeout=5)
        info = feedback[0]
        self.assertEqual(info['url'], msg_out['url'])
        self.assertEqual(info['decision'], 'MONITORING')
        self.assertTrue(info['module'].startswith("SAL"))
        with open(pick_sample("scanflow/normal_sal_mon.html"), "rb") as f:
            feedback_content = feedback[1]
            sample_content = f.read()
            self.assertEqual(feedback_content, sample_content)

    def test_feedback_monitoring_disable(self):
        '''Disable feedback_monitoring, expect monitoring not to be feedback
        '''
        d = {}
        d['odin_sa.feedback.enable'] = True
        d['odin_sa.feedback.feedback_monitoring'] = False
        d['odin_sa.feedback.post_url'] = self.fbsrv.get_post_url()
        self.config_odin_sa(d)

        msg_in = build_message_from_sample(
                                    "scanflow/normal_sal_mon.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]

        # feedback of SAL monitoring
        no_feedback = False
        try:
            feedback = self.fbsrv.get_next_feedback(timeout=5)
        except Queue.Empty, ex:
            no_feedback = True
        self.assertTrue(no_feedback)

class TestCrashRecovery(OdinSACommonTestCase):

    def setUp(self):
        user_conf = "/trend/odin/conf/odin_sa_user_test.conf"
        d = {}
        d['odin_sa.feedback.enable'] = False
        d['odin_sa.feedback.post_url'] = ''
        d['odin_sa.feedback.feedback_monitoring'] = False
        d['odin_sa.gsb.enable'] = False
        d['odin_sa.gsb.query_url'] = ''
        write_user_conf(user_conf, d)

        self.sa = OdinSA_Mocker(user_conf)
        self.input = self.sa.get_input_pipe()
        self.output = self.sa.get_output_line_queue()

    def tearDown(self):
        self.sa.close()

    def list_odin_sa_pids(self):
        all = []
        for pid in os.listdir('/proc'):
            if pid.isdigit():
                cmdline = open(os.path.join('/proc',pid,'cmdline'), 'rb').read()
                cmdline = cmdline.replace('\x00', '')
                stat = open(os.path.join('/proc',pid,'stat'), 'rb').read()
                if re.search(r'python.*odin_sa\.py', cmdline):
                    all.append((pid, stat.split(" ")[3]))# pid, ppid
        return all

    def test_no_crash(self):
        msg_in = build_message_from_sample(
                                    "scanflow/sal_mal_exploit.html",'HTML')
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 5))[0]
        self.assertEqual(msg_out['sa.ret'], RET_URL_MALICIOUS)
        self.assertEqual(msg_out['sa.rating'], RATING_MALICIOUS)
        self.assertEqual(msg_out['sa.score'], SCORE_MALICIOUS)

    def test_crash(self):
        msg_in = build_message_from_sample(
                                    "scanflow/sal_mal_exploit.html",'HTML')
        # Scan 1st (ensure SAL initialized succeeded)
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 10))[0]
        self.assertEqual(msg_out['sa.ret'], RET_URL_MALICIOUS)
        self.assertEqual(msg_out['sa.rating'], RATING_MALICIOUS)
        self.assertEqual(msg_out['sa.score'], SCORE_MALICIOUS)

        # Scan 2nd Send SIGSEGV to SAL scan process to simulate the crash
        print >>self.input, json.dumps([msg_in])

        #time.sleep(0.1)
        os.kill(self.sa.get_scan_process_pid(), signal.SIGSEGV)

        msg_out = json.loads(self.output.get(True, 12))[0]
        self.assertEqual(msg_out['sa.ret'], RET_ENG_ABORTED)

        # Scan Again (no crash)
        print >>self.input, json.dumps([msg_in])
        msg_out = json.loads(self.output.get(True, 10))[0]
        self.assertEqual(msg_out['sa.ret'], RET_URL_MALICIOUS)
        self.assertEqual(msg_out['sa.rating'], RATING_MALICIOUS)
        self.assertEqual(msg_out['sa.score'], SCORE_MALICIOUS)


if __name__=="__main__":
    unittest.main()
