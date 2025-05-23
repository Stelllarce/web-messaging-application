import React from 'react';
import './OptionsPanel.css';

const OptionsPanel: React.FC = () => (
  <div className="options-panel">
    <div className="modal-content">
      <h3>Options</h3>
      <input type="text" placeholder="Search message" />
      <button>Change name</button>
      <button>Add person</button>
      <button>Leave chat</button>
    </div>
  </div>
);

export default OptionsPanel;
