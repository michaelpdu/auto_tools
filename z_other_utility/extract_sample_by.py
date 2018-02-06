'''
read csv
group by domain
extract sample randomly
'''
#map_file_path = 'saz_name_mapping2.txt'
input_file = r'd:\Cases\aep\samples\20170130\30_1.csv'
input_file = r'd:\Cases\aep\samples\20170129\29_1.csv'

#input_file = '77_20011.csv'
output_dir = r'd:\Cases\aep\samples\output\20170130'
input_dir = r'd:\Cases\aep\samples\20170130'
output_dir = r'd:\Cases\aep\samples\output\20170129'
input_dir = r'd:\Cases\aep\samples\20170129'
#20170201
output_dir = r'd:\Cases\aep\samples\output\20170201'
input_dir = r'd:\Cases\aep\samples\20170201'
input_file = r'd:\Cases\aep\samples\20170201\0201.csv'
csv_dialect = 'excel'
#
#20170202
output_dir = r'd:\Cases\aep\samples\output\20170202'
input_dir = r'd:\Cases\aep\samples\20170202'
input_file = r'd:\Cases\aep\samples\20170202\0202.csv'
csv_dialect = 'excel'

from ipdb import set_trace
import io
import csv
from itertools import groupby
from collections import defaultdict
from urlparse import urlparse
from pprint import pprint
from random import sample
from os.path import join, exists
from shutil import copytree, copy
url_index = 1
nssid_index = 0

def get_domain(row):
	if len(row) < 2:
		return None
	#pprint(row)
	parsed_uri = urlparse(row[url_index])
	domain = '{uri.netloc}'.format(uri=parsed_uri)
	return domain.strip()

with io.open(input_file, encoding = 'utf-8-sig') as in_file:		
	csvreader = csv.reader(in_file, dialect=csv_dialect)
	header = True
	datas = list(csvreader)[1:]
	#begin of pre filter
	pprint('==> filter invalid nssid, {0}'.format(len(datas)))
	#set_trace()
	datas = filter(lambda data: exists(join(input_dir, data[nssid_index] + '.saz')), datas)
	pprint('<== filter invalid nssid, {0}'.format(len(datas)))
	pprint('==> filter duplicated nssid, {0}'.format(len(datas)))
	datas = sorted(datas, key = (lambda data: data[nssid_index]))
	newdatas = []
	for key, value in groupby(datas, lambda data: data[nssid_index]):
		#set_trace()
		newdatas.append(value.next())
		continue
		# first = True
		# for data in value:
		# 	if first:
		# 		newdatas.append(data)
		# 		first = False
		# 	else: continue
	datas = newdatas
	pprint('<== filter duplicated nssid, {0}'.format(len(datas)))
	
	#end of pre filter
	#pprint(datas)
	total = len(datas)
	extracted_number = 60
	datas = sorted(datas, key = get_domain)
	groups = defaultdict(list)
	for name, group in groupby(datas, get_domain):
		if name is None: continue
		for item in group:
			groups[name].append(item)
	#set_trace()
	real_extracted_number = 0
	for key, value in groups.items():
		domain_samples_number = float(len(value)) / total * extracted_number
		domain_samples_number = max(int(domain_samples_number),1)
		pprint('domain {0} sample number is {1} of {2}'.format(key, domain_samples_number, len(value)))
		extracted_samples = sample(value, domain_samples_number) 
		real_extracted_number += domain_samples_number
		for item in extracted_samples:
			src_file = join(input_dir, '{0}.saz'.format(item[0]))
			dst_dir = join(output_dir, item[nssid_index])
			pprint('select {0}'.format(src_file))
			copy(src_file, output_dir)
		#pprint(extracted_samples[0])
	pprint('real_extracted_number is {0}'.format(real_extracted_number))
