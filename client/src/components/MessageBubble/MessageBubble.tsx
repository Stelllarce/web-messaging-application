import React from 'react';
import './MessageBubble.css';

interface Props {
  from: string;
  text: string;
  timestamp: string;
  side: 'left' | 'right' | 'system';
  targetRef?: (el: HTMLDivElement | null) => void;
}

const MessageBubble: React.FC<Props> = ({ from, text, timestamp, side, targetRef }) => {
  if (side === 'system') {
    return (
      <div ref={targetRef} className="message-container system">
        <div className="message-bubble system">
          <span className="message-text">{text}</span>
        </div>
        <div className="message-timestamp">{timestamp}</div>
      </div>
    );
  }

  return (
    <div ref={targetRef} className={`message-container ${side}`}>
      <div className="message-sender">{from}</div>
      <div className={`message-bubble ${side}`}>
        <span className="message-text">{text}</span>
      </div>
      <div className="message-timestamp">{timestamp}</div>
    </div>
  );
};

export default MessageBubble;
