// 在命令行添加 loading 效果
const ora = require('ora')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = function (fn, opts) {
  const {
    msg = '资源加载中...',
    successText = '加载完成',
    failedText = '加载失败',
    retryTimes = 3,
    retryInterval = 1000,
  } = opts || {}
  let count = 0
  async function runWithSpinner(...args) {
    if (count) console.log(`开始第${count}次重试...`)
    const spinner = ora(msg)
    spinner.start()
    try {
      const ret = await fn(...args)
      if (successText) spinner.succeed(successText)
      return ret
    } catch (e) {
      spinner.fail(failedText + ':' + e.message)
      console.log(e)
      await sleep(retryInterval)
      if (count < retryTimes) {
        count++
        await runWithSpinner(...args)
      } else {
        console.log(`${retryTimes}次重试仍然失败，中断加载。`)
        throw e
      }
    }
  }
  return runWithSpinner
}
