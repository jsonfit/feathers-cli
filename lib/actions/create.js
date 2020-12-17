const path = require('path')
const fs = require('fs-extra')
const os = require('os')
const chalk = require('chalk')
const prompts = require('prompts')
const trash = require('trash')
const Metalsmith = require('metalsmith')
const git = require('../utils/git')
const showFig = require('../utils/showFig')
const msPlugins = require('../utils/metalsmithPlugins')
const wrapLoading = require('../utils/wrapLoading')

// 创建新项目
module.exports = async function (appName, options) {
  await showFig(appName)
  const targetDir = path.join(process.cwd(), appName)
  // 目标路径已存在，提示是否删除
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await trash(targetDir)
    } else {
      const question = {
        name: 'action',
        type: 'toggle',
        message: `目录 ${appName} 已存在, 需要清空该目录以创建新项目吗?`,
        initial: true,
        active: '清空并创建新项目',
        inactive: '不要清空，立即退出',
      }
      const { action } = await prompts(question)
      if (!action) return
      await trash(targetDir)
    }
  }

  await fs.ensureDir(targetDir)

  // 拉取项目模板到本地，保存到 ~/.feat-templates
  const defaultTplDir = await wrapLoading(saveTpl, {
    msg: '开始加载项目模板...',
    successText: '项目模板加载完成，开始创建项目：',
    failedText: '模板加载失败',
  })()

  // 根据模板渲染文件
  await renderTpl(appName, defaultTplDir)
}

// 默认模板保存位置 ~/.feat-templates/feathers-template-default
async function saveTpl() {
  const tplDir = path.join(os.homedir(), '.feat-templates')
  await fs.ensureDir(tplDir)
  const defaultTplDir = path.join(tplDir, 'feathers-template-default')
  if (fs.existsSync(path.join(defaultTplDir, '.git'))) {
    // 模板已存在则 pull 最新代码
    await git.pull(defaultTplDir)
  } else {
    // 模板不存在则 clone 到本地
    await git.clone('git@github.com:jsonfit/feathers-template-default.git', {
      workdir: tplDir,
    })
  }
  return defaultTplDir
}

// 根据模板生成文件
async function renderTpl(appName, tplDir) {
  const metaFile = path.join(tplDir, 'metadata/app.js')
  if (!fs.existsSync(metaFile)) {
    throw new Error('模板变量缺失，终止项目创建！')
  }
  const meta = require(metaFile)
  const { questions, filters } = meta()

  questions.projectName.initial = appName

  const appTplDir = path.join(tplDir, 'templates/app')
  const appTargetDir = path.join(process.cwd(), appName)

  return new Promise((resolve, reject) => {
    Metalsmith(process.cwd())
      .metadata({
        projectName: '项目名称',
        projectDescription: '项目描述',
        gitUser: git.getUser(),
      })
      .source(appTplDir)
      .destination(appTargetDir)
      .use(msPlugins.askQuestions(questions))
      .use(msPlugins.filterFiles(filters))
      .use((files, metalsmith, done) => {
        // console.log(metalsmith.metadata())
        done()
      })
      .use(msPlugins.renderTemplateFiles())
      .build((err) => {
        if (err) {
          console.log(`Metalsmith build error: ${err}`)
          reject(err)
          return
        }
        console.log(`👏  项目 ${chalk.cyan(appName)} 创建完毕！`)
        resolve()
      })
  })
}
