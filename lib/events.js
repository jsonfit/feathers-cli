const chalk = require('chalk')
const actionsMap = require('./actionsMap')

module.exports = function (program) {
  // 自定义帮助信息
  program.on('--help', () => {
    console.log()
    console.log('Examples')
    Object.keys(actionsMap).forEach((action) => {
      const { examples = [] } = actionsMap[action]
      examples.forEach((example) => {
        console.log(`  ${example}`)
      })
    })
    console.log()
    console.log(
      `Run ${chalk.cyan(
        'feat <command> --help'
      )} for detailed usage of given command.`
    )
    console.log()
  })

  program.on('command:*', function (operands) {
    console.error(`${chalk.red('未知命令:')} ${chalk.cyan(operands[0])}`)
    const availableCommands = program.commands.map((cmd) => cmd.name())
    console.log(`可用的命令有 [${availableCommands}], 用 'feat --help' 查看使用帮助`)
  })
}
