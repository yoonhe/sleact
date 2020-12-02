import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import { Header, Container } from '@pages/DirectMessage/styles';
import { IDM } from '@typings/db';
import fetcher from '@utils/fetcher';
import makeSection from '@utils/makeSection';
import axios from 'axios';
import gravatar from 'gravatar';
import React, { useCallback, useEffect, useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { useParams } from 'react-router';
import useSWR, { useSWRInfinite } from 'swr';

const PAGE_SIZE = 20;
const DirectMessage = () => {
  /** Q & A
   * 옵티미스틱 유아이
   *
   * 프론트에서는 바로 표시
   * 백엔드로 요청도 바로 보내지만 백엔드는 자동으로 딜레이가 생김
   *  => 왜 ?
   *    ===> 클라이언트에서 서버로 요청을 보내면 네트워크를 한번 거쳤다가 클리언트로 다시 돌아와야하기때문(저절로 딜레이가 생김)
   *
   *
   */

  // TODO
  /**
   * hooks를 쓰지 않았을때(class 컴포넌트) ?
   *  => 하이오더 컴포넌트를 써야함
   *  => data를 props로 받아서 props가 엄청 비대해짐
   *  =>
   * hooks를 쓰면 ?
   *  => props를 쓸일이 거의 없다
   *  => data를 hooks를 통해 가져올 수 있음
   *  => props 관계가 없어짐
   *  => props 관계가 없어지면 좋은점
   *     => props가 바뀔때마다 리렌더링이 되는데 hooks는 props가 없기떄문에 리렌더링 관리가 용이하다
   *
   * 그런데... hooks가 없다는건지 hoc이 없다는건지? 알아보기
   */

  /**
   * 모든 서비스는 네트워크를 거쳐야하는데
   * 요청을 보냈을때 네트워크를 거쳐 반영을 하려면 즉각 반응이 어렵다
   * 그래서 mutate를 사용해
   *
   * 클라이언트에서 서버로 요청을 보낸다
   * 서버에서 성공을 하던 안하던
   * 먼저 클라이언트에서만 mutate 같은 것으로 데이터를 변조해준다
   *   => 옵티미스틱 유아이라고 검색해보면 된다.
   */

  /**
   * 최적화를 미리하면 디버깅이 어려움
   *
   * 다만들고나서 마지막에 리렌더링이 너무 많이 되는 곳을 최적화해주자.
   */
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const [socket] = useSocket(workspace);
  const { data: myData } = useSWR('/api/user', fetcher);
  const { data: userData } = useSWR(`/api/workspace/${workspace}/user/${id}`, fetcher);
  const { data: chatData, mutate: mutateChat, setSize } = useSWRInfinite<IDM[]>(
    (index) => `/api/workspace/${workspace}/dm/${id}/chats?perPage=${PAGE_SIZE}&page=${index + 1}`,
    fetcher,
  );
  const [chat, onChangeChat, setChat] = useInput('');
  const scrollbarRef = useRef<Scrollbars>(null);
  /**
   * 컴포넌트나 JSX태그에 useRef 연결을 할때 초기값을 null로 해줘야한다(타입스크립트에서는)
   */

  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < PAGE_SIZE); // 20개 불러와서 끝자락에 도달하면 true가 됨, 그럼 다시 20개를 불러옴

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData.id,
            Sender: myData,
            ReceiverId: userData.id,
            Receiver: userData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false).then(() => {
          // mutate는 promise를 지원함
          setChat('');
          if (scrollbarRef.current) {
            console.log('scrollToBottom!', scrollbarRef.current?.getValues());
            scrollbarRef.current.scrollToBottom();
            // 메시지 보낸 후에 스크롤바 맨 아래로
          }
        });
        axios
          .post(`/api/workspace/${workspace}/dm/${id}/chat`, {
            content: chat,
          })
          .catch(console.error);
      }
    },
    [chat, workspace, id, myData, userData, chatData],
  );

  const onMessage = (data: IDM) => {
    if (data.SenderId === Number(id) && myData?.id !== Number(id)) {
      mutateChat((chatData) => {
        chatData[0].unshift(data);
        return chatData;
      }, false).then(() => {
        /**
         * 새로운 메시지가 왔을대 표시해주고
         * 스크롤바는 가장 아래로
         */
        if (scrollbarRef.current) {
          if (
            scrollbarRef.current.getScrollHeight() <
            scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            // 과거 메시지를 보고있을때 새로운 메시지가 오면?
            // 채팅창 맨 아래에서 150px 정도 위에 스크롤이 위치하면 새로운 메시지가 와도 스크롤을 맨 아래로 내리지 않는다.!
          ) {
            console.log('scrollToBottom!', scrollbarRef.current?.getValues());
            scrollbarRef.current.scrollToBottom();
          } else {
            // 과거 메시지르 보고있을때
            // 새로운 메시지가 왔다고 알림이라도 해주기
          }
        }
      });
    }
  };

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, id]);
  /**
   * socket?.on('dm', onMessage);
   *  => onMessage ? dm 소켓 이벤트가 왔을떄 실행될 콜백함수
   *
   *  socket?.on을 햇으면 return에 socket?.off를 꼭 해줘야함
   *  => 왜?
   *    ==> 1번사람과 dm하고 있다가 2번사람과 dm을 하게 되면 1번사람과의 소켓을 off해줘야함
   *    ==> 기존 dm 채팅방에서 나갈때 off를 안해주면 2번 사람과 dm할때 1번 사람의 메세지도 같이 쌓이게됨
   */

  useEffect(() => {
    if (chatData?.length === 1) {
      console.log('toBottomWhenLoaded', chatData, scrollbarRef.current?.getValues());
      scrollbarRef.current?.scrollToBottom();
    }
    /**
     * 처음 로딩될떄 스크롤바를 가장 아래로 내려줌
     */
  }, [chatData]);

  if (!userData || !myData) {
    return null;
  }

  // FIXME
  /**
   * 최적화 적용한 부분
   *
   *
   * 캐싱필요 useMemo 사용
   *
   * children이 바껴서 리렌더링이 되는 것은 어쩔수 없지만 다른 요소에 의해 리렌더링이 되는것들은 최적화를 해줘야함.
   */
  const chatSections = useMemo(makeSection(chatData ? ([] as IDM[]).concat(...chatData).reverse() : []), [chatData]);

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList
        scrollbarRef={scrollbarRef}
        chatSections={chatSections}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox
        onSubmitForm={onSubmitForm}
        chat={chat}
        onChangeChat={onChangeChat}
        placeholder={`Message ${userData.nickname}`}
        data={[]}
      />
    </Container>
  );
};

export default DirectMessage;
