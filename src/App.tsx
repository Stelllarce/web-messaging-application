import React, { useState } from 'react';
import './App.css';

interface Message {
  text: string;
  side: 'left' | 'right';
}

const allUsers: string[] = ['Dimi', 'Andrei', 'Denis', 'Eli', 'Valya'];

type CreatingType = 'people' | 'group';

const App: React.FC = () => {
  const [currentChannel, setCurrentChannel] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);
  const [userModalOpen, setUserModalOpen] = useState<boolean>(false);
  const [creatingType, setCreatingType] = useState<CreatingType>('people');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState<string>('');

  const [showPublic, setShowPublic] = useState<boolean>(false);
  const [showPrivate, setShowPrivate] = useState<boolean>(false);
  const [showGroups, setShowGroups] = useState<boolean>(false);
  const [showPeople, setShowPeople] = useState<boolean>(false);

  const [privatePeopleChats, setPrivatePeopleChats] = useState<string[]>([]);
  const [privateGroupChats, setPrivateGroupChats] = useState<string[]>([]);

  const handleSend = (): void => {
    if (input.trim()) {
      const side = Math.random() > 0.5 ? 'left' : 'right';
      setMessages((prev) => [...prev, { text: input.trim(), side }]);
      setInput('');
    }
  };

  const toggleUserSelection = (user: string): void => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(user)) {
      newSet.delete(user);
    } else {
      newSet.add(user);
    }
    setSelectedUsers(newSet);
  };

  const confirmUsers = (): void => {
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

  const loadChannel = (name: string): void => {
    setCurrentChannel(name);
    setMessages(name === 'General' ? [
      { text: 'zdr', side: 'left' },
      { text: 'kp', side: 'right' },
      { text: 'web', side: 'left' }
    ] : []);
  };

  return (
    <div className={`container ${optionsOpen ? 'options-open' : ''}`}>
      <div className="sidebar">
        <h2>Channels</h2>

        <div className="dropdown">
          <button className="dropdown-btn" onClick={() => setShowPublic(!showPublic)}>
            Public <span className="arrow">{showPublic ? '▼' : '▶'}</span>
          </button>
          {showPublic && (
            <ul className="dropdown-content">
              {['General', 'Gaming', 'Music'].map((name) => (
                <li key={name} onClick={() => loadChannel(name)}># {name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="dropdown">
          <button className="dropdown-btn" onClick={() => setShowPrivate(!showPrivate)}>
            Private <span className="arrow">{showPrivate ? '▼' : '▶'}</span>
          </button>
          {showPrivate && (
            <div className="dropdown-content">

              <div className="sub-dropdown">
                <button className="dropdown-btn" onClick={() => setShowGroups(!showGroups)}>
                  Groups <span className="arrow">{showGroups ? '▼' : '▶'}</span>
                </button>
                {showGroups && (
                  <ul className="sub-dropdown-content">
                    <button onClick={() => { setCreatingType('group'); setUserModalOpen(true); }}>
                        Create group
                    </button>
                    {privateGroupChats.map((group) => (
                      <li key={group} onClick={() => loadChannel(group)}>{group}</li>
                    ))}
                    <li>
                      
                    </li>
                  </ul>
                )}
              </div>

              <div className="sub-dropdown">
                <button className="dropdown-btn" onClick={() => setShowPeople(!showPeople)}>
                  People <span className="arrow">{showPeople ? '▼' : '▶'}</span>
                </button>
                {showPeople && (
                  <ul className="sub-dropdown-content">
                    <button onClick={() => { setCreatingType('people'); setUserModalOpen(true); }}>
                        Add people
                    </button>
                    {privatePeopleChats.map((person) => (
                      <li key={person} onClick={() => loadChannel(person)}>{person}</li>
                    ))}
                    <li>
                      
                    </li>
                  </ul>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      <div className="chat">
        <div className="chat-header">
          <h3>{currentChannel}</h3>
          <button className="options-btn" onClick={() => setOptionsOpen(!optionsOpen)}>Options</button>
        </div>
        <div id="messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-${msg.side}`}>{msg.text}</div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>

      {optionsOpen && (
        <div className="options-panel">
          <div className="modal-content">
            <h3>Options</h3>
            <input type="text" placeholder="Search message" />
            <button>Change name</button>
            <button>Add person</button>
            <button>Leave chat</button>
          </div>
        </div>
      )}

      {userModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Select users</h3>
            {creatingType === 'group' && (
              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
            )}
            <div id="userList">
              {allUsers.map((user) => (
                <div key={user}>
                  <input
                    type="checkbox"
                    id={user}
                    checked={selectedUsers.has(user)}
                    onChange={() => toggleUserSelection(user)}
                  />
                  <label htmlFor={user}>{user}</label>
                </div>
              ))}
            </div>
            <button className="btn" onClick={confirmUsers}>Confirm</button>
            <button onClick={() => setUserModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
