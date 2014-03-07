/**
 * Created by massimo on 14-3-7.
 */


var redisHelper = require('../redisHelper');
exports.redisTest = {
    pushUrl: function (test) {
        redisHelper.pushUrl('www.baidu.com', function (err) {
            test.ok(!err);
            test.done();
        })
    },
    popUrl: function (test) {
        redisHelper.popUrl(function (err, url) {
            test.ok(!err);
            test.ok(url);
            test.done();
        })
    },
    addSpider: function (test) {
        redisHelper.addSpider('baidu.com', function (err) {
            test.ok(!err);
            test.done();
        });
    },
    hasSpider: function (test) {
        redisHelper.hasSpider('baidu.com', function (err, result) {
            test.ok(!err);
            test.ok(result);
            test.done();
        })
    },
    hasSpider2: function (test) {
        redisHelper.hasSpider('asdfkjasdlkfjalkdsfjasd', function (err, result) {
            test.ok(!err);
            test.ok(!result);
            test.done();
        })
    }
}