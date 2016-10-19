// var fs = require('fs');
// var path = require('path');
// var crypto = require('crypto');
// var child_process = require('child_process');
// var minimist = require('minimist');
// var express = require('express');
// var morgan = require('morgan');
// var bodyParser = require('body-parser');
// var expressGrabBody = require('express-grab-body');
// var cookieParser = require('cookie-parser')
// var expressWs = require('express-ws');
// var serveCgi = require('serve-cgi');

// var args = minimist(process.argv.slice(2));


res.sendFile(path_to_file);

exports = function expressDevAutoReload(options) {
    return function expressDevAutoReload(req, res, next) {
        console.log('XXX', req.path);
        next();
    }
}

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

// var devserver = express();
// devserver.use(express.static(__dirname + '/client', {
//     dotfiles: 'ignore',
//     etag: true
// }));

// var app = express();

// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.send('Fatal error!', 500);
// });

// app.use(expressGrabBody.init());
// app.use(cookieParser('s3cr3t#'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(expressGrabBody.grab());
// app.use(morgan(':method :url :status :response-time'))
// expressWs(app);

// app.use(expressFilterResponse((req, res, body, callback) => {
//     if (res.getHeader('Content-Type') && res.getHeader('Content-Type').startsWith('text/html')) {
//         body = body.toString();
//         var pos = body.search(new RegExp('</ *body *>', 'i'));
//         if (pos == -1) pos = body.length;
//         body = body.slice(0, pos) + '<script src="/__devserver__/livereload.js"></script>\n' + body.slice(pos);
//     }
//     callback(body);
// }));

// app.use(serveCgi({
//   root: process.cwd(),
//   roles: {
//     '.php': '/usr/local/bin/php-cgi',
//     '.py': '/usr/local/bin/python'
//   },
//   indexes: ['index.php', 'index.sh']
// }));

// app.use(express.static(process.cwd(), {
//     dotfiles: 'ignore',
//     etag: true
// }));

// app.use('/__devserver__', devserver)

// function sha1file(path, callback) {
//     var fd = fs.createReadStream(path);
//     var hash = crypto.createHash('sha1');
//     hash.setEncoding('hex');
//     fd.on('error', function(e) {
//         callback(e);
//     });
//     fd.on('end', function() {
//         hash.end();
//         callback(null, hash.read());
//     });
//     fd.pipe(hash);
// }

// app.ws('/watch', function(ws, req) {
//     ws.on('message', function(msg) {
//         try {
//             var realPath = path.join(process.cwd(), msg);
//             sha1file(realPath, function(e, currentHash) {
//                 var watcher;
//                 try {
//                     if (e) throw e;
//                     watcher = fs.watch(realPath, {}, function(eventType, filename) {
//                         sha1file(realPath, function(e, hash) {
//                             try {
//                                 if (e) throw e;
//                                 if (hash == currentHash) return;
//                                 currentHash = hash;
//                                 ws.send(eventType+' '+msg+' '+hash);
//                             } catch (e) {
//                                 try { ws.send('error '+msg+' '+e); } catch (f) {};
//                                 watcher.close();
//                             }
//                         });
//                     });
//                 } catch (e) {
//                     try { ws.send('error '+msg+' '+e); } catch (f) {};
//                     if (watcher) watcher.close();
//                 }
//             });
//         } catch (e) {
//             try { ws.send('error '+msg+' '+e); } catch (f) {};
//         }
//     });
// });

// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.send('Fatal error!', 500);
// });

// app.listen(args.port || 3000, args.bind || 'localhost');
