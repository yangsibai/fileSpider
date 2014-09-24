var numCPUs = require('os').cpus().length; //cpu数量
var utils = require('./utils');
var resolver = require('./webResolve');

var cronJob = require('cron').CronJob; //任务计划管理

var cluster = require('cluster');

process.on('uncaughtException', function(err) {
    console.log(err);
    console.log(err.message);
    console.log(err.stack);
    console.log('node not exiting');
});

if (cluster.isMaster) {
    resolver.init(function(err) {
        if (!err) {
            for (var i = 0; i < numCPUs; i++) {
                cluster.fork();
            }
            cluster.on('death', function(woker) {
                console.log('worker die', worker.pid);
                cluster.fork();
            });
        }
    })
} else if (cluster.isWorker) {
    var curWorker = cluster.worker;
    console.log('worker is working');
    var job = new cronJob('* * * * * *', function() {
        resolver.worker();
    }, null, true, null);
    var downloadWorker = new cronJob('* * * * * *', function() {
        resolver.downloadWorker();
    }, null, true, null);
}
