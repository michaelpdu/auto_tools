Usage:
------
ssa_helper.py [-h] [--extract-js-features label]
                   [--predict] [--classifier CLASSIFIER]
                   [--output OUTPUT]
                   target
positional arguments:
------
-  target:
                                       js folder or js file

optional arguments:
------
-  -h --help:
                                       show this help message and exit

-  --extract-js-features label:
			use yara rules to
                                       create OUTPUT file(default:feature_list)
                                       if target is Malicious,label will be 1
                                       if target is Normal,label will be 0
-  --predict:
                                       predict samples according to classifier

-  --classifier:
                                       (svm | xgboost |...)

-  --output:		specify name of output


Usage:
------
model_training.py [-h] [--classifier CLASSIFIER] target

positional arguments:
------
-  target:
                                       feature_list from ssa_helper 

optional arguments:
------
-  -h --help:
                                       show this help message and exit

-  --classifier:
                                       (svm | xgboost |...)

Usage:
------
parse_type.py [--output output_path] target

copy html/js files to output_path from target folder

