/**
 * Created by massimo on 14-3-7.
 */
var config = require('./config');
var redis = require("redis"),
    client = redis.createClient(config.redisConfig.port, config.redisConfig.host);
var utils = require('./utils');
var uuid = require('node-uuid');

/**
 * 记录异常
 */
client.on('error', function (err) {
    utils.error('redis error', err);
});

/**
 *  压入url
 */
exports.pushUrl = function (urls, callback) {
    var guid = uuid.v4();
    client.sadd(guid, urls, function (err, reply) {
        if (err || reply === 0) {
            client.del(guid);
            if (typeof callback === 'function') {
                callback();
            }
        } else {
            client.sdiff(guid, 'spidered', function (err, reply) {
                client.del(guid);
                if (!err && reply) {
                    client.sadd('urls', reply, function () {
                        if (typeof callback === 'function') {
                            callback();
                        }
                    });
                }
                else {
                    if (typeof callback === 'function') {
                        callback();
                    }
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
    client.spop('urls', function (err, url) {
        if (!err && url) {
            client.sadd('spidered', url, function () {
                callback(null, url);
            });
        }
    });
};

exports.pushFileUrl = function (urls, callback) {
    var guid = uuid.v4();
    client.sadd(guid, urls, function (err, reply) {
        if (err || reply === 0) {
            client.del(guid);
            if (typeof callback === 'function') {
                callback();
            }
        } else {
            client.sdiff(guid, 'downloadedFile', function (err, reply) {
                client.del(guid);
                if (!err && reply) {
                    client.sadd('files', reply, function () {
                        if (typeof callback === 'function') {
                            callback();
                        }
                    });
                }
                else {
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            });
        }
    });
}

/**
 * pop一个文件地址
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.popFileUrl = function (callback) {
    client.spop('files', function (err, url) {
        if (!err && url) {
            client.sadd('downloadedFile', url, function (err, reply) {
                callback(null, url);
            });
        }
    });
}

/**
 * 显示状态
 * @type {displayStatus}
 */
exports.displayStatus = displayStatus = function () {
    setInterval(function () {
        client.scard('urls', function (err, urlsCount) {
            client.scard('files', function (err, filesCount) {
                client.scard('spidered', function (err, spideredCount) {
                    client.scard('downloadedFile', function (err, downloadedCount) {
                        console.log('status => urls = ' + urlsCount + " files = " + filesCount + "  spidered = " + spideredCount + "  downloaded = " + downloadedCount);
                    });
                })
            })
        });
    }, 3 * 1000);
}
