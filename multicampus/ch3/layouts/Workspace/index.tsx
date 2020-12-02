import ChannelList from '@components/ChannelList';
import DMList from '@components/DMList';
import useSocket from '@hooks/useSocket';
import {
  AddButton,
  Channels,
  Chats,
  Header,
  MenuScroll,
  ProfileImg,
  RightMenu,
  WorkspaceButton,
  WorkspaceName,
  Workspaces,
  WorkspaceWrapper,
} from '@layouts/Workspace/styles';
import Channel from '@pages/Channel';
import DirectMessage from '@pages/DirectMessage';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useEffect } from 'react';
import { Link, Route, Switch, useParams } from 'react-router-dom';
import useSWR from 'swr';
import gravatar from 'gravatar';

const Workspace = () => {
  // TODO
  /**
   * GET /user
   * 내 로그인 정보를 가져옴, 로그인되어있지 않으면 false
   * return: IUser | false
   *
   * gravatar => npm i gravatar @types/gravatar
   * 프로필 이미지를 등록하지 않았다면 이메일에 따라서 프로필 아이콘을 만들어줌(슬랙 프로필 아이콘 참고)
   */

  const { workspace } = useParams<{ workspace: string }>();
  // TODO
  // useParams을 컨트롤을 눌러 클릭해보면 타입을 파악할 수 있음
  // export function useParams<Params extends { [K in keyof Params]?: string } = {}>(): Params;
  // 한번 분석이 완료되었다면 타입이 정확해지니까 믿고 사용할 수 있어진다.
  // workspace가 문자열이라는 것을 확실하게 믿고 사용할 수 있다.
  // 처음 작성할땐 귀찮고 가독성도 안좋지만 그 과정이 끝나면 안정성이 생김

  const { data: userData } = useSWR<IUser>('/api/user', fetcher);
  // 로그인 여부 파악하는 swr
  // 어떤 데이터가 swr로 오는지를 정의해줘야함 => useSWR<IUser>

  const { data: channelData } = useSWR<IChannel[]>(`/api/workspace/${workspace}/channels`, fetcher);

  const [socket, disconnectSocket] = useSocket(workspace);

  // TODO
  /**
   * useSocket을 실행하면 workspace에 접속이됨
   * useSocket을 여러번 호출하면 처음 연결했던 소켓을 재사용한다, 여러번 연결되는 것이 아님
   */

  useEffect(() => {
    return () => {
      console.info('disconnect socket', workspace);
      disconnectSocket();
    };
  }, [workspace]);

  // TODO
  /**
   * 사용자 정보가 로딩이되면 서버로 로그인 이벤트를 보낸다
   * 같은 워크스페이스에 접속해 있는 모든사람들이 이벤트를 받음. 서버에서 해당 유저를 onlineList에 담아 클라이언트로 보내줌
   */
  useEffect(() => {
    if (userData) {
      console.info('로그인하자');
      socket?.emit('login', { id: userData?.id, channels: [] });
    }
  }, [userData]);

  return (
    <div>
      <Header>
        {userData && (
          <RightMenu>
            <span>
              <ProfileImg src={gravatar.url(userData.email, { s: '36px', d: 'retro' })} />
              {/* gravatar => 이메일 기반으로 고유한 아이콘을 만들어줌, s:'아이콘 사이즈', d: '아이콘 스타일(github같은 아이콘은 retro)'*/}
            </span>
          </RightMenu>
        )}
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {/* swr로 불러오는 데이터는 로딩중일때 undefined일 가능성이 있기때문에 optional chaning을 꼭 걸어준다, undefined일 경우를 대비*/}
          {userData?.Workspaces?.map((ws) => {
            return (
              <Link key={ws.id} to={`/workspace/${ws.url}`}>
                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton>+</AddButton>
        </Workspaces>

        <Channels>
          <WorkspaceName>{userData?.Workspaces.find((v) => v.url === workspace)?.name}</WorkspaceName>
          <MenuScroll>
            <ChannelList userData={userData} channelData={channelData} />
            <DMList userData={userData} />
          </MenuScroll>
        </Channels>

        <Chats>
          {/* 같은 채팅공간이지만 채널에서 채팅(그룹채팅)할때와 디엠으로 채팅(1:1 채팅)할때 두경우가 다르기때문에 route로 나눠줘야함.  */}
          <Switch>
            <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
            <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>
    </div>
  );
};

export default Workspace;
