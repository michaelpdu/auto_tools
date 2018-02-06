How to use ptn_creator to build SAL pattern?
1. copy 'pattern' folder from INT branch to current folder
2. copy previous 2.5.xxxx_pattern_sal.zip to current folder
3. run 'python ptn_creator.py uni_pattern_version osce_pattern_version SAL'
OR run 'python ptn_creator.py sal-auto'

How to use ptn_creator to build BEP pattern?
1. copy 'tmbep.cfg' and 'rankdb' folder from INT branch to current folder
2. copy previous 7.5.xxxx_pattern_bep.zip to current folder
3. run 'python ptn_creator.py uni_pattern_version osce_pattern_version BEP'
OR run 'python ptn_creator.py bep-auto'

How to use ptn_extractor to extract SAL/BEP pattern?
1. copy a.zip(such as, 2.5.2385_pattern_sal(based_on_122213.0.0).zip) and b.zip(such as, 2.5.2386_pattern_sal(based_on_122313.0.0).zip) to current folder
2. run python ptn_extractor.py