import os,sys,binascii

def wasm_to_jsarray(input, output):
    if not os.path.exists(input):
        print "[ERROR] cannot find " + input
        return
    content=''
    with open(input, "rb") as input_handle:
        content = binascii.hexlify(input_handle.read())
    wasm_bytes = []
    for i in range(0,len(content),2):
        wasm_bytes.append('0x'+content[i:i+2])
    js_content = 'var wasmarr = [{}];'.format(', '.join(wasm_bytes))
    with open(output, "w") as output_handle:
        output_handle.write(js_content)

def print_help():
    print """
Usage:
  python wasm_to_jsarray.py wasm_file output_js_file
    """

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print_help()
        exit(-1)
    wasm_to_jsarray(sys.argv[1], sys.argv[2])