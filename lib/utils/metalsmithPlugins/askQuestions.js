const evaluate = require('../eval')
const prompts = require('prompts')

module.exports = function (questions) {
  return async (files, metalsmith, done) => {
    await ask(questions, metalsmith.metadata())
    done()
  }
}
async function ask(questions, data) {
  const names = Object.keys(questions)
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const it = questions[name]
    if (it.when) {
      let expr = it.when
      if (typeof it.when === 'function') expr = it.when(data)
      if (!evaluate(expr, data)) continue
    }
    const question = {
      type: it.type,
      name: name,
      message: it.message || name,
      initial: it.initial,
      choices: it.choices || [],
      validate: it.validate || (() => true),
      active: it.active,
      inactive: it.inactive,
      onState: (state) => {
        if (state.aborted) {
          throw new Error('创建过程被用户终止')
        }
      },
    }
    const answer = await prompts(question)
    // console.log(answer)
    Object.assign(data, answer)
  }
}
