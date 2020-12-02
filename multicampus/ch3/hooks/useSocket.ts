import io from 'socket.io-client';

// TODO
/**
 * 웹소켓
 * 
 * 주소를 http와 공유를 할 수 있다.
 * 웹소켓은 원래 프로토콜이 http가 아니라 ws이다
 * ws로 하더라도 http랑 같은 포트에서 돌아갈 수 있기때문에 별도의 주소나 프로토콜 설정이 필요없다.
 * socket.io를 사용할때는 http로 해도 알아서 ws까지 접속이 된다
 * 
 * 네임스페이스
 * room
 * 
 */

const backUrl = process.env.NODE_ENV === 'production' ? 'https://sleact.nodebird.com' : 'http://localhost:3095';

const sockets: { [key: string]: SocketIOClient.Socket } = {};
const useSocket = (workspace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  if (!workspace) {
    return [undefined, disconnect];
  }
  if (!sockets[workspace]) {
    /**
     * 네이스페이스, room
     * 
     * ## socket.io
     *  ==> `ws-${workspace}` 는 네임스페스라고 불린다.
     *  ==> 네임스페이스가 일치하는 사람들끼리 실시간으로 소통할 수 있음
     *  ==> 네임스페이스에 room이라는 개념이 있음
     *    ==> 네임스페이스 안에 들어가있는 사람들 중에서도 룸이라는것을 하나 더 파서 그 방안에 들어가면 그 방안에 들어간 사람들끼리 채팅할 수 있다.
     *    ==> 네임스페이스, 네임스페이스/룸
     *  ## 소켓아이오가 좋은점
     *    ==> 전체, 특정인, 특정방, 나를 제외한 나머지 한테 보내기 기능이 구현되어있다.
     * 
     *  ## transports: ['websocket']
     *    ==> IE는 http만 지원하고 웹소켓은 지원하지 않음, 그래서 소켓아이오가 알아서 판단해서 IE는 http로 최신 브라우저는 웹소켓으로 자동으로 판단해서 설정해준다.
     *    ==> 최신 브라우저에서만 돌아가도 되면 =====> transports: ['websocket'] => http는 안쓰고 웹소켓만 쓰겠다라는 의미   
     *    ==> IE 브라우저에서도 돌아가야 하면 =====> transports: ['websocket, polling'] ==> http, 웹소켓 둘다 사용하겠따.   
     */
    sockets[workspace] = io(`${backUrl}/ws-${workspace}`, {
      transports: ['websocket'],
    });
    console.info('create socket', workspace, sockets[workspace].id);
  }
  function disconnect() {
    if (workspace && sockets[workspace]) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }
  /**
   * 소켓 연결을 강제로 끊어야하는 경우 disconnect 사용
   * 
   * ==> 어떤 경우?
   *    ==> 기존 워크스페이스에서 다른 워크스페이스로 넘어갈때 기존 워크스페이스에서 disconnect하고 새로운곳으로 소켓연결을 해야함.
   */

  return [sockets[workspace], disconnect];
};

export default useSocket;

// MEMO
/**
 * 앞으로 socket.io 셋팅해서 한번 연결을 맺었던 소켓을 두고두고 컴포넌트간에 재사용하기 위해서 사용하는 커스텀훅
 * 
 *  
 */
