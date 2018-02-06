#!/usr/bin/env python
# inspired from https://raw.github.com/schmir/bbfreeze/master/bbfreeze/py.py

import sys
import os
sys.path.append(os.path.dirname(getattr(sys,'executable',sys.argv[0])) or '.')
try:
    import zipextimporter
    zipextimporter.install()
except:
    pass

def parse_options(args, spec):
    needarg = dict()
    for x in spec.split():
        if x.endswith('='):
            needarg[x[:-1]] = True
        else:
            needarg[x] = False
    options = []
    newargs = []
    i = 0
    while i < len(args):
        a, v = (args[i].split('=', 1) + [None])[:2]
        if a in needarg:
            if v is None and needarg[a]:
                i += 1
                try:
                    v = args[i]
                except IndexError:
                    raise Exception('option %s needs an argument' % (a, ))
            options.append((a, v))
            if a in ('-c', '-m'):
                break
        else:
            break
        i += 1
    newargs.extend(args[i:])
    return options, newargs

options, args = parse_options(sys.argv[1:], '-u -h -B -V -x -c= -m=')
options = dict(options)
sys.argv = args or ['']

main = __import__('__main__')

if '-B' in options or os.getenv('PYTHONDONTWRITEBYTECODE'):
    sys.dont_write_bytecode = True
if '-u' in options or os.getenv('PYTHONUNBUFFERED'):
    sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 0)
    sys.stderr = os.fdopen(sys.stderr.fileno(), 'w', 0)

if '-h' in options:
    print """
usage: python [option] ... [-c cmd | file] [arg] ...
Options and arguments (and corresponding environment variables):
-B     : don't write .py[co] files on import; also PYTHONDONTWRITEBYTECODE=x
-c cmd : program passed in as string (terminates option list)
-h     : print this help message and exit
-u     : unbuffered binary stdout and stderr; also PYTHONUNBUFFERED=x
         see man page for details on internal buffering relating to '-u'
-V     : print the Python version number and exit (also --version)
-x     : skip first line of source, allowing use of non-Unix forms of #!cmd
file   : program read from script file
arg ...: arguments passed to program in sys.argv[1:]
    """.strip()
elif '-V' in options:
    sys.stdout.write('python %s\n' % sys.version.split()[0])
elif options.get('-m') is not None:
    get_loader = getattr(__import__('imp'), 'get_loader', None) or getattr(__import__('pkgutil'), 'get_loader')
    codeobj = get_loader(options['-m']).get_code(options['-m'])
    main.__dict__ ['__file__'] = codeobj.co_filename
    exec codeobj in main.__dict__
elif options.get('-c') is not None:
    exec options.get('-c') in main.__dict__
elif sys.argv[0]:
    if sys.argv[0].endswith('.zip'):
        import zipimport
        importer = zipimport.zipimporter(sys.argv[0])
        sys.path.insert(0, sys.argv[0])
        main.__dict__['__file__'] = os.path.join(os.path.abspath(sys.argv[0]), '__main__.py')
        exec importer.get_code('__main__') in main.__dict__
    else:
        codeobj = None
        with open(sys.argv[0], 'rb') as fp:
            if '-x' in options:
                fp.readline()
            content = fp.read()
            main.__dict__['__file__'] = os.path.abspath(sys.argv[0])
            if content.startswith('\x03\xf3\r\n'):
                codeobj = __import__('marshal').loads(content[8:])
            else:
                codeobj = compile(content, filename=sys.argv[0], mode='exec')
        if codeobj:
            exec codeobj in main.__dict__
else:
    import code
    cprt = 'Type "help", "copyright", "credits" or "license" for more information.'
    code.interact(banner='Python %s on %s\n%s' % (sys.version, sys.platform, cprt))
