import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { WebPlugin } from "web-webpack-plugin";

export default {
  entry: { index: "./src/index.tsx" },
  mode: "development",
  devtool: "inline-source-map",
  output: {
    filename: "index.js",
    path: resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.js|ts|tsx|jsx$/,
        exclude: /(node_modules)/,
        use: {
          // `.swcrc` can be used to configure swc
          loader: "swc-loader",
        },
      },
    ],
  },
  plugins: [
    new WebPlugin({
      filename: "index.html",
      template: "./index.html",
      requires: ["index"],
    }),
  ],
};
