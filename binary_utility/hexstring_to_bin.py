import os,sys,binascii

def convert_to_bin(input, output):
    if not os.path.exists(input):
        print "[ERROR] cannot find " + input
        return
    data = []
    with open(input, "r") as input_handle:
        content = input_handle.read()
        if len(content) % 2 != 0:
            print "[ERROR] content length issue"
            return
        for i in range(0,len(content),2):
            data.append(content[i:i+2])
    with open(output, "wb") as output_handle:
        for d in data:
            output_handle.write(binascii.unhexlify(d))

def print_help():
    print """
Usage:
  python hexstring_to_bin.py import_file bin_file

HexString:
  0061736d0100000001641060037f7f7f017f60017f017f6000017f60017f0060027f7f017f60027f7f0
    """

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print_help()
        exit(-1)
    convert_to_bin(sys.argv[1], sys.argv[2])