import React from "react"
import ChannelMessages from "./components/ChannelMessages/ChannelMessages"
import { RefManager } from "./components/RefMessagesManager"

const App: React.FC = () => {
  return (
    <RefManager>
      <ChannelMessages />
    </RefManager>
  )
};

export default App;