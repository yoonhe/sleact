import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const isDevelopment = process.env.NODE_ENV !== 'production';

const config: webpack.Configuration = {
  name: 'sleact',
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'inline-source-map' : 'hidden-source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@hooks': path.resolve(__dirname, 'hooks'),
      '@components': path.resolve(__dirname, 'components'),
      '@layouts': path.resolve(__dirname, 'layouts'),
      '@pages': path.resolve(__dirname, 'pages'),
      '@utils': path.resolve(__dirname, 'utils'),
      '@typings': path.resolve(__dirname, 'typings'),
    },
  },
  entry: {
    app: './client',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: { browsers: ['last 2 chrome versions'] },
                debug: isDevelopment,
              },
            ],
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
          env: {
            development: {
              plugins: [['emotion', { sourceMap: true }], require.resolve('react-refresh/babel')],
            },
            production: {
              plugins: ['emotion'],
            },
          },
        },
        exclude: path.join(__dirname, 'node_modules'),
      },
      {
        test: /\.css?$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  // TODO
  /** MEMO
   * 웹팩이 실행되는 순서
   * 1. 타입검사
   * 2. eslint, prettier 검사
   * 3. 개발 서버 구동
   * 1, 2번을 순차적으로 하면 느리기때문에 동시에 하는게 좋음(그 역할을 ForkTsCheckerWebpackPlugin가 해줌)
   * ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
   */
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false, // 옵션은 공식문서 사용해서 필요에 맞게 커스터마이징
    }),
    // TODO
    /**
     * 개발모드와 배포모드에 공통적으로 적용되는 애들을 여기에 적고
     */
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/dist/',
  },
  devServer: {
    historyApiFallback: true,
    port: 3090,
    publicPath: '/dist/',
    proxy: {
      // TODO
      /** MEMO
       * cors 에러가 나는 이유?
       * 브라우저에서 서버로 요청할때 발생
       * 브라우저(3090)와 서버(3095) 주소가 다르기 때문
       * 
       * cors 에러를 피해가는 한가지 방법
       * 서버에서 서버로 요청을 보내면 cors 에러가 발생하지 않는다..!
       * cors 에러는 브라우저에서 서버로 요청을 보낼때만 발생한다.
       * 
       * 꼼수..!
       * 
       * 브라우저에서 같은 주소의 서버로 요청을 보낸다
       * localhost:3090 프론트에서 localhost:3090 프론트서버로 요청을 보낸다
       *  => 브라우저와 서버의 주소가 같기때문에 cors 에러가 발생하지 않는다.
       * 그다음 localhost:3090 프론트서버에서 localhost:3095 백엔드 서버로 한번더 요청을 보낸다
       *  => 이때는 서버랑 서버간에 요청을 보내는거니까 cors에러가 발생하지 않는다.
       * 
       * 중간에 프론트 서버를 거쳐서 cors 에러를 피해가는 꼼수 바로 그것이 proxy
       */
      '/api/': {
        changeOrigin: true,
        target: 'http://localhost:3095',
      },
    },
  },
};
// devServer: {
//     historyApiFallback: true,
//     port: 3090,
//     publicPath: '/dist/',
//   },


 // TODO
  /**
   * 개발모드에거만 적용되는 애들을 여기에 적고
   */
if (isDevelopment && config.plugins) {
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new ReactRefreshWebpackPlugin());
}
if (!isDevelopment && config.plugins) {// 배포모드
  config.plugins.push(new webpack.LoaderOptionsPlugin({ minimize: true }));
  /**
   * 모든 플러그인의 minimize: true 옵션이 셋팅이됨
   * 개발용으로 최소화됨
   * 파일사이즈를 알아서 줄여줌
   * 웹팩4버전부터 들어갔다고ㅇ함
   * 설정이 점점 간소화되고있음.
   */
}

export default config;

/**
 * 빌드시, 결과물이 1개가 아니라 여러개가 나오는데
 * loadable을 적용시켜 주었기 때문에 여러개 쪼개서 빌드가 된것(코드스플리팅)
 * 각 페이지에서 필요한 것만 로딩하면 되기때문에 로딩속도가 빨라짐
 * 
 * 빌드해서 나온 결과물은 dist 폴더에서 볼 수 있음
 * 라이센스까지 적어줌(빌드하게 되면)
 * 
 * ssr을 하지 않아도 된다면 dist 폴더와 index.html을 백엔드 개발자에게 전달해주면 된다.
 */

// const LogIn = loadable(() => import('@pages/LogIn'));
// const SignUp = loadable(() => import('@pages/SignUp'));
// const Workspace = loadable(() => import('@layouts/Workspace'));

// const App = () => {
//   return (
//     <Switch>
//       <Redirect exact path="/" to="/login" />
//       <Route path="/login" component={LogIn} />
//       <Route path="/signup" component={SignUp} />
//       <Route path="/workspace/:workspace" component={Workspace} />
//     </Switch>
//   );
// };

/**
 * ## 유닛테스트
 *    jest + enayme
 * 
 *    readme 요약본 보면서 복습
 * 
 *    최종결과물은 front
 */

//TODO

/**
 * 드래그 앤 드롭
 * 
 * react-beautiful-dnd 라이브러리 사용해서 구현 후 front 폴더에 넣어놓았음.
 */