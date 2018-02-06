import os
import sys
import shutil
import zipfile
import StringIO
import gzip
import zlib
import re

class SazExtractor:
  def __init__(self):
    #print ''
    #code by another one
    self.url_dict = {}
    #code by another one
    
  def unZip(self,inputfile,output_dir): # unzip saz file to temp directory
    if not os.path.exists(output_dir):
      os.mkdir(output_dir)
    try:
      f = zipfile.ZipFile(inputfile,'r')
      for file in f.namelist():
        f.extract(file,output_dir + "/")
    except Exception,e:
      print e
      
  def getTransferEncodingType(self,srcstring,filename,file_num):
    typelist = ["chunked"]
    type = ""
    for t in typelist:
      index = srcstring.find(t)
      if(index>0):
        type = srcstring[index:len(srcstring.strip())]
        break
    if(cmp(type,"")==0):
      file = open("log.txt",'a')
      file.write("trans-encoding :"+srcstring)
      file.write(filename)
      file.write("\n"+file_num)
      file.write("\n------------------------------\n\n")
      file.close()
    return type
  
  def decodeTransferEncoding_chunked(self,encodingtype,srcstring):
    if(cmp(encodingtype,"chunked")!=0):
      return srcstring
    else:
      dststr = ""
      try:
        while(1):
          index = srcstring.find("\r\n") #get content length
          length = int(srcstring[0:index],16) 
          if(length==0):
            break
          startindex = index+2
          endindex = startindex + length
          dststr = dststr + srcstring[startindex:endindex] #get content
          srcstring = srcstring[endindex+2:len(srcstring)] 
        return dststr
      except Exception,e:
        if(cmp(dststr,"")==0):
          return srcstring
        else:
          return dststr
      
  def decodeTransferEncoding(self,srcstring,encodingtype):
    if(cmp(encodingtype,"chunked")==0):
      return self.decodeTransferEncoding_chunked(encodingtype,srcstring)
    else:
      return srcstring
      
  def getContentEncodingType(self,srcstring,filename,file_num):
    typelist = ["gzip","deflate"]# , "identity" , "compress"
    type = ""
    for t in typelist:
      index = srcstring.find(t)
      if(index>0):
        type = srcstring[index:len(srcstring.strip())]
        break
        
    if(cmp(type,"")==0):
      file = open("log.txt",'a')
      file.write("content-encoding :"+srcstring)
      file.write(filename)
      file.write("\n"+file_num)
      file.write("\n***********************************\n\n")
      file.close()
      
    return type
  
  def decodeContentEncoding_gzip(self,encodingtype,srcstring):
    if(cmp(encodingtype,"gzip")!=0):
      return srcstring
    else:
      try:
        compressedstream = StringIO.StringIO(srcstring)
        gzipper = gzip.GzipFile(fileobj=compressedstream)
        dststr = gzipper.read()
        return dststr
      except Exception,e:
        dststr = gzipper.extrabuf # solution from: http://blog.knownsec.com/2012/04/about-content-encoding-gzip/ 
        return dststr
  
  def decodeContentEncoding_deflate(self,encodingtype,srcstring):
    if(cmp(encodingtype,"deflate")!=0):
      return srcstring
    else:
      try:
        dststr = zlib.decompress(srcstring, -zlib.MAX_WBITS);
        return dststr
      except Exception,e: 
        return srcstring
  
  def decodeContentEncoding(self,srcstring,encodingtype):
    if(cmp(encodingtype,"gzip")==0):
      return self.decodeContentEncoding_gzip(encodingtype,srcstring)
    else:
      if(cmp(encodingtype,"deflate")==0):
        return self.decodeContentEncoding_deflate(encodingtype,srcstring)
    return srcstring
    
  
  def checkFileName(self,filename):
    filename = filename.replace(" ","")
    filename = filename.replace(":","_")
    filename = filename.replace("*","_")
    filename = filename.replace("<","_")
    filename = filename.replace(">","_")
    filename = filename.replace("|","_")
    filename = filename.replace("?","_")
    filename = filename.replace("\"","_")
    return filename

  def checkPath(self,path):
    path = path.replace("\r","")
    path = path.replace("\t","")
    path = path.replace("\n","")
    return path

  def analysisSAZFile(self,inputfile,input_dir,output_dir): # extract message from temp saz file to rawfile
    flist = []
    root = os.path.join(input_dir, "raw")
    if(os.path.exists(root)==False):
      shutil.rmtree(output_dir)
      return
    for f in os.listdir(root):
      flist.append(f)
    filelist = sorted(flist)
    #for some saz not have xxx_m.xml file
    #code by #
    #name = filelist[-1]
    #session_num = (name[0:name.find("_")])
    #length = len(session_num)
    #session_num = int(session_num)
    #filelist = []
    #for i in range(1,session_num+1):
    #  name = str(i).zfill(length)
    #  file_c = "%s_c.txt"%name
    #  filelist.append(file_c)
    #  file_m = "%s_m.xml"%name
    #  filelist.append(file_m)
    #  file_s = "%s_s.txt"%name
    #  filelist.append(file_s)
    #code by another
    length = len(filelist)

    for i in range(0, length, 3):
      orig_name = filelist[i+2][0:filelist[i+2].find(".")-1]
      filelist[i] = os.path.join(root, filelist[i])
      filelist[i+1] = os.path.join(root, filelist[i+1])
      filelist[i+2] = os.path.join(root, filelist[i+2])
      #------------check if file is "HTTP/1.1 200 OK"
      file_s = open(filelist[i+2],'rb') 
      strin = file_s.readline()
      if(strin.find("200")<0 or strin.find("OK")<0):
        file_s.close()
        continue
      file_s.close()
      #------------open  *_c.txt-----------------
      file_c = open(filelist[i],'rb') 
      strin = file_c.readline()
      # code by another people
      temp_ = re.split(" +", strin)
      url_ = temp_[1]
      #temp2_ = temp_[1].split("//")
      #url_ = temp2_[1].split("?")[0]
      #url_ = url_.split("#")[0]
      # code by another people
      startindex = strin.find("://") + 3
      endindex = strin.find("/",startindex)
      url_root = str(strin[startindex:endindex]).replace(':','_') # get hostname
      url_root = self.checkPath(url_root)
      startindex = endindex      # get filename
      endindex = strin.find("HTTP")-1
      filename = ""
      new_dir = url_root
      
      strtemp = strin[startindex:endindex]
      strtemp = self.checkPath(strtemp)
      strtemplist = strtemp.split('/')
      strtemplen = len(strtemplist)-1
      for j in range(strtemplen):
        strtempindex = strtemplist[j].find("?")
        if(strtempindex>0):
          filename = strtemplist[j][0:strtempindex]
          break
        new_dir = os.path.join(new_dir,strtemplist[j])
      if(cmp(filename,"")==0):
        filename = strtemplist[strtemplen]
        strtempindex = strtemplist[strtemplen].find("?")
        if(strtempindex>0):
          filename = strtemplist[strtemplen][0:strtempindex]
      if(filename.find(".")<0):
        filename = orig_name
      new_dir = self.checkFileName(new_dir)
      file_c.close()
      #------------open  *_s.txt-----------------
      file_s = open(filelist[i+2],'rb') 
      strin = file_s.readline()
      Transfer_Encoding = ""
      Content_Encoding = ""
      while(len(strin.strip())>0):      
        index = strin.find("Transfer-Encoding:") # get Transfer_Encoding value
        if(index >= 0):
          Transfer_Encoding = self.getTransferEncodingType(strin,inputfile,filelist[i+2])
        else:
          index = strin.find("transfer-encoding")
          if(index >= 0):
            Transfer_Encoding = self.getTransferEncodingType(strin,inputfile,filelist[i+2])

        index = strin.find("Content-Encoding:") # get Content_Encoding value
        if(index >= 0):
          Content_Encoding = self.getContentEncodingType(strin,inputfile,filelist[i+2])
        else:
          index = strin.find("content-encoding:")
          if(index >= 0):
            Content_Encoding = self.getContentEncodingType(strin,inputfile,filelist[i+2])
        strin =  file_s.readline()

      #----------write response body into file------------------
      srcstr = file_s.read() # get content
      #print filelist[i+2]
      dststr = self.decodeTransferEncoding(srcstr,Transfer_Encoding) #decode content
      dststr = self.decodeContentEncoding(dststr,Content_Encoding)
      
      if((len(new_dir)+len(output_dir))>200): # the length of file name should be < 255 
        new_dir = self.checkFileName(url_root)
        
      temp_new_dir = os.path.join(output_dir,new_dir)
      #temp_new_dir = self.checkPath(temp_new_dir)
      if(os.path.exists(temp_new_dir)==False): #check path
        
        os.makedirs(temp_new_dir)

      temp_new_dir_file = os.path.join(temp_new_dir,filename)
      if(len(temp_new_dir_file)>200): #the length of file name should be < 255 
        filename = orig_name
      new_dir_file = os.path.join(new_dir,filename)
      new_dir_file = self.checkFileName(new_dir_file)
      new_dir_file = os.path.join(output_dir,new_dir_file)
      if(os.path.exists(new_dir_file)): # check that if there exists the same name file
        new_dir_file = new_dir_file + orig_name
      #new_dir_file = self.checkPath(new_dir_file)
      raw_file = open(new_dir_file,'wb') # write into file
      # code by another one
      if url_ not in self.url_dict:
        self.url_dict[url_] = [new_dir_file]
      else:
        self.url_dict[url_].append(new_dir_file)
      # code by another one
      raw_file.write(dststr)
      raw_file.close()        
      file_s.close()
      
  def initDirectory(self,output_dir):
    if(os.path.exists(output_dir)):
      shutil.rmtree(output_dir)
    os.mkdir(output_dir)
    if(os.path.exists("log.txt")):
      os.remove("log.txt")

  def processFile(self, input_file, output_dir):
    if(input_file[-4:] == ".saz"):
      temp_dir = ''
      try:
      #if True:
        file_name = os.path.basename(input_file).split(".")[0]
        #file_name = input_file.split(".")[0].split("\\")[-1]
        #print input_file
        output_path = os.path.join(output_dir, file_name)
        #print "output_dir",output_dir
        #print "output_path",output_path
        if os.path.exists(output_path):
          shutil.rmtree(output_path)
        os.makedirs(output_path)
        temp_dir = os.path.join(output_path,"temp")
        os.makedirs(temp_dir)
        self.unZip(input_file, temp_dir)
        self.analysisSAZFile(input_file, temp_dir, output_path)
        shutil.rmtree(temp_dir)
        return True
      except Exception,e:
        #shutil.rmtree(temp_dir)
        print 'Find exception in processFile, exception = ', e
        return False
    else:
      print 'Input is NOT .saz, path: ', input_file
      return False
  def processFolder(self, input_dir, output_dir): # find all saz files in recursion way and convert them into rawfile
    if not os.path.exists(input_dir):
      return False
    self.initDirectory(output_dir)
    for root, dirs, files in os.walk(input_dir):
      for name in files:
        input_file = os.path.join(root, name)
        self.processFile(input_file, output_dir)
    return True
  
if __name__ == "__main__":
  if len(sys.argv) == 4 and (sys.argv[1] == '--file' or sys.argv[1] == '--dir'):
    print "\n Start to convert, please wait......"
    extractor = SazExtractor()
    if (sys.argv[1] == '--file'):
      extractor.processFile(sys.argv[2], sys.argv[3])
    else:
      extractor.processFolder(sys.argv[2], sys.argv[3])
  else:
    print """
    Usage:
      python tool.py --[file|dir] [input_file|input_dir] output_dir
    """
    sys.exit(1)
  
  
  