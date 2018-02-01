import sys,os
import signal
import time
import multiprocessing
import Queue
from sa import *

_scale = {'kB': 1024.0, 'mB': 1024.0*1024.0,
          'KB': 1024.0, 'MB': 1024.0*1024.0}

def _VmB(VmKey, pid):
    '''Private.
    '''
    _proc_status = '/proc/%d/status' % pid
    # get pseudo file  /proc/<pid>/status
    try:
        t = open(_proc_status)
        v = t.read()
        t.close()
    except:
        assert False, "Only support on Linux/Unix system"
    # get VmKey line e.g. 'VmRSS:  9999  kB\n ...'
    i = v.index(VmKey)
    v = v[i:].split(None, 3)  # whitespace
    if len(v) < 3:
        return 0.0  # invalid format?
    # convert Vm value to bytes
    return float(v[1]) * _scale[v[2]]


def memory(pid, since=0.0):
    '''Return memory usage in bytes.
    '''
    return _VmB('VmSize:', pid) - since


def resident(pid, since=0.0):
    '''Return resident memory usage in bytes.
    '''
    return _VmB('VmRSS:', pid) - since


def stacksize(pid, since=0.0):
    '''Return stack size in bytes.
    '''
    return _VmB('VmStk:', pid) - since
#add by charlie li for return wrs result 2014.12.17
class WrsResult():
    def __init__(self,scan_result,scan_page):
         # decision
        if scan_result.get_decision()!=None:
            self._decision = scan_result.get_decision()
        if scan_result.get_module()!=None:
            self._module = scan_result.get_module()
        if scan_result.get_rules()!=None:
            self._rules = scan_result.get_rules()
        self._engine_version =scan_result.get_engine_version()
        self._pattern_version = scan_result.get_pattern_version()
        self._filetype = None
        if scan_page.get_filetype() != None:
            self._filetype = scan_page.get_filetype()
        self._dynamic_links = [] 
        if scan_page.has_dynamic_link():
            self._dynamic_links = scan_page.get_dynamic_links()
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

    def get_engine_version(self):
        return self._engine_version

    def get_pattern_version(self):
        return self._pattern_version
    
    def get_filetype(self):
        return self._filetype
    
    def has_dynamic_link(self):
        return len(self._dynamic_links) > 0

    def get_dynamic_links(self):
        return self._dynamic_links
class WrsNormalResult():

    def __init__(self, decision,category,scan_page):
        self._decision = decision
        self._category = category
        self._filetype = None
        if scan_page.get_filetype() != None:
            self._filetype = scan_page.get_filetype()
        self._dynamic_links = [] 
        if scan_page.has_dynamic_link():
            self._dynamic_links = scan_page.get_dynamic_links()
    def get_decision(self):
        return self._decision

    def get_category(self):
        return self._category
    def get_filetype(self):
        return self._filetype
    
    def has_dynamic_link(self):
        return len(self._dynamic_links) > 0

    def get_dynamic_links(self):
        return self._dynamic_links

class ScanProcess(multiprocessing.Process):

    EXIT_EVENT = -1 

    def __init__(self, scanner_creater,feedback_manager, feedback_enable,feedback_monitoring,logger, page_queue, result_queue):
        multiprocessing.Process.__init__(self, name="SALWorker")

        self.scanner_creater = scanner_creater
        self.feedback_manager = feedback_manager
        self.feedback_enable = feedback_enable
        self.feedback_monitoring = feedback_monitoring
        self.logger = logger
        self.page_queue = page_queue
        self.result_queue = result_queue

        self.ready_to_serve = multiprocessing.Condition()
        self.daemon = False
        self.start()

    def run(self):
        # Replace stdin/stdout/stderr with /dev/null
        # This can avoid SAL's output to interfere with ODIN's message output
        os.dup2(os.open(os.devnull, 0), 0)
        os.dup2(os.open(os.devnull, 0), 1)

        sal_scanner = self.scanner_creater()
        self.logger.info("ScanProcess: initialized successfully")
        with self.ready_to_serve:
            self.ready_to_serve.notify()

        self.logger.debug("ScanProcess: get into main loop")
        while True:
            self.logger.debug("ScanProcess: waiting for next page")
            message = self.page_queue.get()
            page = Page.build_from_message(message)
            if page == ScanProcess.EXIT_EVENT:
                self.logger.info("ScanProcess: got exit event")
                break
            self.logger.debug("ScanProcess: scanning page")
            result = sal_scanner.scan(page)
            
            if result.get_decision() == SA_DECISION_MALICIOUS or result.get_decision() == SA_DECISION_MONITORING:
                wrs_result = WrsResult(result,page)
                self.result_queue.put(wrs_result)
                #feedback
                if self.feedback_enable:
                    if (result.get_decision() == SA_DECISION_MONITORING and not self.feedback_monitoring):
                        # monitoring not feedback
                        pass
                    else:
                        self.logger.info("begin feedback")
                        self.feedback_manager.feedback(page, result)
            elif result.get_decision() ==  SA_DECISION_NORMAL :
                wrs_result = WrsNormalResult(SA_DECISION_NORMAL,SA_DECISION_NORMAL,page)
                self.result_queue.put(wrs_result)
            else:
                pass
            self.logger.debug("ScanProcess: sending result to agent")
        self.logger.info("ScanProcess: exit normally")
        return 0


