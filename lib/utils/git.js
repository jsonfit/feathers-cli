// git 相关操作
const path = require('path')
const { spawn, execSync } = require('child_process')

// 获取 git 用户
function getUser() {
  let name
  let email

  try {
    name = execSync('git config --get user.name')
    email = execSync('git config --get user.email')
  } catch (e) {}

  name = name ? name.toString().trim() : ''
  email = email ? ` <${email.toString().trim()}>` : ''
  return name + email
}

// 下载 git 仓库
async function clone(repo, opts = {}) {
  const defaultOpts = {
    shallow: false, // 不clone所有历史，只下载当前最新
    rmDotGit: false, // 下载之后是否删除 .git 目录
    targetPath: repo // 下载后的目录名称
      .split('/')
      .pop()
      .replace(/\.git$/, ''),
    workdir: process.cwd(), // 执行命令所在的目录
    checkout: undefined, // 切换分支
  }
  _mergeDefault(opts, defaultOpts)
  await _clone(repo, opts) // 下载
  const repoDir = path.join(opts.workdir, opts.targetPath)
  if (opts.checkout) _checkout(opts.checkout, repoDir) // 切分支
  if (opts.rmDotGit) _removeDotGit(repoDir) // 删除 .git 目录
}

// 更新 git 仓库
async function pull(cwd) {
  return new Promise((resolve, reject) => {
    const process = spawn('git', ['pull'], { cwd })
    process.on('close', (status) => {
      if (status == 0) return resolve()
      reject(new Error("'git pull' failed with status " + status))
    })
  })
}

// 合并默认参数
function _mergeDefault(opts, defaultOpts) {
  for (let [key, value] of Object.entries(defaultOpts)) {
    if (key in opts) continue
    opts[key] = value
  }
  return opts
}

// 克隆仓库
function _clone(repo, opts) {
  return new Promise((resolve, reject) => {
    const args = ['clone']
    if (opts.shallow) {
      args.push('--depth', '1')
    }
    args.push('--') // 仅仅是为了区分选项和参数
    args.push(repo)
    args.push(opts.targetPath)
    const proc = spawn('git', args, { cwd: opts.workdir })
    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stderr)
    proc.on('close', (status) => {
      if (status == 0) return resolve()
      reject(new Error(`'git clone' failed with status ${status}`))
    })
  })
}

// 切换到指定分支
function _checkout(branch, cwd) {
  const process = spawn('git', ['checkout', branch], { cwd })
  process.on('close', (status) => {
    if (status == 0) return resolve()
    reject(new Error(`'git checkout' failed with status ${status}`))
  })
}

// 删除 .git 目录
function _removeDotGit(cwd) {
  const process = spawn('rm', ['-rf', '.git'], { cwd })
  process.on('close', (status) => {
    if (status == 0) return resolve()
    reject(new Error(`'rm -rf .git' failed with status ${status}`))
  })
}

module.exports = {
  getUser,
  clone,
  pull,
}
