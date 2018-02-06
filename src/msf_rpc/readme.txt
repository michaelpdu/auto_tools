[*] install module in pre-install folder firstly

client: 
1. install Python(2.7.6 in my machine) and msfrpc(https://github.com/SpiderLabs/msfrpc)
2. install Fiddler(2.6.1.4 in my machine) 
3. replace CustomRules.js(Note: savesaz and clear commands are necessary)

server:
4. replace ruby file
5. startup MSF RPC Server
>> load msgrpc ServerHost=server ip ServerPort=55553 User=test Pass='111111'


client:
6. startup Fiddler
7. generate sample: modify modules.cfg and run msfrpc_auto.py
8. check and extract:
                    modify saz_check.cfg
                    check saz: python check.py
                    extract malicious file from saz:python check.py extract

check.py:
    execute:
        python check.py (only print check result,won't extract)
        python check.py extract (check and extract)

