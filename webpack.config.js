'use strict';
const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
module.exports = {
  egg: true,
  framework: 'vue',
  entry: {
    app: 'app/web/page/app/app.js'
  },
  resolve: {
    alias: {
      "@":path.resolve("app/web/page/app/"),
      "_":path.resolve("app/web/"),
      "COMP":path.resolve("app/web/page/components"),
    }
  },
  module: {
    rules: [
      { 
        less:{
            options:{
              lessOptions: {
                javascriptEnabled: true,
              }
            }
         }
      }
    ]
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ["json", "javascript"],
      features:["coreCommands","find"]
    })
  ]
};