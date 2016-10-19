(function() {
    var socket = new WebSocket('ws://' + location.host + '/watch', 'ws');
    var prefix = location.href.split('/').slice(0,3).join('/') + '/';
    function watch(url) {
        if (!url.startsWith(prefix)) return;
        if (url.indexOf('__devserver__') >= 0) return;
        if (url.indexOf('?') >= 0) {
            url = url.slice(0, url.indexOf('?'));
        }
        socket.send(url.slice(prefix.length));
    }
    socket.onopen = function() {
        watch(document.location.href);
        for (var tag of document.getElementsByTagName('script')) {
            watch(tag.src);
        }
        for (var tag of document.getElementsByTagName('link')) {
            watch(tag.href);
        }
    };
    socket.onmessage = function(e) {
        var eventType = e.data.split(' ')[0];
        var filename = e.data.split(' ')[1];
        if (eventType == 'change') {
            location.reload();
        }
    };
    socket.onclose = function(e) {
        console.log('socket close');
    };
    socket.onerror = function(e) {
        console.log('socket error', e);
    };

})();
