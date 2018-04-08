const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.js')
const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpackDevServer = require('webpack-dev-server')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const opn = require('opn')
const chalk = require('chalk')

const fs = require('fs')
const glob = require('glob')
const r = pathString => path.resolve(__dirname, pathString)

let projectEntryObject = {}

const scanConfig = () => {
  return new Promise((resolve, reject) => {
    const pattern = r('../src/**/project.json')

    const readJsonAndPush = filePath => {
      const { name, entry: { js: jsEntry, html: htmlEntry } } = JSON.parse(
        fs.readFileSync(filePath)
      )
      if (name && jsEntry && htmlEntry) {
        projectEntryObject[name] = { name, jsEntry, htmlEntry }
      } else {
        console.log(
          chalk.bgRed(
            '\n\n  项目内 project.json 配置错误  \n 请检查文件内 name/entry 配置是否正常 \n'
          )
        )
        reject()
      }
    }

    glob(pattern, { nodir: true }, (err, files) => {
      if (err) {
        console.log(err)
        reject()
      } else {
        if (files.length) {
          files.map(readJsonAndPush)
          resolve()
        } else {
          reject()
        }
      }
    })
  })
}

const addHash = str => {
  let splitByDotArr = str.split('.')
  splitByDotArr[splitByDotArr.length - 1] = '[hash:6]'
  splitByDotArr.push('js')
  return splitByDotArr.join('.')
}

const generateHtmlWebpackPluginSettings = (htmlEntry, projectName) => {
  if (typeof htmlEntry === 'string') {
    htmlEntry = [htmlEntry]
  }
  return htmlEntry.map(entry => {
    return new HtmlWebpackPlugin({
      template: `./src/${projectName}/${entry}`,
      filename: `${entry.split('.')[0]}.html`
    })
  })
}

const runDev = project => {
  const webpackConfig = merge(baseWebpackConfig, {
    mode: 'development',
    entry: `./src/${project.name}/${project.jsEntry}`,
    output: {
      path: r('../'),
      filename: `dist/${project.name}/${addHash(project.jsEntry)}`,
      publicPath: '/'
    },
    devtool: 'cheap-module-eval-source-map',
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      ...generateHtmlWebpackPluginSettings(project.htmlEntry, project.name),
      new ExtractTextPlugin(`dist/${project.name}/css/style.[hash:6].css`),
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ]
  })

  webpackDevServer.addDevServerEntrypoints(webpackConfig, {
    contentBase: r('../src/'),
    inline: true,
    publicPath: '/',
    progress: true,
    disableHostCheck: true,
    stats: { colors: true },
    port: 8080,
    host: 'localhost'
  })

  const compiler = webpack(webpackConfig)

  const server = new webpackDevServer(compiler)

  server.listen(8080)

  setTimeout(() => {
    console.log(
      chalk.green(
        `\n\n 项目[${project.name}]热更新已启动 \n\n http://localhost:8080  \n\n`
      )
    )
    opn('http://localhost:8080')
  }, 0)
}

const project = process.argv[2]
if (!project) return console.log(chalk.red('\n 未输入打包项目 \n'))

scanConfig()
  .then(() => {
    if (typeof projectEntryObject[project] === 'object') {
      runDev(projectEntryObject[project])
    } else {
      console.log(chalk.red('\n\n  警告： 没有对应的项目名 请检查 \n\n'))
    }
  })
  .catch(err => {
    console.log(chalk.bgRed('\n\n 项目启动失败 \n\n'))
  })
