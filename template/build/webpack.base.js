const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    plugins: [require('autoprefixer')]
  }
}

module.exports = {
  optimization: {
    splitChunks: {
      minChunks: Infinity,
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        }
      }
    }
  },  
  module: {
    rules: [
      {
        test: /\.(html)$/,
        use: [
        {
          loader: 'html-loader',
          options: {
            minimize: true
          }
        },
        {
          loader: path.resolve(__dirname, './html-version-loader.js'),
          options: {
            list: ['static8.ziroom.com/fecommon/mCommon2017/mCommon.js']
          }
        }]
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ],
        exclude: [path.resolve(__dirname, '../node_modules')]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', postcssLoader]
        }),
        exclude: [path.resolve(__dirname, '../node_modules')]
      },
      {
        test: /\.(scss|sass)$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader', postcssLoader]
        })
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/fonts/[name]-[hash].[ext]'
            }
          }
        ]
      }
    ]
  }
}
