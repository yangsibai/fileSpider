var dbHelper = require('./dbHelper');
var numCPUs = require('os').cpus().length; //cpu数量
var utils = require('./utils');
var resolver = require('./webResolve');

var cronJob = require('cron').CronJob; //任务计划管理

cluster = require('cluster');

process.on('uncaughtException', function (err) {
    console.log(err);
    console.log('node not exiting');
})

if (cluster.isMaster) {
    resolver.init(function (err) {
        if (!err) {
            var job = new cronJob('*/2 * * * * *', function () {
                resolver.worker();
            }, null, true, null);

            for (var i = 0; i < numCPUs / 2; i++) {
                cluster.fork();
            }
            cluster.on('death', function (woker) {
                utils.trace('worker die', worker.pid);
                cluster.fork();
            });
        }
    })
} else if (cluster.isWorker) {
    var curWorker = cluster.worker;
    console.log('worker is working');
    var downloadWorker = new cronJob('*/5 * * * * *', function () {
        resolver.downloadWorker();
    }, null, true, null);
}