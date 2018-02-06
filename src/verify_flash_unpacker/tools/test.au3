Func Install($package, $title)

   run($package)

   Winwait($title)

   ;check agreement
   ControlCommand($title, "", "Button5", "Check", "")
   Sleep(5)

   ;Click Install
   ControlClick($title, "", "Button2")
   Sleep(5000)

   ;Check
   ControlCommand($title, "", "Button12", "Check", "")
   Sleep(5)

   ;choose Done
   ControlClick($title, "", "Button9")
EndFunc

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

$package = $CmdLine[1]
$title = $CmdLine[2]

Call(Uninstall,)
Sleep(5)

Call("Install", $package, $title)
