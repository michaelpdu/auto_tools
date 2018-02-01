# -*- coding=utf-8 -*-
import os
import sys
import json
import platform
from ctypes import *
import multiprocessing
from tmsie_wrapper import TmsieWrapper
sys.path.append(os.path.join('..','..','..','..'))
from optparse import OptionParser
from src.pysie.keyword_feature_analyzer import KeywordFeatureAnalyzer

def GetSampleData(sample_path):
    if not os.path.exists(sample_path):
        print ("file do not exsit")
        return ""
    with open(sample_path, 'rb') as f:
        return f.read()


def FakeSieScan(tmsie, dllpath, samplepath):
    try:
        context_id = c_uint(0)
        tmsie.TMSIE_CreateContext(byref(context_id))
        ret = -1
        reserve = c_void_p()
        client_ip = b"127.0.0.1"
        ret = tmsie.TMSIE_AddContent(context_id, tmsie.TMSIE_HTTP_REQ_CLIENT_IP, client_ip, len(client_ip), reserve)
        if ret != 0:
            print ("TMSIE_AddContent failed : TMSIE_HTTP_REQ_CLIENT_IP \n")
        server_ip = b"127.0.0.1"
        ret = tmsie.TMSIE_AddContent(context_id, tmsie.TMSIE_HTTP_REQ_SERVER_IP, server_ip, len(server_ip), reserve)
        if ret != 0:
            print ("TMSIE_AddContent failed : TMSIE_HTTP_REQ_SERVER_IP \n")
        url       = b"http://www.abcd1234sa.com.cn/index"
        ret = tmsie.TMSIE_AddContent(context_id, tmsie.TMSIE_HTTP_REQ_URL, url, len(url), reserve)
        if ret != 0:
            print ("TMSIE_AddContent failed : TMSIE_HTTP_REQ_URL \n")
        req_hdr   = b"GET /abc.html HTTP/1.1\r\nConnection: Keep-Alive\r\n"
        ret = tmsie.TMSIE_AddContent(context_id, tmsie.TMSIE_HTTP_REQ_HDR, req_hdr, len(req_hdr), reserve)
        if ret != 0:
            print ("TMSIE_AddContent failed : TMSIE_HTTP_REQ_HDR \n")
        req_body  = b""
        ret = tmsie.TMSIE_AddContent(context_id, tmsie.TMSIE_HTTP_REQ_BODY, req_body, len(req_body), reserve)
        if ret != 0:
            print ("TMSIE_AddContent failed : TMSIE_HTTP_REQ_BODY \n")
        resp_hdr  = b"HTTP/1.0 200 OK\r\nContent-Length: 1024"
        ret = tmsie.TMSIE_AddContent(context_id, tmsie.TMSIE_HTTP_RESP_HDR, resp_hdr, len(resp_hdr), reserve)
        if ret != 0:
            print ("TMSIE_AddContent failed : TMSIE_HTTP_RESP_HDR \n")
        resp_body = GetSampleData(samplepath)
        ret = tmsie.TMSIE_AddContent(context_id, tmsie.TMSIE_HTTP_RESP_BODY, resp_body, len(resp_body), reserve)
        if ret != 0:
            print ("TMSIE_AddContent failed : TMSIE_HTTP_RESP_BODY \n")
        decision = c_int(100)
        ret = tmsie.TMSIE_Scan(context_id, byref(decision), reserve)
        if ret != 0:
            print ("TMSIE_Scan failed : scan " + str(ret) + " \n")
    except:
        print "got exception"
    return context_id


