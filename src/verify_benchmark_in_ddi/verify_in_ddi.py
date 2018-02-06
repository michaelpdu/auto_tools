#/usr/bin/python

import sys, os, subprocess
import re, time, logging

# global variables
saldCtl = r"/opt/TrendMicro/MinorityReport/bin/sald_ctl"
tcpReplay = r"/opt/TrendMicro/MinorityReport/QA_TOOLS/tcpreplay"
saldLog = r"/var/log/sald.log"

fileScanResult = 'benchmark_report.log'

# logger
logPath = 'verify_in_ddi.log'
logger = logging.getLogger('verify_in_ddi')
logger.setLevel(logging.DEBUG)
fh = logging.FileHandler(logPath)
fh.setLevel(logging.DEBUG)
fh.setFormatter(logging.Formatter('[%(asctime)s] %(levelname)s - %(message)s (%(name)s)'))
logger.addHandler(fh)


def clearScriptLog():
    if os.path.exists(logPath):
        os.remove(logPath)

def clearDB():
    logger.debug("Entering into clearDB")
    logger.info(">>> clear table TotalLogs")
    retCode = subprocess.call("psql -d TDADB -c \"delete from tb_cav_total_logs where ruleid=713\"", shell=True)
    logger.info("<<< return code = %d" % retCode)
    os.system("find /fileStores/raw/ -type f | xargs rm -f")

    logger.info(">>> clear table FstreamSHA1")
    retCode = subprocess.call("psql -d TDADB -c \"delete from tb_fstream_sha1\"", shell=True)
    logger.info("<<< return code = %d" % retCode)

    logger.info(">>> clear table SandboxResult")
    retCode = subprocess.call("psql -d TDADB -c \"delete from tb_sandbox_result\"", shell=True)
    logger.info("<<< return code = %d" % retCode)
    logger.debug("Leaving out clearDB")

def clearLOG():
    logger.debug("Entering into clearLOG")
    #print "clear SALD/SIE log"
    os.system("cat /dev/null > /var/log/sald.log")
    os.system("cat /dev/null > /var/log/sald.0.log")
    os.system("cat /dev/null > /var/log/sald.1.log")
    os.system("cat /dev/null > /var/log/sald.2.log")
    os.system("cat /dev/null > /var/log/tmsa.0.log")
    os.system("cat /dev/null > /var/log/tmsa.1.log")
    os.system("cat /dev/null > /var/log/tmsa.2.log")
    logger.debug("Leaving out clearLOG")

def clearSALDCache():
    logger.debug("Entering into clearSALDCache")
    logger.info(">>> clear SALD cache")
    retCode = subprocess.call([saldCtl, "-cf"])
    logger.info("<<< return code = %d" % retCode)
    logger.debug("Leaving out clearSALDCache")

def procSALDLog():
    logger.debug("Entering into procSALDLog")

    isScanResp = False
    isFindDetection = False
    decision = 0
    retMap = {}

    for line in open(saldLog, "r").readlines():
        if "Enter sald_parent_scan_res_cb" in line:
           logger.debug("> Enter sald_parent_scan_res_cb")
           isScanResp = True
        elif "Leave sald_parent_scan_res_cb" in line:
           logger.debug("< Leave sald_parent_scan_res_cb")
           isScanResp = False
           isFindDetection = False
           decision = 0
        elif isScanResp and "result=" in line:
           decision = re.search(r'result=(\d)', line).group(1)
           logger.info("[SALD] find detection, decision = %s" % decision)
           isFindDetection = True
        elif isFindDetection and "[SHA1=]" in line:
           sha1 = re.search(r'\[SHA1=\]=\[(\w{40,40})\]', line).group(1)
           logger.info('SHA1 = %s' % sha1)
           retMap[sha1] = decision
        else:
           continue

    logger.debug("Leaving out procSALDLog")
    return retMap

