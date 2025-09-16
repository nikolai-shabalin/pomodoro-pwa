const body = document.body;
const app = document.querySelector('.app');
const timer = app.querySelector('.timer');
const [minutes, seconds] = timer.querySelectorAll('.minutes, .seconds');
const button = app.querySelector('.toggle-timer');
const themeElement = document.querySelector('meta[name="theme-color"]');
const settingsButton = document.querySelector('.settings-btn');
const settingsOverlay = document.querySelector('.settings-overlay');
const closeSettingsButton = document.querySelector('.close-settings');

const states = {
  STOPPED: 'stopped',
  RUNNING: 'running',
  PAUSED: 'paused',
  FINISHED: 'finished',
  SHORTBREAK: 'shortbreak',
  LONGBREAK: 'longbreak'
};
const colors = {
  RUNNING: '#13b888',
  STOPPED: '#e7626c',
};

let currentState = states.STOPPED;
let countdown;
let time = 15 * 60;

const changeThemeColor = () => {
  const color = currentState === states.RUNNING ? colors.RUNNING : colors.STOPPED;
  themeElement.setAttribute('content', color);
};

const updateUI = () => {
  const isRunning = currentState === states.RUNNING;
  body.classList.toggle(states.RUNNING, isRunning);
  body.classList.toggle(states.FINISHED, !isRunning && currentState === states.STOPPED);
  changeThemeColor();
};

const startTimer = () => {
  currentState = states.RUNNING;
  updateUI();
  countdown = setInterval(() => {
    time--;

    const minutesLeft = Math.floor(time / 60);
    const secondsLeft = time % 60;

    minutes.textContent = String(minutesLeft).padStart(2, '0');
    seconds.textContent = String(secondsLeft).padStart(2, '0');

    if (time <= 0) {
      clearInterval(countdown);
      currentState = states.STOPPED;
      updateUI();
    }
  }, 1000);
};

const toggleTimer = () => {
  if (currentState === states.RUNNING) {
    clearInterval(countdown);
    currentState = states.PAUSED;
  } else if (currentState === states.PAUSED || currentState === states.STOPPED) {
    if (currentState === states.STOPPED) {
      time = 25 * 60;
    }
    startTimer();
  } else {
    startTimer();
  }
  updateUI();
};

button.addEventListener('click', toggleTimer);

// Автоматический запуск таймера на основе параметра URL
const urlParams = new URLSearchParams(window.location.search);
const initialStateFromURL = urlParams.get('state');
if (initialStateFromURL === 'running') {
  toggleTimer();
}

// Открытие/закрытие настроек
const openSettings = () => {
  if (!settingsOverlay) return;
  settingsOverlay.classList.remove('hidden');
};

const closeSettings = () => {
  if (!settingsOverlay) return;
  settingsOverlay.classList.add('hidden');
};

if (settingsButton) {
  settingsButton.addEventListener('click', openSettings);
}

if (closeSettingsButton) {
  closeSettingsButton.addEventListener('click', closeSettings);
}

if (settingsOverlay) {
  settingsOverlay.addEventListener('click', (event) => {
    if (event.target === settingsOverlay) {
      closeSettings();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && settingsOverlay && !settingsOverlay.classList.contains('hidden')) {
    closeSettings();
  }
});
