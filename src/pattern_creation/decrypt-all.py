'''
Usage: auto-decrypt-all.py <dir>

This command will encrypt all files found in given directory. The decrypted 
file's name will be appended by ".plain", for example "sa.ptn" will be 
decrypted to a new file "sa.ptn.plain"
'''
import os, sys
import subprocess

def decryptOne(filename):
    decFilename = filename+".plain"
    retcode = subprocess.call([r"PatternEncryptor.exe","-d",
        filename, decFilename])
    assert retcode==0
    print "Decrypted"
    print " From: %s" % filename
    print " To  : %s" % decFilename

def decryptAll(dirname):
    for r,ds,fs in os.walk(dirname):
        for f in fs:
            filename = os.path.join(r,f)
            if not filename.endswith(".plain"):
                decryptOne(filename)

if __name__=="__main__":
    if len(sys.argv) < 2:
        print __doc__
    else:
        decryptAll(sys.argv[1])
