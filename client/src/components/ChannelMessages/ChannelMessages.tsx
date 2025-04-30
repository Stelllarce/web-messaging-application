import React, { useEffect, useState } from "react"
import MessageBox from "../MessageBox"
import { useRefManager } from "../RefMessagesManager"
import SearchInput from "../SearchInput"
import "./ChannelMessages.css"
import { Message } from "../../../../server/messages"

const ChannelMessages = () => {
    const [searchQuery, setSearchQuery] = useState("") // for what we are typing
    const [confirmedQuery, setConfirmedQuery] = useState("") // for what we are searching
    const [messages, setMessages] = useState<Message[]>([]) // for messages from server
    const [showSearchPanel, setShowSearchPanel] = useState(false);

    useEffect(() => {
        fetch("http://localhost:3001/messages")
        .then(response => response.json())
        .then(data => setMessages(data))
        .catch(error => console.error(error))
    }, [])

    const handleSearch = () => {
        setConfirmedQuery(searchQuery)
    }

    const filteredMessages = confirmedQuery === "" ? [] : messages.filter((msg) =>
        msg.content.toLowerCase().includes(confirmedQuery.toLowerCase()))

    const { getTarget } = useRefManager()
    const scrollToMessage = (id: number) => {
        const target = getTarget("message", id)

        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            target.classList.add("message-click")
            setTimeout(() => {
                target.classList.remove("message-click")
                target.classList.add("message-after-click")}, 5000)
        }
    }

    return (
        <div className="channel-messages-container">
            <div className="search-panel">
            {showSearchPanel ? (
                <>
                <h2>Search</h2>
                <SearchInput searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                <button onClick={handleSearch}>Find</button>
                <MessageBox id="search" messages={filteredMessages} onMessageClick={scrollToMessage} highlightedWord={confirmedQuery}/>
                </>
            ) : null}
            </div>

            <div className="messages-panel">
                <button onClick={() => setShowSearchPanel(prev => !prev)}>{showSearchPanel ? "Hide Search" : "Show Search"}</button>
                <h2>Messages</h2>
                <MessageBox id="message" messages={messages}/>
            </div>
        </div>
    )
};

export default ChannelMessages;
