import os,sys

def analysis_url(_url):
    flag=0
    #db_path=os.path.join(db_folder_path,'top-1m.csv')
    db_path=os.path.join(sys.path[0],'top-1m.csv')
    if not os.path.exists(db_path):
        print """
The dataset doesn't exist!Please check whether there is a file named 'top-1m.csv' under the directory.
    """
        return -1
    for line in open(db_path,'r'):
        no,url=line.split(",")
        if _url==url.strip() or _url.find(r'.'+url.strip())!=-1:
            break
    return int(no)

def print_usage():
	print """
Usage:
    python url_rank.py url
  	"""

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print_usage()
        exit(-1)
    print str(analysis_url(sys.argv[1]))