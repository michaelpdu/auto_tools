import itertools
import logging
import os
import sys

import str_unigram_cc_on.extractor
import token_unigram_cc_on.extractor
import struct_hash256_cc_on.extractor
import struct_unigram_cc_on.extractor
import basic

logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)
"""Default logger"""

LEN = 256 * 4 +4


class extractor(object):
    def getStoreType(self):
        return 'file'

    def getTimeCostTitle(self):
        return 'no function here'

    def getTitle(self):
        return self.__class__.str_from_vec(HEX)

    def extract(self, file_path):
        try:
            basic_ex  = basic.extractor()
            str_ex = str_unigram_cc_on.extractor.extractor()
            token_ex = token_unigram_cc_on.extractor.extractor()
            struct_hash_ex = struct_hash256_cc_on.extractor.extractor()
            struct_ex = struct_unigram_cc_on.extractor.extractor()


            return ','.join([ basic_ex.extract(file_path), str_ex.extract(file_path), token_ex.extract(file_path),
                    struct_hash_ex.extract(file_path), struct_ex.extract(file_path)])
        except:
            return [0] * LEN


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print 'Usage: python extractor.py <samplepath>'
        sys.exit(1)

    ex = extractor()
    print ex.extract(sys.argv[1])

#    with open('out.csv', 'w') as f:
#        f.write('Filename,' + ex.getTitle() + '\n')
#        f.write(',' + ex.extract(sys.argv[1]))

