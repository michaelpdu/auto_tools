#!/usr/bin/python
import sys,os
import traceback
import time
import threading
import multiprocessing
import Queue
from urlparse import urlparse

import odin_common_py.application as odin_app
import odin_common_py.singleton as odin_singleton
import odin_common_py.common as odin_common
import odin_common_py.msg_io as odin_msg_io
import odin_common_py.msg_util as odin_msg_util
import odin_common_py.conf_util as odin_conf_util
import odin_am_common

from sa import *
from sa_scan_process import *

#################################################
# Constants
#################################################

SA_MODULE_NAME = "sa"

ODIN_RUNTIME_ROOT = os.environ['odin_runtime_root']
ODIN_PIPE_INS_NUM = os.environ['odin_pipe_ins_num']
SA_PATTERN_FILE = os.path.join(ODIN_RUNTIME_ROOT, 'data', SA_MODULE_NAME, 'tmsa.cfg')
SA_LOG_FILE = os.path.join(ODIN_RUNTIME_ROOT, 'log', SA_MODULE_NAME, 'tmsa-%s.log' % ODIN_PIPE_INS_NUM)

# Configuration Kyes
CONFIG_KEY_ANALYZE_POLICY = 'odin_sa.analyze_policy'
CONFIG_KEY_CACHE_ENABLE = 'odin_sa.cache.enable'
CONFIG_KEY_CACHE_QUERY_URL = 'odin_sa.cache.query_url'
CONFIG_KEY_CACHE_EXPIRATION = 'odin_sa.cache.expire'
CONFIG_KEY_FEEDBACK_ENABLE = 'odin_sa.feedback.enable'
CONFIG_KEY_FEEDBACK_POST_URL = 'odin_sa.feedback.post_url'
CONFIG_KEY_FEEDBACK_MONITORING = 'odin_sa.feedback.feedback_monitoring'
CONFIG_KEY_GSB_ENABLE = 'odin_sa.gsb.enable'
CONFIG_KEY_GSB_QUERY_URL = 'odin_sa.gsb.query_url'
CONFIG_KEY_SAL_SCAN_TIMEOUT = 'odin_sa.sal.scan_timeout'
CONFIG_KEY_SAL_MEMORY_LIMIT = 'odin_sa.sal.memory_limit'

# Customized return codes
RET_ENG_ABORTED = -1000

CATEGORY_TO_RATING = {
    SA_CATEGORY_NORMAL:     odin_am_common.RATING_UNKNOWN,
    SA_CATEGORY_EXPLOIT:    odin_am_common.RATING_MALICIOUS,
    SA_CATEGORY_PHISHING:   odin_am_common.RATING_PHISHING,
}

CATEGORY_TO_RET = {
    SA_CATEGORY_NORMAL:     odin_common.RET_URL_UNKNOWN,
    SA_CATEGORY_EXPLOIT:    odin_common.RET_URL_MALICIOUS,
    SA_CATEGORY_PHISHING:   odin_common.RET_URL_PHISHING,
}

DECISION_TO_SCORE = {
    SA_DECISION_NORMAL:     odin_am_common.SCORE_UNKNOWN,
    SA_DECISION_MONITORING: odin_am_common.SCORE_UNKNOWN,
    SA_DECISION_MALICIOUS:  odin_am_common.SCORE_MALICIOUS,
}

class GSBWorker(threading.Thread):

    def __init__(self, app):
        threading.Thread.__init__(self, name="GSBWorker")
        self.daemon = True
        self.app = app
        query_url = app.config[CONFIG_KEY_GSB_QUERY_URL]
        if urlparse(query_url).path == '':
            query_url = os.path.join(query_url, "gsbquery")
        self.gsb_scanner = GSBScanner(query_url)
        self.scan_tasks = Queue.Queue()

    def push_scan_task(self, message, page):
        self.scan_tasks.put((message, page))

    def run(self):
        while True:
            message, page = self.scan_tasks.get()
            result = self.gsb_scanner.scan(page)
            if result !=None:
                if result.get_category()== SA_CATEGORY_EXPLOIT:
                    message['sa.threat.tag'] = 'low-reputation-url:genericfile/malware.blocked-list'
                if result.get_category()== SA_CATEGORY_PHISHING:
                    message['sa.threat.tag'] = 'fraud:url/phishing.fakesites'
            self.app.push_result(message, page, result)
            self.app.flush_result_buffer()


