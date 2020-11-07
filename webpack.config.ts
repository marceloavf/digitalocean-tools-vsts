import * as path from 'path'
import * as webpack from 'webpack'
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin')

const config: webpack.Configuration = {
  mode: 'production',
  context: __dirname,
  target: 'node',
  devtool: 'inline-source-map',
  node: { __dirname: false },
  entry: {
    DigitalOceanSpacesDelete: './Tasks/DigitalOceanSpacesDelete/index.ts',
    DigitalOceanSpacesDownload: './Tasks/DigitalOceanSpacesDownload/index.ts',
    DigitalOceanSpacesUpload: './Tasks/DigitalOceanSpacesUpload/index.ts',
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
        enforce: 'pre',
        exclude: /node_modules/,
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
    }),
    /**
     * Solves problem related to "RangeError: Maximum call stack size exceeded" with node_modules/azure-pipelines-task-lib/internal.js
     */
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(
            './node_modules/azure-pipelines-task-lib/lib.json'
          ),
          to: path.resolve('./Tasks/DigitalOceanSpacesDelete/'),
          force: true,
        },
        {
          from: path.resolve('./node_modules/azure-pipelines-task-lib/Strings'),
          to: path.resolve('./Tasks/DigitalOceanSpacesDelete/'),
          force: true,
        },
        {
          from: path.resolve(
            './node_modules/azure-pipelines-task-lib/lib.json'
          ),
          to: path.resolve('./Tasks/DigitalOceanSpacesDownload/'),
          force: true,
        },
        {
          from: path.resolve('./node_modules/azure-pipelines-task-lib/Strings'),
          to: path.resolve('./Tasks/DigitalOceanSpacesDownload/'),
          force: true,
        },
        {
          from: path.resolve(
            './node_modules/azure-pipelines-task-lib/lib.json'
          ),
          to: path.resolve('./Tasks/DigitalOceanSpacesUpload/'),
          force: true,
        },
        {
          from: path.resolve('./node_modules/azure-pipelines-task-lib/Strings'),
          to: path.resolve('./Tasks/DigitalOceanSpacesUpload/'),
          force: true,
        },
      ],
    }),
    new ReplaceInFileWebpackPlugin([
      {
        dir: path.join(__dirname, 'Tasks'),
        test: /\index.js$/,
        rules: [
          {
            search: /__webpack_require__\(.*\)\(resourceFile\)/,
            replace: 'require(resourceFile)',
          },
        ],
      },
    ]),
  ],
}

export default config
