const isProduction = process.env.NODE_ENV === "production";

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const cssRules = isProduction
  ? [
      { loader: MiniCssExtractPlugin.loader, options: {} },
      { loader: "css-loader", options: { url: false } },
    ]
  : [
      { loader: "style-loader" },
      {
        loader: "css-loader",
        options: {
          url: false,
          modules: { namedExport: false, exportLocalsConvention: "as-is" },
          sourceMap: true,
          importLoaders: 1,
        },
      },
    ];

module.exports = {
  mode: isProduction ? "production" : "development",
  entry: "./src/index.tsx",
  output: {
    path: __dirname + "/dist/",
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        resolve: {
          extensions: [".ts", ".tsx", ".js", ".json"],
        },
        use: "ts-loader",
      },
      {
        test: /\.css$/,
        use: cssRules,
      },
    ],
  },
  devtool: isProduction ? undefined : "source-map",
  plugins: [
    new HtmlWebpackPlugin({
      // inject: prod,
      template: "public/index.html",
    }),
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: "public/assets", to: "assets" }],
    }),
  ],
  devServer: {
    server: {
      type: "https",
      options: {
        key: ".local/cert.key",
        cert: ".local/cert.crt",
        ca: ".local/ca.crt",
      },
    },
  },
};
