const watch = require('node-watch');

function expressFilterResponse(checkCallback, modifyCallback)
{
    return function expressFilterResponse(req, res, next) {
        var _end = res.end;
        var _write = res.write;
        var buffers = [];
        var addBuffer = (chunk, encoding) => {
            if (chunk === undefined) return;
            if (typeof chunk === 'string') {
                chunk = new Buffer(chunk, encoding);
            }
            buffers.push(chunk);
        };
        res.write = function write(chunk, encoding) {
            if (!res.headersSent) {
                var hook = checkCallback(req, res);
                if (!hook) {
                    res.end = _end;
                    res.write = _write;
                    res.write(chunk, encoding);
                } else {
                    addBuffer(chunk, encoding);
                }
            } else {
                addBuffer(chunk, encoding);
            }
        };
        res.end = function end(chunk, encoding) {
            addBuffer(chunk, encoding);
            var buffer = Buffer.concat(buffers);
            Promise.resolve(modifyCallback(req, res, buffer)).then((result) => {
                if (res.getHeader('Content-Length')) {
                    res.setHeader('Content-Length', String(result.length));
                }
                res.end = _end;
                res.write = _write;
                res.write(result);
                res.end();
            }).catch((e) => {
                // handle?
                next(e);
            });
        };
        next();
    };
}

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
        expressFilterResponse((req, res) => {
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

