import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/logout';
import Sidebar from '../components/Sidebar/Sidebar';
import Chat from '../components/Chat/Chat';
import OptionsPanel from '../components/OptionsPanel/OptionsPanel';
import { useRefManager } from '../components/RefMessagesManager';
import { fetchWithAuth } from '../utils/api';
import { format } from 'date-fns';


interface Channel {
  _id: string;
  name: string;
  creator: string;
  type: 'public' | 'private';
}

interface Message {
  id: string;
  from: string;
  text: string;
  timestamp: string;
  side: 'left' | 'right';
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const [currentChannel, setCurrentChannel] = useState<Channel>({ _id: '', name: '', creator: '', type: 'public' });
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const [showPublic, setShowPublic] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [confirmedQuery, setConfirmedQuery] = useState('');
  const { getTarget } = useRefManager();

  const handleSend = async (channelId: string) => {
  if (!input.trim() || !channelId) return;

  try {
    const res = await fetchWithAuth(`http://localhost:3000/api/channels/${channelId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input.trim() }),
    });

    if (!res.ok) throw new Error('Неуспешно изпращане на съобщението');

    const newMsg = await res.json();
    console.log('Новото съобщение:', newMsg);
    const currentUserId = localStorage.getItem('userId') || '';

    setMessages((prev) => [
      ...prev,
      {
        id: newMsg._id,
        from: newMsg.from._id === currentUserId ? "You" : newMsg.sender.username,
        text: newMsg.content,
        side: newMsg.from._id === currentUserId ? 'right' : 'left',
        timestamp: format(newMsg.timestamp, 'dd.MM.yyyy HH:mm')
      },
    ]);
    scrollToMessage(newMsg._id);
    setInput('');
  } catch (err) {
    console.error('Грешка при изпращане:', err);
  }
};


  const loadChannel = async (channelName: string, channelId: string, creator: string, type: 'public' | 'private') => {
    try {
      setCurrentChannel({_id: channelId, name: channelName, creator: creator, type: type});

      const res = await fetchWithAuth(`http://localhost:3000/api/channels/${channelId}/messages`);
      if (!res.ok) throw new Error('Failed to load messages');

      const data = await res.json();
      const currentUserId = localStorage.getItem('userId') || '';

      const formattedMessages = data.map((msg: any) => ({
        id: msg._id,
        from: msg.from._id === currentUserId ? "You" : msg.from.username,
        text: msg.content,
        side: msg.from._id === currentUserId ? 'right' : 'left',
        timestamp: format(msg.timestamp, 'dd.MM.yyyy HH:mm')
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Грешка при зареждане на съобщенията:', err);
      setMessages([]);
    }
};


  const scrollToMessage = (id: string) => {
  const target = getTarget("message", id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });

    const textElement = target.querySelector('.message-text') as HTMLElement;
    if (!textElement) return;

    textElement.classList.remove("highlight-text");
    void textElement.offsetWidth; // trigger reflow for re-adding
    textElement.classList.add("highlight-text");

    setTimeout(() => {
      textElement.classList.remove("highlight-text");
    }, 5000);
  }
};



  return (
    <div className={`container ${optionsOpen ? 'options-open' : ''}`}>
      <Sidebar
        showPublic={showPublic}
        showPrivate={showPrivate}
        toggle={{
          public: () => setShowPublic(p => !p),
          private: () => setShowPrivate(p => !p),
        }}
        loadChannel={loadChannel}
      />
      <Chat
        currentChannel={currentChannel}
        messages={messages}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        toggleOptions={() => setOptionsOpen(p => !p)}
        onLogout={handleLogout}
      />
      {optionsOpen && (
        <OptionsPanel
          channelType={currentChannel.type}
          creatorId={currentChannel.creator}
          channelId={currentChannel._id}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          confirmedQuery={confirmedQuery}
          setConfirmedQuery={setConfirmedQuery}
          filteredMessages={confirmedQuery === '' ? [] : messages.filter((msg) =>
            msg.text.toLowerCase().includes(confirmedQuery.toLowerCase())
          )}
          scrollToMessage={scrollToMessage}
          setCurrentChannel={setCurrentChannel}

        />
      )}

    </div>
  );
};

export default ChatPage;
