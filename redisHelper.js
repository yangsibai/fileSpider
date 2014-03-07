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
exports.pushUrl = function (url, callback) {
    hasSpider(url, function (err, result) {
        if (err) {
            callback(err);
        }
        else if (result) {
            callback(new Error('has spider:' + url));
        }
        else {
            client.sadd('urls', url, function (err, reply) {
                if (callback && typeof callback === 'function') {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null);
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
    client.spop('urls', function (err, reply) {
        if (callback && typeof callback === 'function') {
            if (err) {
                callback(err);
            }
            else if (!reply) {
                console.log('没有地址');
                callback(new Error('没有地址'));
            }
            else {
                addSpider(reply, function (err) {
                    if (!err) {
                        callback(null, reply);
                    }
                    else {
                        callback(new Error('add spider error:' + reply));
                    }
                })
            }
        }
    })
};

/**
 * 压入图片地址
 * @param url
 * @param @optional callback
 */
exports.pushFileUrl = function (url, callback) {
    client.sadd('files', url, function (err) {
        if (typeof callback === 'function') {
            if (err) {
                callback(err);
            }
            else {
                callback(null);
            }
        }
    });
};

exports.popFileUrl = function (callback) {
    client.spop('files', function (err, reply) {
        if (typeof callback === 'function') {
            if (err) {
                callback(err);
            }
            else if (!reply) {
                console.log('没有图片地址');
                callback(new Error('没有图片地址'));
            }
            else {
                callback(null, reply);
            }
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
            }
            else {
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
            }
            else {
                callback(null, reply);
            }
        }
    })
}