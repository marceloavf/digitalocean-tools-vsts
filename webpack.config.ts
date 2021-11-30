import * as path from 'path'
import * as fs from 'fs'
import * as webpack from 'webpack'
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const config: webpack.Configuration = {
  mode: 'production',
  context: __dirname,
  node: {
    '__dirname': false
  },
  target: 'node',
  externals: {
    'azure-pipelines-task-lib': 'commonjs2 azure-pipelines-task-lib',
    'azure-pipelines-task-lib/task': 'commonjs2 azure-pipelines-task-lib/task',
    'azure-pipelines-task-lib/toolrunner': 'commonjs2 azure-pipelines-task-lib/toolrunner',
    'azure-pipelines-tool-lib': 'commonjs2 azure-pipelines-tool-lib',
    'azure-pipelines-tool-lib/tool': 'commonjs2 azure-pipelines-tool-lib/tool',
  },
  devtool: 'inline-source-map',
  entry: () => {
    const source = path.resolve(__dirname, './Tasks')
    return fs.readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({ [dirent.name]: path.resolve(__dirname, './Tasks', dirent.name, 'index.ts') }))
      .reduce((acc, curr) => ({ ...curr, ...acc }), {})
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.resjson'],
    modules: ['node_modules'],
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          configFile: 'tsconfig.json',
        },
      },
    ],
  },
  output: {
    path: path.join(__dirname, 'Tasks'),
    filename: '[name]/index.js',
  },
  optimization: {
    // .vsix package minimize it later, no need to decrease performance now
    minimize: false,
    minimizer: [
      new TerserPlugin({
        extractComments: {
          condition: /^\**!|@preserve|@license|@cc_on/i,
          filename: (fileData: any) => {
            return `${path.dirname(fileData.filename)}/LICENSE.txt`
          },
          banner: (licenseFile: any) => {
            return `License information can be found in ${licenseFile}`
          },
        },
      }),
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['*.js'],
    })
  ],
}

export default config
