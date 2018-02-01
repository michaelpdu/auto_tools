SAL_enhancement
===============

In the directory:
-------------------------
- [SAL_enhancement.py]:to analyse behaviour_....XML and put results into csv.
- [top-1m.csv]:A database of URL rank from [http://www.alexa.cn/](http://www.alexa.cn/).
- [url_rank.py]:to search for the rank of urls
- [feature.list]: feature list file

Usage:
------
salineup_enhancement.py [-h] [--extract-flash-features label]
                        [--predict] [--classifier CLASSIFIER]
                        [--output OUTPUT]
                        target

print "python SAL_enhancement.py input_dir" in command window
Note:Rank 1000000 means no matched url is found.

positional arguments:
------
-  target:
                                       behavior.xml folder

optional arguments:
------
-  -h --help:
                                       show this help message and exit

-  --extract-flash-features label:
                                       create OUTPUT file(default:output.list)
                                       if target is Malicious,label will be 1
                                       if target is Normal,label will be 0

-  --predict:
                                       predict samples according to classifier

-  --classifier:
                                       (svm | xgboost |...)

-  --output:
                                       if specify --extract-flash-features,OUTPUT is a output.list
                                       if specify --predict,OUTPUT is output.csv

Examples:
------
-  salineup_enhancement.py --extract-flash-features=1 D:\result
                                     
extract [D:\result] flash features to default path(output.list).

-  salineup_enhancement.py --extract-flash-features=1 --output=test.list D:\result
                                     
extract [D:\result] flash features to [test.list].

-  salineup_enhancement.py --predict --classifier=svm D:\result
                                     
predict [D:\result],use svm model.

-  salineup_enhancement.py --predict --classifier=svm --output=output.csv D:\result
                                     
predict [D:\result],use svm model.And export [output.csv] to show details
