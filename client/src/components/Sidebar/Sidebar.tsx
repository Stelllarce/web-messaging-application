import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  showPublic: boolean;
  showPrivate: boolean;
  showGroups: boolean;
  showPeople: boolean;
  toggle: {
    public: () => void;
    private: () => void;
    groups: () => void;
    people: () => void;
  };
  privateGroupChats: string[];
  privatePeopleChats: string[];
  openModal: (type: 'people' | 'group') => void;
  loadChannel: (name: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  showPublic,
  showPrivate,
  showGroups,
  showPeople,
  toggle,
  privateGroupChats,
  privatePeopleChats,
  openModal,
  loadChannel
}) => {
  return (
    <div className="sidebar">
      <h2>Channels</h2>

      <div className="dropdown">
        <button className="dropdown-btn" onClick={toggle.public}>
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
        <button className="dropdown-btn" onClick={toggle.private}>
          Private <span className="arrow">{showPrivate ? '▼' : '▶'}</span>
        </button>
        {showPrivate && (
          <div className="dropdown-content">

            <div className="sub-dropdown">
              <button className="dropdown-btn" onClick={toggle.groups}>
                Groups <span className="arrow">{showGroups ? '▼' : '▶'}</span>
              </button>
              {showGroups && (
                <ul className="sub-dropdown-content">
                  <li>
                    <button className="sub-dropdown-add-btn" onClick={() => openModal('group')}>
                      Create group
                    </button>
                  </li>
                  {privateGroupChats.map(group => (
                    <li key={group} onClick={() => loadChannel(group)}>{group}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="sub-dropdown">
              <button className="dropdown-btn" onClick={toggle.people}>
                People <span className="arrow">{showPeople ? '▼' : '▶'}</span>
              </button>
              {showPeople && (
                <ul className="sub-dropdown-content">
                  <li>
                    <button className="sub-dropdown-add-btn" onClick={() => openModal('people')}>
                      Add people
                    </button>
                  </li>
                  {privatePeopleChats.map(person => (
                    <li key={person} onClick={() => loadChannel(person)}>{person}</li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
