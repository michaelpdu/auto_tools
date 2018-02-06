from os.path import exists, isfile, join, basename, dirname, realpath
from os import makedirs, listdir
from shutil import copy, copyfile
from pdb import set_trace
input_file_path = 'c:\\temp\\prohook.temp.log'
with open(input_file_path) as appparams_file:
    params = {}
    for line in appparams_file:
        k, v = [x.strip() for x in line.split('=', 1)]
        params[k] = v
print('create process params are {0}'.format(params))

def ensure_dir(d):
    if not exists(d):
        makedirs(d)

def try_to_copy(src, dst_dir, count):
    #set_trace()
    if isfile(src):
        try:
            copy(src, join(dst_dir, '{0}_{1}'.format(count, basename(src))))
            return True
        except Exception as e:
            return False

def cmd_line_to_args(cmd_line):
    return cmd_line.split()
        
output_dir = join(dirname(realpath(__file__)), 'output')
ensure_dir(output_dir)
k_appname = 'lpApplicationName'
k_cmdline = 'lpCommandLine'
k_workdir = 'E:\\src\\proc_hook\\buildall\\Win32\\Release'
existed_folders = filter(lambda x : not isfile(x), listdir(output_dir))
dump_dir_path = join(output_dir, 'create_process_{0}'.format(len(existed_folders)))
ensure_dir(dump_dir_path)
count = 0
count = count + 1; try_to_copy(input_file_path, dump_dir_path, count)
if params.has_key(k_appname):
    count = count + 1; try_to_copy(params[k_appname], dump_dir_path, count)

for arg in cmd_line_to_args(params[k_cmdline]):
    count = count + 1; try_to_copy(arg, dump_dir_path, count)    