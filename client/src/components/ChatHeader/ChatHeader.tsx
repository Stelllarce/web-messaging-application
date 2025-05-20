import React from 'react';
import './ChatHeader.css';

interface Props {
  currentChannel: string;
  toggleOptions: () => void;
}

const ChatHeader: React.FC<Props> = ({ currentChannel, toggleOptions }) => (
  <div className="chat-header">
    <h3>{currentChannel}</h3>
    <button className="options-btn" onClick={toggleOptions}>Options</button>
  </div>
);

export default ChatHeader;
