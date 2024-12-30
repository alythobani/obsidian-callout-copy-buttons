module.exports = {
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
    alias: {
      // Ensure the correct instance of shared CodeMirror packages
      "@codemirror/state": require.resolve(__dirname, "node_modules/@codemirror/state"),
      "@codemirror/view": require.resolve(__dirname, "node_modules/@codemirror/view"),
      // Do not alias @codemirror/language because it is bundled with your plugin
    },
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
};
