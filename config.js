/**
 * Created by massimo on 14-3-7.
 */

exports.redisConfig = {
    port: 6379,
    host: '127.0.0.1'
};

exports.taskConfig = {
    startUrl: 'http://www.baidu.com',
    sitePattern: /baidu\.com/i,
    filePattern: /(jpg|png)/i
};

/**
 * 代理设置
 * @type {{on: boolean, host: string, port: number}}
 */
exports.proxyConfig = {
    on: true,
    host: '127.0.0.1',
    port: 8087
};