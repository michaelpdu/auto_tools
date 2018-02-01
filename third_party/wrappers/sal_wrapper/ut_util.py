import sys,os
import unittest
import urllib
import multiprocessing
import threading
import subprocess
import Queue
import tempfile
import time
import cgi
import memcache
import hashlib
import BaseHTTPServer
import json
import signal
import socket
import base64


def pick_sample(rpath):
    fullpath = os.path.join("./ut_data/sample", rpath)
    assert os.path.exists(fullpath), "Can't find '%s'" % fullpath
    return fullpath

def link_sample(rpath, content_dir='/tmp/sa_mock'):
    filepath = pick_sample(rpath)
    filename = hashlib.sha1(filepath).hexdigest()
    content_file = os.path.join(content_dir, "page", filename)

    if not os.path.exists(os.path.dirname(content_file)):
        os.makedirs(os.path.dirname(content_file))

    if os.path.exists(content_file):
        os.remove(content_file)
    assert not os.path.exists(content_file)

    os.symlink(os.path.abspath(filepath), content_file)
    return content_dir, filename


def build_message_from_sample(file, filetype):
    msg = {
        "url": "http://www.test1234.com/a.html",
        "vsapi_tftd.cat": "TXT",
        "content.dir": "",
        "content.filename": "",
        "magic_tftd.desc": "text/html"
    }
    content_dir, content_filename = link_sample(file)
    msg['content.dir'] = content_dir
    msg['content.filename'] = content_filename

    if filetype == 'HTML':
        msg['vsapi_tftd.cat'] = "TXT"
    elif filetype == 'PDF':
        msg['vsapi_tftd.cat'] = "BIN"
        msg['magic_tftd.desc'] = "application/pdf"
    elif filetype == 'SWF':
        msg['vsapi_tftd.cat'] = "BIN"
        msg['magic_tftd.desc'] = "application/x-shockwave-flash"
    elif filetype == 'JAVA':
        msg['vsapi_tftd.cat'] = "BIN"
        msg['magic_tftd.desc'] = "application/zip"
    else:
        assert False, "invalid filetype: %s" % filetype

    return msg


class AsyncLinePipeReader(threading.Thread):

    def __init__(self, pipe_file):
        threading.Thread.__init__(self)
        self.pipe_file = pipe_file
        self.lines = Queue.Queue()
        self.daemon = True
        self.start()

    def run(self):
        for line in iter(self.pipe_file.readline, ''):
            self.lines.put(line)


class MemcachedAgent:

    def __init__(self, port):
        self.host = "127.0.0.1"
        self.port = port

        self.process = subprocess.Popen(["memcached", "-u", "root", \
                                         "-p", str(port)])
        if self.process.poll() != None:
            raise Exception("server process start failed")
        self.wait_for_server_ready()

    def wait_for_server_ready(self):
        t = 0.01
        c = 9
        while c > 0:
            client = memcache.Client([self.get_server_string(),])
            if client.set("__check__", 1):
                client.delete("__check__")
                return
            time.sleep(t)
            t *= 2
            c -= 1
        raise Exception("server start failed")

    def __del__(self):
        try:
            self.close()
        except:
            pass

    def close(self):
        self.process.terminate()

    def get_server_string(self):
        return "%s:%d" % (self.host, self.port)


class FeedbackServerAgent:

    def __init__(self, port):
        self.host = "127.0.0.1"
        self.port = port

        cmd = ["python", "tools/feedback-server.py", str(port)]
        self.process = subprocess.Popen(cmd, 
                                        stdin=subprocess.PIPE, 
                                        stdout=subprocess.PIPE,
                                        stderr=sys.stderr)
        if self.process.poll() != None:
            raise Exception("server process start failed")

        # create asynchomized pipe reader, to avoid pipe deadlock
        self.pipe_reader = AsyncLinePipeReader(self.process.stdout)
        
        self._wait_for_server_ready()

    def _wait_for_server_ready(self):
        t = 0.01
        c = 9
        while c > 0:
            try:
                f = urllib.urlopen(self.get_post_url())
                if f:
                    return
            except Exception, ex:
                pass
            time.sleep(t)
            t *= 2
            c -= 1
        raise Exception("server start failed")

    def __del__(self):
        try:
            self.close()
        except:
            pass

    def close(self):
        self.process.terminate()

    def get_post_url(self):
        return "http://%s:%d/sa/post_feedback.php" % (self.host, self.port)

    def get_next_feedback(self, timeout=-1):
        line = None
        if timeout > 0:
            line = self.pipe_reader.lines.get(True, timeout)
        else:
            line = self.pipe_reader.lines.get()

        if line:
            feedback = json.loads(line)
            return (feedback[0], base64.b64decode(feedback[1]),
                                 base64.b64decode(feedback[2]))
        else:
            return None


