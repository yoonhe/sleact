import Chat from '@components/Chat';
import { ChatZone, Section, StickyHeader } from '@components/ChatList/styles';
import { IChat, IDM } from '@typings/db';
import React, { FC, memo, RefObject, useCallback } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

interface Props {
  scrollbarRef: RefObject<Scrollbars>;
  chatSections: { [key: string]: (IDM | IChat)[] };
  isReachingEnd?: boolean;
  isEmpty: boolean;
  setSize: (f: (size: number) => number) => Promise<(IDM | IChat)[][] | undefined>;
}

//TODO
/**
 *  ## makeSection 참고
 *    T의 타입은 IDM | IChat
 *    key는 string
 *
 *  ## react-custom-scrollbars
 *    기본 브라우저 스크롤바보다 디자인적으로 좋음
 *    스크롤 이벤트를 실제로 발생시키는 대상에 스크롤을 걸어주는것이 가능해짐
 *    npm i react-custom-scrollbars @types/react-custom-scrollbars
 *    라이브러리는 인기 많은 라이브러리를 받는 것을 추천..! 강!추!
 *    오픈소스는 다운로드수가 많으면 버그가 적다
 *     autoHide : 몇초뒤에 스크롤바 사라지는것
 *    ref :
 *    onScrollFrame :
 *
 *  ##
 */

// FIXME
/**
 * 최적화 필요 React.memo 사용
 */

/**
 * 컴포넌트를 memo로 감싸주면된다
 * props로 전달받은 애들이 바뀌어야만 해당 컴포넌트가 리렌더링된다.
 *
 * props, state가 바뀌었을때 부모컴포넌트가 리렌더링 되었을때 컴포넌트가 리렌더링 된다
 *
 * 부모컴포넌트가 리렌더링되어도 memo를 걸어준 자식 컴포넌트는 props가 바뀌지않는한 자식컴포넌트는 리렌더링되지 않는다..(기억기억!!)
 */
const ChatList: FC<Props> = ({ setSize, isReachingEnd, isEmpty, scrollbarRef, chatSections }) => {
  const onScroll = useCallback(
    (values) => {
      if (values.scrollTop === 0 && !isReachingEnd && !isEmpty) {
        setSize((size) => size + 1).then(() => {
          scrollbarRef.current?.scrollTop(scrollbarRef.current?.getScrollHeight() - values.scrollHeight);
          /**
           * scrollbarRef.current?.getScrollHeight() : 업데이트된 후에 scorll height
           * values.scrollHeight : 불러오기전의 scroll height
           */
        });

        /**
         * clientHeight => 스크롤바 길이
         * scrollHeight => 스크롤바 바디 전체 길이
         * scrollTop => 스크롤바 바디 전체 길이 - 스크로바 길이
         *  clientHeight + scrollTop = scrollHeight
         *
         * 현재 채팅창은 리벌스되어 스크롤바를 위로 올렸을때 무한스크롤링이 일어나므로 scrollTop이 0일때 무한 스크롤링이 실행되면 됨
         */
      }
    },
    [isReachingEnd, isEmpty],
  );

  /**
   *
   * ## key값 중요
   * map 안에 들어가는 컴포넌트에는 반드시 key 값을 넣어주자
   * 세션들 간에 구별이 됨
   * 최적화
   * key를 안붙여주면 리액트가 리렌더링할때 누구를 리렌더링해야되는지 구별을 못해서 전체를 리렌더링해버린다
   * key를 걸어야 바뀐 대상만 리렌더링함
   * 매우 중요
   *
   *
   * position: stickey 신기!! 알아보기
   */
  return (
    <ChatZone>
      {/* 부모컴포넌트인 다이렉트메세지에서 자식컴포넌트인 챗리스트 컴포넌트에 빨대를 꼽는다 scrollbarRef 
        이렇게 하면 부모컴포넌트에서 자식컴포넌트를 컨트롤 할 수 있음

        DirectMessages에서 
        const scrollbarRef = useRef<Scrollbars>(null); 이렇게 useRef를 선언해주고
        <ChatList
        scrollbarRef={scrollbarRef} /> 이렇게 넘겨주는거임
      */}
      <Scrollbars ref={scrollbarRef} autoHide onScrollFrame={onScroll}>
        {Object.entries(chatSections).map(([date, chats]) => {
          return (
            <Section key={date}>
              <StickyHeader>
                <button>{date}</button>
              </StickyHeader>
              {chats.map((chat) => (
                <Chat key={chat.id} data={chat} />
              ))}
            </Section>
          );
        })}
      </Scrollbars>
    </ChatZone>
  );
};

export default memo(ChatList);
