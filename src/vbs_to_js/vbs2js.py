import os
import sys
import re
from api_replace import APIConverter


class VBSConverter:
    """
    """
    def __init__(self, vbs_file, js_file, function_list_file='known_function_names.cfg', conversion_rules_path='vba_to_js.rules'):
        self.vbs_file_ = vbs_file
        self.path = os.path.split(os.path.realpath(__file__))[0]
        self.external_fun_list_file_ = os.path.join(self.path, function_list_file)
        self.conversion_rules_path_ = os.path.join(self.path, conversion_rules_path)
        self.runtime_for_vbs_api = os.path.join(self.path,'runtime_for_win_host_vbs.js')
        self.conversion_rules_ = []
        self.array_name_list_ = []
        self.function_name_list_ = []
        self.external_fun_list_ = []
        self.js_file_ = js_file
        self.re_module_name_ = re.compile(r'VBA MACRO (\w*?)\.', re.IGNORECASE | re.MULTILINE)

    def load_conversion_rules(self):
        with open(self.conversion_rules_path_) as fh:
            for line in fh.readlines():
                if line.startswith('//') or len(line.strip()) == 0:
                    continue
                else:
                    matched, replaced = line.split('-->')
                    self.conversion_rules_.append((matched.strip(), replaced.strip()))

    def load_external_function_list(self):
        with open(self.external_fun_list_file_) as fh:
            for line in fh.readlines():
                if line.startswith('//') or len(line.strip()) == 0:
                    continue
                else:
                    self.external_fun_list_.append(line.strip())

    def remove_module_class_name(self):
        name_list = re.findall(self.re_module_name_, self.content_)
        for item in name_list:
            self.content_ = re.sub(item + '\\.', '', self.content_, 0, re.IGNORECASE | re.MULTILINE)

    def process_variables(self, lines):
        output_lines = []
        for line in lines:
            line = line.strip()
            if ('dim ' in line or 'const ' in line) and ',' in line:
                vars = line.split(',')
                output_lines.append(vars[0])
                for var in vars[1:]:
                    output_lines.append('dim ' + var)
            else:
                output_lines.append(line)
        return output_lines

    def is_colon_in_string(self, line):
        matched = re.search(r'([^"]*)"([^"]*)"([^"]*)', line, re.IGNORECASE)
        if matched is not None:
            if ':' in matched.group(2):
                return True
        return False

    def process_statement_separator(self, lines):
        output_lines = []
        for line in lines:
            if ':' in line and '"' not in line and 'case' not in line:
                if ("'" in line) or (re.match(r'^\s*\w+:', line))\
                        or (re.match(r'"[^"]*:[^"]*"', line))\
                        or self.is_colon_in_string(line):
                    output_lines.append(line)
                else:
                    statements = line.split(':')
                    for statement in statements:
                        output_lines.append(statement)
            else:
                output_lines.append(line)
        return output_lines

    def find_key_in_line(self, line, key_list):
        matched_key_list = []
        for key in key_list:
            lower_key = key.lower()
            matched = re.search(r'\b' + lower_key + r'\b', line, re.IGNORECASE)
            if matched is not None:
                matched_key_list.append(key)
        return matched_key_list

    def get_bracket_dict(self, line):
        bracket_ops_stack = []
        bracket_dict = {}
        length_of_line = len(line)
        for i in xrange(length_of_line):
            each_char = line[i]
            if each_char == '(':
                bracket_ops_stack.append(i)
            elif each_char == ')':
                id = bracket_ops_stack.pop()
                bracket_dict[id] = i

        if len(bracket_ops_stack) != 0:
            print line
            print "left_bracket_count is not equal to right_bracket_count"
            return False
        else:
            return bracket_dict

    def find_array_name(self):
        lines = self.content_.split('\n')
        array_set = set()
        for line in lines:
            matched = re.search(r'\b(dim|sub|function)\b', line)
            if matched is None:
                matched = re.search(r'[^\.]\b(\w+)\s*\(\s*[^\"=\n\s]+\s*\)', line, re.IGNORECASE)
                if matched is not None:
                    array_name = matched.group(1)
                    matched = re.search(r'\bset\b\s*\b' + array_name + r'\b', self.content_, re.IGNORECASE)
                    if matched is None:
                        array_set.add(array_name)
        self.array_name_list_ = [val for val in array_set if val not in self.function_name_list_ and val not in self.external_fun_list_]

    def process_array_op(self, lines):
        output_lines = []
        for line in lines:
            matched = re.search(r'^\bredim\b', line)
            if matched is None:
                matched = re.search(r'\bdim\b', line)
                if matched is not None:
                    matched = re.search(r'(\w+)\(.*\)', line, re.IGNORECASE)
                    if matched is not None:
                        array_name = matched.group(1)
                        self.array_name_list_.append(array_name)
                        output_lines.append(line)
                        continue
                matched_array_name_list = self.find_key_in_line(line, self.array_name_list_)
                if len(matched_array_name_list) > 0:
                    bracket_dict = self.get_bracket_dict(line)
                    str_list = list(line)
                    for array_name in matched_array_name_list:
                        pattern = array_name + r'\s*\('
                        for m in re.finditer(pattern, line):
                            match_str = m.group()
                            left_bracket_index = m.start() + len(match_str) - 1
                            str_list[left_bracket_index] = '['
                            str_list[bracket_dict[left_bracket_index]] = ']'
                    output_lines.append(''.join(str_list))
                else:
                    output_lines.append(line)
            else:
                output_lines.append(line)
        return output_lines

    def process_backslant_in_str(self, lines):
        output_lines = []
        backslant_parttern = re.compile(r'\"[^\"]*\\[^\"]*\"')
        for line in lines:
            matched = backslant_parttern.search(line)
            if matched is not None:
                snippets = line.split('\"')
                new_snippets = []
                for i, snippet in enumerate(snippets):
                    if i % 2 == 1:
                        snippet = snippet.replace('\\', '\\\\')
                    new_snippets.append(snippet)
                line = '\"'.join(new_snippets)
            output_lines.append(line)
        return output_lines

    def process_array_traversal(self, lines):
        output_lines = []
        for_each_pattern = re.compile(r'for each (\w+) in ([^\s]+)', re.IGNORECASE)
        in_loop_flag = False
        index_name = ''
        array_name = ''
        for line in lines:
            if in_loop_flag is False:
                param_matched = for_each_pattern.match(line.strip())
                if param_matched is not None:
                    index_name = param_matched.group(1)
                    array_name = param_matched.group(2)
                    in_loop_flag = True
            else:
                if line.strip().startswith('next'):
                    in_loop_flag = False
                else:
                    name = '%s[%s]' % (array_name, index_name)
                    line = re.sub(r'\b' + index_name + r'\b', name, line)
            output_lines.append(line)
        return output_lines

    def find_all_function_name(self):
        re_function_name = re.compile(r'(?:Function|Sub)[ \t]+(\w+)', re.IGNORECASE | re.MULTILINE)
        self.function_name_list_ = re.findall(re_function_name, self.content_)
        # Set RutRachel = GetRef("GoBar"), RutRachel need to be put in func_list
        re_ref_function_name = re.compile(r'(\w+)\s*=\s*getref\b', re.IGNORECASE)
        self.function_name_list_ += re.findall(re_ref_function_name, self.content_)
        # parse function_name in runtime_for_vbs_api
        re_function_name = re.compile(r'(?:function)\s*(\w+)', re.IGNORECASE | re.MULTILINE)
        self.function_name_list_ += re.findall(re_function_name, open(self.runtime_for_vbs_api).read())

    def process_array_in_function_params(self, func_name, line):
        matched = re.search(r'(.*)(function|sub)[ \t]*?\b' + func_name + r'\b[ \t]*?\((.+)\)(.*)', line, re.IGNORECASE)
        if matched is not None:
            params = matched.group(3).split(',')
            new_params = []
            for param in params:
                param_matched = re.search(r'\b(\w+)\b[ \t]*?\((.*)\).*', param.strip(), re.IGNORECASE)
                if param_matched is not None:
                    new_params.append(param_matched.group(1))
                else:
                    new_params.append(param)
            line = matched.group(1) + matched.group(2) + ' ' + func_name + '(' + ', '.join(new_params) + ')' + matched.group(4)
        return line

    def process_function_op(self, lines):
        output_lines = []
        for line in lines:
            if 'set' not in line:
                matched_func_name_list = self.find_key_in_line(line, self.function_name_list_)
                if len(matched_func_name_list) > 0:
                    for matched_func_name in matched_func_name_list:
                        # \b  matched_func_name  \b[ \t]*?=
                        if re.search(r'\b' + matched_func_name + r'\b[ \t]*?=', line, re.IGNORECASE) is not None:
                            line = re.sub(r'(.*?)\b' + matched_func_name + r'\b[ \t]*?=(.*)', r'\1ret_val = \2', line)
                        # \b  matched_func_name  \b[ \t]*?\w+
                        elif re.search(r'\b' + matched_func_name + r'\b[ \t]*?[\w\"]+', line, re.IGNORECASE) is not None:
                            line = re.sub(r'(.*?)\b' + matched_func_name + r'\b[ \t]*?([\w\"].*)', r'\1' + matched_func_name + r'(\2)', line)
                        else:
                            line = self.process_array_in_function_params(matched_func_name, line)
            output_lines.append(line)
        return output_lines

    def process_known_api(self, lines):
        output_lines = []
        for line in lines:
            matched_func_name_list = self.find_key_in_line(line, self.external_fun_list_)
            modified_flag = False
            if len(matched_func_name_list) > 0:
                for matched_func_name in matched_func_name_list:
                    if '(' in line and ')' in line:
                        matched = re.search(r'\.' + matched_func_name + r'\b[ \t]*?\(', line, re.IGNORECASE)
                        if matched is not None:
                            modified_flag = True
                            output_lines.append(line)
                            continue
                    matched = re.search(r'(.*?)\.' + matched_func_name + r'\b[ \t]*?(.*)', line, re.IGNORECASE)
                    if matched is not None:
                        line = matched.group(1) + '.' + matched_func_name + '(' + matched.group(2) + ')'
                        # following code doesn't work! why?
                        # line = re.sub(r'(.*?)\.' + matched_func_name + r'\b(.*)', r'\1' + matched_func_name + r'(\2)', line, re.IGNORECASE)
            if modified_flag is False:
                output_lines.append(line)
        return output_lines

    def remove_annotation(self, lines):
        output_lines = []
        for line in lines:
            line = line.strip()
            if '\'' in line:
                output_lines.append(line.split('\'')[0])
            else:
                output_lines.append(line)
        return output_lines

    def process_by_lines(self):
        lines = self.content_.split('\n')
        lines = self.remove_annotation(lines)
        lines = self.process_variables(lines)
        lines = self.process_array_op(lines)
        lines = self.process_statement_separator(lines)
        lines = self.process_backslant_in_str(lines)
        lines = self.process_array_traversal(lines)
        lines = self.process_function_op(lines)
        lines = self.process_known_api(lines)
        self.content_ = '\n'.join(lines)

    def apply_conversion_rules(self):
        for matched, replaced in self.conversion_rules_:
            self.content_ = re.sub(matched, replaced, self.content_, 0, re.IGNORECASE | re.MULTILINE)

    def dump_to_js_file(self):
        fh = open(self.js_file_, 'w')
        fh.write(self.content_)
        fh.close()

    def beautify_js(self):
        self.content_ = re.sub('\n\s*\n', '\n', self.content_)
        try:
            import jsbeautifier
            self.content_ = jsbeautifier.beautify(self.content_)
        except ImportError:
            pass

    def replace_api(self):
        converter = APIConverter(self.content_)
        self.content_ = converter.process_str()

    def convert(self):
        self.content_ = open(self.vbs_file_, 'r').read().lower()
        self.load_conversion_rules()
        self.load_external_function_list()
        self.remove_module_class_name()
        self.find_all_function_name()
        self.find_array_name()
        self.process_by_lines()
        self.replace_api()
        self.apply_conversion_rules()
        # self.beautify_js()
        self.dump_to_js_file()


