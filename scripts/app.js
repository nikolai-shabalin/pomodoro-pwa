// DOM Elements
const body = document.body;
const app = document.querySelector('.app');
const timer = app.querySelector('.timer');
const [minutes, seconds] = timer.querySelectorAll('.minutes, .seconds');
const button = app.querySelector('.toggle-timer');
const themeElement = document.querySelector('meta[name="theme-color"]');
const sessionType = document.querySelector('.session-type');
const sessionCounter = document.querySelector('.session-counter');
const settingsBtn = document.querySelector('.settings-btn');
const settingsOverlay = document.querySelector('.settings-overlay');
const closeSettingsBtn = document.querySelector('.close-settings');
const saveBtn = document.querySelector('.save-btn');
const resetBtn = document.querySelector('.reset-btn');

// Settings Elements
const workDurationInput = document.getElementById('work-duration');
const shortBreakInput = document.getElementById('short-break-duration');
const longBreakInput = document.getElementById('long-break-duration');
const sessionsUntilLongBreakInput = document.getElementById('sessions-until-long-break');
const soundNotificationsInput = document.getElementById('sound-notifications');
const browserNotificationsInput = document.getElementById('browser-notifications');
const autoStartBreaksInput = document.getElementById('auto-start-breaks');
const autoStartSessionsInput = document.getElementById('auto-start-sessions');
const themeSelect = document.getElementById('theme-select');
const showSecondsInput = document.getElementById('show-seconds');

// States
const states = {
  STOPPED: 'stopped',
  RUNNING: 'running',
  PAUSED: 'paused',
  FINISHED: 'finished',
  WORK: 'work',
  SHORTBREAK: 'shortbreak',
  LONGBREAK: 'longbreak'
};

const sessionTypes = {
  WORK: 'work',
  SHORT_BREAK: 'shortbreak',
  LONG_BREAK: 'longbreak'
};

const sessionLabels = {
  work: 'Рабочая сессия',
  shortbreak: 'Короткий перерыв',
  longbreak: 'Длинный перерыв'
};

const colors = {
  RUNNING: '#13b888',
  STOPPED: '#e7626c',
  WORK: '#e7626c',
  SHORTBREAK: '#13b888',
  LONGBREAK: '#4285f4'
};

const themeColors = {
  default: '#e7626c',
  dark: '#2c2c2c',
  green: '#13b888',
  blue: '#4285f4'
};

// Default Settings
const defaultSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  soundNotifications: true,
  browserNotifications: false,
  autoStartBreaks: false,
  autoStartSessions: false,
  theme: 'default',
  showSeconds: true
};

// App State
let currentState = states.STOPPED;
let currentSessionType = sessionTypes.WORK;
let countdown;
let time = 25 * 60;
let completedSessions = 0;
let settings = { ...defaultSettings };

// Audio for notifications
let notificationSound = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  applySettings();
  updateUI();
  requestNotificationPermission();
  initAudio();
});

// Settings Management
function loadSettings() {
  const savedSettings = localStorage.getItem('pomodoroSettings');
  if (savedSettings) {
    settings = { ...defaultSettings, ...JSON.parse(savedSettings) };
  }
  updateSettingsUI();
}

function saveSettings() {
  settings = {
    workDuration: parseInt(workDurationInput.value),
    shortBreakDuration: parseInt(shortBreakInput.value),
    longBreakDuration: parseInt(longBreakInput.value),
    sessionsUntilLongBreak: parseInt(sessionsUntilLongBreakInput.value),
    soundNotifications: soundNotificationsInput.checked,
    browserNotifications: browserNotificationsInput.checked,
    autoStartBreaks: autoStartBreaksInput.checked,
    autoStartSessions: autoStartSessionsInput.checked,
    theme: themeSelect.value,
    showSeconds: showSecondsInput.checked
  };
  
  localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  applySettings();
  closeSettings();
  
  // Reset timer if stopped
  if (currentState === states.STOPPED) {
    resetTimer();
  }
}

function resetSettings() {
  settings = { ...defaultSettings };
  updateSettingsUI();
  localStorage.removeItem('pomodoroSettings');
  applySettings();
  resetTimer();
}

function updateSettingsUI() {
  workDurationInput.value = settings.workDuration;
  shortBreakInput.value = settings.shortBreakDuration;
  longBreakInput.value = settings.longBreakDuration;
  sessionsUntilLongBreakInput.value = settings.sessionsUntilLongBreak;
  soundNotificationsInput.checked = settings.soundNotifications;
  browserNotificationsInput.checked = settings.browserNotifications;
  autoStartBreaksInput.checked = settings.autoStartBreaks;
  autoStartSessionsInput.checked = settings.autoStartSessions;
  themeSelect.value = settings.theme;
  showSecondsInput.checked = settings.showSeconds;
}

function applySettings() {
  // Apply theme
  body.className = body.className.replace(/theme-\w+/g, '');
  if (settings.theme !== 'default') {
    body.classList.add(`theme-${settings.theme}`);
  }
  
  // Apply show seconds setting
  if (settings.showSeconds) {
    body.classList.remove('hide-seconds');
  } else {
    body.classList.add('hide-seconds');
  }
  
  // Update CSS custom properties
  document.documentElement.style.setProperty('--bg-theme', themeColors[settings.theme]);
  
  updateUI();
}

