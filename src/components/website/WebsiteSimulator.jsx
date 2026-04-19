// ============================================
// WebsiteSimulator — Simulated webpage that receives adaptations
// ============================================
// This simulates the "website the user is browsing"
// When converted to Chrome extension, these CSS injections
// will be applied to the actual active tab via content script

import React from 'react';
import { useFatigue } from '../../context/FatigueContext';

const SAMPLE_NAV_ITEMS = ['Home', 'Dashboard', 'Projects', 'Messages', 'Analytics', 'Settings'];
const SAMPLE_SIDEBAR_WIDGETS = [
  { title: 'Notifications', count: 12, items: ['John commented on your post', 'New sign-up: Sarah K.', 'Server alert: CPU > 90%'] },
  { title: 'Quick Stats', count: null, items: ['Revenue: $12,450', 'Users: 3,241', 'Tickets: 18 open'] },
  { title: 'Recent Activity', count: 5, items: ['Deployed v2.4.1', 'Merged PR #342', 'Updated docs'] },
];

const SAMPLE_ARTICLE = {
  title: 'Understanding Cognitive Load in Digital Interfaces',
  subtitle: 'How modern applications are silently draining your mental energy — and what we can do about it',
  paragraphs: [
    'Cognitive load theory, originally developed by John Sweller in the late 1980s, has become increasingly relevant in the age of digital interfaces. As we spend more hours interacting with complex web applications, the cumulative mental effort required to process information, make decisions, and navigate through various UI patterns takes a measurable toll on our cognitive resources.',
    'Research from the Nielsen Norman Group shows that the average knowledge worker switches between applications 1,200 times per day — roughly once every 40 seconds during active working hours. Each switch carries a cognitive cost: the brain must context-switch, recall the new application\'s UI patterns, and re-orient to the current task. This phenomenon, known as "attention residue," means that fragments of cognitive processing from the previous task linger and interfere with the new one.',
    'The implications for ADHD users are particularly severe. Studies published in the Journal of Attention Disorders (2023) found that adults with ADHD experience disproportionately higher cognitive fatigue when using information-dense applications like Slack, email clients, and project management tools. The constant stream of notifications, the visual complexity of nested threads, and the need to maintain multiple conversation contexts simultaneously create a perfect storm for cognitive overload.',
    'One promising approach is adaptive interfaces — systems that detect signs of cognitive fatigue through behavioral signals and automatically simplify the UI. By monitoring typing patterns, mouse movement precision, scroll behavior, and tab-switching frequency, these systems can build a real-time picture of the user\'s cognitive state without invasive monitoring. When fatigue is detected, the interface can respond by increasing font sizes, reducing visual clutter, collapsing non-essential panels, and converting dense text into more scannable formats.',
    'The key challenge lies in balancing sensitivity with specificity. An overly aggressive system that constantly shifts the UI can itself become a source of cognitive load. This is why hysteresis — requiring sustained signal before triggering adaptations — is essential. The interface should feel like it\'s breathing with you, not fighting against you.',
    'Early user studies with prototype adaptive interfaces show promising results: participants reported 23% lower perceived mental effort and 31% fewer task abandonment events when using an adaptive interface compared to a static one. These numbers are particularly striking given that the adaptations themselves are relatively simple — primarily CSS-level changes rather than fundamental redesigns.',
  ],
};