def beautify_vbs(file):
    with open(file, 'r') as vbs:
        s = vbs.read().strip()
        s = re.sub(r'\n\s*\n', '\n', s)
        s = re.sub(r'\n\s*\bFunction\b', r'\n\nFunction', s)
        s = re.sub(r'\n\s*\bSub\b', r'\n\nSub', s)
        s = re.sub(r'End Function\b\s*\n', r'End Function\n\n', s)
        s = re.sub(r'End Sub\b\s*\n', r'End Sub\n\n', s)
    fh = open(file, 'w')
    fh.write(s)
    fh.close()


def print_help():
    print """
Usage:
    python vbs2js.py input_vbs function_list_file input_conversion_rules_file 
    """


if __name__ == '__main__':
    if len(sys.argv) != 2 and len(sys.argv) != 4:
        print_help()
        exit(-1)
    target_path = sys.argv[1]
    if os.path.isfile(target_path):
        file_name = os.path.split(target_path)[1]
        js_path = os.path.join(sys.path[0], file_name + '.js')
        converter = VBSConverter(target_path, js_path, sys.argv[2], sys.argv[3])
        converter.convert()        
    elif os.path.isdir(target_path):
        for vbs in os.listdir(target_path):
            if vbs.endswith(r'.vbs'):
                vbs_file = os.path.join(target_path, vbs)
                js_path = os.path.join(sys.path[0], vbs + '.js')
                converter = VBSConverter(vbs_file, js_path, sys.argv[2], sys.argv[3])
                converter.convert()
