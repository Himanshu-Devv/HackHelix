// PopupTemplates — Message template functions
// Popup message templates rotated by trigger type

export function getPopupMessage(triggerType, data = {}) {
  const { domain = 'Unknown App', minutes = 0, score = 0, peakScore = 0, currentScore = 0, avgScore = 0, count = 0, hours = 2 } = data;

  switch (triggerType) {
    case 'sustained_drain':
      return {
        title: 'Sustained Cognitive Drain',
        message: `You've been on ${domain} for ${minutes} minutes and your fatigue score is climbing. ${domain} is your #1 drain app this week. Want to step back?`,
        icon: '🔥',
      };

    case 'cumulative_fatigue':
      return {
        title: 'Cumulative Fatigue Alert',
        message: `Your cognitive load has been above 60 for the past ${hours} hours. Your brain is running hot. A 10-minute break now saves 2 hours of fog later.`,
        icon: '🧠',
      };

    case 'crash_pattern':
      return {
        title: 'Mental Crash Detected',
        message: `Looks like you just hit a wall. Your score spiked to ${peakScore} then dropped sharply — that's a classic mental crash pattern. Time to recover before pushing on.`,
        icon: '💥',
      };

    case 'post_crash_drift':
      return {
        title: 'Post-Crash Drift',
        message: `You're still running slow after your earlier crash. Your score has been between 55–70 for ${minutes} minutes. A short break now will reset your focus.`,
        icon: '🌊',
      };

    case 'app_repeat':
      return {
        title: 'Repeat Offender Alert',
        message: `${domain} has pushed you into Overloaded state ${count} times today. Consider batching your messages instead of staying in the app.`,
        icon: '🔁',
      };

    case 'test':
      return {
        title: 'Test Notification',
        message: `This is a test popup for ${domain}. In production, this would be triggered by actual fatigue patterns detected in your behavior.`,
        icon: '🧪',
      };

    default:
      return {
        title: 'Cognitive Load Alert',
        message: 'Your cognitive load has reached a level that may benefit from a break or UI adjustment.',
        icon: '⚡',
      };
  }
}
