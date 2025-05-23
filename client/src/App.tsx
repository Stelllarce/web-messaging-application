import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import Chat from './components/Chat/Chat';
import OptionsPanel from './components/OptionsPanel/OptionsPanel';
import Modal from './components/Modal/Modal';

interface Message {
  text: string;
  side: 'left' | 'right';
}

const allUsers = ['Dimi', 'Andrei', 'Denis', 'Eli', 'Valya'];

type CreatingType = 'people' | 'group';

const App: React.FC = () => {
  const [currentChannel, setCurrentChannel] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [creatingType, setCreatingType] = useState<CreatingType>('people');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState('');

  const [showPublic, setShowPublic] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showPeople, setShowPeople] = useState(false);

  const [privatePeopleChats, setPrivatePeopleChats] = useState<string[]>([]);
  const [privateGroupChats, setPrivateGroupChats] = useState<string[]>([]);

  const handleSend = () => {
    if (input.trim()) {
      const side = Math.random() > 0.5 ? 'left' : 'right';
      setMessages([...messages, { text: input.trim(), side }]);
      setInput('');
    }
  };

  const toggleUserSelection = (user: string) => {
    const newSet = new Set(selectedUsers);
    newSet.has(user) ? newSet.delete(user) : newSet.add(user);
    setSelectedUsers(newSet);
  };

  const confirmUsers = () => {
    const selected = Array.from(selectedUsers);
    if (creatingType === 'people' && selected.length !== 1) {
      alert('You can only select one user for private chat!');
      return;
    }
    if (creatingType === 'group' && selected.length < 2) {
      alert('You need to select at least two users for a group chat!');
      return;
    }

    const name = creatingType === 'group' ? groupName || selected.join(', ') : selected[0];

    if (creatingType === 'people') {
      if (privatePeopleChats.includes(name)) {
        alert('Chat already exists with this user.');
        return;
      }
      setPrivatePeopleChats([...privatePeopleChats, name]);
    } else {
      if (privateGroupChats.includes(name)) {
        alert('Group chat already exists with this name.');
        return;
      }
      setPrivateGroupChats([...privateGroupChats, name]);
    }

    setCurrentChannel(name);
    setMessages([]);
    setUserModalOpen(false);
    setSelectedUsers(new Set());
    setGroupName('');
  };

  const loadChannel = (name: string) => {
    setCurrentChannel(name);
    setMessages(name === 'General' ? [
      { text: 'zdr', side: 'left' },
      { text: 'kp', side: 'right' },
      { text: 'web', side: 'left' }
    ] : []);
  };

  return (
    <div className={`container ${optionsOpen ? 'options-open' : ''}`}>
      <Sidebar
        showPublic={showPublic}
        showPrivate={showPrivate}
        showGroups={showGroups}
        showPeople={showPeople}
        toggle={{
          public: () => setShowPublic(p => !p),
          private: () => setShowPrivate(p => !p),
          groups: () => setShowGroups(p => !p),
          people: () => setShowPeople(p => !p),
        }}
        privateGroupChats={privateGroupChats}
        privatePeopleChats={privatePeopleChats}
        openModal={(type) => {
          setCreatingType(type);
          setUserModalOpen(true);
        }}
        loadChannel={loadChannel}
      />

      <Chat
        currentChannel={currentChannel}
        messages={messages}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        toggleOptions={() => setOptionsOpen(prev => !prev)}
      />

      {optionsOpen && <OptionsPanel />}

      {userModalOpen && (
        <Modal
          creatingType={creatingType}
          groupName={groupName}
          setGroupName={setGroupName}
          allUsers={allUsers}
          selectedUsers={selectedUsers}
          toggleUserSelection={toggleUserSelection}
          confirmUsers={confirmUsers}
          closeModal={() => setUserModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
