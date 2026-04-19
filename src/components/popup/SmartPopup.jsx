// SmartPopup — Contextual notification overlay card
import React from 'react';
import { getPopupMessage } from './PopupTemplates';

export default function SmartPopup({ triggerType, triggerDomain, triggerData, onBreak, onDismiss }) {
  const { title, message, icon } = getPopupMessage(triggerType, {
    domain: triggerDomain,
    ...triggerData,
  });

  return (
    <div className="fixed bottom-16 left-1/4 -translate-x-1/2 z-50 w-96 popup-enter" id="smart-popup">
      <div className="glass-card rounded-2xl p-5 shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-600 hover:text-gray-400 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onBreak}
            className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-colors"
          >
            ✅ Take a 10-min break
          </button>

          <button
            onClick={onDismiss}
            className="px-3 py-2 rounded-lg bg-gray-700/40 border border-gray-600/30 text-gray-500 text-xs font-medium hover:bg-gray-700/60 hover:text-gray-400 transition-colors"
          >
            ❌ I'm fine
          </button>
        </div>
      </div>
    </div>
  );
}