def GetMatchFeature(dllpath, samplepath, out_path, sample_label, config_path, top_n, tfcfg_path, usemaxtf):
    tmsie = TmsieWrapper(dllpath)
    with open(config_path, 'rb') as fh:
        config = json.load(fh)
    with open(tfcfg_path, 'rb') as fh:
        tfconfig = json.load(fh)
    kf = KeywordFeatureAnalyzer(config, tfconfig, usemaxtf)
    for root, dir, samples in os.walk(samplepath):
        for sample in samples:
            sample = os.path.join(root, sample)
            # print (sample + "\n")
            # get keyword match features
            feature_word = ""
            with open(sample, 'r+') as fd:
                content = fd.read()
                kf.analyze_content(content, top_n)      # use top n keywords in the config
                features_ = kf.get_features_index_frequency()
                order_list = sorted(features_.keys()) 
                for item in order_list:
                    feature_word += str(item)
                    feature_word += ':'
                    feature_word += str(features_[item])
                    feature_word += ' '
            feature_word = bytes(feature_word)

            context_id = FakeSieScan(tmsie, dllpath, sample)
            try:
                reserve = c_void_p()
                result_len = c_ulong(0)
                c_result = c_char_p()
                print "scan complete"
                tmsie.TMSIE_GetScanResult(context_id, tmsie.TMSIE_HEU_FEATURES_DESC, c_result, byref(result_len))

                if result_len != 0:
                    result = create_string_buffer(result_len.value)
                    tmsie.TMSIE_GetScanResult(context_id, tmsie.TMSIE_HEU_FEATURES_DESC, result, byref(result_len))
                    #print (result.value)
                    res = str(result.value)
                    #print res
                    if not res:
                        res = "0:0 "
                    with open(out_path, 'a+') as fd:
                        tmp = sample_label + " " + res + feature_word + "#" + os.path.join(root, sample) + "\n"
                        print 'feature are:', tmp
                        fd.write(tmp)
            except:
                print "get exception"
                        


def add_option(option_parser):
    option_parser.add_option("--dllpath", dest='dllpath', help="dll path", type="string")
    option_parser.add_option("--samplepath", dest='path', help="sample path", type="string")
    option_parser.add_option("--label", dest='label', help="malicious 1 , normal 0", type="string")
    option_parser.add_option("--out", dest='out', help="out file", type="string")
    option_parser.add_option("--topn", dest='topn', help="top n keyword", type="string")
    option_parser.add_option("--configpath", dest='configpath', help="config path", type="string")
    option_parser.add_option("--usemaxtf", dest='usemaxtf', help="usemaxtf", type="string")
    option_parser.add_option("--tfconfigpath", dest='tfconfigpath', help="tfconfigpath", type="string")
    option_parser.add_option("--start_extract_index", dest='startindex', help="startindex", type="string")
    option_parser.add_option("--interval", dest='interval', help="interval", type="string")


if __name__ == "__main__":
    option_parser = OptionParser()
    add_option(option_parser)

    if len(sys.argv) != 11:
        option_parser.print_help()

    (options, args) = option_parser.parse_args()
    sample_path = options.path
    dll_path = options.dllpath
    sample_label = options.label    
    out_path = options.out
    topn=int(options.topn)
    config=options.configpath
    if options.usemaxtf == 'True':
        usemaxtf = True
    else:
        usemaxtf = False
    tfcfgpath = options.tfconfigpath
    start_index = int(options.startindex)
    interval = int(options.interval)
    ########## FUNCTION ##########
    if not dll_path:
        if platform.system() == 'Windows':
            if platform.architecture()[0] == '64bit':
                dll_path = os.path.join('build', 'Windows', 'x64', 'tmsie64.dll')
            else:
                dll_path = os.path.join('build', 'Windows', 'x86', 'tmsie32.dll')
        elif platform.system() == 'Linux':
            if platform.architecture()[0] == '64bit':
                dll_path = os.path.join('build', 'x64', 'build', 'libtmsie.so')
            else:
                dll_path = os.path.join('build', 'x86', 'build', 'libtmsie.so')
        else:
            print '[ERROR] Unknown platform'
            exit(-1)
    #for i in range(start_index, topn+interval, interval):
     #   out = out_path + '_' + str(i) + '.txt'
      #  GetMatchFeature(dll_path, sample_path, out, sample_label, config, i, tfcfgpath, usemaxtf)
    proclist = []
    for i in range(start_index, topn+interval, interval):
        out = out_path + '_' + str(i) + '.txt'
        proclist.append(multiprocessing.Process(target=GetMatchFeature, args=(dll_path, sample_path, out, sample_label, config, i, tfcfgpath, usemaxtf)))

    for item in proclist:
	item.start()
    for item in proclist:
	item.join()
