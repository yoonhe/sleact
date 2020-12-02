import { Dispatch, SetStateAction, useCallback, useState } from 'react';

const useInput = <T = any>(initialValue: T): [T, (e: any) => void, Dispatch<SetStateAction<T>>] => {
  // TODO
  /** MEMO
   * 중복되는 부분을 커스텀 훅으로 만들어주기
   * 
   * 타입스크립트 vs 자바스크립트
   * 
   * 타입스크립트 => 변수, 매개변수, return값 에 타입을 명확하게 적어주는 것(타입정의)
   * 
   * 타입스크립트가 생각보다 똑똑해서 타입을 알고있는 경우도 있음.
   */
  const [value, setValue] = useState(initialValue);
  const handler = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  return [value, handler, setValue];
};

export default useInput;
 