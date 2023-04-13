const fs = require('fs')
const path = require('path')
const babelCode = require('@babel/core')
const babelTypes = require('@babel/types')
const arrowFunctions = require('babel-plugin-transform-es2015-arrow-functions')

// let sourceCode = `
//   const sum = (a, b) => {
//     return a + b;
//   }
// `
// let sourceCode = `
//   const sum = (a, b) => {
//     console.log(this)
//     return a + b;
//   }
// `

// 读取源文件
const sourceCode = fs.readFileSync(path.join(__dirname, './sourceCode.js'), {
  encoding: 'utf-8'
});


const arrowFunctions2 = {
  visitor: {
    // 当遍历语法遇到箭头函数的时候，执行此函数，参数好似箭头函数的节点路径对象
    ArrowFunctionExpression(path) {
      const { node } = path
      node.type = 'FunctionExpression'
      let body = node.body
      // 如果 body 不是一个块级语句
      if (!babelTypes.isBlockStatement(body)) {
        node.body = babelTypes.blockStatement([
          babelTypes.returnStatement(body)
        ])
      }
    }
  }
}
// 在函数的外部声明一个变量 _this，值时 this
// 在函数体内把所有的 this 都变成 _this
function hoistFunctionEnviroment(path) {
  // findParent(callback) 从当前节点一直向上找到根节点(不包括自己)
  const thisEnv = path.findParent(parent => {
    // 如果这个父节点是一个普通函数，或者是一个根节点的话就返回此节点
    return (parent.isFunction() && !parent.isArrowFunctionExpression()) || parent.isProgram()
  })
  // 需要先确定在当前的作用域是否使用了 this
  let thisPaths = getThisPaths(path)
  // const thisBinding = thisEnv.scope.generateUid('this')
  const thisBinding = '_this_'
  // 在外层作用域中添加一个 _this 的变量，值为 this
  // 向 thisEnv 作用域内创建一个变量，变量名为 _this
  // thisEnv.scope.push({
  //   id: babelTypes.identifier(thisBinding),
  //   init: babelTypes.thisExpression()
  // })
  if (thisPaths.length > 0) {
    // 在外层作用域中添加一个 _this 的变量，值为 this
  // 向 thisEnv 作用域内创建一个变量，变量名为 _this_
    if (thisEnv.scope.hasBinding(thisBinding)) {
      thisEnv.scope.push({
        id: babelTypes.identifier(thisBinding),
        init: babelTypes.thisExpression()
      })
    }
    
    thisPaths.forEach(thisPath => {
      thisPath.replaceWith(babelTypes.identifier(thisBinding))
    })
  }
}
function getThisPaths(path) {
  let thisPaths = []
  // 判断 this 节点
  path.traverse({
    ThisExpression(thisPath) {
      thisPaths.push(thisPath)
    }
  })
  return thisPaths
}

const arrowFunctions3 = {
  visitor: {
    // 当遍历语法遇到箭头函数的时候，执行此函数，参数好似箭头函数的节点路径对象
    ArrowFunctionExpression(path) {
      const { node } = path
      hoistFunctionEnviroment(path)
      node.type = 'FunctionExpression'
      let body = node.body
      // 如果 body 不是一个块级语句
      if (!babelTypes.isBlockStatement(body)) {
        node.body = babelTypes.blockStatement([
          babelTypes.returnStatement(body)
        ])
      }
      path.skip()
    }
  }
}

let targetSource = babelCode.transform(sourceCode, {
  plugins: [
    // arrowFunctions
    // arrowFunctions2
    arrowFunctions3
  ]
})

console.log(targetSource.code)
