from ctypes import *
import platform


# ****************************************
# Constants
# ****************************************
if platform.architecture()[0]=='32bit':
    TMSA_INVALID_HANDLE_VALUE   = 0xffffffff
else:
    TMSA_INVALID_HANDLE_VALUE   = 0xffffffffffffffff

# Return code
TM_SA_SUCCESS                           = 0
TM_SA_ERR_BASE                          = TM_SA_SUCCESS
TM_SA_ERR_INVALID_HANDLE                = TM_SA_ERR_BASE - 1
TM_SA_ERR_FIND_PATH                     = TM_SA_ERR_BASE - 2
TM_SA_ERR_OPEN_FILE                     = TM_SA_ERR_BASE - 3
TM_SA_ERR_READ_FILE                     = TM_SA_ERR_BASE - 4
TM_SA_ERR_PATTERN_CONTENT               = TM_SA_ERR_BASE - 5
TM_SA_ERR_INSUFFICIENT_BUF              = TM_SA_ERR_BASE - 6
TM_SA_ERR_INVALID_PARAM                 = TM_SA_ERR_BASE - 7
TM_SA_ERR_MEM_ALLOC_FAIL                = TM_SA_ERR_BASE - 8
TM_SA_ERR_UNKNOWN                       = TM_SA_ERR_BASE - 9
TM_SA_ERR_INVALID_HTTP_CONTENT          = TM_SA_ERR_BASE - 10
TM_SA_ERR_UNSUPPORT_TYPE                = TM_SA_ERR_BASE - 11
TM_SA_ERR_BUFFER_FULL                   = TM_SA_ERR_BASE - 12
TM_SA_ERR_CALL_SEQ                      = TM_SA_ERR_BASE - 13
TM_SA_ERR_INTERNAL                      = TM_SA_ERR_BASE - 14
TM_SA_ERR_EXCESSIVE_TRAFFIC             = TM_SA_ERR_BASE - 15
TM_SA_ERR_INVALID_OPT_VALUE             = TM_SA_ERR_BASE - 16
TM_SA_ERR_INVALID_EVENT_TYPE            = TM_SA_ERR_BASE - 17
TM_SA_ERR_INVALID_EVENT_HANDLE          = TM_SA_ERR_BASE - 18
TM_SA_ERR_FILTER_BY_RANK                = TM_SA_ERR_BASE - 19

# TM_SA_DIAGNOSIS_TYPE
TM_SA_DIAGNOSIS_INVALID                 = -1
TM_SA_DIAGNOSIS_LOWRISK                 = 1 
TM_SA_DIAGNOSIS_UNDETERMINED            = 2
TM_SA_DIAGNOSIS_MONITORING              = 3
TM_SA_DIAGNOSIS_SUSPICIOUS              = 4
TM_SA_DIAGNOSIS_MALICIOUS               = 5

# TM_SA_OPTIONS
TM_SA_OPT_LOGPATH                       = 1
TM_SA_OPT_LOGLEVEL                      = 2
TM_SA_OPT_UCONV_CALLBACK                = 3
TM_SA_OPT_FEEDBACK_CALLBACK             = 4
TM_SA_OPT_LOCAL_EVENT_STORE_CALLBACK    = 5
TM_SA_OPT_NON_BLOCKING_MODE             = 6
TM_SA_OPT_RANK_FOLDER                   = 7
TM_SA_OPT_NF_FOLDER                     = 8

# TM_SA_CONTENT_TYPE
TM_SA_HTTP_REQ_HOST_IP                  = 1
TM_SA_HTTP_REQ_URL                      = 2
TM_SA_HTTP_REQ_HDR                      = 3
TM_SA_HTTP_REQ_BODY                     = 4
TM_SA_HTTP_RESP_HDR                     = 5
TM_SA_HTTP_RESP_BODY                    = 6
TM_SA_HTTP_SCRIPT_BODY                  = 7

# TM_SA_LOG_LEVEL
TM_SA_LOG_OFF                           = 6
TM_SA_LOG_FATAL                         = 5
TM_SA_LOG_ERROR                         = 4
TM_SA_LOG_WARN                          = 3
TM_SA_LOG_INFO                          = 2
TM_SA_LOG_DEBUG                         = 1
TM_SA_LOG_TRACE                         = 0
TM_SA_LOG_ALL                           = TM_SA_LOG_TRACE

# TM_SA_DESCRIPTION_TYPE
TM_SA_DESCRIPTION_DECISION              = 0
TM_SA_DESCRIPTION_BEHAVIOR              = 1
TM_SA_DESCRIPTION_ANALYZER              = 2
TM_SA_DESCRIPTION_MATCHED_RULES         = 3
TM_SA_DESCRIPTION_USER_DEFINE           = 4
TM_SA_DESCRIPTION_MAX                   = 5

