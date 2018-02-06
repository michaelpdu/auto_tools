import xml.etree.cElementTree as ET
import itertools,copy

#when strict = True,it will raise exception if not find ek_match
strict = True
class And:
    def __init__(self,node=None):
        self._list = []
        if node != None:
            self._list.append(node)


    def bool(self):
        result = True
        for node in self._list:
            if node.bool() != True:
                result = False
                break
        return result

    def add_node(self,node):
        self._list.append(node)

    def get_leaf_list(self):
        result = []
        for node in self._list:
            if isinstance(node, Leaf):
                result.append(node)
            else:
                result.extend(node.get_leaf_list())
        return result

class Or:
    def __init__(self, node=None):
        self._list = []
        if node != None:
            self._list.append(node)

    def bool(self):
        result = False
        for node in self._list:
            if node.bool() == True:
                result = True
                break
        return result

    def add_node(self,node):
        self._list.append(node)

    def get_leaf_list(self):
        result = []
        for node in self._list:
            if isinstance(node, Leaf):
                result.append(node)
            else:
                result.extend(node.get_leaf_list())
        return result

class Leaf:
    def __init__(self,tag, bool=False):
        self.tag = tag
        self._bool = bool

    def check_tag(self,tag):
        if self.tag.lower() == tag.lower():
            self._bool = True
        else :
            self._bool = False

    def bool(self):
        return self._bool


class EKMatch:
    pass

    def __init__(self, name, condition):
        self.name = name
        self._condition = condition
        tag_dict = {}# key-value : tag-leaf
        leaf_list = self._condition.get_leaf_list()
        for leaf in leaf_list:
            tag = leaf.tag
            if tag not in tag_dict:
                tag_dict[tag] = leaf
            else:
                raise "repeat tag in one Match(repeat match in one rule)"
        self._tag_dict = tag_dict

    def get_tag_list(self):
        return [x for x in self._tag_dict]

    def check_tag(self, tag):

        if tag not in self._tag_dict:
            if strict:
                raise ValueError("not find tag %s in ek %s"%(tag,self.name))
            return False
        leaf = self._tag_dict[tag]
        leaf.check_tag(tag)
        return True

    def is_match(self):

        return self._condition.bool()




class EKCfg:
    def __init__(self, path):
        self._match_dict = {} # key-value: tag-match_list
        self._parse_xml(path)

    def _parse_xml(self, file_path):

        with open(file_path) as f:
            it = itertools.chain('<root>', f, '</root>')
            root = ET.fromstringlist(it)

        for rule in root:
            name = rule.attrib["name"]
            condition = self._create_condition(rule)
            match = EKMatch(name, condition)
            for tag in match.get_tag_list():
                if tag not in self._match_dict:
                    self._match_dict[tag] = []
                self._match_dict[tag].append(match)



    def get_new_match(self, tag):
        if tag not in self._match_dict:
            if strict:
                raise ValueError("not find tag %s in ek cfg"%(tag))

            return []
        return copy.deepcopy(self._match_dict[tag])


    def _create_condition(self, root):
        condition = And()
        if root.tag == "or":
            condition = Or()
        for child in root:

            if child.tag == "match":
                condition.add_node(Leaf(child.text))
            if child.tag == "or":
                node = self._create_condition(child)
                condition.add_node(node)
            if child.tag == "and":
                node = self._create_condition(child)
                condition.add_node(node)
        return condition
def test():
    test = EKCfg("ek_rule.cfg")
    match_a = test.get_new_match("jsb_checkav_e")[0]
    print match_a.is_match() == False
    match_a.check_tag("jsb_checkav_e")
    print match_a.is_match() == False
    match_a.check_tag("JSB_EK_DOCUMENT_SCRIPT_SETATTRIBUTE")
    print match_a.is_match() == True
    match_a_2 = test.get_new_match("jsb_checkav_e")[0]
    print match_a_2.is_match() == False


    match_b = test.get_new_match("HTML_VBS_CVE_2016_0189_A_exploit")[0]
    print match_b.is_match() == False
    match_b.check_tag("HTML_VBS_CVE_2016_0189_A_exploit")
    print match_b.is_match() == False
    match_b.check_tag("JS_VBS_CVE_2016_0189_A_valueof_fuzz")
    print match_b.is_match() == True