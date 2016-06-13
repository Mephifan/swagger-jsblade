/**
 * 标题：          $${swagger.info.title}
 * 版本：          $${swagger.info.version}
 * 描述：          $${swagger.info.description}
 * 时间：          $${config.createTime}
 * swagger版本：   $${swagger.swagger}
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD 格式
        define([
            $${config.dependenceObj.dependence}
    ], factory);
    } else if (typeof exports === 'object') {
        // CMD 格式
        module.exports = factory(
            $${config.dependenceObj.require}
        );
    } else {
        // 挂载到浏览器 window 下
        root.$${config.apiName} = factory(
            $${config.dependenceObj.root}
        );
    }
}(this, function ($${config.dependenceObj.params}) {
{@include file://./$${config.type}-template.js, _}
}));