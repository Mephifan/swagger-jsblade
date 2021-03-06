var path = require('path');
var fs = require('fs-extra');
var cp = require('child_process');
var colors = require('colors');
var mockGenByCases = require('swagger-mock-file-generator-by-cases');
var mockGen = require('swagger-mock-file-generator');
var express = require('express');
var middleware = require('swagger-express-middleware-with-chance');
var inquirer = require('inquirer');
var cli = require('../util/cli');
var apiCasesMiddleware = require('api-cases-middleware');
var proxyMiddleware = require('express-proxy-middleware');
var juicerAdapter = require('juicer-express-adapter');
var chokidar = require('chokidar');
var getConfig = require('../api-creators/getConfigData.js');
var Finder = require('fs-finder');
var _ = require('lodash');

module.exports = {
    create: create
};

var mock = {
    server: null,
    swaggerFilePath: '',
    configFilePath: '',
    options: '',
    cb: null
};
var createConfigQuestion = { name: 'create', message: 'Do you need to generate a default config file?', type: 'confirm', default: true };
var useDefaultQuestion = { name: 'useDefault', message: 'Do you want to use the default config?', type: 'confirm', default: true };

function create(swaggerFile, options, cb) {
    mock.swaggerFilePath = swaggerFile;
    mock.options = options;
    mock.cb = cb;
    var mockFilePath = options.file;
    var port = options.server;

    if (!/(\.json|\.yaml)$/.test(swaggerFile)) {
        console.log('need the swagger file with json or yaml format'.red);
        throw new Error();
    } else {
        fs.access(swaggerFile, fs.R_OK, function(err) {
            if (err) {
                console.log(swaggerFile + 'the swagger file exists not or not readable'.red);
                throw new Error();
            } else {
                // 生成mock.json -f
                if (mockFilePath) {
                    mockGen(swaggerFile, mockFilePath, function (err) {
                        if (err) throw err;
                        console.log('mock data generated:'+ mockFilePath.green);
                        mockConfig(mock.options);
                        // console.log('使用含有mock数据的swagger文件启动Mock Server'.green);
                    });
                } else {
                    mockConfig(mock.options);
                }
            }
        })
    }
}

function runMockServer(swaggerFile, port) {
    var swagger = swaggerFile;
    var port = isNaN(parseInt(port)) ? 8000 : parseInt(port);
    // Set the DEBUG environment variable to enable debug output
    process.env.DEBUG = 'swagger:middleware';
    var app = express();
    if (mock.options.file) return;
    var proxyMiddlewareList = proxyMiddleware(mock.configFilePath);
    middleware(swagger, app, function(err, middleware) {
        app.use(
            middleware.metadata(),
            middleware.CORS(),
            middleware.files(),
            // middleware.validateRequest(),
            apiCasesMiddleware(mock.configFilePath),
            proxyMiddlewareList,
            middleware.parseRequest(),
            middleware.mock()
        );

        mock.server = app.listen(port, function() {
            openHotReload();
            console.log('Mock Server run at http://localhost:' + port);
        });
    });
}

function mockConfig(options) {
    var configPath = options.config || '';
    var hasLite = options.lite;
    var mockFilePath = options.file;
    var port = options.server;
    var defaultConfigPath = path.resolve('./mock.config.js');
    mock.configFilePath = configPath;
    //默认文件是否存在
    if (!configPath && !hasLite) {
        if (!fs.existsSync(defaultConfigPath)) {
            // 无默认mock.config.js文件
            inquirer.prompt(createConfigQuestion).then(function(answers) {
                if (answers.create) {
                    // 同意自动生成mock.config.js
                    mock.configFilePath = './mock.config.js';
                    fs.writeFile(mock.configFilePath, '', (err) => {
                        if (err) throw err;
                        createDefaultConfigFile();
                    });
                } else {
                    // 不同意自动生成，需先遍历查找
                    Finder.from(path.join('..')).findFiles('mock.config.js', function(files) {
                        if (files.length) {
                            // 在别的目录下有 mock.config.js 文件
                            inquirer.prompt(useDefaultQuestion).then(function(answers) {
                                if (answers.useDefault) {
                                    // 同意使用该文件作为配置文件
                                    // 默认路径
                                    configPath = files[0];
                                    mock.configFilePath = configPath;
                                    mockGenByCaseFunc(options);
                                } else {
                                    // 不使用找到的config文件，无config启动
                                    mock.configFilePath = '';
                                    runMockServer(mock.swaggerFilePath, mock.options.server);
                                }
                            });
                        } else {
                            // 不同意生成，且无mock.config.js文件，则无config启动
                            mock.configFilePath = '';
                            runMockServer(options.file, options.server);
                        }
                    });
                }
            });
        } else {
            // 找到默认配置文件
            mock.configFilePath = defaultConfigPath;
            mockGenByCaseFunc(options);
        }
    } else if (configPath && !hasLite) {
        // 使用指定的 config 文件
        mockGenByCaseFunc(options);
    } else {
        // 没有 config 直接起 server
        mock.configFilePath = '';
        runMockServer(options.file, options.server);
    }
    return configPath;
}

