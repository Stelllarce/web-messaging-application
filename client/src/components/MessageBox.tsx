import React, { useEffect, useRef } from "react";
import { useRefManager } from "./RefMessagesManager";
import MessageItem from "./MessageItem/MessageItem";

interface Message {
  id: string;
  from: string;
  text: string;
  timestamp: string;
  side: 'left' | 'right';
}
type MessageBoxProps = {
  id: string;
  messages: Message[];
  onMessageClick?: (id: string) => void;
  highlightedWord?: string;
};

const MessageBox: React.FC<MessageBoxProps> = ({ id, messages, onMessageClick, highlightedWord }) => {
  const { registerPanel, unregisterPanel } = useRefManager();
  const targetsRef = useRef<Record<string, HTMLElement>>({});

  useEffect(() => {
    registerPanel(id, { targetsRef });
    return () => unregisterPanel(id);
  }, [id, registerPanel, unregisterPanel]);

  if (messages.length === 0) {
    return <div><h3>No results found.</h3></div>;
  }

  return (
    <div>
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          text={msg.text}
          onClick={onMessageClick ? () => onMessageClick(msg.id) : undefined}
          targetRef={(el) => {
            if (el) targetsRef.current[msg.id] = el;
          }}
          highlightedWord={highlightedWord}
        />
      ))}
    </div>
  );
};

export default MessageBox;
