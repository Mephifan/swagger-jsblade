# swagger-jsblade-en

english version of swagger-jsblade. more options are added. 


## Introduction

Jsblade is a tool kit for Front-End developers who use Swagger as their API definition.
These are the main it solved.

* Boilerplate
* Auto generate API based built-in templates and custom template
* Auto mock API and custom mock response

For complete information about Swagger™, you can check the Swagger Specification project. It contains general information and the actual Swagger specification.


## Install
```shell
npm i swagger-jsblade-en -g
```
### Boilerplate Example
```shell
blade create myProject -f vue
```

| Command | Options | Description |
| --- | --- | ---
| -f, —-framework| 'angular1' , 'vue' |Built-in Angular 1.5.x and Vue 1.x project bolierplate|

**Detail Usage**

```shell
blade create -h
 Usage: create [options] [name]

  create a folder which has a frontend project

  Options:

    -h, --help                   output usage information
    -f, --framework <framework>  angular1|vue  one of them
```

### API Generation Example
```
blade api DataApi ./input/swagger.json ./output/service dataApi
```
| Command | Options | Description |
| --- | --- | ---
| -a, —-ajax <type>| n, s|generated API type : n for angular's $http; s for NodeJS or browser's superagent
| -s, —-surround <mode>| 1,2,3,4 |API Module: 1 for UMD; 2 for AMD; 3 for CommonJS; 4 for JavaScript closure
| -w, —-withCredentials |  |Enable CORS
| -t, —-tags <tagName>| Swagger definition's tagName |Only generate API based on tagName: @tagOne -> generate tagOne. @tagOne@tagTwo -> generate both tagOne and tageTwo
| -p, —-promise |  |Enable Promise

**Detail Usage**

```shell
blade api -h

  Usage: api [options] <apiName> <swaggerFile> <toPath> [outFileName]

    create api interface
    
    Options:
      -a, --ajax <type>       request type (don'work by -c), n: type $http, s: type superagent, f: type fetch, a: type axios, b: type superbridge, c: type config,only generate configuration
      -s, --surround <mode>   surround mode(don'work by -c)), add generated codes in UMD-1 AMD-2 CommonJS-3 4 and ES6-5
      -c, --custom <tplPath>  custom template(Has priority over -a and -s)
      -w, --withCredentials   support transport cookie over domain
      -t, --tags <tagName>    generate files by tag group,(@) generate all tags, (@aaa@bbb)generate aaa and bbb
      -p, --promise           inject Promise dependence, off by default
      -V, --version           output the version number
      -h, --help              output usage information
```

#### Using API
**Simple Usage**

```javascript
import API from '../api/dataApi';

let api = new API('http://xxx.com');
// This will send an AJAX to http://xxx.com/xxx
api.xxxx(param).then(res => {
    console.log('get respone:' + res)
})
```
**Superagent/Superbridge/Fetch Interceptor Enhanced**
like Angular's $http , we add an interceptor to superagent/superbridge/fetch type API,
angular/axios has interceptor yet.
you can use it like this:

```
import API from '../api/dataApi';

API.interceptor({
    request: function (config) {
        console.log(config);
        return (new Promise(function (resolve, reject) {
            resolve(config);
        }));
    },

    requestError: function (err) {
        console.log(err);
        return (new Promise(function (resolve, reject) {
            resolve(err);
        }));
    },

    response: function (response) {
        console.log(response);
        return (new Promise(function (resolve, reject) {
            resolve(response);
        }));
    },

    responseError: function (err) {
        console.log(err);
        return (new Promise(function (resolve, reject) {
            resolve(err);
        }));
    }
});

let api = new API('http://xxx.com');
```

**if generate cofig, use like following demo**
```
import ApiUtil from '@/common/services/ApiUtil';    // import util
import ApiConfig from '@/common/services/config';   // import config
import axios from 'axios';

axios.interceptors.request.use(function (config) {
    return config;
}, function (err) {
    return Promise.reject(err);
});
axios.interceptors.response.use(function (response) {
    return response;
}, function (err) {
    return Promise.reject(err);
});

export const Apis = new ApiUtil(ApiConfig, {
    domain: ''
});

export default Apis;
```

generate ApiUtil dev tool via blade util

###generate ApiUtil 
```
blade util -h

  Usage: util [options] <toPath> [outFileName]

  Create an api dev tool
  
  Options:
    -a, --ajax <type>      request type, a: axios, currently support only axios
    -s, --surround <mode>  surround mode(don'work by -c)), add generated codes in UMD-1 AMD-2 CommonJS-3 4 and ES6-5
    -V, --version          output the version number
    -h, --help             output usage information

```
### Mock Example
#### Mock data generation

```
blade mock ./input/swagger.json 
```
The mock data will generate in the `mock` folder (or the folder which is defined in mock.config.js)
```
```
if your original swagger file has defined some example,will remain the same otherwhise random generate.

#### Mock server

```
blade mock ./input/swagger.json -k -s 8001 
```
| Command | Options | Description |
| --- | --- | ---
| -f, —-file <mockFilePath>| file path|generate swagger mock file which definition's example is filled with random mock data
| -s, —-server <port>|  port number|mock server's port ,default is 8000
| -c, —-config <config file>|config file path| mock 2.0(v0.2.0) added: custom config file,default config will prompt whether generate at your project root dir, named with 'mock.config.js'
| -l, —-lite||disable mock 2.0 default prompt

**Detail Usage**

```shell
blade mock -h

 Usage: mock [options] <swaggerFile>

create the mock data according to swagger file and start mock server

Options:
  -f, --file <filePath>    create a mock file
  -s, --server [portNum]   run mock server with port number,default is 8000
  -c, --config <filePath>  mock config file
  -l, --lite               not recognise config file automatically
  -k, --skip               skip generate mock data step
  -h, --help               output usage information

```
## LICENSE
MIT