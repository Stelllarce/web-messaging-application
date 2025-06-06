import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { fetchWithAuth } from '../../utils/api';
import config from '../../config';

interface Channel {
  _id: string;
  name: string;
  creator: string;
  type: 'public' | 'private';
}

interface SidebarProps {
  showPublic: boolean;
  showPrivate: boolean;
  toggle: {
    public: () => void;
    private: () => void;
  };
  loadChannel: (channelName: string, channelId: string, creatorId: string, type: 'public' | 'private') => void;
  refreshTrigger?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
    showPublic,
    showPrivate,
    toggle,
    loadChannel,
    refreshTrigger
  }) => {
  const [publicChannels, setPublicChannels] = useState<Channel[]>([]);
  const [privateChannels, setPrivateChannels] = useState<Channel[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetchChannels();
    fetchUsername();
  }, []);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchChannels();
    }
  }, [refreshTrigger]);

   useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCreateModal(false);
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchChannels = async () => {
    try {
      const pubRes = await fetchWithAuth(`${config.API_BASE_URL}/channels?type=public`);
      const pubData = await pubRes.json();
      setPublicChannels(pubData);

      const privRes = await fetchWithAuth(`${config.API_BASE_URL}/channels?type=private`);
      const privData = await privRes.json();
      setPrivateChannels(privData);

      console.log('Public channels:', pubData);
      console.log('Private channels:', privData);
    } catch (err) {
      console.error('Failed to fetch channels:', err);
    }
  };

  const fetchUsername = async () => {
    try {
      const res = await fetchWithAuth(`${config.API_BASE_URL}/auth/me`);
      if (!res.ok) throw new Error('Failed to fetch user data');
      const data = await res.json();
      setUsername(data.username);
    } catch (err) {
      console.error('Failed to fetch username:', err);
      return '';
    }
  }

  const handleCreateChannel = async () => {
    try {
      const res = await fetchWithAuth(`${config.API_BASE_URL}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          type: isPrivate ? 'private' : 'public'
        })
      });

      if (!res.ok) throw new Error('Failed to create channel');

      setNewName('');
      setIsPrivate(false);
      setShowCreateModal(false);
      fetchChannels();
    } catch (err) {
      console.error('Failed to create channel:', err);
    }
  };

  return (
    <div className="sidebar">
      <div className="user-display">👤 Logged in as: <strong>{username}</strong></div>

      <h2>Channels</h2>

      <div className="create-btn-wrapper">
        <button className="create-btn" onClick={() => setShowCreateModal(true)}>
          Create Channel
        </button>
      </div>

      <div className="dropdown">
        <button className="dropdown-btn" onClick={toggle.public}>
          Public <span className="arrow">{showPublic ? '▼' : '▶'}</span>
        </button>
        {showPublic && (
          <ul className="dropdown-content">
            {publicChannels.map((channel) => (
              <li key={channel._id} onClick={() => loadChannel(channel.name, channel._id, channel.creator, channel.type)}>
                # {channel.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dropdown">
        <button className="dropdown-btn" onClick={toggle.private}>
          Private <span className="arrow">{showPrivate ? '▼' : '▶'}</span>
        </button>
        {showPrivate && (
          <ul className="dropdown-content">
            {privateChannels.map((channel) => (
              <li key={channel._id} onClick={() => loadChannel(channel.name, channel._id, channel.creator, channel.type)}>
              {channel.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showCreateModal && (
      <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setShowCreateModal(false)}>✖</button>
          <h3>Create a new channel</h3>
          <input
            type="text"
            placeholder="Channel name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Private Channel
          </label>
          <div className="modal-buttons">
            <button className="create-btn" onClick={handleCreateChannel}>Create</button>
            <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
};

export default Sidebar;
