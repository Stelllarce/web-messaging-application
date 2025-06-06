import React from 'react';
import './OptionsPanel.css';
import SearchInput from '../SearchInput';
import MessageBox from '../MessageBox';

interface Message {
  id: string;
  from: string;
  text: string;
  timestamp: string;
  side: 'left' | 'right';
}

interface OptionsPanelProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  confirmedQuery: string;
  setConfirmedQuery: (val: string) => void;
  filteredMessages: Message[];
  scrollToMessage: (id: string) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({ searchQuery, setSearchQuery, confirmedQuery, setConfirmedQuery, filteredMessages, scrollToMessage }) => (
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
    </div>
  </div>
);

export default OptionsPanel;
