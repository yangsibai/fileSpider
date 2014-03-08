/**
 * Created by massimo on 14-3-7.
 */
var resolver = require('../webResolve');
var util = require('../utils');
var config = require('../config');

exports.workerTest=function(test){
    resolver.worker();
    test.done();
}

exports.downloadWorkerTest = function (test) {
    resolver.downloadWorker();
    test.done();
}

exports.downloadWorkerTest = function (test) {
    resolver.resolveUrl('http://www.baidu.com', function () {
        test.done();
    });
}

exports.downloadFile = function (test) {
    resolver.downloadFile('http://www.baidu.com', function () {
        test.done();
    });
};

exports.fetchAllLinksTest = function (test) {
    resolver.resolveUrl('http://www.baidu.com', function (err, allLinks) {
        test.ok(!err);
        test.ok(allLinks.length > 0);
        console.log(allLinks.length);
        test.done();
    });
};

exports.downloadPageTest = function (test) {
    util.downloadPage('https://www.facebook.com', function (err, body) {
        test.ok(!err);
        test.ok(body);
        test.done();
    });
};
