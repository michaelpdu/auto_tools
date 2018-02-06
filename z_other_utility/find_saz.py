import os, sys, shutil

"""
Usage:
    python find_saz.py nssid_list sample_path output_dir
"""

dest_dir = sys.argv[3]
if os.path.exists(dest_dir):
    os.removedirs(dest_dir)
os.makedirs(dest_dir)

with open(sys.argv[1]) as fh:
    lines = [i.split()[0] for i in fh.readlines()]

for root, dirs, files in os.walk(sys.argv[2]):
    for name in files:
        (basename, ext) = os.path.splitext(name)
        if ext == '.saz' and basename in lines:
            print 'Find ' + name
            shutil.copy2(os.path.join(root, name), dest_dir)


        
