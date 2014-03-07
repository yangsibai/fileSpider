var urlUtil = require('url');
var http = require('follow-redirects').http;
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var dbHelper = require('./dbHelper');
var config = require('./config');

exports.log = function () {
    var argu = arguments;
    var logPath = path.join(__dirname, '..', 'log', utils.currentDate() + '.txt');
    fs.exists(logPath, function () {
        fs.appendFile(logPath, utils.currentTime() + '=>' + [].slice.call(argu).join(' ') + '\n', function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log.apply(this, argu);
            }
        });
    });
};

/**
 * 记录trace信息
 * @param title
 * @param content
 * @param @optional callback
 */
exports.trace = function (title, content, callback) {
    dbHelper.addErrorTrace(title, content, 1, callback);
};

/**
 * 记录异常
 * @param title
 * @param contentOrError
 * @param @optional callback
 */
exports.error = function (title, contentOrError, callback) {
    if (contentOrError instanceof Error) {
        // contentOrError is a error now
        dbHelper.addErrorTrace(title + ":" + contentOrError.message, contentOrError.stack, 0, callback);
    }
    else {
        dbHelper.addErrorTrace(title, contentOrError, 0, callback);
    }
};

/**
 * 下载网页
 * @param url
 * @param callback
 */
exports.downloadPage = function (url, callback) {
    var parser = urlUtil.parse(url);

    if (config.proxyConfig.on) {
        http.get({
            hostname: config.proxyConfig.host,
            port: config.proxyConfig.port,
            path: url,
            headers: {
                Host: parser.hostname,
                'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.146 Safari/537.36'
            }
        },function (res) {
            if (res.statusCode == 200) {
                var buffer = new BufferHelper();
                res.on('data',function (data) {
                    buffer.concat(data);
                }).on('end', function () {
                        var buf = buffer.toBuffer();
                        var result = buf.toString();
                        var charset = getCharset(res.headers, result) || 'utf-8';
                        var body = iconv.decode(buf, charset);
                        body = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<!--[\s\S]*?-->/gi, ''); //移除script标签，移除注释
                        callback(null, body);
                    });
            } else {
                callback(new Error("status code:" + res.statusCode));
            }
        }).on('error', function (error) {
                callback(error);
            });
    }
    else {
        http.get({
            hostname: parser.hostname,
            port: 80,
            path: parser.pathname,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.146 Safari/537.36'
            }
        },function (res) {
            if (res.statusCode == 200) {
                var buffer = new BufferHelper();
                res.on('data',function (data) {
                    buffer.concat(data);
                }).on('end', function () {
                        var buf = buffer.toBuffer();
                        var result = buf.toString();
                        var charset = getCharset(res.headers, result) || 'utf-8';
                        var body = iconv.decode(buf, charset);
                        body = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<!--[\s\S]*?-->/gi, ''); //移除script标签，移除注释
                        callback(null, body);
                    });
            } else {
                callback(new Error("status code:" + res.statusCode));
            }
        }).on('error', function (error) {
                callback(error);
            });
    }
};

/**
 * 获取编码
 * @param  {[type]} headers [description]
 * @param  {[type]} body    [description]
 * @return {string}         [description]
 */

function getCharset(headers, body) {
    var charset;
    try {
        var re = /<meta[^>]*charset=['"]?([^'"]*)/gi;
        var arr = re.exec(body);
        charset = arr[1];
        if (charset) {
            return charset;
        }
    } catch (e) {
    }

    try {
        charset = headers["content-type"].match(/charset=(.*)/gi)[1];
        if (charset) {
            return charset;
        }
    } catch (e) {
    }
    return '';
}

/**
 * 检测是否为有效的url地址
 * @param  {String} input [description]
 * @return {boolean}       [description]
 */
exports.validUrl = function (input) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(input);
};

/**
 * 获取当前时间
 * @returns {string}
 */
exports.currentTime = function () {
    var now = new Date();
    return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDay() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
};