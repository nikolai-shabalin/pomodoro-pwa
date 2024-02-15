const body = document.body;
const app = document.querySelector('.app');
const timer = app.querySelector('.timer');
const [minutes, seconds] = timer.querySelectorAll('.minutes, .seconds');
const button = app.querySelector('.toggle');
const themeElement = document.querySelector('meta[name="theme-color"]');

const currentStates = {
  STOPPED: 'stopped',
  RUNNING: 'running',
  PAUSED: 'paused',
  SHORBREAK: 'shortbreak',
  LONGBREAK: 'longbreak'
};
const colors = {
  PLAY: '#13b888',
  PAUSE: '#e7626c',
}

let currentState = currentStates.STOPPED;
let countdown;
let time = 25 * 60;
let currentThemeColor = colors.PAUSE;

const changeThemeColor = () => {
  const color = currentState === currentStates.RUNNING ? colors.PLAY : colors.PAUSE;
  themeElement.setAttribute('content', color);
  currentThemeColor = color;
}

const updateUI = () => {
  const isRunning = currentState === currentStates.RUNNING;
  body.classList.toggle('active', isRunning);
  body.classList.toggle('finished', !isRunning && currentState === currentStates.STOPPED);
  button.classList.toggle('start', isRunning);
  button.classList.toggle('pause', !isRunning);
  changeThemeColor();
}

const startTimer = () => {
  currentState = currentStates.RUNNING;
  updateUI();
  countdown = setInterval(() => {
    time--;

    const minutesLeft = Math.floor(time / 60);
    const secondsLeft = time % 60;

    minutes.textContent = String(minutesLeft).padStart(2, '0');
    seconds.textContent = String(secondsLeft).padStart(2, '0');

    if (time <= 0) {
      clearInterval(countdown);
      currentState = currentStates.STOPPED;
      updateUI();
    }
  }, 1000);
}

const toggleTimer = () => {
  if (currentState === currentStates.RUNNING) {
    clearInterval(countdown);
    currentState = currentStates.PAUSED;
  } else if (currentState === currentStates.PAUSED || currentState === currentStates.STOPPED) {
    if (currentState === currentStates.STOPPED) {
      time = 25 * 60;
    }
    startTimer();
  } else {
    startTimer();
  }
  updateUI();
}

button.addEventListener('click', toggleTimer);
