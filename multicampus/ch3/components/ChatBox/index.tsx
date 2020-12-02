import { IUser } from '@typings/db';
import React, { useRef, useEffect, useCallback, FC } from 'react';
import { ChatArea, Form, MentionsTextarea, SendButton, Toolbox, EachMention } from '@components/ChatBox/styles';
import { Mention, SuggestionDataItem } from 'react-mentions';
import gravatar from 'gravatar';

// TODO

/**
 * Mention 기능
 *
 *  => 1:1 채팅에는 필요없음(그룹 채팅에만 필요)
 *  => 직접만들면 고려할것이 많고 오래 걸리기때문에 npm에서 가져다 쓰자!
 *
 *
 * ## tip
 * npm에서 라이브러리를 가져다 쓸때,
 *  => 공식문서(설명서)를 꼭 읽어보고
 *  => props가 어떤게 들어가는지 꼭 보고
 *  => 공부할때는 github 소스를 분석해보는 것이 실력향상에 도움이된다
 *  ==> 단순하게 사용하는데서 그치지말고 내가 나중에 라이브러리를 쓰지 않고도 직접 만들수 있는 실력을 가지도록 다른사람의 스킬을 흡수하자
 *  ==> 회사에서 급할땐(실무) 라이브러리를 먼저 가져다 쓰고 차근차큰 그 라이브러리를 만든 사람의 코드, 스킬을 흡수하자
 */

interface Props {
  onSubmitForm: (e: any) => void;
  chat?: string;
  onChangeChat: (e: any) => void;
  placeholder: string;
  data?: IUser[];
}

const ChatBox: FC<Props> = ({ onSubmitForm, chat, onChangeChat, placeholder, data }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onKeydownChat = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        if (!e.shiftKey) {
          e.preventDefault();
          onSubmitForm(e);
        }
      }
    },
    [chat],
  );

  const renderUserSuggestion: (
    suggestion: SuggestionDataItem,
    search: string,
    highlightedDisplay: React.ReactNode,
    index: number,
    focused: boolean,
  ) => React.ReactNode = useCallback(
    (member, search, highlightedDisplay, index, focus) => {
      if (!data) {
        return null;
      }
      return (
        <EachMention focus={focus}>
          <img src={gravatar.url(data[index].email, { s: '20px', d: 'retro' })} alt={data[index].nickname} />
          <span>{highlightedDisplay}</span>
        </EachMention>
      );
    },
    [data],
  );

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea
          id="editor-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyPress={onKeydownChat}
          placeholder={placeholder}
          inputRef={textareaRef}
          allowSuggestionsAboveCursor
        >
          <Mention
            appendSpaceOnAdd
            trigger="@"
            data={data?.map((v) => ({ id: v.id, display: v.nickname })) || []}
            renderSuggestion={renderUserSuggestion}
          />
        </MentionsTextarea>
        <Toolbox>
          <SendButton
            className={
              'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send' +
              (chat?.trim() ? '' : ' c-texty_input__button--disabled')
            }
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
};

export default ChatBox;