class ScanProcessAgent:

    def __init__(self, scanner_creater,feedback_manager,feedback_enable,feedback_monitoring, logger, scan_timeout, mem_limit):
        self.scanner_creater = scanner_creater
        self.feedback_manager = feedback_manager
        self.feedback_enable = feedback_enable
        self.feedback_monitoring = feedback_monitoring
        self.logger = logger
        self.scan_timeout = scan_timeout
        self.mem_limit = mem_limit

        self.page_queue = None
        self.result_queue = None
        self.scan_process = None

        self.restart()

    def close(self):
        self.logger.info("SPAgent: shutting down")

        self.page_queue.put(ScanProcess.EXIT_EVENT)

        try:
            result = self.result_queue.get(True, 2)
            self.logger.warning("SPAgent: entry found in result queue, cleaned.")
        except Queue.Empty, ex:
            self.logger.info("SPAgent: result queue is empty")
        except IOError, ex:
            self.logger.info("SPAgent: result queue is closed")

        try:
            self.scan_process.join(5)
            if self.scan_process.is_alive():
                self.logger.warning("SPAgent: scan process still alive, kill it")
                os.kill(self.scan_process.pid, signal.SIGKILL)
                self.scan_process.join()
        except Exception, ex:
            self.logger.warning("SPAgent: %s. scan_process pid is %d" % (str(ex), self.scan_process.pid))

        self.logger.info("SPAgent: shutdown successfully")

    def restart(self):
        if self.page_queue:
            self.page_queue.close()
        if self.result_queue:
            self.result_queue.close()
        self.page_queue = multiprocessing.Queue()
        self.result_queue = multiprocessing.Queue()

        if self.scan_process:
            if self.scan_process.is_alive():
                os.kill(self.scan_process.pid, signal.SIGKILL)
                self.logger.error("SPAgent: killed the alive scan process.")
            else:
                self.logger.error("SPAgent: scan process is no longer exist.")
            self.scan_process.join()

        self.scan_process = ScanProcess(self.scanner_creater, self.feedback_manager, self.feedback_enable, self.feedback_monitoring,self.logger, self.page_queue, self.result_queue)

    def scan(self, message):
        result = None
        self.logger.debug("SPAgent: scan message %s" % message)
        self.page_queue.put(message)
        for i in range(int(self.scan_timeout)):
            if not self.scan_process.is_alive():
                break
            try:
                self.logger.debug("SPAgent: trying to get result ...")
                result = self.result_queue.get(True, 1.0)
                self.logger.debug("SPAgent: got result %s" % result)
                break
            except Queue.Empty, ex:
                pass

        if result == None:
            if self.scan_process.is_alive():
                self.logger.error("SPAgent: no result, scan process ran out of time.")
            else:
                self.logger.error("SPAgent: no result, scan process exited unexpectly.")
            self.restart()

        memory_usage = memory(self.scan_process.pid)
        self.logger.info("SPAgent: current memory usage: %.3f MB" % ( memory_usage / 1024.0 / 1024.0 ))
        self.logger.debug("SPAgent: current memory usage: %.3f MB" % ( memory_usage / 1024.0 / 1024.0 ))
        if self.mem_limit != 0 and memory_usage > self.mem_limit:
            self.logger.warning("SPAgent: memory exceeds maximum limit, restart scan process")
            self.restart()

        return result


