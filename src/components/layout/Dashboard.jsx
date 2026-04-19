// ============================================
// Dashboard — Split layout: Website on left, Extension popup on right
// ============================================
// The left side shows a simulated website that receives all UI adaptations
// The right side is the compact extension control panel

import React, { useState } from 'react';
import { useFatigue } from '../../context/FatigueContext';
import TabBar from './TabBar';
import LiveMonitorTab from '../liveMonitor/LiveMonitorTab';
import WeeklyInsightsTab from '../weeklyInsights/WeeklyInsightsTab';
import NotificationHistoryTab from '../history/NotificationHistoryTab';
import SettingsTab from '../settings/SettingsTab';
import DomainInput from '../domainTracker/DomainInput';
import FeedbackPill from '../feedback/FeedbackPill';
import SmartPopup from '../popup/SmartPopup';
import BreakScreen from '../breakScreen/BreakScreen';
import ComfortSettings from '../settings/ComfortSettings';
import WebsiteSimulator from '../website/WebsiteSimulator';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('live');
  const {
    confirmedBand,
    pendingBand,
    countdown,
    sessionTracker,
    popupTrigger,
    showBreakScreen,
    startBreak,
    endBreak,
    snooze,
    comfortSettings,
    toggleComfort,
    showComfortPanel,
    setShowComfortPanel,
    adaptationsEnabled,
    setAdaptationsEnabled,
    postBreakMessage,
  } = useFatigue();

  const isAdapting = adaptationsEnabled && !snooze.isSnoozed && confirmedBand && confirmedBand.key !== 'FOCUSED';

  // Handle popup actions
  const handlePopupBreak = () => {
    popupTrigger.dismissPopup('Break');
    startBreak();
  };
  const handlePopupDismiss = () => {
    popupTrigger.dismissPopup('Dismissed');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#0f0f14]">
      {/* ======= LEFT: Simulated Website ======= */}
      <div className="flex-1 min-w-0 relative">
        <WebsiteSimulator />

        {/* Sleek Countdown Notification for the Main Screen (Non-blocking) */}
        {pendingBand && countdown > 0 && pendingBand.key !== 'FOCUSED' && (
          <div className="absolute bottom-6 right-6 z-50 animate-slide-up pointer-events-none">
            <div className="flex items-center gap-4 bg-gray-900 border border-blue-500/30 shadow-lg rounded-xl p-4 pr-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
              
              <div className="flex-shrink-0 relative w-12 h-12 flex items-center justify-center bg-gray-950 rounded-full border border-gray-800">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="24" cy="24" r="22" 
                    stroke="currentColor" strokeWidth="2" fill="none" 
                    className="text-blue-500/80 transition-all duration-1000 ease-linear" 
                    strokeDasharray="138" 
                    strokeDashoffset={138 - (138 * ((15 - countdown) / 15))} 
                  />
                </svg>
                <span className="text-lg font-mono text-gray-300 relative z-10">{countdown}</span>
              </div>

              <div className="relative z-10">
                <h3 className="text-sm font-medium text-gray-200">High Cognitive Load</h3>
                <p className="text-xs text-blue-300/70 mt-0.5">
                  Simplifying UI in <strong className="text-white text-sm">{countdown}</strong> seconds
                </p>
              </div>
            </div>
          </div>
        )}



        {/* Adaptation OFF indicator */}
        {!adaptationsEnabled && confirmedBand && confirmedBand.key !== 'FOCUSED' && (
          <div className="fixed bottom-4 left-4 z-40 animate-fade-in">
            <button
              onClick={() => setAdaptationsEnabled(true)}
              className="pill-button flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-800/80 backdrop-blur border border-gray-700 text-xs text-gray-500 hover:text-purple-400 hover:border-purple-500/30 transition-all shadow-lg"
            >
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              UI adaptations paused — click to resume
            </button>
          </div>
        )}

        {/* Welcome back message overlay */}
        {postBreakMessage && (
          <div className="fixed top-4 left-4 right-[396px] z-30 animate-fade-in">
            <div className="mx-auto max-w-lg bg-emerald-900/80 backdrop-blur border border-emerald-500/30 rounded-xl p-4 text-center text-sm text-emerald-200 shadow-xl">
              🌿 {postBreakMessage}
            </div>
          </div>
        )}
      </div>

      {/* ======= RIGHT: Extension Popup Panel ======= */}
      <div className="w-[380px] flex-shrink-0 bg-[#12121a] border-l border-white/5 flex flex-col h-screen overflow-hidden">
        {/* Extension Header */}
        <header className="px-4 py-3 border-b border-white/5 bg-[#12121a]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <h1 className="text-sm font-semibold text-gray-200 tracking-tight">
                Cognitive Fatigue Adapter
              </h1>
            </div>

            {/* Master adaptation toggle */}
            <button
              onClick={() => setAdaptationsEnabled(!adaptationsEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                adaptationsEnabled
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-gray-800 border border-gray-700 text-gray-500'
              }`}
              id="adaptation-toggle"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${adaptationsEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
              {adaptationsEnabled ? 'Adapting' : 'Paused'}
            </button>
          </div>

          {/* Domain tracker */}
          <DomainInput
            currentDomain={sessionTracker.currentDomain}
            onSwitch={(domain) => sessionTracker.switchApp(domain)}
          />
        </header>

        {/* Tabs */}
        <TabBar activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto px-1 py-3">
          {activeTab === 'live' && <LiveMonitorTab />}
          {activeTab === 'insights' && <WeeklyInsightsTab />}
          {activeTab === 'history' && <NotificationHistoryTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>

      {/* ======= OVERLAYS ======= */}

      {/* Comfort settings slide-out panel */}
      {showComfortPanel && (
        <div className="fixed inset-0 z-40" onClick={() => setShowComfortPanel(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute right-[380px] top-0 bottom-0 w-72 bg-[#1a1a24] border-r border-white/5 p-5 overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-300">Comfort Settings</h2>
              <button onClick={() => setShowComfortPanel(false)} className="text-gray-500 hover:text-gray-300">✕</button>
            </div>
            <ComfortSettings settings={comfortSettings} onToggle={toggleComfort} />
          </div>
        </div>
      )}

      {/* Smart popup — positioned over the website */}
      {popupTrigger.shouldShowPopup && (
        <SmartPopup
          triggerType={popupTrigger.triggerType}
          triggerDomain={popupTrigger.triggerDomain}
          triggerData={popupTrigger.triggerData}
          onBreak={handlePopupBreak}
          onDismiss={handlePopupDismiss}
        />
      )}

      {/* Break screen */}
      {showBreakScreen && <BreakScreen onEnd={endBreak} />}
    </div>
  );
}
