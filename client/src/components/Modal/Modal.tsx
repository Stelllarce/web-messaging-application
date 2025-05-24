import React from 'react';
import './Modal.css';

interface ModalProps {
  creatingType: 'people' | 'group';
  groupName: string;
  setGroupName: (val: string) => void;
  allUsers: string[];
  selectedUsers: Set<string>;
  toggleUserSelection: (user: string) => void;
  confirmUsers: () => void;
  closeModal: () => void;
}

const Modal: React.FC<ModalProps> = ({
  creatingType,
  groupName,
  setGroupName,
  allUsers,
  selectedUsers,
  toggleUserSelection,
  confirmUsers,
  closeModal,
}) => (
  <div className="modal">
    <div className="modal-content">
      <h3>Select users</h3>
      {creatingType === 'group' && (
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      )}
      <div className="user-list">
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
      <button onClick={closeModal}>Cancel</button>
    </div>
  </div>
);

export default Modal;