@odin_singleton.Singleton
class OdinSA(odin_app.BaseApplication):

    def __init__(self):
        odin_app.BaseApplication.__init__(self, sys.argv, name='odin_sa')

        self.logger = self.get_logger()
        self.config = self.get_config()
        self.validate_config()

        # init the global logger used by sa module
        init_sa_logger(self.logger)

        # init feedback manager
        post_url = self.config[CONFIG_KEY_FEEDBACK_POST_URL]
        self.feedback_monitoring = self.config[CONFIG_KEY_FEEDBACK_MONITORING]
        self.feedback_enable = self.config[CONFIG_KEY_FEEDBACK_ENABLE]
        self.feedback_manager = FeedbackManager(post_url)

        # init result cache
        self.cache_enable = self.config[CONFIG_KEY_CACHE_ENABLE]
        servers = self.config[CONFIG_KEY_CACHE_QUERY_URL]
        expiration = self.config[CONFIG_KEY_CACHE_EXPIRATION]
        self.cache = ResultCache(servers, expiration)

        # init GSB worker
        self.gsb_worker = GSBWorker(self)
        self.gsb_worker.start()

        # init SAL worker
        scanner_creater = lambda: SALScanner(config=SA_PATTERN_FILE, \
                                             log=SA_LOG_FILE)
        self.sal_worker  = ScanProcessAgent(scanner_creater, self.feedback_manager,self.feedback_enable,self.feedback_monitoring,self.logger,
                                           self.config[CONFIG_KEY_SAL_SCAN_TIMEOUT],
                                           self.config[CONFIG_KEY_SAL_MEMORY_LIMIT])

        # init result buffer, and buffer lock.
        self.result_buffer = Queue.Queue()
        self.flush_locker = threading.RLock()

        # register destroyer
        self.set_destroyer(self.cleanup)

        self.logger.info("Initialize SA done")

    def validate_config(self):
        NOT_VALID_KEY_ERROR_MSG = '%s is not a valid "%s"'
        KEY_TYPE_ERROR_MSG = 'Config entry "%s" expects "%s" value, while "%s" value given.' 

        # validate config keys
        key_types = {
                CONFIG_KEY_ANALYZE_POLICY: dict,
                CONFIG_KEY_CACHE_ENABLE: bool,
                CONFIG_KEY_CACHE_QUERY_URL: list,
                CONFIG_KEY_CACHE_EXPIRATION: int,
                CONFIG_KEY_FEEDBACK_ENABLE: bool,
                CONFIG_KEY_FEEDBACK_POST_URL: str,
                CONFIG_KEY_FEEDBACK_MONITORING: bool,
                CONFIG_KEY_GSB_ENABLE: bool,
                CONFIG_KEY_GSB_QUERY_URL: str,
                CONFIG_KEY_SAL_SCAN_TIMEOUT: int,
                CONFIG_KEY_SAL_MEMORY_LIMIT: None, # either float or int is allow for this config
        }
        odin_conf_util.validate_config_keys(self.config, key_types.keys(), "odin_sa")
        for key, key_type in key_types.items():
            actual_type = type(self.config[key])
            if key_type and actual_type != key_type:
                raise odin_conf_util.OdinConfigError(KEY_TYPE_ERROR_MSG % \
                        (key, key_type.__name__, actual_type.__name__))

        # validate analyze policy
        odin_conf_util.config_validate_analyze_policy(
                                    CONFIG_KEY_ANALYZE_POLICY,
                                    self.config[CONFIG_KEY_ANALYZE_POLICY])

        # validate cache expire
        key = CONFIG_KEY_CACHE_EXPIRATION
        key_value = self.config[key]
        if key_value <= 0:
            raise odin_conf_util.OdinConfigError(NOT_VALID_KEY_ERROR_MSG % \
                    (key_value.__repr__(), key))

        # validate feedback post url
        key = CONFIG_KEY_FEEDBACK_POST_URL
        key_value = self.config[key]
        if self.config[CONFIG_KEY_FEEDBACK_ENABLE] and \
                not key_value.startswith("http://"):
            raise odin_conf_util.OdinConfigError(NOT_VALID_KEY_ERROR_MSG % \
                    (key_value.__repr__(), key))

        # validate gsb query url
        key = CONFIG_KEY_GSB_QUERY_URL
        key_value = self.config[key]
        if self.config[CONFIG_KEY_GSB_ENABLE] and \
                not key_value.startswith("http://"):
            raise odin_conf_util.OdinConfigError(NOT_VALID_KEY_ERROR_MSG % \
                    (key_value.__repr__(), key))

        # validate sal scan time
        key = CONFIG_KEY_SAL_SCAN_TIMEOUT
        key_value = self.config[key]
        if not key_value > 0:
            raise odin_conf_util.OdinConfigError(NOT_VALID_KEY_ERROR_MSG % \
                    (key_value.__repr__(), key))

        # validate sal memory limit
        key = CONFIG_KEY_SAL_MEMORY_LIMIT
        key_value = self.config[key]
        if not key_value >= 0:
            raise odin_conf_util.OdinConfigError(NOT_VALID_KEY_ERROR_MSG % \
                    (key_value.__repr__(), key))
            

    def cleanup(self):
        self.logger.info("Uninitialize SA ...")
        self.sal_worker.close()

    def push_result(self, message, page, result):
        self.result_buffer.put((message, page, result))

    def feedback(self, page, result):
        if self.feedback_enable:
            if (result.get_decision() == SA_DECISION_MONITORING and
                    not self.feedback_monitoring):
                # monitoring not feedback
                pass
            else:
                self.feedback_manager.feedback(page, result)

    def handle_result(self, message, page, result, output_message_package):
        # this must be filtered or invalid message, thus has no page and 
        # scan result.
        if page == None or result == None:
            message['sa.e_time'] = "%.6f" % time.time()
            output_message_package.append(message)
            return

        # only feedback action for monitoring result
        if result.get_decision() == SA_DECISION_MONITORING:
