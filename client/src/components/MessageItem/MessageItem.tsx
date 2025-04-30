import React from "react"
import "./MessageItem.css"

type MessageItem = {
    user: string;
    content: string;
    timestamp: string;
    onClick?: () => void;
    targetRef: (el: HTMLDivElement | null) => void;
    highlightedWord?: string;
}

const MessageItem: React.FC<MessageItem> = ({ user, content, timestamp, onClick, targetRef, highlightedWord }) => {
    const formattedTimestamp = new Date(timestamp).toLocaleString();

    const highlight = () => {
        if(!highlightedWord) {
            return content;
        }

        const words = content.split(new RegExp(`(${highlightedWord})`, 'gi'))

        return words.map((word, i) => {
            if (word.toLowerCase() === highlightedWord.toLowerCase()) {
                return <span key={i} className="highlight-word">{word}</span>
            }
            else {
                return word;
            }
        })
    }

    return (
        <div ref={targetRef} onClick={onClick} className={`message-item ${onClick ? "clickable" : ""}`}>
            <h4 className="message-user">{user}</h4>
            <p className="message-content">{highlight()}</p>
            <small className="message-timestamp">{formattedTimestamp}</small>
        </div>
    )
};

export default MessageItem;
