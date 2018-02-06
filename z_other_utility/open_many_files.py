'''
read csv
group by domain
extract sample randomly
'''
#map_file_path = 'saz_name_mapping2.txt'
missed_files=r'''
20170204\NSS-2017-28SCKK\EK_pages\bd2232c5c6d883f11890deefc26ecca654272f46
20170204\NSS-2017-28SCKM\EK_pages\b1b371c9a831b45c0deda43590b5b48f26404cd5
'''
editor = r"c:\totalcmd\soft\sublime3\sublime_text.exe"
sample_dir = r'z:\\'

from ipdb import set_trace
import io
import csv
from itertools import groupby
from collections import defaultdict
from urlparse import urlparse
from pprint import pprint
from random import sample
from os.path import join, exists, dirname
from shutil import copytree, copy
from os import system
from glob import glob

for file in missed_files.splitlines(False):
	file_path = join(sample_dir, file)
	if exists(file_path):
		cmd = '{0} {1}'.format(editor, file_path)
		system(cmd)	
	else:
		file_path = file_path+'*'
		print('file_path is {0}'.format(file_path))
		for file_path_ in glob(file_path):
			cmd = '{0} {1}'.format(editor, file_path_)
			system(cmd)
	