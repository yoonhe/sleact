import { ChatWrapper } from '@components/Chat/styles';
import { IChat, IDM, IUser } from '@typings/db';
import React, { FC, memo, useMemo } from 'react';
import gravatar from 'gravatar';
import { useParams } from 'react-router';
import dayjs from 'dayjs';
import regexifyString from 'regexify-string';
import { Link } from 'react-router-dom';

interface Props {
  data: IDM | IChat;
}
// FIXME
/**
 * 최적화 memo
 * 말단 컴포넌트는 memo로 감싸주는게 좋다
 *
 * 큰 부모컴포넌트(layouts, page)는 memo하는게 더 손해
 *  ==> props가 바뀌었는지 안바뀌었는지 체크하느라 비용이 더 든다
 *
 *
 * ## 프로파일러 적극 활용하기
 *  ==> 내가 바꾸고싶은 부분과 전혀 상관없는 부분이 색깔이 입혀져 있다면 거기서 이유를 찾고 최적화를 시도해봐야함
 *  ==> why did this render ? 참고
 *  ==> 어떤 state, props가 바뀌어서 리렌더링되었다고 알려줌
 *
 *  ex)
 *  채팅창에 글자만 치고 전송버튼도 안눌렀는데 채팅리스트가 리렌더링 된다?
 *  chatSection 최적화가 필요함 문제 파악하기
 *  문제 해결하기 => useMemo, React.memo로 해결
 *
 *  최적화 후 크롬 프로파일러탭에서 클리어 => 시작 눌러서 다시 테스트 해보기
 *
 *
 *  최적화 할때는 확실히 이부분떄문에 성능에 문제가 있다 화면이 버벅거린다 라고 느낄때 해줘야함.
 *  미리 문제가 될거야 하고 지레 짐작해서 최적화하는 것은 오바이다, 진짜 문제를 잡는데 방해되는 경우가 많음.
 *
 *  usememo, memo 남용하는 것은 비추
 */
const Chat: FC<Props> = memo(({ data }) => {
  const { workspace } = useParams<{ workspace: string; channel: string }>();
  const user: IUser = 'Sender' in data ? data.Sender : data.User;
  const result = useMemo<(string | JSX.Element)[]>(
    () =>
      regexifyString({
        pattern: /@\[(.+?)]\((\d+?)\)|\n/g,
        decorator(match, index) {
          const arr: string[] | null = match.match(/@\[(.+?)]\((\d+?)\)/)!;
          if (arr) {
            return (
              <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
                @{arr[1]}
              </Link>
            );
          }
          return <br key={index} />;
        },
        input: data.content,
      }),
    [data.content],
  );

  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        <p>{result}</p>
      </div>
    </ChatWrapper>
  );
});

export default Chat;
