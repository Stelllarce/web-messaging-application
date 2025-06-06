import React from 'react';
import './MessageBubble.css';

interface Props {
  from: string;
  text: string;
  timestamp: string;
  side: 'left' | 'right';
  targetRef?: (el: HTMLDivElement | null) => void;
}

const MessageBubble: React.FC<Props> = ({ from, text, timestamp, side, targetRef }) => (
  <div ref={targetRef} className={`message-container ${side}`}>
    <div className="message-sender">{from}</div>
    <div className={`message-bubble ${side}`}>
      <span className="message-text">{text}</span> {/* ⬅️ оцветим само този */}
    </div>
    <div className="message-timestamp">{timestamp}</div>
  </div>
);

export default MessageBubble;
