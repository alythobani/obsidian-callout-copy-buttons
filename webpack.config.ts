import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";

const config: webpack.Configuration = {
  entry: "./src/main.ts",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  externals: {
    // Mark these as external because they are provided by Obsidian
    "@codemirror/state": "commonjs @codemirror/state",
    "@codemirror/view": "commonjs @codemirror/view",
    obsidian: "commonjs2 obsidian",
  },
  output: {
    filename: "main.js",
    path: __dirname,
    libraryTarget: "commonjs",
  },
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};

export default config;
