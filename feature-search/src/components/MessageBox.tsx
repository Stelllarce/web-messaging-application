import React from "react"
    import { useEffect, useRef } from "react"
    import { useRefManager } from "./RefMessagesManager"
    import MessageItem from "./MessageItem/MessageItem"
    import type { Message } from "../../../server/messages"

    type MessageBoxType = {
        id: string;
        messages: Message[];
        onMessageClick?: (id: number) => void;
        highlightedWord?: string;
    }

    const MessageBox: React.FC<MessageBoxType> = ({ id, messages, onMessageClick, highlightedWord }) => {
        const {registerPanel, unregisterPanel } = useRefManager()
        const targetsRef = useRef<Record<number, HTMLElement>>({});

        useEffect(() => {
            registerPanel(id, {targetsRef})

            return () => {
                unregisterPanel(id)
            }
        }, [id, registerPanel, unregisterPanel])

        if (messages.length === 0) {
            return (
                <div>
                    <h3>No results found.</h3>
                </div>
            )
        }

        return (
            <div>
                {messages.map((msg) => (
                    <MessageItem
                    user={msg.user}
                    content={msg.content}
                    timestamp={msg.timestamp}
                    onClick={onMessageClick ? () => onMessageClick(msg.id) : undefined}
                    targetRef={(el) => {
                        if (el) {
                        targetsRef.current[msg.id] = el;
                        }
                    }}
                    highlightedWord={highlightedWord}
                    />
                ))}
            </div>
        )
    };

    export default MessageBox;