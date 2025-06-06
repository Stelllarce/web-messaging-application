import React, { useEffect, useRef } from 'react';
import './Chat.css';
import ChatHeader from '../ChatHeader/ChatHeader';
import InputArea from '../InputArea/InputArea';
import MessageBubble from '../MessageBubble/MessageBubble';
import { useRefManager } from '../RefMessagesManager';

interface Message {
  id: string;
  from: string;
  text: string;
  timestamp: string;
  side: 'left' | 'right';
}

interface ChatProps {
  currentChannel: {
    _id: string;
    name: string;
  };
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  handleSend: (channelId: string) => void;
  toggleOptions: () => void;
  onLogout: () => void;
}

const Chat: React.FC<ChatProps> = ({ currentChannel, messages, input, setInput, handleSend, toggleOptions, onLogout }) => {
  const { registerPanel, unregisterPanel } = useRefManager();
  const targetsRef = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    registerPanel('message', { targetsRef });
    return () => unregisterPanel('message');
  }, [registerPanel, unregisterPanel]);

  return (
    <div className="chat">
      <ChatHeader currentChannel={currentChannel.name} toggleOptions={toggleOptions} onLogout={ onLogout } />
      <div id="messages">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            from={msg.from}
            text={msg.text}
            timestamp={msg.timestamp}
            side={msg.side}
            targetRef={(el) => {
              targetsRef.current[msg.id] = el;
            }}
          />
        ))}
      </div>
      <InputArea input={input} setInput={setInput} handleSend={handleSend} channelId={currentChannel._id} />
    </div>
  );
};

export default Chat;