def prepareReportHeader():
    if os.path.exists(fileScanResult):
        os.remove(fileScanResult)
    appendMessage(("PATH","SHA1","SIE-DECISION","SEVERITY-SBOX","OVERALL-SEVERITY-SBOX","VIRUSNAME","SA-RULES","URL","SIE-RULE","THREATTYPE","SEVERITY-TOTAL","HASDTASRES"))

def appendMessage(msg):
    msgContent = '%s###%s###%s###%s###%s###%s###%s###%s###%s###%s###%s###%s' % msg
    logger.info("[dump message to %s] %s" % (fileScanResult, msgContent))
    os.system("echo %s >> %s" % (msgContent, fileScanResult) )

def runSingleCase(pcapPath):
    print '>>> [runSingleCase] pcap path: %s' % pcapPath
    logger.debug("Entering into runSingleCase")
    logger.info('[runSingleCase] pcap path: %s' % pcapPath)

    clearDB()
    clearLOG()
    clearSALDCache()

    detectionList = []

    # execute single case
    logger.info("[TCP Replay] PCAP: %s" % pcapPath)
    retCode = subprocess.call([tcpReplay, "-i", "tapddi", "-p", "1000", pcapPath])
    logger.info("[TCP Replay] return code = %d" % retCode)
    # force to execute
    logger.info("force to execute")
    subprocess.call("echo 1 > /proc/sys/net/ncit/debug/purge", shell=True)

    # wait for tb_fstream_sha1 update
    #logger.info("wait for tb_fstream_sha1 update ...")
    #time.sleep(5)

    # wait for sandbox complete
    waitTime = 300
    while True:
        msg = "wait for sandbox scan complete ..."
        print msg
        logger.info(msg)
        time.sleep(10)
        waitTime -= 10
        if waitTime < 0:
            return False

        cmdCheckSHA1 = 'psql TDADB -c "select * from tb_fstream_sha1 where dtas_enabled=1 and report_time=0"'
        logger.debug("CMD: %s" % cmdCheckSHA1)
        outputSHA1 = subprocess.Popen(cmdCheckSHA1, shell=True, stdout=subprocess.PIPE).stdout.readlines()
        logger.debug("Output: %s" % outputSHA1)
        logger.debug("Output[-2]: %s" % outputSHA1[-2])
        if "0 rows" in outputSHA1[-2]:
            break

    # sandbox cannot scan in 20s, so retry this case if wait time is less than 20
    if waitTime >= 280:
        return False

    # process SALD log
    decisionSIEMap = procSALDLog()
    #print decisionSIEMap
    # traverse decisionSIE map
    for (sha1SIE, decisionSIE) in decisionSIEMap.items():
        logger.info(">>> process SIE scan result, SHA1 = %s, Result = %s" % (sha1SIE, decisionSIE) )
        detectionList.append( [pcapPath,sha1SIE,decisionSIE,"n/a","n/a","n/a","n/a","n/a","n/a","n/a","n/a","n/a"] )
    #logger.debug(detectionList)
    
    #
    sha1 = "n/a"
    url = "n/a"
    sieRule = "n/a"
    threattype = "n/a"
    severity = "n/a"
    hasdtasres = "n/a"

    # 
    checkTotalLogsTime = 0
    while True:
        #
        time.sleep(3)

        checkTotalLogsTime += 1
        if checkTotalLogsTime == 4:
            msg = "Check 3 times TOTAL-LOGS, cannot find detection records"
            print msg
            logger.info(msg)
            break

        logger.info("check table for total logs, time: %d" % checkTotalLogsTime)
        cmdCheckTotalLogs = 'psql -d TDADB -c "select sha1,url,detectionname,threattype,severity,hasdtasres from tb_cav_total_logs where ruleid=713"'
        logger.debug("CMD: %s" % cmdCheckTotalLogs)
        outputTotalLogs = subprocess.Popen(cmdCheckTotalLogs, shell=True, stdout=subprocess.PIPE).stdout.readlines()
        logger.debug("Output: %s" % outputTotalLogs)
    
        if len(outputTotalLogs) == 4:
            msg = "No detection records in TOTAL-LOGS table, try again..."
            logger.info(msg)
            print msg
            continue

        for itemTotalLogs in outputTotalLogs[2:-2]:
            if "|" in itemTotalLogs:
                (sha1, url, sieRule, threattype, severity, hasdtasres) = itemTotalLogs.split("|")
                sha1 = sha1.strip()
                logger.info("sha1 = %s" % sha1)
                url = url.strip().replace('&','%26')
                logger.info("url = %s" % url)
                sieRule = "'"+sieRule.strip()+"'"
                logger.info("SIE rule = %s" % sieRule)
                threattype = threattype.strip()
                logger.info("threattype = %s" % threattype)
                severity = severity.strip()
                logger.info("severity = %s" % severity)
                hasdtasres = hasdtasres.strip()
                logger.info("hasdtasres = %s" % hasdtasres)
    
                for detectionItem in detectionList:
                    #logger.debug(detectionItem)
                    if detectionItem[1] == sha1:
                        detectionItem[7] =  url
                        detectionItem[8] =  sieRule
                        detectionItem[9] =  threattype
                        detectionItem[10] =  severity
                        detectionItem[11] =  hasdtasres
                    else:
                        continue
                        #logger.debug('cannot find SHA1: %s, and append a empty one' % sha1)
                        #detectionList.append([pcapPath,sha1,"n/a","n/a","n/a","n/a","n/a",url,threattype,severity,hasdtasres])
            else:
                logger.critical("cannot find correct item in TotalLogs table")
                continue
        #logger.debug(detectionList)
        break

    # 
    logger.info("check table for sandbox scan result")
    for detectionItem in detectionList:
        sha1 = detectionItem[1]
        cmdCheckSandbox = 'psql -d TDADB -c "select severity,overallseverity,virusname from tb_sandbox_result where sha1 = \'%s\'"' % sha1
        logger.debug("CMD: %s" % cmdCheckSandbox)
        outputSandbox = subprocess.Popen(cmdCheckSandbox, shell=True, stdout=subprocess.PIPE).stdout.readlines()
        logger.debug("Output: %s" % outputSandbox)

        for itemSandbox in outputSandbox[2:-2]:
            severitySbox = "n/a"
            overallseveritySbox = "n/a"
            virusname = "n/a"
            saRule = "n/a"
            report = "n/a"
    
            if "|" in itemSandbox:
                (severitySbox, overallseveritySbox, virusname) = itemSandbox.split("|")
                severitySbox = severitySbox.strip()
                logger.info("severity in sbox = %s" % severitySbox)
                overallseveritySbox = overallseveritySbox.strip()
                logger.info("overallseverity in sbox = %s" % overallseveritySbox)
                virusname = virusname.strip()
                logger.info("virusname = %s" % virusname)
    
                if int(overallseveritySbox) > 0:
                    logger.info("Sandbox has detection")
                    cmdCheckSandboxReport = 'psql -d TDADB -c "select report from tb_sandbox_result where sha1=\'%s\'"' % sha1
                    logger.debug("CMD: %s" % cmdCheckSandboxReport)
                    outputSandboxReport = subprocess.Popen(cmdCheckSandboxReport, shell=True, stdout=subprocess.PIPE).stdout.readlines()
                    logger.debug("Output: %s" % outputSandboxReport)
    
                    #
                    findSigExpCode = False
                    logger.debug("Search SA rules in Sandcastle report")
                    for line in outputSandboxReport[2:]:
                        logger.info(repr(line))
                        if "+" in line:
                            firstPart, secondPart = line.split("+")
                            firstPart = firstPart.strip(" ")

                            if findSigExpCode:
                                preIndex = firstPart.find("<Details>")
                                postIndex = firstPart.find("</Details>")
                                if -1 != preIndex and -1 != postIndex:
                                    saRule = firstPart[preIndex+len("<Details>"):postIndex]
                                else:
                                    if -1 != preIndex:
                                        saRule = firstPart[preIndex+len("<Details>"):]+';'
                                    elif -1 != postIndex:
                                        saRule += firstPart[:postIndex]
                                    else:
                                        saRule = saRule + firstPart + ";"
                                if "</Details>" in firstPart:
                                    findSigExpCode = False
                                    break
                            if "Document contains known exploit code" in firstPart:
                                findSigExpCode = True
                        else:
                            continue
                else:
                    logger.info("Sandbox has no detection")

                for detectionItem in detectionList:
                    if detectionItem[1] == sha1:
                        detectionItem[3] =  severitySbox
                        detectionItem[4] =  overallseveritySbox
                        detectionItem[5] =  virusname
                        detectionItem[6] =  repr(saRule)
                    else:
                        continue

            else:
                logger.critical("cannot find correct item in Sandbox table")
                continue

    # dump scan result
    for detectionItem in detectionList:
        appendMessage(tuple(detectionItem))

    logger.debug("Leaving out runSingleCase")
    return True

