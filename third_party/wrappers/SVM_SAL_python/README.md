PYSAL(add svm function)
# python pysal.py --loglevel=all --productname=sc --script_malware target file/dir
扫描sample
# python pysal.py -svm file_type target(behavior_result_dir)
使用-svm参数，target应为behavior_result的路径  
# python pysal.py -h
帮助
# python pysal.py -p pattern tmsa2.ptn
pack pattern


usage: pysal.py [-h] [-d DECRYPT] [-e ENCRYPT] [-p PACK] [-u UNPACK] [-svm file_type]
                [--loglevel LOGLEVEL] [--productname PRODUCTNAME]
                [--script_malware]
                target

SALineup Implemented By Python

positional arguments:
  target

optional arguments:
  -h, --help            show this help message and exit
  -d DECRYPT
  -e ENCRYPT
  -p PACK
  -u UNPACK
  -svm file_type 	if set -svm，target should be the path of RESULT_DIR	(swf | html)
  --loglevel LOGLEVEL   (off | fatal | error | warn | info | debug | trace |
                        all), info is the default log level
  --productname PRODUCTNAME
                        (sc|ti9)
  --script_malware      Force Rescan with Current A/V Definitions


