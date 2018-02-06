
Func Uninstall()

   run("uninstall_flash_player.exe")

   Winwait("Uninstall Adobe Flash Player")

   ControlFocus("Uninstall Adobe Flash Player", "", "Button3")
   Send("{TAB}")
   Send("{TAB}")
   send("{ENTER}")

   Sleep(5000)

   Winwait("Uninstall Adobe Flash Player")
   ControlClick("Uninstall Adobe Flash Player", "", "Button2")
EndFunc

Call(Uninstall,)

