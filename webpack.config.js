const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "idb.js",
    library: "@workablehr/idb",
    libraryTarget: "commonjs2"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /\/node_modules\/(?!(idb-keyval))\/.*/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/env",
                {
                  useBuiltIns: 'entry',
                  corejs: 3,
                  debug: true,
                  targets: {
                    "browsers": ["last 2 versions", "safari >= 7"]
                  }
                }
              ]
            ]
          }
        }
      }
    ]
  }
};
