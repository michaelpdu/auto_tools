import os
import shutil
import sys
pcaplist=[]
def CopyPcap(EkTypePath,filename):
    EkTypeName=os.path.split(EkTypePath)[1]
    if not os.path.exists(os.path.join(os.path.dirname(os.path.dirname(EkTypePath)),'temp')):#create temp file
        os.makedirs(os.path.join(os.path.dirname(os.path.dirname(EkTypePath)),'temp'))
    temppath=os.path.join(os.path.dirname(os.path.dirname(EkTypePath)),'temp')
    pcaptempfold=os.path.join(temppath,'pcap')
    print pcaptempfold
    if not os.path.exists(pcaptempfold):#create pcap folder
        os.makedirs(pcaptempfold)
        print '*'
    EkTypeNamePath=os.path.join(pcaptempfold,EkTypeName)
    if not os.path.exists(EkTypeNamePath):#create EkTypeName folder
        os.makedirs(EkTypeNamePath)
    if not os.path.exists(os.path.join(EkTypeNamePath,filename)):#if exists filename in pcap\EkTypeName
        shutil.copy(os.path.join(EkTypePath,filename),EkTypeNamePath)
    #DeleteNewItem(pcaptempfold)


def RecordPcap(InputPcapFilePath):
    global pcaplist
    status=False
    rootdir=os.path.dirname(InputPcapFilePath)
    if not os.path.exists(os.path.join(rootdir,'pcapnamelist.txt')):
        pcapnamelist=open(os.path.join(rootdir,'pcapnamelist.txt'),'w+')
        pcapnamelist.close()
    else:
        pcapnamelist=open(os.path.join(rootdir,'pcapnamelist.txt'),'r+')
        pcapnamelist.close()
    pcapnamelist=open(os.path.join(rootdir,'pcapnamelist.txt'),'r+')
    if len(pcapnamelist.read())==0:
        print'The first time handle pcapfile,exit SmartDect!'
        for root,dirs,files in os.walk(InputPcapFilePath):
            for filename in files:
                pcapnamelist.write(filename)
                pcapnamelist.write('\n')
        sys.exit(0)
    pcapnamelist.seek(0,0)
    content=pcapnamelist.readline()
    while len(content)!=0:
        content=content.strip('\n')
        pcaplist.append(content)
        content=pcapnamelist.readline()
    for root,dirs,files in os.walk(InputPcapFilePath):
        for filename in files:
            if filename not in pcaplist:
                print'bu cun zai '
                status=True
                pcapnamelist.seek(0,2)
                pcapnamelist.write(filename)
                pcapnamelist.write('\n')
                #except add pcapname in pcapnamelist.txt ,but also  copy this file in another pcap folder
                try:
                    CopyPcap(root,filename)
                except:
                    print 'copy function is failed!'
                    exit(1)
    pcapnamelist.close()
    if status==True:
        print 'new pcap add in '
        status=False
    else:
        print 'no item add in'
        
if __name__=='__main__':
    #arg1:pcap file path
	#pcap file and pcapnamelist must in the same folder
    if len(sys.argv)==2:
        RecordPcap(sys.argv[1])
    elif len(sys.argv)>0 and len(sys.argv)<2:
        print 'argv[1]:pcap file path'
        print 'No Input argument! The input argument is pcap file path'
        exit(1)
