var FileLoadingService = {
  createSession: function () {
    return {
      open: function (request) {
        if (request.url.indexOf('http://s.youtube.com/stream_204') === 0) {
          // No reason to send error report yet, let's keep it this way for now.
          // 204 means no response, so no data will be expected.
          print('YT_CALLBACK: ' + request.url);
          this.onopen && this.onopen();
          this.onclose && this.onclose();
          return;
        }

        var self = this;
        var path = FileLoadingService.resolveUrl(request.url);
        print('FileLoadingService: loading ' + path + ", data: " + request.data);
        TMSA_INFO('FileLoadingService: loading ' + path);
        var reader = new BinaryFileReader(path, request.method, request.mimeType, request.data);
        if (!useFakeXHR) {
          reader.readAsync(
            function (data, progress) {
              self.onprogress(data, {bytesLoaded: progress.loaded, bytesTotal: progress.total});
            },
            function (e) { self.onerror(e); },
            self.onopen,
            self.onclose,
            self.onhttpstatus
          );
        } else {
          reader.readAsyncFake(
            function (data, progress) {
              self.onprogress(data, {bytesLoaded: progress.loaded, bytesTotal: progress.total});
            },
            function (e) { self.onerror(e); },
            self.onopen,
            self.onclose,
            self.onhttpstatus
          );
        }
      }
    };
  },
  setBaseUrl: function (url) {
    FileLoadingService.baseUrl = url || '#';
    print('Set base URL: ' + FileLoadingService.baseUrl);
    //var a = document.createElement('a');
    //a.href = url || '#';
    //a.setAttribute('style', 'display: none;');
    //document.body.appendChild(a);
    //FileLoadingService.baseUrl = a.href;
    //document.body.removeChild(a);
  },
  resolveUrl: function (url) {
    if (url.indexOf('://') >= 0) {
      print('Resolve URL: ' + url);
      return url;
    }

    var base = FileLoadingService.baseUrl || '';
    base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
    if (url.indexOf('/') === 0) {
      var m = /^[^:]+:\/\/[^\/]+/.exec(base);
      if (m) base = m[0];
    }
    print('Resolve URL: ' + base + url);
    return base + url;
  }
};
