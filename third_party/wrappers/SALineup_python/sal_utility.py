import hashlib

def md5sum(str):
    m2 = hashlib.md5()   
    m2.update(str)   
    return m2.hexdigest()

def calc_sha1(filepath):
    with open(filepath,'rb') as f:
        sha1obj = hashlib.sha1()
        sha1obj.update(f.read())
        hash = sha1obj.hexdigest()
        return hash