import os, sys


def copy_from_feature_file_not_in_sha1_list(feature_list_file, sha1_list_file, dest_file):
    #
    sha1_list = []
    with open(sha1_list_file, 'rb') as fh:
        for line in fh.readlines():
            sha1_list.append(line.strip())
    #
    with open(dest_file, 'wb') as dest_fh:
        with open(feature_list_file, 'rb') as feature_fh:
            for line in feature_fh.readlines():
                file_path = line.split('#')[1].split('@@')[0].strip()
                current_sha1 = os.path.split(file_path)[1]
                if current_sha1 not in sha1_list:
                    dest_fh.write(line)


def copy_from_feature_file_by_sha1(feature_list_file, sha1_list_file, dest_file):
    #
    sha1_list = []
    with open(sha1_list_file, 'rb') as fh:
        for line in fh.readlines():
            sha1_list.append(line.strip())
    #
    with open(dest_file, 'wb') as dest_fh:
        with open(feature_list_file, 'rb') as feature_fh:
            for line in feature_fh.readlines():
                file_path = line.split('#')[1].split('@@')[0].strip()
                current_sha1 = os.path.split(file_path)[1]
                if current_sha1 in sha1_list:
                    dest_fh.write(line)

help_msg = """
Usage:
    python copy_from_feature_list_by_sha1.py -[i|o] feature_list_file sha1_list_file dest_file

    Note:
        Copy feature lines into dest_file by SHA1 list
        '-i' :  copy lines if SHA1 of line could be found in SHA1 list
        '-o' :  copy lines if SHA1 of line could NOT be found in SHA1 list
"""

if __name__ == '__main__':
    if len(sys.argv) != 5 or sys.argv[1] != '-i' and sys.argv[1] != '-o':
        print help_msg
        exit(-1)
    if sys.argv[1] == '-i':
        copy_from_feature_file_by_sha1(sys.argv[2], sys.argv[3], sys.argv[4])
    elif sys.argv[1] == '-o':
        copy_from_feature_file_not_in_sha1_list(sys.argv[2], sys.argv[3], sys.argv[4])
    else:
        print help_msg
        exit(-1)

