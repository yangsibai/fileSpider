var utils = require('./utils');
var config = require('./config');
var redisHelper = require('./redisHelper');
var urlHelper = require('url');
var uuid = require('node-uuid');
var fs = require('fs'),
    path = require('path');
var http = require('http');

/**
 * 初始化
 * @param callback
 */
exports.init = function(callback) {
    redisHelper.displayStatus();
    utils.getSaveFolder(function() {
        resolveUrl(config.taskConfig.startUrl, callback);
    });
};

/**
 * 从redis中取出地址进行解析
 */
exports.worker = function() {
    redisHelper.popUrl(function(err, url) {
        if (!err && url) {
            resolveUrl(url);
        }
    })
}

/**
 * 解析给定的地址
 * @type {resolveUrl}
 */
exports.resolveUrl = resolveUrl = function(url, callback) {
    utils.downloadPage(url, function(err, body) {
        if (err) {
            utils.error('download page', err);
            if (typeof callback === 'function') {
                callback(err);
            }
        } else {
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
                    if (config.taskConfig.filePattern.test(href)) {
                        redisHelper.pushFileUrl(href);
                    } else if (config.taskConfig.sitePattern.test(href)) {
                        redisHelper.pushUrl(href);
                    }
                    hrefMatch = hrefPatter.exec(body);
                }
                if (typeof callback === 'function') {
                    callback(null);
                }
            } catch (e) {
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
exports.downloadWorker = function() {
    redisHelper.popFileUrl(function(err, url) {
        if (!err && url) {
            downloadFile(url);
        }
    });
};

/**
 * 下载文件
 * @param url
 */
exports.downloadFile = downloadFile = function(url, callback) {
    try {
        if (config.proxyConfig.on) {
            var urlParser = urlHelper.parse(url);
            var options = {
                host: config.proxyConfig.host,
                port: config.proxyConfig.port,
                path: url,
                headers: {
                    Host: urlParser.hostname
                }
            };
            var request = http.get(options, function(response) {
                saveFile(response, url);
            });
        } else {
            var request = http.get(url, function(response) {
                saveFile(response, url);
            });
        }
    } catch (e) {
        console.log(e.message);
        callback(e);
    }
};

/**
 * 保存文件
 * @param  {[type]} httpResponse [description]
 * @return {[type]}              [description]
 */

function saveFile(httpResponse, url) {
    if (httpResponse.statusCode === 200) {
        var length = (httpResponse.headers['content-length'] || 0) / 1024;
        if (length && length >= config.taskConfig.minSizeByKb && length <= config.taskConfig.maxSizeBykb) {
            var fileName = uuid.v4();
            var pattern = /\.[0-9a-z]+$/i;
            var match = pattern.exec(url);
            if (!match) {
                return;
            }
            fileName += match[0];
            utils.getSaveFolder(function(dir) {
                var filePath = path.join(dir, fileName);
                var file = fs.createWriteStream(filePath);
                httpResponse.pipe(file);
            });
        }
    }
}
