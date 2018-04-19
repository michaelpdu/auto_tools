import sys

def remove_lines(file_a, file_b):
    removed_list = []
    with open(file_b, 'r') as fh:
        for line in fh.readlines():
            removed_list.append(line.strip())
    with open(file_a, 'r') as fh:
        for line in fh.readlines():
            line = line.strip()
            if not line in removed_list:
                print(line)

help_msg = """
Usage:
    python remove_lines.py file_a file_b > file_c

Description:
    remove lines in file_b from file_a

"""

if __name__ == "__main__":
    remove_lines(sys.argv[1], sys.argv[2])

