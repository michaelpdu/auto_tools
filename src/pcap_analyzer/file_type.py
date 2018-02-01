import os,sys
import struct

# FILE SIGNATURES TABLE can be referred to on:
# http://www.garykessler.net/library/file_sigs.html
# or for a better visual effect:
# http://www.hackdig.com/06/hack-23681.htm
def typeList():  
    return {
        "4D5A": 'exe/dll',
        "60EA": 'arj',
        "435753": 'swf',
        "465753": 'swf',
        "5A5753": 'swf',
        "89504E": 'png',
        "FFD8FF": 'jpg/jpeg',
        "52617221": 'rar',
        "504B0304": 'zip/jar/xap',
        "5F27A889": 'jar',
        "504B3030": 'zip',
        "D0CF11E0": 'doc/xls',
        "3C3F786D6C": 'xml',
        "3C2144": 'htm/html',
        "68746D6C3E": 'html',
        "3C48544D4C": 'html',
        "3C68746D6C": 'html',
        "255044462D312E": 'pdf',
        "526563": 'eml',
        "46726F6D": 'eml',
        "44656C69766572792D646174653A": 'eml'}  

def bytes2hex(bytes):  
    num = len(bytes)  
    hexstr = u""  
    for i in range(num):  
        t = u"%x" % bytes[i]  
        if len(t) % 2:  
            hexstr += u"0"  
        hexstr += t  
    return hexstr.upper()  

def filetype(filename):  
    binfile = open(filename, 'rb')
    tl = typeList()  
    ftype = 'unknown'  
    for hcode in tl.keys():  
        numOfBytes = len(hcode) / 2
        binfile.seek(0)
        try:
            hbytes = struct.unpack_from("B"*numOfBytes, binfile.read(numOfBytes))
        except:
            return 'unknown'
        f_hcode = bytes2hex(hbytes)  
        if f_hcode == hcode:  
            ftype = tl[hcode]  
            break  
    binfile.close()  
    return ftype  
  
def print_usage():
    print """
Usage:
    python file_type.py file_path
    """

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print_usage()
        exit(-1)

    # print filetype(sys.argv[1])

    with open('result.csv','rb') as f:
        lines = f.readlines()

    with open('111.csv','wb') as fw:
        for line in lines:
            ls = line.split(',')
            if ls[1].endswith('.eml'):
                fw.write(','.join(ls[:3])+',eml,'+','.join(ls[4:]))
            else:
                fw.write(line)