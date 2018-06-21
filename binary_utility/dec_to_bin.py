import os,sys,binascii

def dec_to_bin(input, output):
    if not os.path.exists(input):
        print "[ERROR] cannot find " + input
        return
    data = []
    with open(input, "r") as input_handle:
        content = input_handle.read()
        dec_array = content.split(',')
        print(dec_array)
        data = ["{:02x}".format(int(c)) for c in dec_array]
        print(data)
    with open(output, "wb") as output_handle:
        for d in data:
            output_handle.write(binascii.unhexlify(d))

def print_help():
    print """
Usage:
  python dec_to_bin.py dec_file bin_file

HexString:
  0,97,115,109,1,0,0,0,1,14,3,96,1,127,0,96,0,0,96,2,127,127,1,127,2,35,2,2,106,115,3,109,101,109,2,0,1,7,105,109,112,111,114,116,115,13,105,109,112,111,114,116,101,100,95,102,117,110,99,0,0,3,3,2,1,2,7,30,2,13,101,120,112,111,114,116,101,100,95,102,117,110,99,0,1,10,97,99,99,117
    """

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print_help()
        exit(-1)
    dec_to_bin(sys.argv[1], sys.argv[2])