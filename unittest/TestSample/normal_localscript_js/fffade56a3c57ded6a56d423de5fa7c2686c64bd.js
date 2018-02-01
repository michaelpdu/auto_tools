
var g_strAOUrl = "";
var g_strAOData = "";
var g_strAOAction = "";
var g_bDataPosted = false;

function AO_DoFSCommand(command, args)
{
	args = String(args);
	command = String(command);

	var arrArgs = args.split(g_strDelim);
	
	switch (command)
	{
		case "BW_StoreAOData":

			g_strAOUrl = unescape(arrArgs[0]);
			g_strAOAction = unescape(arrArgs[1]);
			g_strAOData = unescape(arrArgs[2]);
			break;
		case "BW_ClearAOData":
			g_strAOUrl = "";
			g_strAOAction = "";
			g_strAOData = "";		
			break;
	}
}

function CreateXmlHttp()
{
	var xmlHttp = null;
	var arrCtrlName = new Array("MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHttp");
	var nIndex = 0;
	
	if (window.XMLHttpRequest) 
	{
		try
		{
			xmlHttp = new XMLHttpRequest();
		}
		catch (e)
		{
			xmlHttp = null;
		}
	}
	
	if (xmlHttp == null && window.ActiveXObject)
	{
		// Use the ActiveX Control
		while (xmlHttp == null && nIndex < arrCtrlName.length)
		{
			try
			{
				xmlHttp = new ActiveXObject(arrCtrlName[nIndex]);
			}
			catch (e)
			{
				xmlHttp = null;
			}
			
			nIndex++;
		}

	}

	return xmlHttp;
}

function DoAOOnUnload()
{
	if (g_strAOUrl !="" && g_strAOData != "" && g_strAOAction != "")
	{
		if (!g_bDataPosted)
		{
			PostAORequest(g_strAOUrl, g_strAOData, g_strAOAction);
			g_bDataPosted = true;
		}
	}	
}

function PostAORequest(strApiUrl, strXmlData, strRequestAction)
{
	var xmlHttp = CreateXmlHttp();
	
	if (xmlHttp != null)
	{
		try
		{
			xmlHttp.open("POST", strApiUrl, false);
			xmlHttp.setRequestHeader("SOAPAction", strRequestAction);
			xmlHttp.send(strXmlData);
			
			if(xmlHttp.status != 200)
			{	
				if(confirm("Could not save the AO data. You may need to login again. Retry?"))
				{		    
					PostAORequest(strApiUrl, strXmlData, strRequestAction);
					return;
				}
			}
			
		}
		catch (error)
		{
		    if(confirm("Unable connect to server.  Please verify you can connect to the internet. Retry?"))
		    {		    
			    PostAORequest(strApiUrl, strXmlData, strRequestAction);
				return;
		    }
		    else
		    {
			    alert("Request to the url "+ strApiUrl +" failed for the following reason: " + error);
		    }
		}
	}
}


