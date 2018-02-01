import os, sys


def collect_all_of_filename(dir_path):
    file_list = list()
    for root, dirs, files in os.walk(dir_path):
        for name in files:
            file_list.append(name)
    return file_list

def find_same_name(folder_a, folder_b):
    list_a = collect_all_of_filename(folder_a)
    list_b = collect_all_of_filename(folder_b)
    for name in list_a:
        if name in list_b:
            print name


help_msg = """
Usage:
    python find_same_name_in_two_folder.py folder_A folder_B

"""






