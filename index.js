const watch = require('node-watch');

function expressFilterResponse(modifyCallback)
{
    return function expressFilterResponse(req, res, next) {
        var _end = res.end;
        var _write = res.write;
        var buffers = [];
        res.write = function write(chunk, encoding) {
            if (typeof chunk === 'string') {
                chunk = new Buffer(chunk, encoding);
            }
            buffers.push(chunk);
        };
        res.end = function end(chunk, encoding) {
            if (chunk) {
                if (typeof chunk === 'string') {
                    chunk = new Buffer(chunk, encoding);
                }
                buffers.push(chunk);
            }
            if (buffers.length == 0) {
                _end.call(this);
                return;
            }
            var buffer = Buffer.concat(buffers);
            modifyCallback(req, res, buffer, (result) => {
                if (typeof res.statusCode == 'string'){
                    res.statusCode = res.statusCode.split(' ')[0] | 0;
                }
                res.setHeader('Content-Length', String(result.length));
                _write.call(this, result);
                _end.call(this);
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
        expressFilterResponse((req, res, body, callback) => {
            if (res.getHeader('Content-Type') && res.getHeader('Content-Type').startsWith('text/html')) {
                body = body.toString();
                var pos = body.search(new RegExp('</ *body *>', 'i'));
                if (pos == -1) pos = body.length;
                body = body.slice(0, pos) + '<script src="/__dev_autoreload__/livereload.js"></script>\n' + body.slice(pos);
            }
            callback(body);
        })(req, res, next);
    }
}