# TM_SA_WEBPAGE_INFO_TYPE
TM_SA_WEBPAGE_INFO_CHILDURLS            = 0
TM_SA_WEBPAGE_INFO_FILETYPE             = 1

# TM_SA_CONTEXT_TYPE
TM_SA_CONTEXT_AUTO                      = 0
TM_SA_CONTEXT_AFFINITIVE                = 1

# TM_SA_SCAN_TYPE
TM_SCAN_TYPE_BROWSER_HTML_CONTENT       = 0
TM_SCAN_TYPE_BROWSER_SCRIPT_EXECUTION   = 1
TM_SCAN_TYPE_BROWSER_DOCUMENT_COMPLETE  = 2
TM_SCAN_TYPE_BROWSER_HTML_SIGNATURE     = 3
TM_SCAN_TYPE_PROXY_LINK                 = 4
TM_SCAN_TYPE_PROXY_ALL                  = 5
TMSA_TOTAL_SCAN_TYPE_COUNT              = 6

# ****************************************
# Interfaces
# ****************************************

# load library
tmsadll = cdll.LoadLibrary('libtmsa.so')

# alias
TMSAEng_initialize                      = tmsadll.TMSAEng_initialize
TMSAEng_uninitialize                    = tmsadll.TMSAEng_uninitialize
TMSAEng_getEngineVersion                = tmsadll.TMSAEng_getEngineVersion
TMSAEng_getPatternVersion               = tmsadll.TMSAEng_getPatternVersion
TMSAEng_setOption                       = tmsadll.TMSAEng_setOption
TMSAEng_getOption                       = tmsadll.TMSAEng_getOption
TMSAEng_createContext                   = tmsadll.TMSAEng_createContext
TMSAEng_createPage                      = tmsadll.TMSAEng_createPage
TMSAEng_addContent                      = tmsadll.TMSAEng_addContent
TMSAEng_scan                            = tmsadll.TMSAEng_scan
TMSAEng_scanEx                          = tmsadll.TMSAEng_scanEx
TMSAEng_getDiagnosis                    = tmsadll.TMSAEng_getDiagnosis
TMSAEng_getDescription                  = tmsadll.TMSAEng_getDescription
TMSAEng_getDescriptionEx                = tmsadll.TMSAEng_getDescriptionEx
TMSAEng_getWebPageInfo                  = tmsadll.TMSAEng_getWebPageInfo
TMSAEng_freeHandle                      = tmsadll.TMSAEng_freeHandle

# function prototypes
def _define_prototypes():
    prototypes = [
        ( TMSAEng_initialize,           c_long,     [c_wchar_p, c_void_p] ),
        ( TMSAEng_uninitialize,         c_long,     [] ),
        ( TMSAEng_getEngineVersion,     c_long,     [c_void_p, c_void_p, c_void_p] ),
        ( TMSAEng_getPatternVersion,    c_long,     [c_void_p, c_void_p, c_void_p] ),
        ( TMSAEng_setOption,            c_long,     [c_int, c_void_p, c_uint32] ),
        ( TMSAEng_getOption,            c_long,     [c_int, c_void_p, c_void_p] ),
        ( TMSAEng_createContext,        c_void_p,   [c_wchar_p, c_int] ),
        ( TMSAEng_createPage,           c_void_p,   [c_void_p] ),
        ( TMSAEng_addContent,           c_long,     [c_void_p, c_int, c_char_p, c_uint32] ),
        ( TMSAEng_scan,                 c_void_p,   [c_void_p, c_void_p, c_void_p] ),
        ( TMSAEng_scanEx,               c_void_p,   [c_void_p, c_int, c_void_p, c_void_p, c_void_p] ),
        ( TMSAEng_getDiagnosis,         c_int,      [c_void_p] ),
        ( TMSAEng_getDescription,       c_long,     [c_void_p, c_wchar_p, c_void_p] ),
        ( TMSAEng_getDescriptionEx,     c_long,     [c_void_p, c_int, c_wchar_p, c_void_p] ),
        ( TMSAEng_getWebPageInfo,       c_long,     [c_void_p, c_int, c_wchar_p, c_void_p] ),
        ( TMSAEng_freeHandle,           c_long,     [c_void_p] ),
    ]
    for prototype in prototypes:
        prototype[0].restype = prototype[1]
        prototype[0].argtypes = prototype[2]

_define_prototypes()
