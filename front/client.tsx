import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

import App from './layouts/App';

// TODO

/** MEMO
 * axios base url setting
 */

/**
 * MEMO
 *
 * 프론트엔드 개발자는 네트워크탭도 잘 봐야함
 * payload 확인
 * payload는 https 적용을 하면 노출안됨(해커가 볼 수 없음)
 */

axios.defaults.withCredentials = true;
axios.defaults.baseURL =
  process.env.NODE_ENV === 'production' ? 'https://sleact.nodebird.com' : 'http://localhost:3090';

console.log('env', process.env.NODE_ENV === 'production');
render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.querySelector('#app'),
);
