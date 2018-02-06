import os
import time
import subprocess



fiddler_path = "C:\Program Files (x86)\Fiddler2"
pcap_dir = "pcap"
saz_dir = "saz"

def pcap_to_saz(pcap_dir,saz_dir):
    pcap_dir = os.path.abspath(pcap_dir)
    saz_dir = os.path.abspath(saz_dir)

    if not os.path.exists(pcap_dir):
        os.mkdir(pcap_dir)
    if not os.path.exists(saz_dir):
        os.mkdir(saz_dir)

    cur_dir = os.path.abspath(os.curdir)
    os.chdir(fiddler_path)

    for pcap_file in os.listdir(pcap_dir):
        if not pcap_file.endswith("pcap"):
            continue
        pcap_name = os.path.basename(pcap_file).split(".")[0]
        dest_saz = pcap_name + ".saz"
        pcap_path = os.path.join(pcap_dir,pcap_file)
        saz_path = os.path.join(saz_dir, dest_saz)

        fiddler_clear()
        fiddler_import(pcap_path)
        fiddler_save(saz_path)

    os.chdir(cur_dir)

def fiddler_import(file_path):
    cmd = 'ExecAction.exe' + ' ' + r'"import \"' + file_path + r'\""'
    process = subprocess.Popen(cmd, shell=True)
    process.wait()
    time.sleep(0.5)

def fiddler_save(file_path):
    cmd = 'ExecAction.exe' + ' ' + r'"savesaz \"' + file_path + r'\""'
    process = subprocess.Popen(cmd, shell=True)
    process.wait()
    time.sleep(0.5)

def fiddler_clear():
    #clear the sessions in the window
    process = subprocess.Popen('ExecAction.exe clear', shell=True)
    process.wait()
    time.sleep(0.5)

pcap_to_saz(pcap_dir,saz_dir)