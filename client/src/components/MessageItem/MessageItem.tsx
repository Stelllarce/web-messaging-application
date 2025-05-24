// MessageItem.tsx
import React from "react";
import "./MessageItem.css";

type MessageItemProps = {
  text: string;
  onClick?: () => void;
  targetRef: (el: HTMLDivElement | null) => void;
  highlightedWord?: string;
};

const MessageItem: React.FC<MessageItemProps> = ({ text, onClick, highlightedWord }) => {
  const highlight = () => {
    if (!highlightedWord) return text;

    const words = text.split(new RegExp(`(${highlightedWord})`, 'gi'));

    return words.map((word, i) =>
      word.toLowerCase() === highlightedWord.toLowerCase()
        ? <span key={i} className="highlight-word">{word}</span>
        : word
    );
  };

  return (
    <div onClick={onClick} className={`message-item ${onClick ? "clickable" : ""}`}>
      <p className="message-content">{highlight()}</p>
    </div>
  );
};

export default MessageItem;
