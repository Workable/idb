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
          loader: "babel-loader"
        }
      }
    ]
  }
};
