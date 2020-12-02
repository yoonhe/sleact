import useInput from '@hooks/useInput';
import { Button, Error, Form, Header, Input, Label, LinkContainer } from '@pages/SignUp/styles';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { Redirect } from 'react-router-dom';
import useSWR from 'swr';

// TODO
/** Memo
 *
 * 이미 로그인한 유저는 로그인, 회원가입 페이지에 접근하는 것을 막아줘야한다.
 *
 * GET /user
 * 백엔드에서 내 로그인 정보를 가져올 수 있는 API를 만들어놓음
 * 로그인 되어 있으면 ? true : false 를 반환함
 *
 * 위의 반환값을 이용해 로그인된 유저에게는 로그인, 회원가입페이지를 안보여주면됨.
 */

// TODO
/**
 * Memo
 *
 * 탈 Redux 입 SWR
 *
 * get 요청(가져와서 보여주는 get 요청)은 SWR을 사용하는 것이 더 편리함.
 *  => swr도 내부적으로는 axios를 사용하고 있음
 * 수정, 삭제, 생성은 axios
 *
 * ## useSWR
 * useSWR는 기본적으로 get 요청
 * 첫번째 인자는 url
 * 두번쨰 인자는 콜백함수(사용자가 직접 만들어야함)
 * 두번째 인자인 콜백함수의 arguments로 첫번째 인자(url)가 들어감
 *
 * 제로초는 redux 걷어내고 swr 도입중... 오호!
 *
 */

const LogIn = () => {
  const { data: userData, revalidate } = useSWR('/api/user', fetcher);
  /**
   * ## data
   *  => data가 undefined일 경우는 데이터가 없는 것이 아니라 로딩중인 것
   *
   * ## error
   *  => 서버에서 에러가 터지면 error가 undefined에서 실제 서버에서 터진 error로 값이 바뀜
   *
   * ## revalidate
   *  => get해서 가져온 데이터가 최신 데이터인지 아닌지 서버한테 물어봐서 서버에 최신데이터가 있으면 최신데이터로 업데이트를 해준다.
   *  => 서버로 부터 검증을 받고 싶을때는 revalidate를 사용하고,
   *  => 기존데이터를 서버와는 조금 데이터가 다르더라고 나만의 방식으로 데이터를 변조하고 싶을때는 mutate를 사용하면 된다.
   *
   * ## mutate
   *  => 데이터를 가져왔는데 그 데이터를 사용자 마음대로 바꾸고 싶을 경우
   *  => 기본적으로 swr은 항상 서버한테 내 데이터 최신이야? 라고 물어봄, 근데 가끔 서버와는 다르게 나만의 데이터로 변조하고 싶을 경우에 mutate를 사용해줌
   */
  const [logInError, setLogInError] = useState('');
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      axios
        .post(
          '/api/login',
          { email, password },
          {
            withCredentials: true,
          },
        )
        .then(() => {
          revalidate();
        })
        .catch((error) => {
          console.error(error.response);
          setLogInError(error.response?.data);
        });
    },
    [email, password],
  );

  if (userData) {
    // 내가 로그인한 상태라면 workspace 페이지로 리다이렉트 시킨다. 로그인페이지를 볼 수 없음
    return <Redirect to="/workspace/sleact/channel/일반" />;
  }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
          {logInError && <Error>{logInError}</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <a href="/signup">회원가입 하러가기</a>
      </LinkContainer>
    </div>
  );
};

export default LogIn;
