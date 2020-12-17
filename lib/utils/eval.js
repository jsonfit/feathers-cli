const chalk = require('chalk')

// 执行 meta.js 中的字符串表达式
module.exports = function evaluate(exp, data) {
  const fn = new Function('data', `with(data) { return ${exp}}`)
  try {
    return fn(data)
  } catch (e) {
    console.error(chalk.red(`Error when evaluating filter condition: ${exp}`))
  }
}
