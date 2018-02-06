import os
from detectSamples import *
from global_config import *


def start():
	config_file = r"config.cfg"
	po = GlobalConfig(config_file)
	workpath = po.getWorkPath()
	samplerootpath = po.getSampePath()
	build_num = po.getBuildNumber()
	print "build_num: "+str(build_num)
	ie_sign = po.getTargetIE()
	firefox_sign = po.getTargetFirefox()
	activex_sign = po.getTargetActivex()
	for i in range(1,build_num+1):
		salineupdir = po.getBuildPath(i)
		salineupversion = po.getBuildVersion(i)
		detectSamples(workpath,samplerootpath,salineupdir,salineupversion,ie_sign,firefox_sign,activex_sign)#detect samples by using sal
		print '\n\n...ok...\n\n'

if __name__ == '__main__':
   start()
