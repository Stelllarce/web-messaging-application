import React, { useEffect, useRef } from 'react';
import './Chat.css';
import ChatHeader from '../ChatHeader/ChatHeader';
import InputArea from '../InputArea/InputArea';
import MessageBubble from '../MessageBubble/MessageBubble';
import { useRefManager } from '../RefMessagesManager';

interface Message {
  id: number;
  text: string;
  side: 'left' | 'right';
}

interface ChatProps {
  currentChannel: string;
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  toggleOptions: () => void;
}

const Chat: React.FC<ChatProps> = ({ currentChannel, messages, input, setInput, handleSend, toggleOptions }) => {
  const { registerPanel, unregisterPanel } = useRefManager();
  const targetsRef = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    registerPanel('message', { targetsRef });
    return () => unregisterPanel('message');
  }, [registerPanel, unregisterPanel]);

  return (
    <div className="chat">
      <ChatHeader currentChannel={currentChannel} toggleOptions={toggleOptions} />
      <div id="messages">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            text={msg.text}
            side={msg.side}
            targetRef={(el) => {
              targetsRef.current[msg.id] = el;
            }}
          />
        ))}
      </div>
      <InputArea input={input} setInput={setInput} handleSend={handleSend} />
    </div>
  );
};

export default Chat;
