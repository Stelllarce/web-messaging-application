import React from 'react';
import './Chat.css';
import ChatHeader from '../ChatHeader/ChatHeader';
import InputArea from '../InputArea/InputArea';
import MessageBubble from '../MessageBubble/MessageBubble';

interface Message {
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

const Chat: React.FC<ChatProps> = ({ currentChannel, messages, input, setInput, handleSend, toggleOptions }) => (
  <div className="chat">
    <ChatHeader currentChannel={currentChannel} toggleOptions={toggleOptions} />
    <div id="messages">
      {messages.map((msg, idx) => (
        <MessageBubble key={idx} text={msg.text} side={msg.side} />
      ))}
    </div>
    <InputArea input={input} setInput={setInput} handleSend={handleSend} />
  </div>
);

export default Chat;