// Audio
function initAudio() {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    notificationSound = () => {
      if (!settings.soundNotifications) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };
  } catch (e) {
    console.warn('Web Audio API not supported');
    notificationSound = () => {};
  }
}

// Notifications
async function requestNotificationPermission() {
  if ('Notification' in window && settings.browserNotifications) {
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  }
}

function showNotification(title, body) {
  if (!settings.browserNotifications) return;
  
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: './images/icons/icon-192x192.png'
    });
  }
}

// Timer Functions
function getCurrentSessionDuration() {
  switch (currentSessionType) {
    case sessionTypes.WORK:
      return settings.workDuration * 60;
    case sessionTypes.SHORT_BREAK:
      return settings.shortBreakDuration * 60;
    case sessionTypes.LONG_BREAK:
      return settings.longBreakDuration * 60;
    default:
      return settings.workDuration * 60;
  }
}

function resetTimer() {
  time = getCurrentSessionDuration();
  updateDisplay();
  updateUI();
}

function updateDisplay() {
  const minutesLeft = Math.floor(time / 60);
  const secondsLeft = time % 60;
  
  minutes.textContent = String(minutesLeft).padStart(2, '0');
  seconds.textContent = String(secondsLeft).padStart(2, '0');
}

function updateSessionInfo() {
  sessionType.textContent = sessionLabels[currentSessionType];
  sessionCounter.textContent = `Сессия ${Math.floor(completedSessions / 2) + 1} из ${settings.sessionsUntilLongBreak}`;
}

function changeThemeColor() {
  let color;
  
  if (currentState === states.RUNNING) {
    color = colors.RUNNING;
  } else {
    switch (currentSessionType) {
      case sessionTypes.WORK:
        color = colors.WORK;
        break;
      case sessionTypes.SHORT_BREAK:
        color = colors.SHORTBREAK;
        break;
      case sessionTypes.LONG_BREAK:
        color = colors.LONGBREAK;
        break;
      default:
        color = colors.WORK;
    }
  }
  
  // Override with theme color if not default
  if (settings.theme !== 'default') {
    color = themeColors[settings.theme];
  }
  
  themeElement.setAttribute('content', color);
}

function updateUI() {
  const isRunning = currentState === states.RUNNING;
  const isFinished = currentState === states.FINISHED;
  
  body.classList.toggle(states.RUNNING, isRunning);
  body.classList.toggle(states.FINISHED, isFinished);
  body.classList.toggle(currentSessionType, true);
  
  changeThemeColor();
  updateSessionInfo();
}

function startTimer() {
  currentState = states.RUNNING;
  updateUI();
  
  countdown = setInterval(() => {
    time--;
    updateDisplay();
    
    if (time <= 0) {
      clearInterval(countdown);
      finishSession();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(countdown);
  currentState = states.PAUSED;
  updateUI();
}

function finishSession() {
  currentState = states.FINISHED;
  completedSessions++;
  
  // Play notification sound
  if (notificationSound) {
    notificationSound();
  }
  
  // Show notification
  const isWorkSession = currentSessionType === sessionTypes.WORK;
  if (isWorkSession) {
    showNotification('Рабочая сессия завершена!', 'Время для перерыва');
  } else {
    showNotification('Перерыв завершен!', 'Время для работы');
  }
  
  updateUI();
  
  // Auto start next session
  setTimeout(() => {
    if (currentState === states.FINISHED) {
      switchToNextSession();
    }
  }, 3000);
}

function switchToNextSession() {
  if (currentSessionType === sessionTypes.WORK) {
    // Determine break type
    const workSessionsCompleted = Math.floor(completedSessions / 2);
    if (workSessionsCompleted > 0 && workSessionsCompleted % settings.sessionsUntilLongBreak === 0) {
      currentSessionType = sessionTypes.LONG_BREAK;
    } else {
      currentSessionType = sessionTypes.SHORT_BREAK;
    }
    
    if (settings.autoStartBreaks) {
      resetTimer();
      startTimer();
      return;
    }
  } else {
    currentSessionType = sessionTypes.WORK;
    
    if (settings.autoStartSessions) {
      resetTimer();
      startTimer();
      return;
    }
  }
  
  // Manual start required
  currentState = states.STOPPED;
  resetTimer();
}

function toggleTimer() {
  if (currentState === states.RUNNING) {
    pauseTimer();
  } else if (currentState === states.PAUSED) {
    startTimer();
  } else {
    // STOPPED or FINISHED
    if (currentState === states.FINISHED) {
      switchToNextSession();
      if (currentState === states.STOPPED) {
        startTimer();
      }
    } else {
      resetTimer();
      startTimer();
    }
  }
}

// Settings Modal Functions
function openSettings() {
  updateSettingsUI();
  settingsOverlay.classList.remove('hidden');
}

function closeSettings() {
  settingsOverlay.classList.add('hidden');
}

// Event Listeners
button.addEventListener('click', toggleTimer);
settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
saveBtn.addEventListener('click', saveSettings);
resetBtn.addEventListener('click', resetSettings);

// Close settings when clicking outside
settingsOverlay.addEventListener('click', (e) => {
  if (e.target === settingsOverlay) {
    closeSettings();
  }
});

// Close settings with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !settingsOverlay.classList.contains('hidden')) {
    closeSettings();
  }
});

// Auto start from URL
const urlParams = new URLSearchParams(window.location.search);
const initialStateFromURL = urlParams.get('state');
if (initialStateFromURL === 'running') {
  toggleTimer();
}