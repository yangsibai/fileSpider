var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mydb');
var utils = require('./utils');

/**
 * 初始化表
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.init = function (callback) {
    try {
        db.serialize(function () {
            db.run('CREATE TABLE IF NOT EXISTS errorTrace(title TEXT,content TEXT,type INTEGER,addTime TEXT )');
            db.run('CREATE TABLE IF NOT exists sites (site TEXT)');
        });
        db.close();
        if (callback && typeof callback === 'function') {
            callback(null);
        }
    } catch (e) {
        callback(e);
    }
};

/**
 * 添加error trace信息
 * @param title
 * @param content
 * @param type
 * @param callback
 */
exports.addErrorTrace = function (title, content, type, callback) {
    db.run('INSERT INTO errorTrace VALUES (?,?,?,?)', [title, content, type, utils.currentTime()]);
    if (callback && typeof callback === 'function') {
        callback();
    }
};