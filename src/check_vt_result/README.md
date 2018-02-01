### vt_public.py
```
python vt_public.py sha1s.txt
```
> 在VT中搜索.txt中所有文件名（一行一个），提取返回的部分检测数据（认为是Malicious的比例，Sophos、Kaspersky、ESET-NOD32、Microsoft四家厂商的判定结果），写入同路径下report.csv
> PS：受public API限制，一分钟只能发送4次请求，若需要处理大量文件，可考虑申请多个账户，使用多个public API轮流发送请求，或申请private API