#            self.feedback(page, result)
            self.logger.debug("Decision 'MONITORING' on %s" % page.get_url())
            return

        # Append basic fields to message
        message['sa.e_time'] = "%.6f" % time.time()
        message['sa.rating'] = CATEGORY_TO_RATING[result.get_category()]
        message['sa.score'] = DECISION_TO_SCORE[result.get_decision()]
        message['sa.ret'] = CATEGORY_TO_RET[result.get_category()]

        # Append 'sa.ptn' and 'sa.virus.name' if not normal result
        if message['sa.rating'] != odin_am_common.RATING_UNKNOWN:
            message['sa.virus.name'] = ';'.join(result.get_rules())
            message['sa.ptn'] = result.get_pattern_string()

        if result.get_decision() == SA_DECISION_MALICIOUS:
#            self.feedback(page, result)
            self.logger.info("Decision 'MALICIOUS' on %s" % page.get_url())
        elif result.get_decision() == SA_DECISION_NORMAL:
            # avoid re-caching
            if not isinstance(result, CachedResult):
                self.cache.cache_scan_result(page, result)
                self.logger.info("Decision 'NORMAL' on %s" % page.get_url())
            else:
                message['sa.ret'] = odin_common.RET_URL_INFO_ALREADY_EXISTED
                self.logger.info("Decision 'NORMAL' (cached) on %s" % \
                                                        page.get_url())
        output_message_package.append(message)

    def flush_result_buffer(self):
        self.logger.debug("flushing result buffer, buffer size: %d" % \
                            self.result_buffer.qsize())
        with self.flush_locker:
            message_package = []
            while True:
                try:
                    message, page, result = self.result_buffer.get_nowait()
                    self.handle_result(message, page, result, message_package)
                except Queue.Empty, e:
                    break
            if len(message_package) > 0:
                write = self.get_message_writer()
                write(message_package)

    def message_handler(self, message_package):
        # sort message_package as good part and miss_key part
        message_check_keys = ['url', 'content.dir', 'content.filename'] + \
                self.config[CONFIG_KEY_ANALYZE_POLICY].values()[0].keys()
        good_msg_pkg, miss_key_msg_pkg = odin_msg_util.check_msg_pkg_keys(
                                message_package, message_check_keys, 'sa')

        # sort good_msg_pkg as allow part and deny part
        sorted_pkgs = odin_msg_util.group_msg_pkg_by_analyze_policy(
                good_msg_pkg, self.config[CONFIG_KEY_ANALYZE_POLICY])
        allowed_msg_pkg = sorted_pkgs['allow']
        denied_msg_pkg = sorted_pkgs['deny']

        # handle 'miss_key' message group
        for message in miss_key_msg_pkg:
            message['sa.s_time'] = "%.6f" % time.time()
            message['sa.skip'] = True
            message['sa.ret'] = odin_common.RET_MISS_KEY
            self.push_result(message, None, None)

        # handle 'denied' message group
        for message in denied_msg_pkg:
            message['sa.s_time'] = "%.6f" % time.time()
            message['sa.skip'] = True
            message['sa.ret'] = odin_common.RET_URL_INFO_NOT_MATCH_ANALYZE_POLICY
            self.push_result(message, None, None)

        # handle 'allowed' message group
        for message in allowed_msg_pkg:
            self.logger.debug("processing message #%s" % id(message))
            self.logger.debug("message.url: %s" % message['url'])
            self.logger.debug("message.content.dir: %s" % message['content.dir'])
            self.logger.debug("message.content.filename: %s" % message['content.filename'])
            message['sa.s_time'] = "%.6f" % time.time()

            # Check content's existence
            content_file = os.path.join(message['content.dir'], "page", 
                                        message['content.filename'])
            if not os.path.exists(content_file):
                message['sa.skip'] = True
                message['sa.ret'] = odin_common.RET_CONTENT_NOT_EXIST
                self.push_result(message, None, None)
                continue

            page = Page.build_from_message(message)

            # Query result cache
            if self.cache_enable:
                time_start = time.time()
                result = self.cache.query_scan_result(page)
                self.logger.debug("result query time: %.3f seconds" % (time.time() - time_start))
                if result:
                    self.push_result(message, page, result)
                    continue

            # Scan with SAL
            time_start = time.time()
            result = self.sal_worker.scan(message)
            self.logger.debug("sal scan time: %.3f seconds" % (time.time() - time_start))
            if result == None:
                self.logger.info("Page that cause SAL restart: %s" % \
                        os.path.join(message['content.dir'], 'page', message['content.filename']))
                message['sa.skip'] = True
                message['sa.ret'] = RET_ENG_ABORTED
                self.push_result(message, None, None)
                continue
            if result !=None:
                page.set_filetype(result.get_filetype())
                if result.has_dynamic_link():
                    page.set_dynamic_links(result.get_dynamic_links())
                

            if result.get_decision() == SA_DECISION_MALICIOUS:
