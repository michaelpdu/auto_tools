import os,sys
import struct
import zipfile

class TypeParser(object):

    def __init__(self):
    
        self.head_tags = {
              "25504446": "pdf",
              "435753": "flash",
              "465753": "flash",
              "5A5753": "flash",
              "504B": "zip",
              "CAFEBABE": "java",
              }
    def _convertBytes(self, byte_arr):
        '''
        convert bytes to hex string
        '''
        b_str = ""
        for b in byte_arr:
            b_str += "%x" %b
        return b_str.upper()
        
    def _is_malicious_html(self, fp):
        
        if not os.path.exists(fp):
            return False
        data = open(fp, 'r').read().lower()
        return True 
            
    def _hasClassFile(self, jar_file):
        '''
        judge if has class file in jar
        '''
        zf = zipfile.ZipFile(jar_file)
        fstr = ";".join(zf.namelist())
        zf.close()
        if ".class" in fstr.lower():
            return True
        else:
            return False
            
    def _hasSilverFlag(self, jar_file):
        '''
        judge if has class file in jar
        '''
        zf = zipfile.ZipFile(jar_file)
        fstr = ";".join(zf.namelist())
        zf.close()
        if "appmanifest" in fstr.lower():
            return True
        else:
            return False
    
    def _get_type_tag(self, file_path):
        '''
        read file head based on file_path, and return file type
        '''
        if not os.path.exists(file_path):
            return ""
        try:
            f = open(file_path, "rb")
        except:
            print "read file fail"
            return ""
        type_tag = ""
        for tag in self.head_tags:
            head_len = len(tag)/2 #get head tag byte length
            f.seek(0)
            head_bytes = f.read(head_len)
            #print head_bytes, len(head_bytes)
            #if head_bytes is less than tag length, return
            if len(head_bytes) < head_len:
                return ""
            byte_arr = struct.unpack_from("B"*head_len, head_bytes)
            tag_str = self._convertBytes(byte_arr)
            #print tag_str
            if tag == tag_str:
                type_tag = self.head_tags[tag]
                break
        f.close()    
        return type_tag
    
    def get_file_type(self, file_path):
        
        ftype = None
        type_tag = self._get_type_tag(file_path)
        if type_tag:
            if type_tag == "zip":
                if self._hasClassFile(file_path):
                    ftype = 'java'
                elif self._hasSilverFlag(file_path):
                    ftype = 'silverlight'
            else:
                ftype = type_tag
        else:
            if self._is_malicious_html(file_path):
                ftype = 'IE'
        return ftype
    
def print_help():
    print """
Usage:
    python type_parser.py file_path
"""

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print_help()
        exit(-1)
    pass
    type_parser = TypeParser()
    print type_parser.get_file_type(sys.argv[1])