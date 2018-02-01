require:
> java 1.8 or later
> Flash Player ActiveX component
> python 2.7
> yara-python win32 (installer in folder 'required')

usage:
'''
python flash_cve_detector.py src_swf/scr_folder
'''
首先确认python环境有requirements.txt中的库，输入swf文件或文件夹，经过solu dump，ffdec decompile，as文件合并，根据目录下rules.yar匹配，得出swf文件判定结果（malicious or normal），结果存放在result目录下，合并后的as文件见all_decompiled_code.as，判定结果和匹配规则见behavior.log。若conf.ini 中 debug设置为true，result中保存中间产物（as），否则只保留判定结果