#               add by charlie 2014.12.17 for sa.threat.tag
                rule_ = result.get_rules()
                filetype_ = result.get_filetype()
                type="web-threat:"
                if filetype_:
                    platform = filetype_ +"/"
                else:
                    platform = "HTML"+"/"
                str=""
                if rule_ == None :
                    rule_ = "generic"
                    
                for rule in rule_:
                    if rule.strip() == '':
                        continue
                    _rule_ = (rule.split("/")[-1]).replace(".","_") 
                    str=str+type+platform+_rule_
                    str=str+","
                threat_tag = str[:-1]
                threat_tag = threat_tag.lower()
                if threat_tag == "":
                    if result.get_category()==SA_CATEGORY_PHISHING :
                        threat_tag = "fraud:url/phishing.fakesites"
                message['sa.threat.tag'] = threat_tag
                message['sa.decision.sal'] = 'MALICIOUS'
                self.push_result(message, page, result)
                continue

            if result.get_decision() == SA_DECISION_MONITORING:
                message['sa.decision.sal'] = 'MONITORING'
                self.logger.debug("push monitoring result, message #%s" % id(message))
                self.push_result(message, page, result)

            # Scan with GSB
            gsb_enable = self.config[CONFIG_KEY_GSB_ENABLE]
            if gsb_enable and page.has_dynamic_link():
                self.logger.debug("scan by gsb, message #%s" % id(message))
                self.gsb_worker.push_scan_task(message, page)
            else:
                result = NormalResult()
                self.push_result(message, page, result)

        self.flush_result_buffer()

    def basic_exception_handler(self, e):
        #tblines = traceback.format_exc()
        #self.logger.warning("basic exception handler catched:\n"+tblines)
        odin_app.BaseApplication.basic_exception_handler(self, e)
 
    def custom_exception_handler(self, e):
        #tblines = traceback.format_exc()
        #self.logger.warning("custom exception handler catched:\n"+tblines)
        pass

#####################
# Main
#####################
def main():
    sa = OdinSA()
    return sa.run()

import signal
import traceback
lets_go = False
def pause_handler(signum, frame):
    global lets_go
    lets_go = True

def dump_handler(sig, frame):
    with open("/tmp/odin_sa_dump.log", "a") as fout:
        print >>fout, "\n*** STACKTRACE - START ***\n"
        code = []
        for threadId, stack in sys._current_frames().items():
            code.append("\n# ThreadID: %s" % threadId)
            for filename, lineno, name, line in traceback.extract_stack(stack):
                code.append('File: "%s", line %d, in %s' % (filename,
                                                            lineno, name))
                if line:
                    code.append("  %s" % (line.strip()))

        for line in code:
            print >>fout, line
        print >>fout, "\n*** STACKTRACE - END ***\n"


signal.signal(signal.SIGUSR1, pause_handler)
signal.signal(signal.SIGUSR2, dump_handler)

if __name__ == '__main__':
    # Wait for signal 10 (SIGUSR1)
    if 0:
        print >>sys.stderr, "pid: %s" % os.getpid()
        print >>sys.stderr, "Waiting for signal 10 ..."
        while not lets_go: signal.pause()
        print >>sys.stderr, "Got signal 10, continue running ..."

    sys.exit(main())


