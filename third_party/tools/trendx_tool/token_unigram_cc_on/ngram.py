#!/usr/bin/env python
# -*- coding: utf-8 -*-


from __future__ import print_function
#from __future__ import unicode_literals

import collections
import gc
import logging
import sys


logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)
"""Default logger"""


def parse_ngrams(line, n, split_func=list):
    """
    :param n: n-grams, n should be a factor of 4096.

    Raw data:
    A1 A2  A3 A4
    A5 A6  A7 A8

    bytes_ = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']

    3 grams:
    ngrams(bytes_, 3)
    ['A1A2A3', 'A2A3A4', 'A3A4A5', 'A4A5A6', 'A5A6A7', 'A6A7A8']

    ngrams(bytes_[:4], 3)
    ['A1A2A3', 'A2A3A4']

    ngrams(bytes_[4:], 3)
    ['A5A6A7', 'A6A7A8']

    in-between grams:
    ngrams(bytes_[2:6], 3)
    ['A3A4A5', 'A4A5A6']
    """

    # For verifying
    #
#    with open(file_path, 'r') as f:
#        tokens = ngrams(f.read().split(), n)
#
#    return collections.Counter(tokens)

    count_dict = {}
    i = 0
    middle_grams = []
    last_bytes = []

    bytes_ = split_func(line)
    grams = ngrams(bytes_, n)
    LOGGER.debug('grams: {}'.format(grams))

    # Append in-between grams
    #
    if i:
        middle_grams = ngrams((last_bytes + bytes_[:(n - 1)]), n)
        LOGGER.debug('middle grams: {}'.format(middle_grams))

    for gram in middle_grams:
        if gram not in count_dict:
            count_dict[gram] = 0
        count_dict[gram] += 1

    # Count grams with small list is more memory friendly.
    for gram in grams:
        if gram not in count_dict:
            count_dict[gram] = 0
        count_dict[gram] += 1

    if n > 1:
        last_bytes = bytes_[((-1) * (n - 1)):]

    i += 1
    LOGGER.debug('line: {}'.format(i))

    gc.collect()

    return collections.Counter(count_dict)

def read_in_chunks(file_handler, chunk_size=4096):
    """Lazy function to read a file chunk by chunk.
    """

    while True:
        data = file_handler.read(chunk_size)
        if not data:
            break
        yield data

def ngrams(input_list, n):
    list_ = zip(*[input_list[i:] for i in xrange(n)])

    return [''.join(group) for group in list_]


# vim: set hls is ai et sw=4 sts=4 ts=8 nu ft=python:

