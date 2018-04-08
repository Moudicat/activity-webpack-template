const { runCommand } = require('./utils/')

module.exports = {
  prompts: {
    name: {
      type: 'string',
      required: true,
      message: '工程名'
    },
    version: {
      type: 'string',
      required: true,
      message: '工程版本',
      default: '1.0.0'
    },
    description: {
      type: 'string',
      required: false,
      message: '工程描述',
      default: '一个活动/专题工程'
    },
    author: {
      type: 'string',
      required: false,
      message: '作者'
    },
    autoInstall: {
      type: 'list',
      message: '在工程创建后是否自动运行 npm install？',
      choices: [
        {
          name: '是的，使用公司私有npm源安装 (推荐)',
          value: 'cnpm',
          short: 'cnpm'
        },
        {
          name: '是的，使用npm源安装',
          value: 'npm',
          short: 'npm'
        },
        {
          name: '是的，使用yarn源安装',
          value: 'yarn',
          short: 'yarn'
        },
        {
          name: '不，我自己来',
          value: false,
          short: 'no'
        }
      ]
    }
  },
  completeMessage: '\n\n   成功初始化工程   \n\n',
  complete: function(data, { chalk }) {
    const cwd = require('path').join(
      process.cwd(),
      data.inPlace ? '' : data.destDirName
    )

    if (data.autoInstall) {
      console.log(`\n\n ${chalk.green('安装工程依赖... 请稍后')} \n`)
      runCommand(data.autoInstall, ['install'], { cwd })
        .then(() => {
          console.log(chalk.green('工程依赖安装成功'))
        })
        .catch(err => {
          console.log(chalk.red('Error:'), e)
        })
    }
  }
}
