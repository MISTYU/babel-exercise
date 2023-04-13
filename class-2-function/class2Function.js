const fs = require('fs')
const path = require('path')
const babelCode = require('@babel/core')
const babelTypes = require('@babel/types')
const transformClasses = require('@babel/plugin-transform-classes')

// 读取源文件
const sourceCode = fs.readFileSync(path.join(__dirname, './sourceCode.js'), {
  encoding: 'utf-8'
})


const class2function = {
  visitor: {
    // 如果是类的声明，就会进入此函数
    ClassDeclaration(path) {
      const { node } = path
      const id = node.id // 类名 Person
      const classMethods = node.body.body // 方法名
      const newNodes = [] // 将要生成的新节点数组
      classMethods.forEach(classMethod => {
        if (classMethod.kind === 'constructor') {
          const constructorMethod = babelTypes.functionDeclaration(
            id,
            classMethod.params,
            classMethod.body
          )
          newNodes.push(constructorMethod)
        } else {
          const memberExpression = babelTypes.memberExpression(
            babelTypes.memberExpression(
              id, // Persion
              babelTypes.identifier('prototype')
            )
            ,
            classMethod.key // getName
          )
          const functionExpression = babelTypes.functionExpression(
            null,
            classMethod.params,
            classMethod.body
          )
          const assignmentExpress = babelTypes.assignmentExpression(
            '=',
            memberExpression,
            functionExpression
          )
          newNodes.push(assignmentExpress)
        }
      })
      // 如果新创建的节点数量为 0
      if (newNodes.length === 1) {
        // 在 path 路径上，用唯一的一个新节点替换掉老节点
        path.replaceWith(newNodes[0])
      } else {
        // 如果新节点是多个节点的话，使用多个节点替换一个节点
        path.replaceWithMultiple(newNodes)
      }
    }
  }
}


let targetSource = babelCode.transform(sourceCode, {
  plugins: [
    // transformClasses
    class2function
  ]
})

console.log(targetSource.code)
