const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const glob = require('glob')
const r = pathString => path.resolve(__dirname, pathString)
const exists = require('fs').existsSync

const project = process.argv[2]
if (!project) return console.log(chalk.bgRed('\n 未输入项目名字无法添加入口 \n'))

const projectPath = r('../src/' + project)
const pattern = r('../src/' + project + '/**.html')

if (!exists(projectPath)) {
  console.log(chalk.bgRed('\n 不存在该项目 请检查 \n'))
  return
}

const findHTMLFile = () => {
  return new Promise((resolve, reject) => {
    glob(pattern, { nodir: true }, (err, files) => {
      if (err) {
        console.log('Error: ', chalk.red(err))
        reject()
      } else {
        if (files.length) {
          resolve(files)
        } else {
          console.log('Error: ', chalk.red('不存在html文件'))
          reject()
        }
      }
    })
  })
}

const getFileName = files => {
  return files.map(f => f.match(/[^<>/\\\|:""\*\?]+\.\w+$/)[0])
}

const addEntry2ProjectJson = htmlEntryArr => {
  const projectObject = JSON.parse(
    fs.readFileSync(projectPath + '/project.json')
  )
  projectObject.entry.html = htmlEntryArr
  fs.writeFileSync(
    projectPath + '/project.json',
    JSON.stringify(projectObject, null, 2)
  )
  return true
}

findHTMLFile()
  .then(getFileName)
  .then(addEntry2ProjectJson)
  .then(() => {
    console.log(chalk.green('\n  入口文件添加完毕  \n'))
  })
  .catch(err => {
    console.log(chalk.red(err))
  })
