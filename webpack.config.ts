import path from "path";
import webpack from "webpack";
import TerserWebpackPlugin from "terser-webpack-plugin";

const config: webpack.Configuration = {
  entry: "./example/index.jsx",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_module/,
        use: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".jsx", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin({
        test: /\.jsx?$/,
      }),
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, "public"),
    compress: true,
    port: 8080,
  },
};

export default config;
