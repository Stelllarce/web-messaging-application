import React from 'react';
import './ChatHeader.css';

interface Props {
  currentChannel: string;
  toggleOptions: () => void;
  onLogout: () => void;
}

const ChatHeader: React.FC<Props> = ({ currentChannel, toggleOptions, onLogout }) => (
  <div className="chat-header">
    <h3>{currentChannel}</h3>
    <div className="header-buttons">
      <button className="logout-btn" onClick={onLogout}>Logout</button>
      <button className="options-btn" onClick={toggleOptions}>Options</button>
    </div>
  </div>
);

export default ChatHeader;
