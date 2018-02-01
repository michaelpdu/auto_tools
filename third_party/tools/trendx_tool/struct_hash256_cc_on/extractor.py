import hash_tools
import itertools
import logging
import os
import sys

import tokenizer


logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)
"""Default logger"""


SCHEMA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'js_cc_on.json'))
MAPPER = tokenizer.load_mapper(SCHEMA_PATH)
TRIE = tokenizer.make_trie([k for k in MAPPER])
BUCKET_SIZE = 256


class extractor(object):
    @classmethod
    def str_from_vec(cls, vec):
        return ','.join(map(str, vec))

    def getStoreType(self):
        return 'file'

    def getTimeCostTitle(self):
        return 'no function here'

    def getTitle(self):
        return self.__class__.str_from_vec([i for i in xrange(BUCKET_SIZE)])

    def extract(self, file_path):
        try:
            tokens = tokenizer.obfuscate(file_path, MAPPER, TRIE)
            LOGGER.debug(tokens)
            buckets = [0] * BUCKET_SIZE
            for t in tokens:
                buckets[hash_tools.pearson_hash(t)] += 1
            LOGGER.debug(buckets)

            return self.__class__.str_from_vec(buckets)
        except:
            return self.__class__.str_from_vec([0] * BUCKET_SIZE)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print 'Usage: python extractor.py <samplepath>'
        sys.exit(1)

    ex = extractor()
    print ex.extract(sys.argv[1])

#    with open('out.csv', 'w') as f:
#        f.write('Filename,' + ex.getTitle() + '\n')
#        f.write(',' + ex.extract(sys.argv[1]))

