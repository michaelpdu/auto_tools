import os
import sys
from ctypes import *
from optparse import OptionParser


class TmsieWrapper:


    def __init__(self, dll_path):
        self.__product_name = "ddi"  # hard code
        # TM_SIE_LOG_LEVEL
        self.TMSIE_LOG_OFF = 6
        self.TMSIE_LOG_FATAL = 5
        self.TMSIE_LOG_ERROR = 4
        self.TMSIE_LOG_WARN = 3
        self.TMSIE_LOG_INFO = 2
        self.TMSIE_LOG_DEBUG = 1
        self.TMSIE_LOG_TRACE = 0
        self.TMSIE_LOG_ALL = self.TMSIE_LOG_TRACE

        # TM_SIE_OPTIONS
        self.TMSIE_OPT_LOG_PATH = 1
        self.TMSIE_OPT_LOG_LEVEL = 2

        # TMSIE_CONTENT_TYPE
        self.TMSIE_HTTP_REQ_CLIENT_IP = 1
        self.TMSIE_HTTP_REQ_SERVER_IP = 2
        self.TMSIE_HTTP_REQ_URL = 3
        self.TMSIE_HTTP_REQ_HDR = 4
        self.TMSIE_HTTP_REQ_BODY = 5
        self.TMSIE_HTTP_RESP_HDR = 6
        self.TMSIE_HTTP_RESP_BODY = 7

        # scan result type
        self.TMSIE_MATCHED_RULES = 1
        self.TMSIE_ANALYZER = 2
        self.TMSIE_URL_CHAIN = 3
        self.TMSIE_HEU_FEATURES_DESC = 4

        self.__dll_path = dll_path

        self.__loadSIE()
        self.__TmiseInit("tmsie.ptn", self.__product_name)


    def __loadSIE(self):
        self.tmsie                  = CDLL(self.__dll_path)

        self.TMSIE_Initialize       = self.tmsie.TMSIE_Initialize
        self.TMSIE_SetOption        = self.tmsie.TMSIE_SetOption
        self.TMSIE_AddContent       = self.tmsie.TMSIE_AddContent
        self.TMSIE_CreateContext    = self.tmsie.TMSIE_CreateContext
        self.TMSIE_FreeContext      = self.tmsie.TMSIE_FreeContext
        self.TMSIE_Scan             = self.tmsie.TMSIE_Scan
        self.TMSIE_GetScanResult    = self.tmsie.TMSIE_GetScanResult

        self.TMSIE_Initialize.restype       = c_long
        self.TMSIE_Initialize.argtypes      = [c_wchar_p, c_wchar_p]

        self.TMSIE_SetOption.restype        = c_long
        self.TMSIE_SetOption.argtypes       = [c_int, c_void_p, c_long]

        self.TMSIE_AddContent.restype       = c_long
        self.TMSIE_AddContent.argtypes      = [c_uint, c_uint, c_char_p, c_uint, c_void_p]

        self.TMSIE_CreateContext.restype    = c_uint
        self.TMSIE_CreateContext.argtypes   = [POINTER(c_uint)]

        self.TMSIE_FreeContext.restype      = c_long
        self.TMSIE_FreeContext.argtypes     = [POINTER(c_uint)]

        self.TMSIE_GetScanResult.restype    = c_long
        self.TMSIE_GetScanResult.argtypes   = [c_uint, c_uint, c_char_p, POINTER(c_ulong)]

        self.TMSIE_Scan.restype             = c_long
        self.TMSIE_Scan.argtypes            = [c_uint, POINTER(c_int), c_void_p]


    def __TmiseInit(self, pattern, product):
        self.TMSIE_Initialize(pattern, product)
        print "sie init success!"    

    def TMSIE_SetOption(self, opt, content, size):
        c_opt = c_int(opt)
        c_content = c_int(content)
        return self.TMSIE_SetOption(c_opt, byref(c_content), sizeof(c_long))

    def TMSIE_AddContent(self, ctx_id, cont_type, content, cont_len, reserve):
        c_cont_len  = c_ulong(cont_len)
        c_resrve    = c_void_p()
        return self.TMSIE_AddContent(ctx_id, cont_type, content, c_cont_len, c_resrve)

    def TMSIE_CreateContext(self, ctx_id):
        return self.TMSIE_CreateContext(ctx_id)

    def TMSIE_FreeContext(self, ctx_id):
        return self.TMSIE_FreeContext(ctx_id)

    def TMSIE_GetScanResult(self, ctx_id, result_type):
        c_result_data   = c_char_p()
        c_result_long   = c_ulong(0)
        self.TMSIE_GetScanResult(ctx_id, result_type, c_result_data, byref(c_result_long))
        return c_result_data.value

    def TMSIE_Scan(self, ctx_id, reserve):
        c_decision = c_int()
        self.TMSIE_Scan(ctx_id, byref(c_decision), reserve)
        return c_decision.value
