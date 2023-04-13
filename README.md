# Babel
> 可以进行语法转换, ES6 转换成 ES5, typescript 和 flow 的语法转成基于目标环境支持的语法的实现；同时还暴露出了 api 让开发者可以进行特定用途的转换, 做各种静态分析等

## Babel 的一些概念

### 编译流程
1. parse：通过 parser 把源码经过词法分析转换成一个个的 token 字符，在将 token 字符组装成抽象语法树（AST）【 @babel/parser 】
2. transform：遍历 AST，调用各种 transform 插件对 AST 进行增删改 【 @babel/traverse 】【 @babel/types 】
3. generate：把转换后的 AST 生成目标代码 【 @babel/generator 】

### 核心 API
* `@babel/parser` 对源码进行 parse，可以通过 plugins、sourceType 等来指定 parse 语法
* `@babel/traverse` 通过 visitor 函数对遍历到的 ast 进行处理，分为 enter 和 exit 两个阶段，具体操作 AST 使用 path 的 api，还可以通过 state 来在遍历过程中传递一些数据
* `@babel/types` 用于创建、判断 AST 节点，提供了 xxx、isXxx、assertXxx 的 api
* `@babel/template` 用于批量创建节点
* `@babel/code-frame` 可以创建友好的报错信息
* `@babel/generator` 打印 AST 成目标代码字符串，支持 comments、minified、sourceMaps 等选项。
* `@babel/core` 基于上面的包来完成 babel 的编译流程，可以从源码字符串、源码文件、AST 开始。

### Babel 插件
babel 插件的形式返回一个对象，对象有 visitor、pre、post、inherits、manipulateOptions 等属性，
* visitor 指定 traverse 时调用的函数
当遍历到节点时，会调用 visitor 里定义的属性方法
* inherits 指定继承某个插件，和当前插件的 options 合并，通过 Object.assign 的方式
* pre 和 post 分别在遍历前后调用，可以做一些插件调用前后的逻辑，比如可以往 file（表示文件的对象，在插件里面通过 state.file 拿到）中放一些东西，在遍历的过程中取出来
* manipulateOptions 用于修改 options，是在插件里面修改配置的方式，比如 syntaxt plugin一般都会修改 parser options
```js
module.exports = {
  visitor: {
    Identifier(path, state) {}
  },
}
```

### sourcemap
格式
```json
{
  "version" : 3, // source map的版本，目前为3
  "file": "out.js", // 转换后的文件名
  "sourceRoot" : "", // 转换前的文件所在的目录。如果与转换前的文件在同一目录，该项为空
  "sources": ["foo.js", "bar.js"], // 转换前的文件。该项是一个数组，因为可能是多个源文件合并成一个目标文件
  "names": ["src", "maps", "are", "fun"], // 转换前的所有变量名和属性名，把所有变量名提取出来，下面的 mapping 直接使用下标引用，可以减少体积
  "mappings": "AAgBC,SAAQ,CAAEA" // 转换前代码和转换后代码的映射关系的集合，用分号代表一行，每行的 mapping 用逗号分隔
}
```

### babel 插件执行顺序
先应用 plugin，再应用 preset；
plugin 从前到后，preset 从后到前