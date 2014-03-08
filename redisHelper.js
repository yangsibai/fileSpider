/**
 * Created by massimo on 14-3-7.
 */
var config = require('./config');
var redis = require("redis"),
    client = redis.createClient(config.redisConfig.port, config.redisConfig.host);
var utils = require('./utils');

/**
 * 记录异常
 */
client.on('error', function (err) {
    utils.error('redis error', err);
});

/**
 *  压入url
 */
exports.pushUrl = function (url) {
    hasSpider(url, function (err, result) {
        if (err) {
            utils.error('redis push url error', err);
        } else if (!result) {
            client.sadd('urls', url, function (err, reply) {
                if (err) {
                    utils.error('redis sadd url error', err);
                }
            });
        }
    });
};

/**
 * pop 一个地址
 * @param callback
 */
exports.popUrl = function (callback) {
    client.spop('urls', function (err, reply) {
        if (!err && reply) {
            addSpider(reply, function (err) {
                callback(null, reply);
            })
        }
    })
};

/**
 * 压入图片地址
 * @param url
 * @param @optional callback
 */
exports.pushFileUrl = function (url, callback) {
    hasDownloaded(url, function (err, result) {
        if (!err && !result) {
            client.sadd('files', url, function (err) {
                if (typeof callback === 'function') {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                }
            });
        }
    })
};

/**
 * pop一个文件地址
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.popFileUrl = function (callback) {
    client.spop('files', function (err, reply) {
        if (!err && reply) {
            addDownloadedFile(reply, function (err) {
                callback(null, reply);
            })
        }
    });
}

/**
 * 是否已经爬取
 * @param url
 * @param callback
 */
exports.hasSpider = hasSpider = function (url, callback) {
    client.sismember('hasSpider', url, function (err, reply) {
        if (typeof callback === 'function') {
            if (err) {
                callback(err);
            } else {
                callback(null, reply);
            }
        }
    })
};

/**
 * 添加已经爬取的地址
 * @param url
 * @param callback
 */
exports.addSpider = addSpider = function (url, callback) {
    client.sadd('hasSpider', url, function (err, reply) {
        if (typeof callback === 'function') {
            if (err) {
                callback(err);
            } else {
                callback(null, reply);
            }
        }
    })
}

/**
 * 检测文件是否已经下载过
 * @param  {[type]}   url  [description]
 * @param  {Function} callback [description]
 * @return {Boolean}           [description]
 */
exports.hasDownloaded = hasDownloaded = function (url, callback) {
    client.sismember('downloadedFile', url, function (err, reply) {
        if (typeof callback === 'function') {
            if (err) {
                callback(err);
            } else {
                callback(null, reply);
            }
        }
    })
};

/**
 * 添加已经下载过的文件信息
 * @param {[type]}   url      [description]
 * @param {Function} callback [description]
 */
exports.addDownloadedFile = addDownloadedFile = function (url, callback) {
    client.sadd('downloadedFile', url, function (err, reply) {
        if (typeof callback === 'function') {
            if (err) {
                callback(err);
            } else {
                callback(null, reply);
            }
        }
    })
};

/**
 * 显示状态
 * @type {displayStatus}
 */
exports.displayStatus = displayStatus = function () {
    setInterval(function () {
        client.scard('urls', function (err, urlsCount) {
            client.scard('files', function (err, filesCount) {
                client.scard('hasSpider', function (err, spideredCount) {
                    client.scard('downloadedFile', function (err, downloadedCount) {
                        console.log('status => urls = ' + urlsCount + " files = " + filesCount + "  spidered = " + spideredCount + "  downloaded = " + downloadedCount);
                    });
                })
            })
        });
    }, 3 * 1000);
}
