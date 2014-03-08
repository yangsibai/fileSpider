/**
 * Created by massimo on 14-3-7.
 */
var resolver = require('../webResolve');
var util = require('../utils');
var config = require('../config');

exports.downloadFile = function (test) {
    resolver.downloadFile('http://www.ireadhome.com/Content/Images/Home/iNote.png', function () {
        test.done();
    });
};

exports.fetchAllLinksTest = function (test) {
    resolver.resolveUrl('https://facebook.com', function (err, allLinks) {
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

exports.downloadWorkerTest = function (test) {
    resolver.downloadWorker();
    test.done();
}