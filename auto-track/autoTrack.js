const { declare } = require('@babel/helper-plugin-utils')
const importModule = require('@babel/helper-module-imports')
const babelTypes = require('@babel/types')

const autoTrackPlugin = declare((api, options, dirname) => {
  api.assertVersion(7)
  return {
    visitor: {
      // 在 Program 根结点里通过 path.traverse 来遍历 ImportDeclaration
      Program: {
        enter(path, state) {
          path.traverse({
            // ImportDeclaration（import声明）
            ImportDeclaration(path) {
              // 获取 import 引入的包路径
              const requirePath = path.get('source').node.value
              // 如果引进引入了 racker 模块
              if (requirePath === options.trackerPath) {
                const specifierPath = path.get('specifiers.0')
                // default import 和 namespace import 取 id 的方式不一样，需要分别处理下。
                if (babelTypes.isImportDefaultSpecifier(path.node.specifiers[0])) { // 另一种判断节点类型的方法
                  state.trackerImportId = specifierPath.toString()
                } else if (specifierPath.isImportNamespaceSpecifier()) {
                  state.trackerImportId = specifierPath.get('local').toString()
                }
                // 终止遍历
                // path.stop()
              }
            }
          })
          if (!state.trackerImportId) {
            state.trackerImportId = importModule.addDefault(path, 'tracker', {
              nameHint: path.scope.generateUid('tracker')
            }).name
          }
          state.trackerAST = api.template.statement(`${state.trackerImportId}()`)()
        }
      },
      'ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration'(path, state) {
        const bodyPath = path.get('body')
        if (bodyPath.isBlockStatement()) {
          bodyPath.node.body.unshift(state.trackerAST)
        } else {
          // 处理箭头函数这种没有函数的体的情况，包装下
          const ast = api.template.statement(`{${state.trackerImportId}();return PREV_BODY;}`)({ PREV_BODY: bodyPath.node })
          // 直接替换
          bodyPath.replaceWith(ast)
        }
      }
    }
  }
})

module.exports = autoTrackPlugin
