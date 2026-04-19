// DomainInput — Text input + "Switch App" button
import React, { useState } from 'react';

export default function DomainInput({ currentDomain, onSwitch }) {
  const [inputValue, setInputValue] = useState('');

  const handleSwitch = () => {
    const domain = inputValue.trim();
    if (!domain) return;
    onSwitch(domain);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSwitch();
  };

  return (
    <div className="flex items-center gap-2" id="domain-input">
      {currentDomain && (
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
          📍 {currentDomain}
        </span>
      )}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter domain (e.g. slack.com)"
        className="flex-1 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700 text-xs text-gray-300 placeholder-gray-600 focus:border-purple-500/50 focus:outline-none transition-colors"
      />
      <button
        onClick={handleSwitch}
        disabled={!inputValue.trim()}
        className="px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-medium hover:bg-purple-500/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Switch App
      </button>
    </div>
  );
}
