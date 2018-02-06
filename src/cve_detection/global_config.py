
import os
from ConfigParser import ConfigParser

class GlobalConfig(object):

    def __init__(self, config_file):
        '''
        Constructor
        @config_file: configuration file, this is config.cfg
        '''
        self.config = ConfigParser()
        self.config.read(config_file)

    def getWorkPath(self):
        path = (self.config.get("workpath", "path")).strip()
        return path
		
    def getBuildNumber(self):
        num = int((self.config.get("build","build_number")).strip())
        return num

    def getBuildPath(self,num):
        path = (self.config.get("build", "build_"+str(num)+"_path")).strip()
        return path
		
    def getBuildVersion(self,num):
        version = (self.config.get("build", "build_"+str(num)+"_version")).strip()
        return version
    
    def getSampePath(self):
        path = (self.config.get("sample", "path")).strip()
        return path	
    
    def getExcelName(self):
        name = (self.config.get("result_excel", "name")).strip()
        return name	
	
    def getTargetIE(self):
        sign = (self.config.get("target", "ie")).strip()
        if(cmp(sign,'true')==0):
            return True
        return False

    def getTargetFirefox(self):
        sign = (self.config.get("target", "firefox")).strip()
        if(cmp(sign,'true')==0):
            return True
        return False

    def getTargetActivex(self):
        sign = (self.config.get("target", "activex")).strip()
        if(cmp(sign,'true')==0):
            return True
        return False
	
	
if __name__ == "__main__":
	config_file = r"config.cfg"
	po = GlobalConfig(config_file)
	print po.getWorkPath()
	print po.getBuildNumber()
	print po.getBuildPath(1)
	print po.getBuildName(1)
	print po.getSampePath()
	print po.getExcelName()
    
    
        
        
