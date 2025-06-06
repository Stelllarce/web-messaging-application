import React, { useEffect, useState } from 'react';
import './OptionsPanel.css';
import SearchInput from '../SearchInput';
import MessageBox from '../MessageBox';
import { fetchWithAuth } from '../../utils/api'; // адаптирай пътя, ако е нужно

interface Message {
  id: string;
  from: string;
  text: string;
  timestamp: string;
  side: 'left' | 'right';
}

interface User {
  _id: string;
  username: string;
}

interface OptionsPanelProps {
  channelId: string;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  confirmedQuery: string;
  setConfirmedQuery: (val: string) => void;
  filteredMessages: Message[];
  scrollToMessage: (id: string) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
  channelId,
  searchQuery,
  setSearchQuery,
  confirmedQuery,
  setConfirmedQuery,
  filteredMessages,
  scrollToMessage
}) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetchWithAuth(`http://localhost:3000/api/channels/${channelId}/users`);
        if (!res.ok) throw new Error('Грешка при зареждане на потребителите');

        const data = await res.json();
        setUsers(data);
        console.log('Users in channel:', data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [channelId]);

  return (
    <div className="options-panel">
      <div className="modal-content">
        <h3>Options</h3>

        <SearchInput searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <button onClick={() => setConfirmedQuery(searchQuery)}>Find</button>

        {confirmedQuery && (
          <MessageBox
            id="search"
            messages={filteredMessages}
            onMessageClick={scrollToMessage}
            highlightedWord={confirmedQuery}
          />
        )}

        <button>Change name</button>
        <button>Add person</button>
        <button>Leave chat</button>

        <div className="channel-users">
          <h3>Users in this channel:</h3>
          {users.length > 0 ? (
            <ul>
              {users.map(user => (
                <li key={user._id}>{user.username}</li>
              ))}
            </ul>
          ) : (
            <p>No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionsPanel;
