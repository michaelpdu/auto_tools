import itertools
import logging
import os
import sys

import ngram
import tokenizer


logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)
"""Default logger"""


N = 1
HEXLIFY = lambda x: [hex(i)[2:].zfill(2) for i in bytearray(x, encoding='latin-1')]
HEX = sorted([''.join(h) for h in itertools.product('0123456789abcdef', repeat=(N*2))])
SCHEMA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'js_cc_on.json'))
MAPPER = tokenizer.load_mapper(SCHEMA_PATH)
TRIE = tokenizer.make_trie([k for k in MAPPER])


class extractor(object):
    @classmethod
    def str_from_vec(cls, vec):
        return ','.join(map(str, vec))

    def getStoreType(self):
        return 'file'

    def getTimeCostTitle(self):
        return 'no function here'

    def getTitle(self):
        return self.__class__.str_from_vec(HEX)

    def extract(self, file_path):
        try:
            str_ = tokenizer.obfuscate(file_path, MAPPER, TRIE)
            LOGGER.debug(str_)
            count_dict = ngram.parse_ngrams(str_, N, split_func=HEXLIFY)
            LOGGER.debug(count_dict)
            vec = [count_dict.get(k, 0) for k in HEX]
            LOGGER.debug('Vector length: {}'.format(len(vec)))

            return self.__class__.str_from_vec(vec)
        except:
            return self.__class__.str_from_vec([0] * len(HEX))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print 'Usage: python extractor.py <samplepath>'
        sys.exit(1)

    ex = extractor()
    print ex.extract(sys.argv[1])

#    with open('out.csv', 'w') as f:
#        f.write('Filename,' + ex.getTitle() + '\n')
#        f.write(',' + ex.extract(sys.argv[1]))

