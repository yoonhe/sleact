import useSocket from '@hooks/useSocket';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import useSWR from 'swr';
import { CollapseButton } from './styles';

// MEMO
/**
 * ## 소켓
 *
 * 한페이지 한페이지 나누어져있는 전통적인 어플리케이션
 *  => 한페이지별로 웹소켓 연결을 맺고 페이지 나갈때 연결 끊고 새로운 페이지갈떄 연결 맺고
 *  => 한페이지별로 소켓 연결 맺고 끊고를 반복함
 *
 * 싱글페이지 어플리케이션
 *  => 연결을 한번 맺으면 브라우저에서 종료하기 전까지 연결을 끊지 않음
 *  => 한번 연결 맺었던 객체를 두고두고 재사용해야함
 */

interface Props {
  userData?: IUser;
}

const DMList: FC<Props> = ({ userData }) => {
  const { workspace } = useParams<{ workspace: string }>();
  const [channelCollapse, setChannelCollapse] = useState(false);
  const { data: memberData } = useSWR<IUser[]>(`/api/workspace/${workspace}/members`, fetcher);
  // workspace/:workspace => :workspace 는 router parameter
  // workspace/heaeun 으로 보내면 useParams으로 가져왔을때 {workspace:heaeun}으로 담긴다

  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);
  const [socket, disconnect] = useSocket(workspace);
  // workspace에서 맺은 소켓을 가져오는것 두번 연결하는 것이 아님
  // 소켓 연결을 두번맺게 되면 메시지가 두번 가게됨 그때는 소켓이 여러개 연결된게 아닌지 확인이 필요함

  const [onlineList, setOnlineList] = useState<number[]>([]);

  //TODO
  /**
   * workspace에서 emit 'onlineList'으로 보내면 서버에서 받아서 클라이언트로 'onlineList'를 담아 보냄
   * 클라이언트에서는 on 'onlineList'으로 받을 수 있음
   *
   *
   * 여러명 테스트 하고싶을때는 다른 브라우저 또는 같은 브라우저에서 새 시크릿창을 띄워야함, 같은 브라우저는 같은 사람으로 취급됨
   */

  useEffect(() => {
    socket?.on('onlineList', (data: number[]) => {
      setOnlineList(data);
    });
  }, [socket]);

  return (
    <div>
      <h2>
        <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
          <i
            className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
            data-qa="channel-section-collapse"
            aria-hidden="true"
          />
        </CollapseButton>
        <span>Direct Message</span>
      </h2>
      <div>
        {!channelCollapse &&
          memberData?.map((member) => {
            const isOnline = onlineList.includes(member.id);
            return (
              /**
               * Link는 단순히 이동을 하는 것
               *
               * NavLink는 눌렀던 링크에 highlight가 됨
               *  => NavLink를 누르면 activeClassName이 적용된다.
               */
              <NavLink key={member.id} activeClassName="selected" to={`/workspace/${workspace}/dm/${member.id}`}>
                {/* member.id에 해당하는 유저와 dm 나누는 공간으로 라우팅 */}
                <i
                  className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
                    isOnline ? 'c-presence--active c-icon--presence-online' : 'c-icon--presence-offline'
                  }`}
                  aria-hidden="true"
                  data-qa="presence_indicator"
                  data-qa-presence-self="false"
                  data-qa-presence-active="false"
                  data-qa-presence-dnd="false"
                />
                <span>{member.nickname}</span>
                {member.id === userData?.id && <span> (나)</span>}
              </NavLink>
            );
          })}
      </div>
    </div>
  );
};

export default DMList;
