var utils = require('./utils');
var config = require('./config');
var redisHelper = require('./redisHelper');
var urlHelper = require('url');
var uuid = require('node-uuid');
var fs = require('fs'), path = require('path');
var http = require('http');

/**
 * 初始化
 * @param callback
 */
exports.init = function (callback) {
    resolveUrl(config.taskConfig.startUrl, callback);
}

/**
 * 从redis中取出地址进行解析
 */
exports.worker = function () {
    redisHelper.popUrl(function (err, url) {
        if (!err && url) {
            console.log('解析地址：' + url);
            resolveUrl(url);
        }
    })
}

/**
 * 解析给定的地址
 * @type {resolveUrl}
 */
exports.resolveUrl = resolveUrl = function (url, callback) {
    utils.downloadPage(url, function (err, body) {
        if (err) {
            utils.error('download page', err);
            if (typeof callback === 'function') {
                callback(err);
            }
        }
        else {
            try {
                var srcPatter = /src=('|")([^"']*)('|")/gi;
                var match = srcPatter.exec(body);
                while (match != null) {
                    var src = urlHelper.resolve(url, match[2]);
                    if (config.taskConfig.filePattern.test(src)) {
                        redisHelper.pushFileUrl(src);
                    }
                    match = srcPatter.exec(body);
                }

                var hrefPatter = /href=('|")([^"']*)('|")/gi;
                var hrefMatch = hrefPatter.exec(body);
                while (hrefMatch != null) {
                    var href = urlHelper.resolve(url, hrefMatch[2]);
                    if (config.taskConfig.sitePattern.test(href)) {
                        redisHelper.pushUrl(href);
                    }
                    hrefMatch = hrefPatter.exec(body);
                }
                if (typeof callback === 'function') {
                    callback(null);
                }
            }
            catch (e) {
                if (typeof callback === 'function') {
                    callback(e);
                }
            }
        }
    });
};

/**
 * 下载文件
 */
exports.downloadWorker = function () {
    redisHelper.popFileUrl(function (err, url) {
        if (!err && url) {
            downloadFile(url);
        }
    });
};

/**
 * 下载文件
 * @param url
 */
exports.downloadFile = downloadFile = function (url, callback) {
    try {
//        var now = new Date();
        var fileName = uuid.v4();
        if (url.toLowerCase().indexOf('png') !== -1) {
            fileName += '.png';
        }
        else {
            fileName += '.jpg';
        }
        var filePath = path.join(__dirname, 'file', fileName);
        var file = fs.createWriteStream(filePath);
        var urlParser = urlHelper.parse(url);
        if (config.proxyConfig.on) {
            var options = {
                host: config.proxyConfig.host,
                port: config.proxyConfig.port,
                path: url,
                headers: {
                    Host: urlParser.hostname
                }
            };
            var request = http.get(options, function (response) {
                response.pipe(file);
            });
        }
        else {
            var request = http.get(url, function (response) {
                response.pipe(file);
            });
        }
    }
    catch (e) {
        console.log(e.message);
        callback(e);
    }
};