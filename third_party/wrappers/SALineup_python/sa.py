import os,sys
import time
import re
import memcache
import json
import StringIO
import urllib
import urllib2
import logging
from ctypes import *
from hashlib import md5
from sa_sal_api import *
from urlparse import urlparse
from post_file import post_multipart
from sal_utility import *

# Unified Decision
SA_DECISION_NORMAL      = 0
SA_DECISION_MONITORING  = 1
SA_DECISION_MALICIOUS   = 2

# Name of decision
DECISION_NAME = {
    SA_DECISION_NORMAL:     'NORMAL',
    SA_DECISION_MONITORING: 'MONITORING',
    SA_DECISION_MALICIOUS:  'MALICIOUS',
}

# Decision Category
SA_CATEGORY_NORMAL      = 0
SA_CATEGORY_EXPLOIT     = 1 
SA_CATEGORY_PHISHING    = 2


TMSA_DECISION_TO_DECISION = {
    TM_SA_DIAGNOSIS_MALICIOUS:      SA_DECISION_MALICIOUS,
    TM_SA_DIAGNOSIS_SUSPICIOUS:     SA_DECISION_MALICIOUS,
    TM_SA_DIAGNOSIS_MONITORING:     SA_DECISION_MONITORING,
    TM_SA_DIAGNOSIS_UNDETERMINED:   SA_DECISION_NORMAL,
    TM_SA_DIAGNOSIS_LOWRISK:        SA_DECISION_NORMAL,
    TM_SA_DIAGNOSIS_INVALID:        SA_DECISION_NORMAL,
}

logger = logging
SAL_TEST_LOG_FILE = 'testtmsa.log'