export default function WebsiteSimulator() {
  const {
    confirmedBand,
    snooze,
    comfortSettings,
    adaptationsEnabled,
  } = useFatigue();

  const bandKey = confirmedBand?.key || null;
  const isAdapting = adaptationsEnabled && !snooze.isSnoozed && bandKey && bandKey !== 'FOCUSED';

  // === Build adaptation styles ===
  const adaptStyles = {};
  const adaptClasses = [];

  if (isAdapting) {
    // Drifting and above: font size +2px, dim badges
    if (['DRIFTING', 'OVERLOADED', 'FATIGUED'].includes(bandKey)) {
      adaptStyles['fontSize'] = 'calc(1rem + 2px)';
      adaptClasses.push('dim-badges');
    }
    // Overloaded and above: increase line spacing, collapse side panels
    if (['OVERLOADED', 'FATIGUED'].includes(bandKey)) {
      adaptStyles['lineHeight'] = '1.8';
    }
    // Fatigued: even larger font
    if (bandKey === 'FATIGUED') {
      adaptStyles['fontSize'] = 'calc(1rem + 3px)';
      adaptStyles['lineHeight'] = '2.0';
    }
  }

  // Comfort settings (always applied if enabled, or automatically if dynamically overloaded)
  const autoComfort = isAdapting && ['OVERLOADED', 'FATIGUED'].includes(bandKey);

  if (comfortSettings.warmFilter || autoComfort) adaptClasses.push('comfort-warm-filter');
  if (comfortSettings.lowContrast || autoComfort) adaptClasses.push('comfort-low-contrast');
  if (comfortSettings.reducedMotion || autoComfort) adaptClasses.push('comfort-reduced-motion');
  if (comfortSettings.fontBoost) {
    adaptStyles['fontSize'] = `calc(${adaptStyles['fontSize'] || '1rem'} + 3px)`;
  }
  if (comfortSettings.lineSpacing) {
    adaptStyles['lineHeight'] = '1.9';
  }

  const hideSidebar = isAdapting && ['OVERLOADED', 'FATIGUED'].includes(bandKey) || comfortSettings.focusMode;
  const convertToBullets = isAdapting && ['OVERLOADED', 'FATIGUED'].includes(bandKey);

  return (
    <div
      className={`h-full bg-white text-gray-800 overflow-y-auto transition-all duration-700 ${adaptClasses.join(' ')}`}
      style={{
        ...adaptStyles,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
      id="website-simulator"
    >
      {isAdapting && (
        <style>{`
          #website-simulator p, 
          #website-simulator h1, 
          #website-simulator h2, 
          #website-simulator span, 
          #website-simulator li, 
          #website-simulator a {
            ${adaptStyles.fontSize ? `font-size: ${adaptStyles.fontSize} !important;` : ''}
            ${adaptStyles.lineHeight ? `line-height: ${adaptStyles.lineHeight} !important;` : ''}
          }
        `}</style>
      )}
      {/* === WEBSITE NAV BAR === */}
      <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-12">
          <div className="flex items-center gap-6">
            <span className="font-bold text-indigo-600 text-lg">TechPulse</span>
            <div className={`flex items-center gap-4 ${hideSidebar ? 'hidden' : ''}`}>
              {SAMPLE_NAV_ITEMS.map(item => (
                <a key={item} href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors" onClick={e => e.preventDefault()}>
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative notification-badge">
              <span className="text-gray-500 text-sm">🔔</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                3
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
              HK
            </div>
          </div>
        </div>
      </nav>

      {/* === MAIN LAYOUT === */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* Article content */}
        <main className="flex-1 min-w-0">
          <article>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight transition-all duration-500">
              {SAMPLE_ARTICLE.title}
            </h1>
            <p className="text-gray-500 text-sm mb-6">{SAMPLE_ARTICLE.subtitle}</p>
            
            <div className="flex items-center gap-3 mb-6 text-xs text-gray-400">
              <span>📅 April 18, 2026</span>
              <span>·</span>
              <span>📖 8 min read</span>
              <span>·</span>
              <span>👁 2,341 views</span>
            </div>

            <div className="space-y-4">
              {SAMPLE_ARTICLE.paragraphs.map((para, i) => (
                <div key={i} className="transition-all duration-500">
                  {convertToBullets ? (
                    // Convert dense paragraphs to bullet points
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {para.split('. ').filter(s => s.length > 20).slice(0, 3).map((sentence, j) => (
                        <li key={j} className="leading-relaxed">
                          {sentence.trim()}{!sentence.endsWith('.') ? '.' : ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{para}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
              {['Cognitive Science', 'UX Design', 'ADHD', 'Mental Health', 'Accessibility'].map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Interactive Comment Section (For Testing Signals) */}
            <div className="mt-12 pt-8 border-t border-gray-200 transition-all duration-500">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Leave a Comment</h3>
              <p className="text-sm text-gray-500 mb-4">
                Test the live monitor: Type in this box and hit <strong>Backspace</strong> repeatedly to trigger a burst.
              </p>
              <div className="flex flex-col gap-3">
                <textarea 
                  className="w-full h-24 p-3 text-sm text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all shadow-sm"
                  placeholder="Share your thoughts on cognitive fatigue... (Try deleting some text!)"
                />
                <div className="flex items-center gap-3 justify-end">
                  <button className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm active:scale-95">
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </article>
        </main>

        {/* === SIDEBAR (hidden when Overloaded+ or Focus Mode) === */}
        {!hideSidebar && (
          <aside className="w-72 flex-shrink-0 space-y-4 sidebar-widget secondary-content transition-all duration-500">
            {SAMPLE_SIDEBAR_WIDGETS.map(widget => (
              <div key={widget.title} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-800">{widget.title}</h3>
                  {widget.count !== null && (
                    <span className="notification-badge w-5 h-5 bg-indigo-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {widget.count}
                    </span>
                  )}
                </div>
                <ul className="space-y-2">
                  {widget.items.map((item, i) => (
                    <li key={i} className="text-xs text-gray-600 py-1 border-b border-gray-100 last:border-0">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>
        )}
      </div>

      {/* === ADAPTATION INDICATOR BAR (shows what's been changed) === */}
      {isAdapting && (
        <div className="fixed bottom-0 left-0 right-[380px] z-20 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur border-t border-purple-500/20 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-purple-200">
            <span className="animate-pulse">✨</span>
            <span>
              UI adapted: {bandKey === 'DRIFTING' && 'Font enlarged, badges dimmed'}
              {bandKey === 'OVERLOADED' && 'Sidebar collapsed, text → bullets, spacing increased'}
              {bandKey === 'FATIGUED' && 'Full simplification active, notifications muted'}
            </span>
          </div>
          <span className="text-[10px] text-purple-400">
            {confirmedBand?.emoji} {confirmedBand?.label} mode
          </span>
        </div>
      )}
    </div>
  );
}
