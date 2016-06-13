/**
 * Created by liangkuaisheng on 16/6/12.
 */
var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var colors = require('colors');
var cwd = process.cwd();

var defaultDep = {
    "resource": [
        {
            "name": "angular"
        },
        {
            "name": "angular-resource"
        }
    ],
    "ng-http": []
};
var defaultConfig = {
    "file": "./swagger.json",
    "outPath": "./",
    "apiName": "ApiService",
    "type": "ng-http"
};

module.exports = function (filePath) {
    var config;
    try {
        config = require(filePath);
    } catch (err) {
        console.log('没有config文件,采用默认值'.yellow);
        config = {};
    }
    var swagger;
    try {
        swagger = require(path.join(cwd, config.file));
    } catch (err) {
        console.log('没有swagger文件,错误'.red);
        throw err;
    }

    defaultConfig.dependence = defaultDep[config.type || defaultConfig.type];
    config = _.defaultsDeep(config, defaultConfig);

    // 依赖注入
    var dependenceArr = [];
    var requireArr = [];
    var rootArr = [];
    var paramsArr = [];
    _.forEach(config.dependence, function (value, key) {
        value.exports = value.exports || _.camelCase(value.name);
        dependenceArr.push("'" + value.name + "'");
        requireArr.push("require('" + value.name + "')");
        rootArr.push('root.' + value.exports);
        paramsArr.push(value.exports);
    });

    config.dependenceObj = {
        dependence: dependenceArr.join(',\n            '),
        require: requireArr.join(',\n            '),
        root: rootArr.join(',\n            '),
        params: paramsArr.join(',\n    ')
    };
    var nowDate = new Date();
    config.createTime = nowDate.toLocaleString();

    swagger.apiName = config.apiName;
    swagger.dependence = config.dependence;

    _.forEach(swagger.paths, function (value, key) {
        _.forEach(value, function (item, index) {
            item.fnName = _.camelCase(index + key);
            if (_.findLastKey(swagger.paths) === key && _.findLastKey(value) === index) {
                item.lastOneReq = true;
            }
        });
    });
    return {
        config: config,
        swagger: swagger
    }
};