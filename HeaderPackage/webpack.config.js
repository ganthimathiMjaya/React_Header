const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  entry: './src/index.js', // Your entry fil
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'MyReactPackage',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    assetModuleFilename: 'assets/[hash][ext][query]',
    publicPath: './', // Set to relative path
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles.css', // Bundle CSS into a single file
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html', // Path to your HTML template
      filename: 'index.html', // Name of the generated HTML file
      inject: true, // Automatically inject scripts and styles
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/devextreme/dist/css/icons', // DevExtreme icon fonts
          to: 'assets/icons', // Output folder in your `dist` directory
        },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'], // Support both JS and JSX files
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Match both .js and .jsx files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',  // For modern JavaScript (ES6+)
              '@babel/preset-react' // For JSX and React syntax
            ],
            plugins: [
              // Optional: If you need to enable JSX parsing manually
              '@babel/plugin-syntax-jsx'
            ],
          },
        },
      },
      {
        test: /\.(png|jpg|gif|svg|woff|woff2|ttf|eot)$/i,
        type: 'asset/resource',         // Use asset/resource type
      },
      {
          test: /\.css$/,
          use: ['style-loader', 'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('postcss-url')({
                      url: 'rebase', // Ensures paths are adjusted to the output
                    }),
                  ],
                },
              },
            }], // Enable CSS handling
        },
    ],
  },
  //   output: {
  //   assetModuleFilename: 'assets/[hash][ext][query]', // Organizes assets in a specific folder
  //   publicPath: './',// Makes URLs relative to the `dist` folder
  // },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
    'react-router-dom': 'react-router-dom',
  },
  devServer: {
    historyApiFallback: true, // For React Router to handle routes
    static: {
      directory: path.join(__dirname, 'node_modules/my-react-etl/dist'), // Adjust path as needed
    },
    compress: true,
    port: 3000,
  },
};
