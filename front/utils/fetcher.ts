import axios from 'axios';

// TODO
/** Memo
 * ## fetcher 
 *  => fetcher도 내부적으로 axios를 쓰고있음.
 * 
 * ## { withCredentials: true }
 *  => 로그인 이후에는 브라우저에서 서버로 요청을 보낼때 로그인 했다는 증명인 쿠키를 같이 동봉해서 보내는데 이때 `{ withCredentials: true }` 이 옵션을 넣어주지 않으면 서버로 요청할때 쿠키가 같이 안가서 서버에서 누가 보낸건지 확인할 수 없어 거절을 한다.
 *  =>  요약 : 로그인후에 요청을 보낼때는 `{ withCredentials: true }`를 같이 보내야 내가 로그인 했는지 안했는지를 서버가 판단할 수 있다.
 * 
 *  
 */

const fetcher = (url: string) => axios.get(url, { withCredentials: true }).then((response) => response.data);

export default fetcher;
