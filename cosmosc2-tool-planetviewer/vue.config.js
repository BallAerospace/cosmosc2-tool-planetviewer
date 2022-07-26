const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  publicPath: '/tools/planetviewer',
  outputDir: 'tools/planetviewer',
  filenameHashing: false,
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    devServer: {
      port: 2918,
      watchOptions: {
        ignored: ['node_modules'],
        aggregateTimeout: 300,
        poll: 1500,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      public: 'localhost:2918/tools/planetviewer',
    },
    plugins: [
      // Copy Cesium Assets, Widgets, and Workers to a static directory
      new CopyWebpackPlugin([
        { from: 'node_modules/cesium/Build/Cesium/Workers', to: 'Workers' },
      ]),
      new CopyWebpackPlugin([
        {
          from: 'node_modules/cesium/Build/Cesium/ThirdParty',
          to: 'ThirdParty',
        },
      ]),
      new CopyWebpackPlugin([
        { from: 'node_modules/cesium/Build/Cesium/Assets', to: 'Assets' },
      ]),
      new CopyWebpackPlugin([
        { from: 'node_modules/cesium/Build/Cesium/Widgets', to: 'Widgets' },
      ]),
      new webpack.DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify(''),
      }),
    ],
    module: {
      // Removes these errors: "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted"
      // https://github.com/AnalyticalGraphicsInc/cesium-webpack-example/issues/6
      unknownContextCritical: false,
      unknownContextRegExp: /\/cesium\/cesium\/Source\/Core\/buildModuleUrl\.js/,
    },
  },
  chainWebpack(config) {
    config.module
      .rule('js')
      .use('babel-loader')
      .tap((options) => {
        return {
          rootMode: 'upward',
        }
      })
    config.externals([
      'vue',
      'vuetify',
      'vuex',
      'vue-router',
    ])      
  },
}
