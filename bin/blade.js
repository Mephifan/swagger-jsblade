#!/usr/bin/env node

'use strict';

var app =  require('commander');
var project = require('../lib/commands/project');
var codegen = require('../lib/commands/codegen');
var apiUtil = require('../lib/commands/apiUtil');
var mock = require('../lib/commands/mock');
var frameworks = Object.keys(project.frameworks).join('|');
var cli = require('../lib/util/cli');
var execute = cli.execute;
var appInfo = require('./../package.json');

app
    .version(appInfo.version);

app
  .command('create [name]')
  .description('create a folder which has a frontend project')
  .option('-f, --framework <framework>', frameworks + " one of them" )
  .action(execute(project.create));

app
    .command('api <apiName> <swaggerFile> <toPath> [outFileName]')
    .description('create api interface' )
    .option('-a, --ajax <type>', "request type (don'work by -c), n: type $http, s: type superagent, f: type fetch, a: type axios, b: type superbridge, c: type config,only generate configuration")
    .option('-s, --surround <mode>', "surround mode(don'work by -c)), add generated codes in UMD-1 AMD-2 CommonJS-3 4 and ES6-5 ")
    .option('-c, --custom <tplPath>', "custom template(Has priority over -a and -s)")
    .option('-w, --withCredentials', "support transport cookie over domain")
    .option('-t, --tags <tagName>', "generate files by tag group,(@) generate all tags, (@aaa@bbb)generate aaa and bbb")
    .option('-p, --promise', "inject Promise dependence, off by default")
    .version(appInfo.version)
    .action(execute(codegen.create));

app
    .command('util <toPath> [outFileName]')
    .description('Create an api dev tool')
    .option('-a, --ajax <type>', "request type, a: axios, currently support only axios")
    .option('-s, --surround <mode>',  "surround mode(don'work by -c)), add generated codes in UMD-1 AMD-2 CommonJS-3 4 and ES6-5 ")
    .version(appInfo.version)
    .action(execute(apiUtil.create));

app
    .command('mock <swaggerFile>')
    .description('create the mock data according to swagger file and start mock server')
    .option('-f, --file <filePath>', "create a mock file")
    .option('-s, --server [portNum]', "run mock server with port number,default is 8000")
    .option('-c, --config <filePath>', "mock config file")
    .option('-l, --lite', "not recognise config file automatically")
    .option('-k, --skip', "skip generate mock data step")
    .action(execute(mock.create));

app.parse(process.argv);
cli.validate(app);