class GSBServerAgent:

    def __init__(self, port):
        self.host = "127.0.0.1"
        self.port = port

        self.process = subprocess.Popen(["python", "tools/gsb-server.py", str(port)])
        if self.process.poll() != None:
            raise Exception("server process start failed")
        self._wait_for_server_ready()

    def get_query_url(self):
        return "http://%s:%d" % (self.host, self.port)

    def __del__(self):
        try:
            self.close()
        except:
            pass

    def close(self):
        self.process.terminate()

    def _wait_for_server_ready(self):
        t = 0.01
        c = 9
        while c > 0:
            try:
                f = urllib.urlopen(self.get_query_url())
                if f:
                    return
            except Exception, ex:
                pass
            time.sleep(t)
            t *= 2
            c -= 1
        raise Exception("server start failed")


class UserConfigWriter:

    def __init__(self, user_conf):
        self.user_conf = user_conf
        self.fout = open(user_conf, "w")

    def write(self, key, value):
        print >>self.fout, "odin_conf[%s] = %s" % (key.__repr__(), 
                                                   value.__repr__())
       
    def write_dict(self, d):
        for k in d:
            self.write(k, d[k])

    def close(self):
        self.fout.close()

def write_user_conf(user_conf, d):
    uc = UserConfigWriter(user_conf)
    uc.write_dict(d)
    uc.close()


class StatsD_Agent:

    def __init__(self, port):
        self.host = "127.0.0.1"
        self.port = port

        cmd = ["python", "tools/statsd.py", str(port)]
        self.process = subprocess.Popen(cmd, 
                                        stdin=subprocess.PIPE, 
                                        stdout=subprocess.PIPE,
                                        stderr=sys.stderr)
        if self.process.poll() != None:
            raise Exception("server process start failed")

        # create asynchomized pipe reader, to avoid pipe deadlock
        self.pipe_reader = AsyncLinePipeReader(self.process.stdout)
        
        self._wait_for_server_ready()

    def _wait_for_server_ready(self):
        t = 0.01
        c = 9
        while c > 0:
            try:
                so = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                so.sendto('"STATSD_TEST"', self.get_statsd_addr())
                j = self.get_next_stats(1)
                if j and j == 'STATSD_TEST':
                    return
            except Exception, ex:
                pass
                #print type(ex), ex
            time.sleep(t)
            t *= 2
            c -= 1
        raise Exception("server start failed")

    def __del__(self):
        try:
            self.close()
        except:
            pass

    def close(self):
        self.process.terminate()

    def get_statsd_addr(self):
        return (self.host, self.port)

    def get_next_stats(self, timeout=-1):
        line = None
        if timeout > 0:
            line = self.pipe_reader.lines.get(True, timeout)
        else:
            line = self.pipe_reader.lines.get()

        if line:
            return json.loads(line)
        else:
            return None


