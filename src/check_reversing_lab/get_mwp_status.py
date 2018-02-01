#!/usr/bin/python

import argparse
import urllib2
import sys

import json
import base64


sample_service = 'https://ticloud01.reversinglabs.com/api/databrowser/malware_presence'

hash_type_sizes = {
    'md5': 16,
    'sha1': 20,
    'sha256': 32
}


def validate_hash(hash_value, hash_type):
    try:
        if len(hash_value.decode('hex')) != hash_type_sizes[hash_type]:
            raise ValueError('invalid %s hash %s' % (hash_type, hash_value))
    except TypeError:
        raise ValueError('invalid %s hash %s' % (hash_type, hash_value))


def generate_headers(user, password):
    auth = base64.encodestring('%s:%s' % (user, password))[:-1]

    headers = {
        'Authorization': 'Basic %s' % (auth,)
    }

    return headers


def main():
    global sample_service

    parser = argparse.ArgumentParser(description='ReversingLabs MWP utility')

    parser.add_argument(
        '--user',
        metavar='USER',
        required=True,
        help='user name')

    parser.add_argument(
        '--password',
        metavar='PASSWORD',
        required=True,
        help='user password')

    parser.add_argument(
        '--service',
        metavar='SERVICE',
        default=sample_service,
        help='service url')

    parser.add_argument(
        '--extended',
        dest='extended',
        action='store_true')

    parser.add_argument(
        '--hash-type',
        type=str,
        default='sha1',
        choices=hash_type_sizes.keys(),
        help='choose hash type, default is sha1')

    group = parser.add_mutually_exclusive_group(required=True)

    group.add_argument(
        '--single',
        metavar='HASH_VALUE',
        help='single query')

    group.add_argument(
        '--bulk',
        metavar='txt_file',
        help='bulq query, accepts file containing list of hashes, one hash per line')

    args = vars(parser.parse_args())

    user = args['user']
    password = args['password']
    sample_service = args['service']
    extended = bool(args['extended'])
    hash_type = args['hash_type']

    if args['bulk'] is not None:
        hash_file = open(args['bulk'], 'r')

        create_batch(user, password, sample_service, hash_file, extended, hash_type)

    if args['single'] is not None:
        validate_hash(args['single'], hash_type)
        send_request(user, password, sample_service, hash_type, args['single'], extended)


def create_batch(user, password, sample_service, post_data_file, extended, hash_type):
    batch_size = 100
    hashes = list()
    for line in post_data_file:
        hash_hex_value = line.strip()
        validate_hash(hash_hex_value, hash_type)
        if len(hashes) >= batch_size:
            send_bulk_request(user, password, sample_service, hash_type, hashes, extended)
            hashes = list()

        hashes.append(hash_hex_value)

    if len(hashes):
        send_bulk_request(user, password, sample_service, hash_type, hashes, extended)


def send_bulk_request(user, password, sample_service, hash_type, hashes, extended):
    post_data = {
        "rl": {
            "query": {
                "hash_type": hash_type,
                "hashes": hashes
            }
        }
    }

    http_get_variables = '?format=json'
    if extended:
        http_get_variables += '&extended=true'

    url = '%s/bulk_query/json%s' % (sample_service, http_get_variables)

    headers = generate_headers(user, password)
    request = urllib2.Request(url, data=json.dumps(post_data), headers=headers)
    request.add_header("Content-Type", 'application/json')

    response = urllib2.urlopen(request)

    print response.read()


def send_request(user, password, sample_service, hash_type, hash_value, extended):
    http_get_variables = '?format=json'
    if extended:
        http_get_variables += '&extended=true'

    url = '%s/query/%s/%s%s' % (sample_service, hash_type, hash_value, http_get_variables)
    headers = generate_headers(user, password)

    request = urllib2.Request(url, headers=headers)

    response = urllib2.urlopen(request)

    print response.read()


help_msg = """
Usage:
    (1) check single sha1
        get_mwp_status.py --user u/trendmicro/research --password tiYah2sh --hash-type sha1 --extended --single FCD987CEE1271FBA1460537FA5D28CB30254FE54 
    (2) check sha1 list
        get_mwp_status.py --user u/trendmicro/research --password tiYah2sh --hash-type sha1 --extended --bulk sha1_list_file 
"""    
    
if __name__ == '__main__':
    try:
        main()
    except Exception, e:
        print >>sys.stderr, str(e)

        print help_msg
        sys.exit(1)

    sys.exit(0)
