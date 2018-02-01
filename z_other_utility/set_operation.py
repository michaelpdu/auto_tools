import sys

def get_set_from_file(file_path):
    sha1_list = []
    with open(file_path, 'rb') as fh:
        for line in fh.readlines():
            sha1_list.append(line.strip())
    return set(sha1_list)

help_msg = """
Usage:
    python set_operation.py --[intersect|union|subtract] sha1_list_file_a sha1_list_file_b
"""

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print help_msg
        exit(-1)
    if sys.argv[1] != '--intersect' and  sys.argv[1] != '--union' and sys.argv[1] != '--subtract':
        print help_msg
        exit(-1)

    print 'Set A: {}, Set B: {}'.format(sys.argv[1], sys.argv[2])
    set_a = get_set_from_file(sys.argv[2])
    set_b = get_set_from_file(sys.argv[3])

    if sys.argv[1] == '--intersect':
        set_c = set_a & set_b
        print 'A & B:'
        for sha1 in set_c:
            print sha1
    elif sys.argv[1] == '--union':
        set_c = set_a | set_b
        print 'A | B:'
        for sha1 in set_c:
            print sha1
    elif sys.argv[1] == '--subtract':
        set_c = set_a - set_b
        print 'A - B:'
        for sha1 in set_c:
            print sha1
    else:
        print help_msg
