const figlet = require('figlet')

module.exports = function (text) {
  return new Promise((resolve) => {
    figlet(text, function (err, data) {
      if (err) {
        resolve()
        return
      }
      console.log(data)
      resolve()
    })
  })
}
