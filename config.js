/**
 * Created by massimo on 14-3-7.
 */

exports.redisConfig = {
    port: 6379,
    host: '127.0.0.1'
};

exports.taskConfig = {
    startUrl: 'http://tieba.baidu.com/f?kw=%C4%A7%CA%DE%CA%C0%BD%E7&fr=index',
    sitePattern: /tieba\.com/i,
    filePattern: /(\.jpg|\.png|\.gif)/i,
    minSizeByKb: 20,
    maxSizeBykb: 20480
};

/**
 * 代理设置
 * @type {{on: boolean, host: string, port: number}}
 */
exports.proxyConfig = {
    on: false,
    host: '127.0.0.1',
    port: 8087
};
