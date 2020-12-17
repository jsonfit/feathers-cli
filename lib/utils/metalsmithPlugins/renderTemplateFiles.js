const Handlebars = require('handlebars')
const render = require('consolidate').handlebars.render

Handlebars.registerHelper('if_eq', function (a, b, opts) {
  return a === b
    ? opts.fn(this)
    : opts.inverse(this)
})

Handlebars.registerHelper('unless_eq', function (a, b, opts) {
  return a === b
    ? opts.inverse(this)
    : opts.fn(this)
})

// 渲染文件
module.exports = function () {
  return async (files, metalsmith, done) => {
    await renderTemplateFiles(files, metalsmith.metadata())
    done()
  }
}

function renderTemplateFiles(files, data) {
  const keys = Object.keys(files)
  return Promise.all(keys.map((key) => renderFile(files[key], data)))
}

async function renderFile(file, data) {
  return new Promise((resolve, reject) => {
    const str = file.contents.toString()
    if (!/{{([^{}]+)}}/g.test(str)) return resolve()
    render(str, data, (err, res) => {
      if (err) {
        return reject(err)
      }
      file.contents = Buffer.from(res)
      resolve()
    })
  })
}
