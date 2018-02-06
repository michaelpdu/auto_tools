@echo off
@echo %time%
REM %1:fiddler path    %2:pcapfile path    %3  SIETool path %4  SALTool path
set arg1=%1
set arg2=%2
set arg3=%3
cd E:\mywork\mywork 
python SmartDect.py %arg2%
REM python AutoConvertToSaz.py "E:\mywork\pcap" "C:\Program Files (x86)\Fiddler2"
echo %ERRORLEVEL%
if %ERRORLEVEL%==1 exit/b
python AutoConvertToSaz.py %arg1% %arg2%
echo %ERRORLEVEL%
if %ERRORLEVEL%==1 exit /b

REM python AutoConvertToRaw.py "E:\mywork\saz"

set sazfilepath=%arg2%
python AutoConvertToRaw.py %sazfilepath%
echo %ERRORLEVEL%
if %ERRORLEVEL%==1 exit/b

REM python CreateExcel.py "E:\mywork\raw_file" "E:\mywork\Job2\SIE"
set rawfilepath=%sazfilepath%
python CreateExcel.py %rawfilepath% %arg3% %arg4%
echo %ERRORLEVEL%
if %ERRORLEVEL%==1 exit/b
echo %time%
pause