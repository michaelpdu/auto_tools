#!/usr/bin/env python
# -*- coding: utf-8 -*-


from __future__ import print_function
#from __future__ import unicode_literals

import logging
import sys


logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)
"""Default logger"""


PEARSON_TABLE = [
    1, 87, 49, 12, 176, 178, 102, 166, 121, 193, 6, 84, 249, 230, 44, 163,
    14, 197, 213, 181, 161, 85, 218, 80, 64, 239, 24, 226, 236, 142, 38, 200,
    110, 177, 104, 103, 141, 253, 255, 50, 77, 101, 81, 18, 45, 96, 31, 222,
    25, 107, 190, 70, 86, 237, 240, 34, 72, 242, 20, 214, 244, 227, 149, 235,
    97, 234, 57, 22, 60, 250, 82, 175, 208, 5, 127, 199, 111, 62, 135, 248,
    174, 169, 211, 58, 66, 154, 106, 195, 245, 171, 17, 187, 182, 179, 0, 243,
    132, 56, 148, 75, 128, 133, 158, 100, 130, 126, 91, 13, 153, 246, 216, 219,
    119, 68, 223, 78, 83, 88, 201, 99, 122, 11, 92, 32, 136, 114, 52, 10,
    138, 30, 48, 183, 156, 35, 61, 26, 143, 74, 251, 94, 129, 162, 63, 152,
    170, 7, 115, 167, 241, 206, 3, 150, 55, 59, 151, 220, 90, 53, 23, 131,
    125, 173, 15, 238, 79, 95, 89, 16, 105, 137, 225, 224, 217, 160, 37, 123,
    118, 73, 2, 157, 46, 116, 9, 145, 134, 228, 207, 212, 202, 215, 69, 229,
    27, 188, 67, 124, 168, 252, 42, 4, 29, 108, 21, 247, 19, 205, 39, 203,
    233, 40, 186, 147, 198, 192, 155, 33, 164, 191, 98, 204, 165, 180, 117, 76,
    140, 36, 210, 172, 41, 54, 159, 8, 185, 232, 113, 196, 231, 47, 146, 120,
    51, 65, 28, 144, 254, 221, 93, 189, 194, 139, 112, 43, 71, 109, 184, 209]
"""256 byte look-up table
Borrow it from TLSH's v_table.
"""


def pearson_hash(key):
    """Pearson hashing algorithm as described in Wikipedia.

    http://en.wikipedia.org/wiki/Pearson_hashing
    """

    hash_ = 0
    for c in key:
        hash_ = PEARSON_TABLE[hash_ ^ ord(c)]

    return hash_

def pearson_16_hash(key):
    """Pearson 16 bits hashing for bi-gram"""

    hash_ = 0
    h1 = pearson_hash(key)
    key = chr((ord(key[0]) + 1) % 256) + key[1]
    h2 = pearson_hash(key)

    return h1 + h2

def pearson_mb_hash(key, n=2):
    """Pearson hashing for mulitple bytes"""

    hash_ = 0
    for i in xrange(n):
        tmp_key = chr((ord(key[0]) + i) % 256) + key[1:]
        hash_ += pearson_hash(tmp_key)

    return hash_

def string_hash(key, size):
    hash_ = 0
    for c in key:
        hash_ = (hash_ * 33) + ord(c)
        hash_ %= size

    return hash_

def djb2_hash(key, size):
    """
    http://www.cse.yorku.ca/~oz/hash.html
    """

    hash_ = 5381
    for c in key:
        hash_ =  ((hash_ << 5) + hash_) + ord(c)    # (hash_ * 33) + ord(c)

    return hash_ % size


# vim: set hls is ai et sw=4 sts=4 ts=8 nu ft=python:

