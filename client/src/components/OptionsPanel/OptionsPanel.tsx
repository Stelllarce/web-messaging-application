import React, { useEffect, useState } from 'react';
import './OptionsPanel.css';
import SearchInput from '../SearchInput';
import MessageBox from '../MessageBox';
import { fetchWithAuth } from '../../utils/api';

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

interface Channel {
  _id: string;
  name: string;
  creator: string;
  type: 'public' | 'private';
}

interface OptionsPanelProps {
  channelId: string;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  confirmedQuery: string;
  setConfirmedQuery: (val: string) => void;
  filteredMessages: Message[];
  scrollToMessage: (id: string) => void;
  setCurrentChannel?: (val: Channel) => void;
  creatorId: string;
  channelType: 'public' | 'private';
  onUserAdded?: () => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
  channelId,
  searchQuery,
  setSearchQuery,
  confirmedQuery,
  setConfirmedQuery,
  filteredMessages,
  scrollToMessage,
  setCurrentChannel,
  creatorId,
  channelType,
  onUserAdded
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetchWithAuth('http://localhost:3000/api/auth/me');
        const userData = await userRes.json();
        setCurrentUserId(userData.id);

        const res = await fetchWithAuth(`http://localhost:3000/api/channels/${channelId}/users`);
        if (!res.ok) throw new Error('Грешка при зареждане на потребителите');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [channelId]);

  const handleRename = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:3000/api/channels/${channelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName })
      });
      if (!res.ok) throw new Error('Rename failed');
      const updated = await res.json();
      setCurrentChannel?.({ _id: updated._id, name: updated.name, creator: updated.creator, type: updated.type });
      setShowRenameModal(false);
      setNewName('');
    } catch (err) {
      console.error('Rename error:', err);
    }
  };

  const handleAddUser = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:3000/api/channels/${channelId}/users/add`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername })
      });
      if (!res.ok) throw new Error('Failed to add user');
      const updatedUsers = await res.json();
      setUsers(updatedUsers);
      setShowAddUserModal(false);
      setNewUsername('');
      
      if (onUserAdded) {
        onUserAdded();
      }
    } catch (err) {
      console.error('Add user error:', err);
    }
  };

  const handleRemoveUser = async (username: string) => {
    try {
      const res = await fetchWithAuth(`http://localhost:3000/api/channels/${channelId}/users/remove`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      if (!res.ok) throw new Error('Failed to remove user');
      const updatedUsers = await res.json();
      setUsers(updatedUsers);
    } catch (err) {
      console.error('Remove user error:', err);
    }
  };

  const handleLeaveChat = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:3000/api/channels/${channelId}/leave`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('Failed to leave chat');
      window.location.reload();
    } catch (err) {
      console.error('Leave chat error:', err);
    }
  };

  const handleDeleteChannel = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:3000/api/channels/${channelId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete channel');
      window.location.reload();
    } catch (err) {
      console.error('Delete channel error:', err);
    }
  };

  const isCreator = currentUserId === creatorId;

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

        {isCreator && (
          <>
            <button onClick={() => setShowRenameModal(true)}>Change name</button>
            <button onClick={handleDeleteChannel}>Delete channel</button>
          </>
        )}

        {channelType === 'private' && isCreator && (
          <>
            <button onClick={() => setShowAddUserModal(true)}>Add person</button>
          </>
        )}

        {channelType === 'private' && !isCreator && (
          <button onClick={handleLeaveChat}>Leave chat</button>
        )}

        <div className="channel-users">
          <h3>Users in this channel:</h3>
          {users.length > 0 ? (
            <ul>
              {users.map(user => (
                <li key={user._id}>
                  {user.username}
                  {channelType === 'private' && isCreator && user._id !== currentUserId && (
                    <button className="remove-btn" onClick={() => handleRemoveUser(user.username)}>Remove</button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No users found.</p>
          )}
        </div>

        {showRenameModal && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="close-btn" onClick={() => setShowRenameModal(false)}>×</button>
              <h3>Rename channel</h3>
              <input
                type="text"
                placeholder="New channel name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div className="modal-buttons">
                <button className="create-btn" onClick={handleRename}>Confirm</button>
                <button className="cancel-btn" onClick={() => setShowRenameModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showAddUserModal && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="close-btn" onClick={() => setShowAddUserModal(false)}>×</button>
              <h3>Add person to channel</h3>
              <input
                type="text"
                placeholder="Enter username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <div className="modal-buttons">
                <button className="create-btn" onClick={handleAddUser}>Confirm</button>
                <button className="cancel-btn" onClick={() => setShowAddUserModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionsPanel;
