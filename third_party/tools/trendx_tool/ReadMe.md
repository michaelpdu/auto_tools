trendx - python
=================

[trendx] 是用于恶意代码检测的工具。我在此基础上增加了对sample集合进行检测以及保存结果到csv的功能。

使用方法:
------
对单个sample检测：

python run.py sample_path

或对多个sample检测：

python dir_csv.py sample_dir

运行环境:
-------------------------
- [xgboost]
- [numpy]
- [scipy]
- [six]
- [pandas]
- [dateutil]
- [scikit-learn]

Note：以上部分模块的win32-python2.7版本可以在\\nj-fs2\home1\Feihao_Chen\software拿到，推荐使用anaconda环境。
xgboost的安装可以参考[官方文档](https://xgboost.readthedocs.io/en/latest/build.html)，源码参见[Github](https://github.com/dmlc/xgboost)。
新版本产生大量log，使用时若有需要最好导出到文件。