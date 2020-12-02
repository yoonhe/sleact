import { IChat, IDM } from '@typings/db';
import dayjs from 'dayjs';

export default function makeSection<T extends IDM | IChat>(chatList: T[]) {
  //TODO
/**
 *  T의 타입은 IDM | IChat
 *  key는 string
 */

  const sections: { [key: string]: T[] } = {};
  chatList.forEach((chat) => {
    const monthDate = dayjs(chat.createdAt).format('YYYY-MM-DD');
    if (Array.isArray(sections[monthDate])) {
      sections[monthDate].push(chat);
    } else {
      sections[monthDate] = [chat];
    }
  });
  return sections;
}
