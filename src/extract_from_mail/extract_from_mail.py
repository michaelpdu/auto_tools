import os, sys, email, re, base64, traceback
from datetime import datetime

def safe_b64decode(str):
    length = len(str) % 4
    if length == 0:
        return base64.b64decode(str)
    else:
        for i in range(4 - int(length)):
            str = str + '='
        return base64.b64decode(str)

class MailExtactor:
    """

    """
    def __init__(self):
        self.dest_dir = r'./'
        self.processd_file_count = 0
        self.saved_file_count = 0
        self.failed_file_count = 0
        self.file_count_in_current_mail = 0

    def set_dest_dir(self, dest):
        self.dest_dir = dest

    def save_file(self, content, dest_file):
        if os.path.exists(dest_file):
            print "[WARN] find exist file, name = " + dest_file
            root, ext = os.path.splitext(dest_file)
            dest_file = root + '_' + datetime.utcnow().strftime('%Y%m%d%H%M%S%f')[:-3] + ext
        with open(dest_file, 'wb') as output:
            output.write(content)
            print "[INFO] save file into: " + dest_file
            self.file_count_in_current_mail += 1

    def save_attachment(self, filename, mime_type, content, encoding):
        if 'image' in mime_type:
            return
        dest_file = ''
        if encoding == 'base64':
            if 'word' in mime_type:
                dest_dir = os.path.join(self.dest_dir, 'office')
                if not os.path.exists(dest_dir):
                    os.makedirs(dest_dir)
                dest_file = os.path.join(dest_dir, filename)
            else:
                dest_file = os.path.join(self.dest_dir, filename)
            b64_list = content.split('\n')
            if len(b64_list[-1]) != len(b64_list[0]) and len(b64_list[-2]) != len(b64_list[0]):
                del b64_list[-1]
            # self.save_file(base64.b64decode(''.join(b64_list)), dest_file) # raise TypeError(msg)  TypeError: Incorrect padding
            self.save_file(safe_b64decode(''.join(b64_list)),dest_file)
        elif encoding == 'quoted-printable' and '.wsf' in filename:
            dest_dir = os.path.join(self.dest_dir, 'wsf')
            if not os.path.exists(dest_dir):
                os.makedirs(dest_dir)
            dest_file = os.path.join(dest_dir, filename)
            self.save_file(content, dest_file)
        else:
            print "[ERROR] Not supported encoding"

    def analyze_mail_message(self, msg):
        if msg.is_multipart():
            msg_list = msg.get_payload()
            for msg in msg_list:
                self.analyze_mail_message(msg)
        else:
            find_filename_in_content_type = False
            find_attachment = False
            find_filename_in_content_dispositioin = False
            if msg.has_key("Content-Type"):
                content_type = msg["Content-Type"].strip().lower()
                # print content_type
                mime_type = content_type.split(';')[0]
                # print mime_type
                if 'name' in content_type:
                    mo = re.search(r'name=[\"\']?(?P<filename>[^\"\';\r\n]*)[\"\']?', content_type)
                    if None == mo:
                        print "[REGEX ERROR] cannot find filename in content type"
                    else:
                        filename = mo.group("filename")
                        find_filename_in_content_type = True
            if msg.has_key("Content-Transfer-Encoding"):
                content_transfer_encoding = msg["Content-Transfer-Encoding"].strip().lower()
            if msg.has_key("Content-Disposition"):
                content_disposition = msg["Content-Disposition"].strip().lower()
                # print content_disposition
                if 'attachment' in content_disposition:
                    find_attachment = True
                if not find_filename_in_content_type and 'filename' in content_disposition:
                    mo = re.search(r'filename=\s*[\"\']?(?P<filename>[^\"\';\r\n]*)[\"\']?', content_disposition)
                    if None == mo:
                        print "[REGEX ERROR] cannot find filename in content disposition"
                    else:
                        filename = mo.group("filename")
                        find_filename_in_content_dispositioin = True
            if find_attachment or ((find_filename_in_content_type or find_filename_in_content_dispositioin) and ('base64' == content_transfer_encoding)):
                filename = filename.replace('?', '_')
                filename = filename.replace('/', '_')
                filename = filename.replace('\\', '_')
                self.save_attachment(filename, mime_type, msg.get_payload(), content_transfer_encoding)
                return True
            else:
                return False

    def analyze_mail_structure(self, mail_content):
        try:
            msg = email.message_from_string(mail_content)
            self.analyze_mail_message(msg)
        except Exception, e:
            print "[ERROR] Cannot analyze email structure"
            print e
            print traceback.print_exc()

    def extract_from_mail(self, mail_path):
        if not os.path.exists(mail_path):
            print "[ERROR] Cannot find mail path, " + mail_path
            return
        root, ext = os.path.splitext(mail_path)
        if ext != '.eml':
            print "[WARN] It's not .eml format, " + mail_path
            return
        print "Now process " + mail_path
        self.processd_file_count += 1
        self.file_count_in_current_mail = 0
        with open(mail_path, 'r') as fh:
            self.analyze_mail_structure(fh.read())
        self.saved_file_count += self.file_count_in_current_mail
        if self.file_count_in_current_mail == 0:
            print 'ERROR!!!!!!!!!!!!!!!\n' * 10
            self.failed_file_count += 1

    def process_single_mail(self, file_path):
        if not os.path.exists(self.dest_dir):
            os.makedirs(self.dest_dir)
        self.extract_from_mail(file_path)

    def process_multiple_mail(self, folder_path):
        if not os.path.exists(self.dest_dir):
            os.makedirs(self.dest_dir)
        for root, dirs, files in os.walk(folder_path):
            for name in files:
                self.extract_from_mail(os.path.join(root,name))
            for dir_ in dirs:
                self.process_multiple_mail(root+'\\'+dir_)

def print_usage():
    print """
Usage:
    python extract_from_mail.py --[file|dir] input_path output_path
    """

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print_usage()
        exit(-1)

    mail_extractor = MailExtactor()
    mail_extractor.set_dest_dir(sys.argv[3])

    if 'file' in sys.argv[1]:
        mail_extractor.process_single_mail(sys.argv[2])
    elif 'dir' in sys.argv[1]:
        mail_extractor.process_multiple_mail(sys.argv[2])
    else:
        print "Unsupported argument!"

    print "\n\n*************************************"
    print "Processd file count: " + str(mail_extractor.processd_file_count)
    print "Saved file count: " + str(mail_extractor.saved_file_count)
    print "Failed file count: " + str(mail_extractor.failed_file_count)

