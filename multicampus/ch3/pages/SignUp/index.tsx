import React, { useCallback, useState } from 'react';
import { Header, Button, Error, Form, Input, Label, LinkContainer, Success } from '@pages/SignUp/styles';

import useInput from '@hooks/useInput';
// TODO
/**
 * ## 질문
 * 1. react가 렌더링되는 과정
 *  - state, props가 바꼈을때
 *  - 부모컴포넌트가 리렌더링 되었을때 자식컴포넌트도 따라서 리렌더링이 됨.
 *  - 함수컴포넌트가 다시 실행됨
 *    - 컴포너트 전체가 리렌더링되는게 아님, `virtual dom`이 실행되어 실제로 바뀐부분만 리액트가 화면을 업데이트해줌
 *    - `return` 부분이 진짜로 바뀌지 않으면 함수는 다시 호출 되더라도 실제로 화면을 다시 그리지는 않는다(`virtual dom`의 역할)
 *
 * 2. `class`와 `hoock`의 장.단점
 *  - `hoock`이 훨씬 더 효율적, 코드가 짧고, 재사용성도 훨씬 더 좋음, 각각의 컴포넌트들의 독립성이 매우 높아짐
 *
 * 3. 타입스크립트 좋은 공부법
 *  - 타입스크립트는 자바스크립트에서 매개변수, return 값, 변수에 타입을 정의하는 것
 *  - 리액트와 노드에서도 원리는 똑같다
 *  - 각각의 변수, 매개변수, return 값에 어떤 타입이 들어가야하는지를 찾아보고 적용해주면 된다..!!!
 */

// TODO
/** Memo
 * 중복 제거
 * custom hooks
 * 3번 연달아 나오면 중복 제거 시도
 */

import axios from 'axios';

const SignUp = () => {
  /** Memo
   *
   * state 만드는 기준
   * 화면이 바뀌는 부분에서 사용하는 데이터를 state로 만들어준다
   * react는 데이터가 바뀌면 데이터에따라 화면이 바뀐다
   *
   */
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [mismatchError, setMismatchError] = useState(false);

  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, _1, setPassword] = useInput('');
  const [passwordCheck, _2, setPasswordCheck] = useInput('');

  const onChangePassword = useCallback(
    (e) => {
      setPassword(e.target.value);
      setMismatchError(passwordCheck !== e.target.value);
    },
    [passwordCheck],
  );

  const onChangePasswordCheck = useCallback(
    (e) => {
      setPasswordCheck(e.target.value);
      setMismatchError(password !== e.target.value);
    },
    [password],
  );

  /** MEMO
   *
   * useCallback(function, [])
   *
   * ==== function ====
   * 함수 자체를 캐싱해줌(재사용)
   *
   * state, props, 부모컴포넌트가 바뀌면 컴포넌트가 리렌더링됨,
   * 이때 return 부분에 함수를 빼지않고 직접 넣어주게되면 return 부분이 실행될때마다
   * 함수가 매번 새로 생성된다, 함수가 매번 새로 생성되면 비교했을때 매번 false가 나오기때문에 계속 리렌더링됨(비효율적)
   *
   * ==== [dependency] ====
   * dependency가 변경되면 기존 캐싱 함수를 지우고 새로 함수를 만든다
   *
   * ==== useCallback은 언제 써야할까? ====
   * `return`안에 들어가는 함수들은 반드시 `userCallback`으로 감싸준다
   */

  /**
   * useMemo(function, [])
   * 함수의 `return` 값을 캐싱함)
   *
   * 프론트엔드는 정교함 디테일
   * 해커라고 생각하고 서비스를 사용하는 마인드?
   */

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!nickname || !nickname.trim()) {
        setSignUpError('닉네임을 입력해주세요'); // 닉네임 공백 방지
        return;
      }
      if (!mismatchError) {
        // 비밀번호랑 비밀번호 확인이 다를경우 나는 에러
        setSignUpError('');
        setSignUpSuccess(false);
        /** Memo
         * axios는 서버와 클라이언트에서 모두 사용가능하다
         * 편함!
         */
        axios
          .post('/api/user', { email, nickname, password })
          .then(() => {
            setSignUpSuccess(true);
          })
          .catch((error) => {
            console.error(error.response);
            setSignUpError(error.response?.data);
          });
      }
    },
    [email, password, nickname, passwordCheck],
  );

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
        <Label id="nickname-label">
          <span>닉네임</span>
          <div>
            <Input type="text" id="nickname" name="nickname" value={nickname} onChange={onChangeNickname} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
        </Label>
        <Label id="password-check-label">
          <span>비밀번호 확인</span>
          <div>
            <Input
              type="password"
              id="password-check"
              name="password-check"
              value={passwordCheck}
              onChange={onChangePasswordCheck}
            />
          </div>
          {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
          {signUpError && <Error>{signUpError}</Error>}
          {signUpSuccess && <Success>회원가입되었습니다! 로그인해주세요.</Success>}
        </Label>
        <Button type="submit">회원가입</Button>
      </Form>
      <LinkContainer>
        이미 회원이신가요?&nbsp;
        <a href="/login">로그인 하러가기</a>
      </LinkContainer>
    </div>
  );
};

export default SignUp;