class OdinSA_Mocker:

    def __init__(self, user_conf, mpu_enable=False):
        self.user_conf = user_conf
        self.mpu_user_conf = '/trend/odin/conf/odin_mpu_user_test.conf'

        d = {}
        d['odin_mpu.stats_component'] = ['odin_sa']
        write_user_conf(self.mpu_user_conf, d)

        self.process = self._create_odin_sa_process()
        self.pipe_stdout = self.process.stdout
        if mpu_enable:
            self.mpu_process = self._create_odin_mpu_process(self.process.stdout)
            self.pipe_stdout = self.mpu_process.stdout

        self.output_lines = Queue.Queue()
        self.asyn_file_reader = threading.Thread(target=self._watch_output)
        self.asyn_file_reader.daemon = True
        self.asyn_file_reader.start()

        self.mpu_enable = mpu_enable

    def _watch_output(self):
        for line in iter(self.pipe_stdout.readline, ''):
            self.output_lines.put(line)

    def _create_odin_sa_process(self):
        env = dict(os.environ)
        env["LD_LIBRARY_PATH"] = ""
        env["LD_LIBRARY_PATH"] += os.pathsep + "/trend/odin/lib"
        env["PYTHONPATH"] = ""
        env["PYTHONPATH"] += os.pathsep + "/trend/odin/lib/python"
        env["PYTHONPATH"] += os.pathsep + "/trend/odin/bin"
        env["odin_runtime_root"] = "/trend/odin"
        env["odin_pipe_ins_num"] = "0"

        cmd = ['/usr/bin/python','/trend/odin/bin/odin_sa.py']
        cmd += ['/trend/odin/conf/base/odin_sa_base.conf']
        cmd += [self.user_conf]
        cmd += [self.user_conf]
        cmd += [self.user_conf]

        return subprocess.Popen(cmd, env=env, 
                                stdin=subprocess.PIPE, 
                                stdout=subprocess.PIPE,
                                stderr=sys.stderr)

    def _create_odin_mpu_process(self, stdin):
        env = dict(os.environ)
        env["PYTHONPATH"] = ""
        env["PYTHONPATH"] += os.pathsep + "/trend/odin/lib/python"
        env["PYTHONPATH"] += os.pathsep + "/trend/odin/bin"
        env["odin_runtime_root"] = "/trend/odin"
        env["odin_pipe_ins_num"] = "0"

        cmd = ['/usr/bin/python','/trend/odin/bin/odin_mpu.py']
        cmd += ['/trend/odin/conf/base/odin_mpu_base.conf']
        cmd += [self.mpu_user_conf]
        cmd += [self.mpu_user_conf]
        cmd += [self.mpu_user_conf]

        return subprocess.Popen(cmd, env=env, 
                                stdin=stdin,
                                stdout=subprocess.PIPE,
                                stderr=sys.stderr)
    
    def __del__(self):
        try:
            self.close()
        except:
            pass

    def close(self):
        self.process.terminate()
        if self.mpu_enable:
            self.mpu_process.terminate()

    def get_pid(self):
        return self.process.pid

    def _get_child_pids(self):
        p = subprocess.Popen(["pgrep", "-P", str(self.get_pid())], stdout=subprocess.PIPE)
        output = p.communicate()[0]
        return [int(l) for l in output.splitlines()]
        
    def get_scan_process_pid(self):
        return self._get_child_pids()[0]
            
    def get_input_pipe(self):
        return self.process.stdin

    def get_output_line_queue(self):
        return self.output_lines


def odin_sa_shell():
    sa = OdinSA_Mocker('/trend/odin/conf/odin_sa_user.conf')
    input = sa.get_input_pipe()
    output = sa.get_output_line_queue()

    while True:
        try:
            data = raw_input("odin_sa> ")
        except EOFError:
            print
            print "Pressed Ctrl-D, exiting..."
            break

        if data == "exit" or data == "quit":
            print
            break

        if len(data) > 0:
            print >>input, data
            try:
                while True:
                    print 
                    print output.get(True, 5)
            except Queue.Empty:
                pass
    

def test():
    fbsrv = FeedbackServerAgent(8002)
    f = urllib.urlopen(fbsrv.get_post_url())
    print f.read()
    fbsrv.close()

    return

    fbsrv = FeedbackServerAgent(8002)
    fbsrv.close()
    fbsrv = FeedbackServerAgent(8002)
    fbsrv.close()
    fbsrv = FeedbackServerAgent(8002)
    fbsrv.close()

    gsbsrv = GSBServerAgent(8003)
    gsbsrv.close()
    gsbsrv = GSBServerAgent(8003)
    gsbsrv.close()
    gsbsrv = GSBServerAgent(8003)
    gsbsrv.close()

    mcsrv = MemcachedAgent(11211)
    mcsrv.close()
    mcsrv = MemcachedAgent(11211)
    mcsrv.close()
    mcsrv = MemcachedAgent(11211)
    mcsrv.close()


def test_conf_writer():
    uc = UserConfigWriter("test.conf")
    uc.write('odin_sa.feedback.post_url', 'http://127.0.0.1:8001/post_feedback.php')
    uc.write('odin_sa.cache.query_url', ['127.0.0.1:11211',])
    uc.close()

if __name__ == "__main__":
    #unittest.main()
    #odin_sa_shell()
    test()
    #test_conf_writer()

