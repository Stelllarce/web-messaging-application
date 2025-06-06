import React from 'react';
import './InputArea.css';
// import { channel } from 'diagnostics_channel';

interface Props {
  channelId: string;
  input: string;
  setInput: (val: string) => void;
  handleSend: (channelId: string) => void;
}

const InputArea: React.FC<Props> = ({ channelId, input, setInput, handleSend }) => (
  <div className="input-area">
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Type your message..."
      onKeyDown={(e) => e.key === 'Enter' && handleSend(channelId)}
    />
    <button onClick={() => handleSend(channelId)}>Send</button>

  </div>
);

export default InputArea;
