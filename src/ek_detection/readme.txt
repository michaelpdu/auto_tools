1.AutoCheckAndWriteToExcel.py
  this script has three parametes:argv[1]   rawfile path    argv[2] SIETool path   argv[3] SALineup path
  if you forget this script need which arguments,you can run this script with none paraments,then will tell you in the console!
  this script scan every rawfile which this rawfile folder is a kind of EK's child directionary. for example:rawfile folder has AnglerEK folder,and AnglerEK folder has many child directionary that 2014-02-26-Angler-EK-traffic.Then this script look 2014-02-26-Angler-EK-traffic as a goal to scan and analysize this result.
  you can change a flag which it's name is SALflag that this value default is False, and this identify only run SIETool to scan sample,if you want to use SALineup at the same time ,then change this flag to True.

2.AutoCheckAndWriteToExcel2.py
   this script difference from 1 is this script scan EK folder,for example, scan AnglerEK folder directly.
   the above .py will create some excel,and save in the ExcelResult folder

3.AutoConvertToSaz.py
  if you don't know this script need which paraments,you can run it with none paraments,then will tell you in the console. at last ,it will create sat folder at the same path which content is corresponds to the pacp content!

4. saz_extractor.py
  if you don't know this script need which paraments,you can run it with none paraments,then will tell you in the console. at last ,it will create rawfile folder at the same path which content is corresponds to the saz content!

5.SmartDect.py
  this script is main to solve this problem which when new pcap file in the folder we can only handle this part but  old part.
  if you don't know this script need which paraments,you can run it with none paraments,then will tell you in the console. it will create pcapnamelist.txt in the current dir which it recored exists pcap file.
  
6.pcap_to_saz.py
	replace custome rule which support script import and savesaz
	open fiddler manually,set fiddler dir ,pcap dir, saz dir in pcap_to_saz.py,put pcap file in pcap dir manually,
	run :python pcap_to_saz.py