def init_sa_logger():
    logging.basicConfig(filename=SAL_TEST_LOG_FILE, level=logging.DEBUG, 
                        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

class SALException(Exception):
    pass

class Page:

    @staticmethod
    def build_from_message(message):
        download_time = None
        if 'dler.e_time' in message:
            download_time = float(message['dler.e_time'])
        content_file = os.path.join(message['content.dir'], "page", 
                                    message['content.filename'])
        return Page(message['url'], content_file=content_file,
                                    download_time=download_time)

    def __init__(self, url="http://www.abcd1234sa.com.cn/index", 
                            content_file=None, content=None, download_time=None):
        self.url = url
        self.path = content_file
        self.content = content
        read_time_start = time.time()
        if not self.content and content_file:
            with open(content_file, "rb") as f:
                self.content = f.read()
        logger.debug("read file time: %.3f seconds" % (time.time() - read_time_start))

        self.download_time = download_time if download_time != None \
                                           else time.time()

        self._filetype = None
        self._dynamic_links = []

    def get_path(self):
        return self.path

    def get_url(self):
        return self.url

    def get_content(self):
        return self.content

    def set_filetype(self, filetype):
        self._filetype = filetype

    def get_filetype(self):
        return self._filetype

    def get_download_time(self):
        return self.download_time

    def set_dynamic_links(self, dynamic_links):
        self._dynamic_links = dynamic_links

    def has_dynamic_link(self):
        return len(self._dynamic_links) > 0

    def get_dynamic_links(self):
        return self._dynamic_links


class FeedbackManager:

    TO_FEEDBACK_FILETYPE = {
        'html': 'HTML',
        'pdf': 'PDF',
        'swf': 'SWF',
        'jar': 'JAR',
    }

    def __init__(self, post_url):
        self.post_url = post_url
        self.post_host = urlparse(self.post_url).netloc

    def _prepare_feedback_info(self, page, result):
        info = {}

        # environment info
        info['salcpp_host'] = None
        info['traffic_chunk_count'] = None
        info['engine_version'] = None
        info['pattern_version'] = None
        info['browser'] = None
        info['user_action'] = None
        info['peer_ip'] = None
        
        # page info
        info['date'] = time.strftime('%Y-%m-%d %H:%M:%S', 
                                     time.gmtime(page.get_download_time()) )
        info['url'] = page.get_url()
        if page.get_filetype() in FeedbackManager.TO_FEEDBACK_FILETYPE:
            info['filetype'] = FeedbackManager.TO_FEEDBACK_FILETYPE[\
                                                       page.get_filetype()]
        else:
            info['filetype'] = None
        info['referer'] = None
        info['solution'] = 'SA'

        # result info
        info = result.to_feedback_info(info)

        for key in info.keys():
            if isinstance(info[key], unicode):
                info[key] = info[key].encode("UTF8")

        return info

    def _post_feedback(self, info, content, behavior):
        assert isinstance(content, str)
        if isinstance(behavior, unicode):
            behavior = behavior.encode("UTF8")

        info_json = json.dumps(info)
        xored_content = "".join([chr(ord(byte)^0xFF) for byte in content])
        xored_behavior = "".join([chr(ord(byte)^0xFF) for byte in behavior])
        try:
            resp = post_multipart(self.post_host, self.post_url, [], 
                                [("info", "info.json", info_json),
                                 ("content", "content.dat", xored_content),
                                 ("behavior", "behavior.xml", xored_behavior)])
        except Exception, ex:
            logger.error("Exception found when posting feedback: %s" % ex)
            return None
        ret = int(resp.split(",")[0])
        if ret == 0:
            sid = int(resp.split(",")[1])
            return sid
        else:
            logger.error("Feedback server return with error: %s" % resp)
            return None


    def feedback(self, page, result):
        info = self._prepare_feedback_info(page, result)
        sid = self._post_feedback(info, page.get_content(), 
                                        result.get_behavior_report())
        return sid

class ScanResult(object):

    def get_decision(self):
        raise Exception("Not Implemented")

    def get_category(self):
        raise Exception("Not Implemented")

    def get_rules(self):
        return None

    def get_pattern_string(self):
        return None

    def to_feedback_info(self, info={}):
        raise Exception("Not Implemented")

class CachedResult(ScanResult):

    def __init__(self, decision=SA_DECISION_NORMAL, 
                       category=SA_CATEGORY_NORMAL):
        self._decision = decision
        self._category = category

    def get_decision(self):
        return self._decision

    def get_category(self):
        return self._category
    

class NormalResult(ScanResult):

    def __init__(self, decision=SA_DECISION_NORMAL, 
                       category=SA_CATEGORY_NORMAL):
        self._decision = decision
        self._category = category

    def get_decision(self):
        return self._decision

    def get_category(self):
        return self._category


class SALScanResult(ScanResult):

    @staticmethod
    def _tmsa_get_description(decision_handle, type):
        length = c_uint32()
        ret = TMSAEng_getDescriptionEx(decision_handle, type, None, 
                                       byref(length))
        if ret != TM_SA_SUCCESS:
            raise SALException("Failed to get description's length, type:%d" \
                               % type)

        desc= create_unicode_buffer(length.value)
        ret = TMSAEng_getDescriptionEx(decision_handle, type, desc, 
                                       byref(length))
        if ret != TM_SA_SUCCESS:
            raise SALException("Failed to get description, type:%d" % type)
        
        return desc.value

    def __init__(self, scanner, decision_handle):
        if decision_handle == None:
            raise SALException("decision handle is NULL")

        # decision
        eng_diagnosis = TMSAEng_getDiagnosis(decision_handle)
        self._decision = TMSA_DECISION_TO_DECISION[eng_diagnosis]

        self._module = self._tmsa_get_description(decision_handle, 
                                                TM_SA_DESCRIPTION_ANALYZER)

        rule_string = self._tmsa_get_description(decision_handle, 
                                           TM_SA_DESCRIPTION_MATCHED_RULES)
        #add by charlie 2014.12.17
        if rule_string.find("<D>") != -1:
            rule_string = rule_string.replace("<D>", "").replace("</D>", ";")
        if rule_string.find("<S>") != -1:
            rule_string = rule_string.replace("<S>", "").replace("</S>", ";")
        if rule_string.endswith(";"):
            rule_string = rule_string[:-1]
        self._rules = map(lambda r:r.strip(), rule_string.split(";"))

        self._behavior_report = self._tmsa_get_description(decision_handle, 
                                                TM_SA_DESCRIPTION_BEHAVIOR)

        self._engine_version = scanner.get_engine_version()
        self._pattern_version = scanner.get_pattern_version()

    def get_decision(self):
        return self._decision

    def get_category(self):
        if self.get_decision() == SA_DECISION_NORMAL:
            return SA_CATEGORY_NORMAL
        if self._module == "PhishingAnalyzer":
            return SA_CATEGORY_PHISHING
        else:
            return SA_CATEGORY_EXPLOIT

    def get_module(self):
        return self._module

    def get_rules(self):
        return self._rules

    def get_pattern_string(self):
        return "sal-%s-%s" % (self.get_engine_version(), self.get_pattern_version())

    def get_behavior_report(self):
        return self._behavior_report

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


class SALScanner:

    __single = None

    class Handle:
        def __init__(self, handle):
            self.handle = handle
        def __enter__(self):
            pass
        def __exit__(self, exc_type, exc_value, traceback):
            if self.handle != TMSA_INVALID_HANDLE_VALUE:
                TMSAEng_freeHandle(self.handle)

    def __init__(self, config, log):
        self.root_path_ = os.path.split(os.path.realpath(__file__))[0]
        if SALScanner.__single:
            raise SALException("SALScanner instantiated twice.")
        SALScanner.__single = self

        log = os.path.join(self.root_path_, log)
        if isinstance(log, str):
            log = log.decode("UTF8")

        ret = TMSAEng_setOption(TM_SA_OPT_LOGPATH, log, (1+len(log))*WCHAR_T_SIZE)
        if ret != TM_SA_SUCCESS:
            raise SALException("Set log path failed, ret=%d" % ret)

        self.config = os.path.join(self.root_path_, config)
        if isinstance(config, str):
            self.config = self.config.decode("UTF8")

        self._engine_version = None
        self._pattern_version = None


    def set_args(self, log_level='all', product_name='sc', script_malware=False):
        if not log_level:
            log_level = 'all'
        if not product_name:
            product_name = 'sc'
        if not TMSA_LOGLEVEL.has_key(log_level.lower()):
            raise SALException("Dont have such loglevel")
        ret = TMSAEng_setOption(TM_SA_OPT_LOGLEVEL, byref(c_int(TMSA_LOGLEVEL[log_level.lower()])), INT_SIZE);
        if ret != TM_SA_SUCCESS:
            raise SALException("Set log level failed, ret=%d" % ret)

        ret = TMSAEng_initialize(self.config, product_name.decode('UTF8')) 
        if ret != TM_SA_SUCCESS:
            raise SALException("Initialize failed, ret=%d" % ret)

        self._script_malware = script_malware


    @staticmethod
    def _tmsa_get_webpage_info(webpage_handle, type):
        length = c_uint32()
        ret = TMSAEng_getWebPageInfo(webpage_handle, type, None, byref(length))
        if ret != TM_SA_SUCCESS:
            raise SALException("Failed to get webpage_info's length, type:%d" \
                               % type)

        desc= create_unicode_buffer(length.value)
        ret = TMSAEng_getWebPageInfo(webpage_handle, type, desc, byref(length))
        if ret != TM_SA_SUCCESS:
            raise SALException("Failed to get webpage_info, type:%d, ret:%d" % \
                                (type, ret))
        
        return desc.value

    @staticmethod
    def _tmsa_get_filetype(webpage_handle):
        return SALScanner._tmsa_get_webpage_info(webpage_handle, 
                                           TM_SA_WEBPAGE_INFO_FILETYPE)

    @staticmethod
    def _tmsa_get_page_links(webpage_handle):
        links = []
        buffer = SALScanner._tmsa_get_webpage_info(webpage_handle, 
                                           TM_SA_WEBPAGE_INFO_CHILDURLS)
        ss = StringIO.StringIO(buffer)
        for line in ss:
            sp = line.split('\t')
            if len(sp) != 2: continue
            type = sp[0].strip()
            url = sp[1].strip()
            links.append(url)
        return links

    def __del__(self):
        ret = TMSAEng_uninitialize()
        if ret != TM_SA_SUCCESS:
            raise SALException("Uninitialize failed, ret=%d" % ret)

    def get_engine_version(self):
        if self._engine_version == None:
            ver = (c_long(), c_long(), c_long())
            TMSAEng_getEngineVersion(byref(ver[0]), \
                                     byref(ver[1]), \
                                     byref(ver[2]))
            self._engine_version = "%d.%d.%04d" % (ver[0].value,\
                                                 ver[1].value, \
                                                 ver[2].value)
        return self._engine_version

    def get_pattern_version(self):
        if self._pattern_version == None:
            ver = (c_long(), c_long(), c_long())
            TMSAEng_getPatternVersion(byref(ver[0]), \
                                     byref(ver[1]), \
                                     byref(ver[2]))
            self._pattern_version = "%d.%02d.%04d" % (ver[0].value,\
                                                 ver[1].value, \
                                                 ver[2].value)
        return self._pattern_version

    def add_content(self, page, type, buffer):
        assert isinstance(buffer, str)
        ret = TMSAEng_addContent(page, type, buffer, len(buffer))
        return ret

    def scan(self, page):
        # Create Context
        ctx = TMSAEng_createContext(None, TM_SA_CONTEXT_AUTO)
        if ctx == TMSA_INVALID_HANDLE_VALUE:
            logger.error("SAL context create failed")
            return 

        with SALScanner.Handle(ctx):
            # Create WebPage
            hpage = TMSAEng_createPage(ctx)
            if hpage == TMSA_INVALID_HANDLE_VALUE:
                logger.error("SAL page create failed")
                return NormalResult()

            with SALScanner.Handle(hpage):
                # Add URL
                ret = self.add_content(hpage, TM_SA_HTTP_REQ_URL, page.url)
                if ret == TM_SA_ERR_FILTER_BY_RANK:
                    logger.debug("filter by AlexaRank")
                elif ret != TM_SA_SUCCESS:
                    logger.error("SAL add URL failed(%d): %s" % (ret, 
                                      page.url))
                    return NormalResult()
                # Add Response Body
                ret = self.add_content(hpage, TM_SA_HTTP_RESP_BODY, 
                                       page.get_content())
                if ret != TM_SA_SUCCESS:
                    # Note that here use debug log due to failure of adding
                    # response body is one of expected result.
                    logger.debug("SAL add response body failed")
                    return NormalResult()

                # set script malware flag
                if self._script_malware is True:
                    fake_proc_name = "fake-proc.exe"
                    ret = self.add_content(hpage, TM_SA_HTTP_SPEC_PROCESS_NAME, 
                           fake_proc_name)
                    if ret != TM_SA_SUCCESS:
                        logger.debug("add process name failed")

                    ret = self.add_content(hpage, TM_SA_HTTP_SPEC_FILE_PATH, 
                           page.path)
                    if ret != TM_SA_SUCCESS:
                        logger.debug("add process name failed")

                    cmd_line = fake_proc_name + " " + page.path
                    ret = self.add_content(hpage, TM_SA_HTTP_SPEC_CMD_LINE, 
                           cmd_line)
                    if ret != TM_SA_SUCCESS:
                        logger.debug("add command line failed.")                             

                    process_chain = "outlook.exe[111]->cmd.exe[222]->fake-proc.exe[333]"
                    ret = self.add_content(hpage, TM_SA_HTTP_SPEC_PROC_CHAIN, 
                           process_chain)
                    if ret != TM_SA_SUCCESS:
                        logger.debug("add process chain failed.")                

                    sha1_sum = os.path.split(page.path)[1]
                    if len(sha1_sum) != 40:
                        sha1_sum = calc_sha1(page.path)
                    ret = self.add_content(hpage, TM_SA_HTTP_SPEC_SHA1, 
                           sha1_sum)
                    if ret != TM_SA_SUCCESS:
                        logger.debug("add SHA1 failed.")

                    host_type = '1'
                    ret = self.add_content(hpage, TM_SA_HTTP_SPEC_HOST_TYPE, 
                           host_type)
                    if ret != TM_SA_SUCCESS:
                        logger.debug("add host type failed.")

                static_links = SALScanner._tmsa_get_page_links(hpage)

                # Scan with Dynamic
                scan_result_dyn = None
                eng_decision = TMSAEng_scanEx(hpage, TM_SCAN_TYPE_PROXY_ALL, 
                                          None, None, None)

                # update page information
                page.set_filetype(SALScanner._tmsa_get_filetype(hpage))
                all_links = SALScanner._tmsa_get_page_links(hpage)
                dynamic_links = list(set(all_links) - set(static_links))
                page.set_dynamic_links(dynamic_links)

                with SALScanner.Handle(eng_decision):
                    scan_result_dyn = SALScanResult(self, eng_decision)

                # return malicious result if dynamically detected
                if scan_result_dyn.get_decision() == SA_DECISION_MALICIOUS:
                    logger.info('dynamically detected')
                    return scan_result_dyn

                # Scan with HS
                logger.info("scan with hs")
                scan_result_hs = None
                eng_decision = TMSAEng_scanEx(hpage,
                                          TM_SCAN_TYPE_BROWSER_HTML_SIGNATURE, 
                                          None, None, None)
                with SALScanner.Handle(eng_decision):
                    scan_result_hs = SALScanResult(self, eng_decision)
                if scan_result_hs.get_decision() == SA_DECISION_MALICIOUS:
                    return scan_result_hs
                elif scan_result_dyn.get_decision() == SA_DECISION_MONITORING:
                    return scan_result_dyn
                elif scan_result_hs.get_decision() == SA_DECISION_MONITORING:
                    return scan_result_hs
                else:
                    return NormalResult()


class GSBScanResult(ScanResult):

    def __init__(self, decision=None, category=None, mal_links=[]):
        self._decision = decision
        self._category = category
        self._mal_links = mal_links

    def get_decision(self):
        return self._decision

    def get_category(self):
        return self._category

    def get_behavior_report(self):
        return "\n".join(self._mal_links)

    def get_rules(self):
        return ['gsb']

    def get_pattern_string(self):
        return 'gsb'

    def to_feedback_info(self, info={}):
        info['decision'] = DECISION_NAME[self.get_decision()]
        info['rule'] = None
        info['module'] = "GSB"
        return info

class GSBScanner:
    def __init__(self, query_url):
        self.query_url = query_url
        self.timeout = 10 # seconds

    def scan(self, page):
        if not page.has_dynamic_link():
            return NormalResult()

        dynamic_links = []
        for link in page.get_dynamic_links():
            if not link.startswith("http://") and not link.startswith("https://"):
                logger.warning("[GSBScanner] found invalid dynamic link not starting with http(s)://, url='%s'" % link.__repr__())
                continue
            dynamic_links.append(link)

        # As GOOGSB2 required, request data should follow this format:
        # {"url":[url1, url2, ..., url3]}
        # see <http://coretech-backend-dev.tw.trendnet.org/wiki/GX-gsbX>
        data = json.dumps({"url":dynamic_links})
        f = None
        try:
            f = urllib2.urlopen(self.query_url, data, self.timeout)
        except Exception, ex:
            logger.error("[GSBScanner] request failed: %s" % str(ex))

        if not f:
            logger.error("[GSBScanner] response file is None")
            return NormalResult()

        resp = f.read()
        logger.debug(resp)
        result = json.loads(resp)
        for i in result:
            if not isinstance(i, list) or len(i) != 2:
                continue
            url = i[0]
            decision = i[1]
            if decision == "mal":
                return GSBScanResult(SA_DECISION_MALICIOUS, 
                                     SA_CATEGORY_EXPLOIT, [url,])
            elif decision == "phi":
                return GSBScanResult(SA_DECISION_MALICIOUS, 
                                     SA_CATEGORY_PHISHING, [url,])

        return NormalResult()


class ResultCache:
    def __init__(self, servers, expiration=604800):
        self.client = memcache.Client(servers)
        self.expiration = expiration  # unit: second

    def extract_scripts(self, page):
        all_script = []
        content = page.get_content()
        matches = re.findall('<script.*?</script>', content, re.I|re.S)
        for s in matches:
            all_script.append(s)
        return all_script

    def get_page_hash_key(self, page, scripts):
        m = md5()
        o = urlparse(page.url)
        m.update(o.netloc)
        for script in scripts:
            m.update(script)
        return m.hexdigest()

    def query_scan_result(self, page):
        '''Query the scanning result of page from cache
        Return the ScanResult object if cache found; otherwise return None
        '''
        scripts = self.extract_scripts(page)
        key = self.get_page_hash_key(page, scripts)
        pair = self.client.get(key)
        if pair != None:
            return CachedResult(pair[0], pair[1])
        else:
            return None

    def cache_scan_result(self, page, scan_result):
        '''Add the scanning result of page to cache.
        Note that currently only normal result would be cached, other result
        will be ignored.
        Return True if cache added successfully, otherwise False.
        '''
        # only cache normal html page that has script tags
        if scan_result.get_decision() == SA_DECISION_NORMAL:
            scripts = self.extract_scripts(page)
            if len(scripts) > 0:
                key = self.get_page_hash_key(page, scripts)
                pair = (scan_result.get_decision(), scan_result.get_category())
                return self.client.set(key, pair, time=self.expiration)
        return False

def main():
    pass

if __name__ == '__main__':
    main()