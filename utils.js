var urlHelper = require('url');
var http = require('follow-redirects').http;
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var config = require('./config');
var fs = require('fs'),
    path = require('path');

exports.log = log = function() {
    var argu = arguments;
    var logPath = path.join(__dirname, 'log', currentDate() + '.txt');
    fs.exists(logPath, function() {
        fs.appendFile(logPath, currentTime() + '=>' + [].slice.call(argu).join(' ') + '\n', function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log.apply(this, argu);
            }
        });
    });
};

/**
 * 记录异常
 * @param title
 * @param contentOrError
 */
exports.error = function(title, err) {
    if (err instanceof Error) {
        log(title + ":" + err.message, err.stack);
    }
};

/**
 * 下载网页
 * @param url
 * @param callback
 */
exports.downloadPage = function(url, callback) {
    try {

        var parser = urlHelper.parse(url);

        if (config.proxyConfig.on) {
            http.get({
                hostname: config.proxyConfig.host,
                port: config.proxyConfig.port,
                path: url,
                headers: {
                    Host: parser.hostname,
                    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.146 Safari/537.36'
                }
            }, function(res) {
                if (res.statusCode == 200) {
                    var buffer = new BufferHelper();
                    res.on('data', function(data) {
                        buffer.concat(data);
                    }).on('end', function() {
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
            }).on('error', function(error) {
                callback(error);
            });
        } else {
            http.get({
                hostname: parser.hostname,
                port: 80,
                path: parser.pathname,
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.146 Safari/537.36'
                }
            }, function(res) {
                if (res.statusCode == 200) {
                    var buffer = new BufferHelper();
                    res.on('data', function(data) {
                        buffer.concat(data);
                    }).on('end', function() {
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
            }).on('error', function(error) {
                callback(error);
            });
        }
    } catch (e) {
        log('download page error', url, e);
        callback(e);
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
    } catch (e) {}

    try {
        charset = headers["content-type"].match(/charset=(.*)/gi)[1];
        if (charset) {
            return charset;
        }
    } catch (e) {}
    return '';
}

/**
 * 检测是否为有效的url地址
 * @param  {String} input [description]
 * @return {boolean}       [description]
 */
exports.validUrl = function(input) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(input);
};

/**
 * 获取当前时间
 * @returns {string}
 */
exports.currentTime = currentTime = function() {
    var now = new Date();
    return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDay() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
};

/**
 * 返回当前日期
 * @type {currentDate}
 */
exports.currentDate = currentDate = function() {
    var now = new Date();
    return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDay()
};

/**
 * 获取本次任务保存的文件夹，如果不存在，创建
 * @param callback
 */
exports.getSaveFolder = function(callback) {
    var url = config.taskConfig.startUrl;
    var hostName = urlHelper.parse(url).hostname;
    var dir = path.join(__dirname, 'file', hostName);
    fs.stat(dir, function(err, stats) {
        if (err || !stats.isDirectory()) {
            fs.mkdir(dir, function() {
                callback(dir);
            });
        } else {
            callback(dir);
        }
    });
}
