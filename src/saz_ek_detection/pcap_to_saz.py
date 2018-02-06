import os
import time,shutil
import subprocess



fiddler_path = r"C:\Program Files\Fiddler2"
pcap_dir = r"C:\data\EK_Sample"
saz_dir = r"C:\data\EK_Sample\pcap_to_saz"

#convert pcap in pcap_dir,produced saz file in saz dir,
# if given backup_dir,will move pcap file to backup_dir
def pcap_to_saz(pcap_dir,saz_dir,backup_dir=None):
    pcap_dir = os.path.abspath(pcap_dir)
    saz_dir = os.path.abspath(saz_dir)

    if backup_dir:
        backup_dir = os.path.abspath(backup_dir)
    cur_dir = os.path.abspath(os.curdir)
    os.chdir(fiddler_path)

    for pcap_file in os.listdir(pcap_dir):
        if not pcap_file.endswith("pcap"):
            continue
        pcap_path = os.path.join(pcap_dir,pcap_file)
        if os.path.isdir(pcap_path):
            continue
        pcap_name = get_name(pcap_file)
        dest_saz = pcap_name + ".saz"
        
        saz_path = os.path.join(saz_dir, dest_saz)

        fiddler_clear()
        fiddler_import(pcap_path)
        if not os.path.exists(saz_dir):
            os.mkdir(saz_dir)
        fiddler_save(saz_path)
        if backup_dir:
            if not os.path.exists(backup_dir):
                os.mkdir(backup_dir)
            try:
                target_path = os.path.join(backup_dir,pcap_file)
                shutil.move(pcap_path, target_path)
            except:
                print "move fail",pcap_path
            

    os.chdir(cur_dir)

def fiddler_import(file_path):
    cmd = 'ExecAction.exe' + ' ' + r'"import \"' + file_path + r'\""'
    process = subprocess.Popen(cmd, shell=True)
    process.wait()
    time.sleep(1)

def fiddler_save(file_path):
    cmd = 'ExecAction.exe' + ' ' + r'"savesaz \"' + file_path + r'\""'
    process = subprocess.Popen(cmd, shell=True)
    process.wait()
    time.sleep(1)

def fiddler_clear():
    #clear the sessions in the window
    process = subprocess.Popen('ExecAction.exe clear', shell=True)
    process.wait()
    time.sleep(1)
def get_name(file_path):
    temp = os.path.basename(file_path)
    name = temp[0:temp.rfind(".")]
    return name

#recursivly traverse dir,and convert pcap file to saz ,make backup dir in ervery dir
#会把文件夹内所有的pcap文件都转成saz文件，并且删除pcap文件，在每个文件夹内建立pcap 备份文件夹
def traverse_pcap_dir(path):
    #global pcap_dir,saz_dir
    for root,dirs,files in os.walk(path):
        #print "start ",root
        pass
        if root.find("backup_pcap")>0:
            continue
        pcap_dir = root
        saz_dir = root
        backup_dir = os.path.join(pcap_dir,"backup_pcap")
        pcap_to_saz(pcap_dir,saz_dir,backup_dir)
        
        
        saz = 0
        name_list = []
        if os.path.exists(saz_dir):
            for file in os.listdir(saz_dir):
                name_list.append(get_name(file))
                saz += 1
        count = 0
        if os.path.exists(backup_dir):
            for file in os.listdir(backup_dir):
                if file.endswith("pcap"):
                    count += 1
                    name = get_name(file)
                    if name not in name_list:
                        # print missed pcap file
                        print root,name
            
        

            
traverse_pcap_dir(r"C:\data\EK_Sample")
#pcap_to_saz(pcap_dir,saz_dir)