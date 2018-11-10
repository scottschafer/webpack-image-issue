const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const path = require('path');

const sourcePath = path.resolve(__dirname, 'src');
const distPath = path.resolve(__dirname, 'build_dist');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  const plugins = [
    new HtmlWebPackPlugin({
      template: sourcePath + '/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash:4].css',
      chunkFilename: 'styles/[id].[contenthash:4].css'
    }),
    new ForkTsCheckerWebpackPlugin({
      tslint: true,
      checkSyntacticErrors: true
    })
  ];

  if (isProd) {
    plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /\/environments\/environment\.ts/, `${sourcePath}/environments/environment.prod.ts`
      ),
      new UglifyJsPlugin({
        sourceMap: true
      })
    );
  } else {
    plugins.push(new webpack.NamedModulesPlugin(), new webpack.HotModuleReplacementPlugin());
  }

  const config = {
    resolve: {
      extensions: [
        '.webpack.js',
        '.web.js',
        '.js',
        '.ts'
      ],
      alias: {
        '@app': path.resolve(__dirname, 'src/app'),
        '@src': path.resolve(__dirname, 'src')
      }
    },
    entry: {
      app: sourcePath + '/index.ts',
    },
    output: {
      path: distPath,
      filename: 'scripts/[name].bundle.[hash:4].js',
    },
    module: {
      rules: [{
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          loader: 'file-loader',
          options: {
            name: 'assets/images/[name].[ext]'
          }
        }, {
          test: /\.(eot|ttf|woff|woff2)$/,
          loader: 'file-loader',
          options: {
            name: 'assets/fonts/[name].[ext]'
          }
        },
        {
          test: /\.html$/,
          loader: 'html-loader',
          options: {
            minimize: true
          }
        },
        {
          test: /\.css$/,
          use: [
            'css-loader',
            MiniCssExtractPlugin.loader,
            //'style-loader',
          ]
        },
        {
          test: /\.scss$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader',
            {
              loader: 'resolve-url-loader',
              options: {
                root: '/Users/sschafer/GITHEAD/cis/healthline/hl-datasolution/src/main/webapp/src'
              }
            },
            'sass-loader'
          ]
        },
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'resolve-url-loader',
              options: {
                root: '/Users/sschafer/GITHEAD/cis/healthline/hl-datasolution/src/main/webapp/src/'
              }
            },
            'less-loader'
          ]
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [{
              loader: 'ng-annotate-loader',
              options: {
                ngAnnotate: 'ng-annotate-patched',
                sourcemap: !isProd,
              },
            },
            {
              loader: 'ts-loader',
              options: {
                configFile: sourcePath + '/tsconfig.app.json',
                // disable type checker - we will use it in fork plugin
                transpileOnly: true,
              }
            }
          ]
        }
      ],
    },
    plugins,
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    // devtool: 'eval-source-map',
    devServer: {
      contentBase: distPath,
      hot: true,
      port: 3000
    }
  };

  if (!isProd) {
    config.devtool = 'source-map';
  }

  return config;
};