# swagger-jsblade
```
  Usage: blade [options] [command]


  Commands:

    create [options] [name]     创建一个文件夹包含一个前端项目
          Usage: create [options] [name]
        
          创建一个文件夹包含一个前端项目
        
          Options:
        
            -h, --help                   output usage information
            -f, --framework <framework>  angular1|vue 中的一个

    api [options] <apiName> <swaggerFile> <toPath>  创建一个api接口集合 必填:<api名称> <swagger文件位置,支持本地和线上> <输出文件位置>
          Usage: api [options] <apiName> <swaggerFile> <toPath>
        
          创建一个api接口集合 必填:<api名称> <swagger文件位置,支持本地和线上> <输出文件位置>
        
          Options:
        
            -h, --help              output usage information
            -n, --ngHttp            $http类型
            -r, --resource          angular-resource类型
            -s, --superagent        superagent类型
            -S, --surround <mode>   包围模式(-c时无效) ,将生成的代码包含在UMD-1 AMD-2 CommonJS-3 或 闭包-4 中
            -c, --custom <tplPath>  自定义模板
            -w, --withCredentials   支持跨域传cookie
            -t, --tags <tagName>    按tag分组生成文件,(@)生成全部tag的, (@aaa@bbb)生成aaa和bbb的

    mock [options] <swaggerFile>    生成含有mock数据的swagger文件 必填:<swagger文件位置,本地或线上yaml或JSON格式文件> <输出JSON文件位置及名称>
          Usage: mock [options] <swaggerFile>
        
          生成含有mock数据的swagger文件 必填:<swagger文件位置,本地或线上yaml或JSON格式文件> <输出JSON文件位置及名称>
        
          Options:
        
            -h, --help              output usage information
            -f, --file <filePath>   生成mock file
            -s, --server [portNum]  启动mock server,端口号,默认8000

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```