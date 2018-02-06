import ConfigParser
import os
import subprocess
import shutil
from verifier import AutoVerifier
from logging import debug as _d
import _winreg
import platform

class player_verify:
    """
    The tool is to verify flash player hook tools
    """
    def __init__(self, config):
        _d("config_file is {0}".format(config))
        self.cfg = ConfigParser.ConfigParser()
        self.cfg.read(config)
        
        self.root = self.cfg.get('script', 'root')
        self.backup_root = os.path.join(self.root, 'src', 'backup')
        self.sample = os.path.join(self.root, 'sample')
        self.tools = os.path.join(self.root, 'tools')
        self.report = os.path.join(self.root, 'report')
        self.csv = os.path.join(self.root, 'src', 'unpack_result.cvs')

        self.players = self.cfg.get('flash_player', 'version')

    def platformIsWinxpOrWin7(self):
        platform_info = platform.platform()
        return platform_info.startswith("Windows-7") or platform_info.startswith("Windows-XP")
        
    def test_player(self, player, reinstall = 0):
        if reinstall == 1:
            #re install flash player
            package = self.cfg.get(player, 'package')
            title =  self.cfg.get(player, 'title')
            exe = self.cfg.get(player, 'exe')
            
            _d('begin to test {0}: package:{1}, title:{2}'.format(player, package, title))
            
            _d('try to uninstall old version and install the player: {0}'.format(player))
            cmd = '{0} {1} {2}'.format(exe, package, title)
            p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, cwd=self.tools)
            (stdoutput, erroutput) = p.communicate()
            _d('output is {0}'.format(stdoutput))

        _d('begin to inject dll and verify sample')
        verifier = AutoVerifier()
        verifier.proc_flash_folder(self.sample)
        verifier.__del__

        _d('backup the test-raw data and report')
        play_report = os.path.join(self.report, player)
        if os.path.exists(play_report):
            shutil.rmtree(play_report)
        
        shutil.copytree(self.backup_root, play_report)
        shutil.copyfile(self.csv, os.path.join(self.report, player+'.cvs'))

    def test_playerlist(self, reinstall = 1):
        if self.platformIsWinxpOrWin7():
            playerlist = self.players.split(',')
            for player in playerlist:
                self.test_player(player.strip(), reinstall)
        else:
            key = _winreg.OpenKey(_winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Macromedia\FlashPlayerActiveX", 0, _winreg.KEY_QUERY_VALUE)
            version, type = _winreg.QueryValueEx(key, "Version")
            _winreg.CloseKey(key)
            player = "buildin_flash_"+version
            self.test_player(player.strip(), 0)
            
    
if __name__ == '__main__':
    player = player_verify('flash.cfg')
    #player.test_player('flashplayer_9', 1)
    player.test_playerlist()
