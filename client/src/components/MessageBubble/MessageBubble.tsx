import React from 'react';
import './MessageBubble.css';

interface Props {
  text: string;
  side: 'left' | 'right';
  targetRef?: (el: HTMLDivElement | null) => void;
}

const MessageBubble: React.FC<Props> = ({ text, side, targetRef }) => (
  <div ref={targetRef} className={`message-${side}`}>
    {text}
  </div>
);

export default MessageBubble;
