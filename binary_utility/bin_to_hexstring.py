import os,sys,binascii

def bin_to_hexstring(input, output):
    if not os.path.exists(input):
        print "[ERROR] cannot find " + input
        return
    content=''
    with open(input, "rb") as input_handle:
        content = binascii.hexlify(input_handle.read())
    with open(output, "w") as output_handle:
        output_handle.write(content)

def print_help():
    print """
Usage:
  python bin_to_hexstring.py bin_file hexstring_file
    """

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print_help()
        exit(-1)
    bin_to_hexstring(sys.argv[1], sys.argv[2])