def runMultiCase(pcapFolder):
    logger.debug("Entering into runMultiCase")
    logger.debug('[runMultiCase] pcap folder: %s' % pcapFolder)
    for root, dirs, files in os.walk(pcapFolder):
        for name in files:
            filePath = os.path.join(root, name)
            fileName, fileExt = os.path.splitext(filePath)
            if ".pcap" == fileExt:
                runSingleCase(filePath)
            else:
                print ">> Unsupported file: %s" % filePath
    logger.debug("Leaving out runMultiCase")

def runSingleCaseEx(pcapPath):
    if os.path.exists(pcapPath):
        count = 0
        while True:
            count += 1
            retVal = runSingleCase(pcapPath)
            if retVal == True:
                break
            if count > 3:
                os.system( "echo %s >> %s" % ("[#] Execute failed, "+pcapPath, fileScanResult) )
                break
    else:
        os.system( "echo %s >> %s" % ("[*] Cannot find "+pcapPath, fileScanResult) )

def runCaseOneByOne(listFile):
    lines = open(listFile).readlines()
    for line in lines:
        line = line.replace('\n','')
        line = line.replace('\r','')
        if os.path.isfile(line):
            runSingleCaseEx(line)
        elif os.path.isdir(line):
            for filename in os.listdir(line):
                name, ext = os.path.splitext(filename)
                if '.pcap' == ext:
                    runSingleCaseEx(os.path.join(line, filename))
                else:
                    logger.debug('Unsupported file: %s' % os.path.join(line, filename))
        else:
            pass

def clear(option):
    logger.debug("Entering into clear")
    logger.debug("Option: %s" % option)
    if 'db' == option:
        clearDB()
    elif 'log' == option:
        clearLOG()
    elif 'cache' == option:
        clearSALDCache()
    else:
        clearDB()
        clearLOG()
        clearSALDCache()
    logger.debug("Leaving out clear")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print """
Usage:
    python verify_in_ddi.py option arg
Option and ARG:
    --single: process single PCAP
    --multi:  process folder contains many PCAPs
    --list:   process PCAP case by case
    --clear:  clear environment
        'db'    -- clear tables in database
        'log'   -- clear SALD and SIE log
        'cache' -- clear SALD cache
        'all'   -- clear all of [db|log|cache]
"""
        sys.exit(-1)
    elif sys.argv[1] == '--single':
        prepareReportHeader()
        runSingleCaseEx(sys.argv[2])
    elif sys.argv[1] == '--multi':
        prepareReportHeader()
        runMultiCase(sys.argv[2])
    elif sys.argv[1] == '--list':
        prepareReportHeader()
        runCaseOneByOne(sys.argv[2])
    elif sys.argv[1] == '--clear':
        clear(sys.argv[2])