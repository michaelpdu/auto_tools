var FirefoxCom = new function() {
    this.initJS = function(callIn) {
        this._callIn = callIn;
    };
    this.request = function(type, data) {
        //"externalCom", {action: "register", functionName: functionName, remove: hasNullCallback}
        print('type = ' + type);
        print('action = ' + data.action);
        print('functionName = ' + data.functionName);
        print('remove = ' + data.hasNullCallback);

        switch (data.action) {
            case 'register':
                break; // do nothing atm
            default:
                throw new Error('Unexpected FirefoxCom.request(' + data.action + ')');
        }
    };
    this.requestSync = function(type, data) {
        //"externalCom", {action: "eval", expression: expression, request: request}
        print('type = '+type);
        print('action = '+data.action);
        print('expression = '+data.expression);
        print('request = '+data.request);

        var objId = "jwplayerObjectId";
        switch (data.action) {
            case 'eval':
                var expr = data.expression;
                var msg = 'ExternalInterface->FirefoxCom.requestSync->eval=' + expr;
                print(msg);
                TMSA_INFO(msg);

                if (expr.indexOf('jwplayer.utils.tea.decrypt') >= 0) {
                    return "<string></string>";
                } else if (expr.indexOf('jwplayer.embed.flash.getVars') >= 0) {
                    return '';
                } else if (expr.indexOf('jwplayer.playerReady') >= 0) {
                    // TODO client calls back jwAddEventListener, jwGetWidth/jwGetHeight
                    return "<undefined/>";
                } else if (expr.indexOf('userAgent') >= 0) {
                    TMSA_INFO("call ExternalInterface to get userAgent");
                    return "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; MS-RTC LM 8; .NET4.0C; .NET4.0E; Zune 4.7)";
                } else {
                    //throw new Error('Unexpected FirefoxCom.requestSync(eval)');
                }
                break;
            case 'getId':
                return objId;
            default:
                throw new Error('Unexpected FirefoxCom.requestSync(' + data.action + ')');
        }
    };
}
