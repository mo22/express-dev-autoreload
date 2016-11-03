const watch = require('node-watch');
const expressModifyResponse = require('express-modify-response');

module.exports = function expressDevAutoReload(options) {
    var queue = [];
    var watcher = watch(process.cwd(), (filename) => {
        for (var i of queue) {
            try {
                i(filename);
            } catch (e) {
                console.log(e.stack);
            }
        }
        queue = [];
    });
    return function expressDevAutoReload(req, res, next) {
        if (req.path == '/__dev_autoreload__/livereload.js') {
            res.sendFile(__dirname + '/livereload.js');
            return;
        }
        if (req.path == '/__dev_autoreload__/watch') {
            queue.push(() => {
                res.send('ok');
            });
            return;
        }
        expressModifyResponse((req, res) => {
            return res.getHeader('Content-Type') && res.getHeader('Content-Type').startsWith('text/html');
        }, (req, res, body) => {
            body = body.toString();
            var pos = body.search(new RegExp('</ *body *>', 'i'));
            if (pos == -1) pos = body.length;
            body = body.slice(0, pos) + '<script src="/__dev_autoreload__/livereload.js"></script>\n' + body.slice(pos);
            return body;
        })(req, res, next);
    }
}