function mockGenByCaseFunc (options) {
    var config = require(path.resolve(mock.configFilePath));
    updateConfigFile(config.path, () => {
        if (config.mockDir) {
            var mockDir = config.mockDir;
            if (!fs.existsSync(mockDir)) {
                try {
                    fs.mkdirSync(mockDir);
                    questionAndGen(mockDir,options );
                } catch (error) {
                    console.log(' mockDir in config file not work'.red);
                    runMockServer(mock.swaggerFilePath, mock.options.server);
                    return;
                }
            } else {
                questionAndGen(mockDir,options);
            }
        } else {
            // no matter what happens
            // run mock server
            runMockServer(mock.swaggerFilePath, mock.options.server);
        }
    });
}

function questionAndGen(mockDir, options) {

  if(options && options.skip) {

    runMockServer(mock.swaggerFilePath, mock.options.server);
  }
  else {

    var mockFileByCasesQuestion = { name: 'mock', message: `do you want to use mock data in ${mockDir} to init/update Swagger mock data?`, type: 'confirm', default: true };
    inquirer.prompt(mockFileByCasesQuestion).then(function(answers) {
      if (answers.mock) {
        mockGenByCases(mock.swaggerFilePath, mockDir, function(err) {
          if (err) throw err;
          runMockServer(mock.swaggerFilePath, mock.options.server);
        })
      } else {
        runMockServer(mock.swaggerFilePath, mock.options.server);
      }
    })
  }
}

var oneprocess

function openHotReload() {
    var monitorPaths = [mock.swaggerFilePath, mock.configFilePath];
    monitorPaths.forEach((filePath) => {
        if (filePath && fs.existsSync(filePath)) {
           chokidar.watch(filePath).on('change', _.debounce(function (file) {
                oneprocess = cp.fork(file);
                mock.server.close();
                console.log('reload', file);
                if (mock.configFilePath && _.includes(mock.swaggerFilePath, file)) {
                    delete require.cache[path.resolve(mock.configFilePath)];
                    var config = require(path.resolve(mock.configFilePath));
                    updateConfigFile(config.path, () => {})
                } else {
                    reloadServer();
                }
            }, 500));
        }
    });
}

function reloadServer () {
    runMockServer(mock.file, mock.options.server);
    console.log('change detected，Mock Server restarted'.green);
    if (mock.configFilePath) {oneprocess = newProcess(oneprocess);}
}

process.on('SIGINT', () => {
    process.exit(0);
});

function newProcess (oneprocess) {
    oneprocess.kill('SIGINT');
    return cp.fork(mock.configFilePath);
}

function createDefaultConfigFile() {
    if (!mock.configFilePath) {
        console.log('config has wrong path'.red);
        runMockServer(mock.options.file, mock.options.server);
    } else {
        var config = getConfig({ file: mock.swaggerFilePath });
        if (config && config.swagger && config.swagger.paths) {
            config.pathObjects = []
            const paths =_.uniq(_.keys(config.swagger.paths));
            _.forEach(paths, (path) => {
                config.pathObjects.push({path: path, value: 0})
            })
            juicerAdapter(path.join(__dirname, '../../templates/mock/config-template.juicer'), config, function(err, str) {
                outPutFile(mock.configFilePath, str, 'default config file is generated successfully! path: ');
            })
        } else {
            console.log('error was occured by ready swagger file'.red);
            runMockServer(mock.options.file, mock.options.server);
        }
    }
}

function updateConfigFile (paths, cb) {
    var updateConfigFileQuestion = {
        name: 'mock',
        message: `want to update mock config incrementally due to modified swagger json？`,
        type: 'confirm',
        default: true
    }
    var config = getConfig({ file: mock.swaggerFilePath });
    if (config && config.swagger && config.swagger.paths && needUpdateConfig(_.keys(config.swagger.paths), _.keys(paths))) {
        inquirer.prompt(updateConfigFileQuestion).then(function(answers) {
            if (answers.mock) {
                // 增量更新mock config 文件
                config.pathObjects = [];
                _.forEach(paths, (value, key) => {
                    config.pathObjects.push({
                        path: key,
                        value: paths[key]
                    })
                });
                _.forEach(config.swagger.paths,((value, key) => {
                    // 将新增 path 追加到尾部，默认值0，不启用
                    if (!_.includes(_.keys(paths), key)) {
                        config.pathObjects.push({path: key, value: 0});
                    }
                }))
                juicerAdapter(path.join(__dirname, '../../templates/mock/config-template.juicer'), config, function(err, str) {
                    outPutFile(mock.configFilePath, str, 'updated successfully', cb);
                })
                if (mock.server) { reloadServer(); }
            } else {
                cb();
            }
        })
    } else {
        cb();
    }
}

function needUpdateConfig (swagger, config) {
    let result = false;
    _.forEach((swagger), (item) => {
        if (!_.includes(config, item)) {
            result = true;
        }
    })
    return result;
}

function outPutFile(filePath, str, message, cb){
    fs.outputFile(filePath, str, function(err) {
        if (err) {
            throw err;
        }
        console.log((message + filePath).green);
        if (cb) {
            cb();
        } else {
            mockGenByCaseFunc(mock.options.file, mock.options.server)
        }
    })
}
