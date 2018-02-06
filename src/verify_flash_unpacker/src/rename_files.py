import os

for root, dirs, files in os.walk("C:\\Users\\Administrator\\Desktop\\flash_unpacker\\swf_samples"):
    for name in files:
        os.rename(os.path.join(root, name), os.path.join(root, name+".swf"))