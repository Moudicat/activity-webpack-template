const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.js')
const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
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
        console.error('\n\n  项目内 project.json 配置错误  \n\n')
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

const build = project => {
  webpack(
    merge(baseWebpackConfig, {
      mode: 'production',
      entry: `./src/${project.name}/js/main.js`,
      output: {
        path: r(`../dist/${project.name}`),
        filename: addHash(project.jsEntry),
        publicPath: './'
      },

      plugins: [
        new CleanWebpackPlugin([r(`../dist/${project.name}`)], {
          root: r('../')
        }),
        new ExtractTextPlugin('css/style.[hash:6].css'),
        new HtmlWebpackPlugin({
          template: `./src/${project.name}/index.html`,
          filename: 'index.html'
        })
      ]
    })
  ).run((err, stats) => {
    if (err) {
      console.error('[webpack:run]', err)
    } else {
      if (stats.hasErrors()) {
        stats.compilation.errors.forEach(err =>
          console.error('[webpack:error]', err)
        )
        return
      }
      if (stats.hasWarnings()) {
        stats.compilation.warnings.forEach(err =>
          console.error('[webpack:warning]', err)
        )
        return
      }

      console.log(`\n\n   项目[${project.name}]打包完成    \n\n`)
    }
  })
}

const project = process.argv[2]
if (!project) return console.log('\n 未输入打包项目 \n')

scanConfig().then(() => {
  if (typeof projectEntryObject[project] === 'object') {
    build(projectEntryObject[project])
  } else {
    console.error('\n\n  警告： 没有对应的项目名 请检查 \n\n')
  }
})
