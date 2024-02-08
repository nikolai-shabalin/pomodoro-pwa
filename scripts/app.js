const body = document.body;
const app = document.querySelector('.app');
const timer = app.querySelector('.timer');
const minutes = timer.querySelector('.minutes');
const seconds = timer.querySelector('.seconds');
const button = app.querySelector('.toggle');
const themeElement = document.querySelector('meta[name="theme-color"]');

const startClass = 'start';
const pauseClass = 'pause';
const activeClass = 'active';

let currentThemeColor = '#e7626c';
let countdown;
let time = 25 * 60;

const changeThemeColor = () => {
  if (currentThemeColor === '#e7626c') {
    themeElement.setAttribute('content', '#13b888');
    currentThemeColor = '#13b888';
  } else {
    themeElement.setAttribute('content', '#e7626c');
    currentThemeColor = '#e7626c';
  }
}

const toggleButtonClass =() => {
  button.classList.toggle(startClass);
  button.classList.toggle(pauseClass);
  body.classList.toggle(activeClass);
  changeThemeColor();
}

const startTimer = timeLeft => {
  if (button.classList.contains(startClass)) {
    countdown = setInterval(() => {
      timeLeft--;

      const minutesLeft = Math.floor(timeLeft / 60);
      const secondsLeft = timeLeft % 60;

      minutes.textContent = String(minutesLeft).padStart(2, '0');
      seconds.textContent = String(secondsLeft).padStart(2, '0');

      if (timeLeft <= 0) {
        clearInterval(countdown);
        toggleButtonClass();
      }
    }, 1000);

    toggleButtonClass();
  } else {
    clearInterval(countdown);
    toggleButtonClass();
  }
}

button.addEventListener('click', () => {
  startTimer(time);
});
