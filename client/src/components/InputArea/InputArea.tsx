import React from 'react';
import './InputArea.css';

interface Props {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
}

const InputArea: React.FC<Props> = ({ input, setInput, handleSend }) => (
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
);

export default InputArea;
