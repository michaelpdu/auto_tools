 # Author: Feihao Chen
 # Date: 2016/12/19
import os,sys
import hashlib

def calc_sha1(filepath):
    with open(filepath,'rb') as f:
        sha1obj = hashlib.sha1()
        sha1obj.update(f.read())
        hash = sha1obj.hexdigest()
        return hash

def main(dest_dir):
    list_file='unique_sha1_list.txt'
    sha1_list=[]
    if not os.path.exists(list_file):
        file=open(list_file,'wb')
        file.write('')
        file.close()
    else:
        file=open(list_file,'rb')
        for line in file:
            sha1_list.append(line.strip())

    log=open('remove.log','w')
    log.write('')
    log=open('remove.log','a')
    file=open(list_file,'ab')
    for root, dirs, files in os.walk(dest_dir):
        for f in files:
            filename=os.path.join(root,f)
            cur_sha1=calc_sha1(filename)
            if cur_sha1 in sha1_list:
                log.write('REMOVE: ' + str(cur_sha1) +' PATH: ' + os.path.join(root,f) + '\n')
                # os.remove(os.path.join(root,f))
            else:
                file.write(cur_sha1+'\n')
                sha1_list.append(f)
                dest_file = os.path.join(root,calc_sha1(filename))
                if os.path.exists(dest_file) and filename != dest_file:
                    os.remove(dest_file)
                print '{} ==> {}'.format(filename, dest_file)
                os.rename(filename, dest_file)

def print_usage():
    print """
Usage:
    python remove_repeated_sample.py dest_dir

If you already have generated a unique_sha1_list.txt, put it under the current folder.
    """


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print_usage()
        exit(-1)

    dest_dir=sys.argv[1]

    main(dest_dir)
    