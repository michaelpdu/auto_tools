import os
import math

def range_bytes (): return range(256)
def range_printable(): return (ord(c) for c in string.printable)

def H(data, iterator=range_bytes):
    if not data:
        return 0
    entropy = 0
    for x in iterator():
        p_x = float(data.count(chr(x)))/len(data)
        if p_x > 0:
            entropy += - p_x*math.log(p_x, 2)
    return entropy


class extractor:    
    def extract(self, filepath1):
        content = open(filepath1).read()
        nline = len(content.split("\n"))
        filesize = os.path.getsize(filepath1)
        file_entropy = H(content)
        first_line_entropy = H(content.split("\n")[0])
        result = [str(x) for x in (nline,filesize,file_entropy,first_line_entropy)] 
        return ",".join(result)

