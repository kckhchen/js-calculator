const container = document.querySelector('.container');
const display = document.querySelector('.display');
const operatorList = ['+', '-', '×', '÷'];
const sound = new Audio('./assets/click-sound.mov');
let answerReturned;

container.addEventListener('click', (e) => {
  if (e.target.nodeName !== 'BUTTON') {
    return;
  }
  sound.currentTime = 0;
  sound.play();

  changeDisplay(e);
});

document.addEventListener('keydown', (e) => {
  let key = e.key;
  if (key === 'Enter') key = '=';
  if (key === 'Backspace') key = '←';
  if (key === 'Escape' || key === 'Delete') key = 'AC';
  if (key === '*') key = '×';
  if (key === '/') key = '÷';
  const buttons = Array.from(document.querySelectorAll('button'));
  const button = buttons.find((btn) => btn.textContent === key);
  if (button) {
    e.preventDefault();
    button.click();
    button.classList.add('pressed');
    setTimeout(() => {
      button.classList.remove('pressed');
    }, 100);
  }
});

function changeDisplay(e) {
  const btn = e.target;
  if (btn.id === 'clear') return clearDisplay();
  if (btn.id === 'back') return deleteLastChar();
  if (btn.id === 'equal') return handleEqual();
  if (btn.id === 'dot') return handleDecimal();
  if (btn.classList.contains('operator'))
    return handleOperator(btn.textContent);
  if (btn.classList.contains('number')) return appendNumber(btn.textContent);
}

function clearDisplay() {
  display.textContent = '';
}

function deleteLastChar() {
  display.textContent = display.textContent.slice(0, -1);
}

function handleOperator(opt) {
  if (operatorList.includes(display.textContent.at(-1))) {
    if (display.textContent === '-' && opt !== '-') {
      return;
    }
    display.textContent = display.textContent.slice(0, -1) + opt;
  } else if (display.textContent === '' && opt !== '-') {
    return;
  } else if (operatorList.some((opt) => display.textContent.includes(opt))) {
    handleEqual();
    display.textContent += opt;
  } else {
    display.textContent += opt;
  }
  answerReturned = false;
}

function handleDecimal() {
  const currentNum = getCurrentOperand();

  if (currentNum.includes('.') && !answerReturned) {
    return;
  }

  if (
    display.textContent === '' ||
    operatorList.includes(display.textContent.at(-1)) ||
    answerReturned
  ) {
    appendNumber('0.');
  } else {
    appendNumber('.');
  }
}

function appendNumber(num) {
  if (answerReturned) {
    clearDisplay();
    answerReturned = false;
  }
  const currentNum = getCurrentOperand();
  if (currentNum === '0') {
    display.textContent = display.textContent.slice(0, -1) + num;
  } else {
    display.textContent += num;
  }
}

function handleEqual() {
  const expression = getEval();
  if (!expression) return;
  let [num1, operator, num2] = expression;
  let answer = getAnswer(num1, num2, operator);
  display.textContent = answer;
  answerReturned = true;
  addHistoryItem([num1, operator, num2, answer]);
}

function getEval() {
  const regex = /(-?\d*\.?\d*)([+\-×÷])(-?\d*\.?\d*)/;
  if (display.textContent.match(regex)) {
    let [num1, operator, num2] = display.textContent.match(regex).slice(1);
    return [num1, operator, num2];
  }
  return;
}

function getAnswer(num1, num2, operator) {
  num1 = Number(num1);
  num2 = Number(num2);
  let answer;
  switch (operator) {
    case '+':
      answer = num1 + num2;
      break;
    case '-':
      answer = num1 - num2;
      break;
    case '×':
      answer = num1 * num2;
      break;
    case '÷':
      if (num2 === 0) {
        alert('Error: Division by zero.');
        return '';
      }
      answer = num1 / num2;
      break;
  }
  return roundTo(answer, 3);
}

const roundTo = function (num, decimal) {
  return Math.round(num * 10 ** decimal) / 10 ** decimal;
};

function getCurrentOperand() {
  const parts = display.textContent.split(/[+\-×÷]/);
  return parts[parts.length - 1];
}

const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const body = document.body;

// Dark mode toggle
const moonIcon = '/assets/dark-mode.png';
const sunIcon = '/assets/light-mode.png';

function setDarkTheme(isDark) {
  if (isDark) {
    body.classList.add('dark-mode');
    themeIcon.src = sunIcon;
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark-mode');
    themeIcon.src = moonIcon;
    localStorage.setItem('theme', 'light');
  }
}

const currentTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia(
  '(prefers-color-scheme: dark)'
).matches;

if (currentTheme === 'dark' || systemPrefersDark) {
  setDarkTheme(true);
} else if (currentTheme === 'light') {
  setDarkTheme(false);
}

themeToggleBtn.addEventListener('click', () => {
  const isDark = body.classList.contains('dark-mode');
  setDarkTheme(!isDark);
});

// history page toggle
const historyIcon = document.getElementById('history-toggle');
const historyPaper = document.getElementById('history-paper');
const HISTORYTIMEOUT = 200;
let closeTimer;

historyIcon.addEventListener('mouseenter', () => {
  clearTimeout(closeTimer);
  historyPaper.classList.add('open');
});

historyIcon.addEventListener('mouseleave', () => {
  startCloseTimer();
});

historyPaper.addEventListener('mouseenter', () => {
  clearTimeout(closeTimer);
});

historyPaper.addEventListener('mouseleave', () => {
  startCloseTimer();
});

function startCloseTimer() {
  closeTimer = setTimeout(() => {
    historyPaper.classList.remove('open');
  }, HISTORYTIMEOUT);
}

// Add history item to list
const historyList = document.getElementById('history-list');
const MAXHISTORY = 20;
function addHistoryItem(entry) {
  if (
    historyList.firstElementChild.classList.contains('empty-msg') ||
    historyList.childElementCount >= MAXHISTORY
  ) {
    historyList.removeChild(historyList.firstElementChild);
  }
  entry.splice(entry.length - 1, 0, '=');
  const historyItem = document.createElement('li');
  historyItem.classList.add('history-item');
  historyItem.textContent = entry.join(' ');
  historyList.appendChild(historyItem);
}

// Copy entry to display if clicked

historyList.addEventListener('click', (e) => {
  if (e.target.classList.contains('history-item')) {
    const answer = e.target.textContent.split('= ').at(-1);
    display.textContent = answer;
    answerReturned = false;
  }
});
