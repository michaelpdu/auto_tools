import os, sys

size_dict = {}

def update_dict(size):
    index = size/1000
    if index in size_dict:
        size_dict[index] += 1
    else:
        size_dict[index] = 1

def dump_dict():
    for key,value in size_dict.items():
        print('{}: {}'.format(key,value))

def fold_statistic(dest_path):
    for root, dirs, files in os.walk(dest_path):
        for name in files:
            size = os.path.getsize(os.path.join(root, name))
            update_dict(size)
        
if __name__ == "__main__":
    fold_statistic(sys.argv[1])
    dump_dict()