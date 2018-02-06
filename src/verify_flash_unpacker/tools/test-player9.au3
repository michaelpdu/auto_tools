Func Uninstall()

   run("install_flash_player_9_active_x_32bit.exe")
   Winwait("Adobe Flash Player ActiveX Setup: Completed")
   Sleep(4)
   Send("!c")

EndFunc

Call(Uninstall,)