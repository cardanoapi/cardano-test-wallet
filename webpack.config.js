const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const dotenv = require("dotenv");
const path = require("path");
const webpack = require("webpack");

dotenv.config();

const licenseText = `
/*!
* The cardano-test-wallet module for browser environments.
*
* @author   Nabin Kawan
* @license  MIT
*/
`;

module.exports = {
  entry: "src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    plugins: [
      new TsconfigPathsPlugin({
        extensions: [".js", ".ts"],
      }),
    ],
    fallback: {
      buffer: require.resolve("buffer"),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.BannerPlugin({
      banner: licenseText,
    }),
  ],
  output: {
    filename: "script.js",
    path: path.resolve(__dirname, "dist"),
  },
};
