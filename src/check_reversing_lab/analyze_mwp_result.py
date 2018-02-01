import sys, json

with open(sys.argv[1], 'rb') as fh:
    lines = fh.readlines()
    for line in lines:
        result = json.loads(line)
        detection_list = result['rl']['entries']
        for item in detection_list:
            sha1 = item['query_hash']['sha1']
            decision = item['status']
            filetype = ''
            rule = ''
            if 'MALICIOUS' == decision:
                try:
                    filetype = item['classification']['subplatform']
                    rule = item['threat_name']
                except Exception,e:
                    pass
            print '{},{},{},{}'.format(sha1, decision, filetype, rule)
