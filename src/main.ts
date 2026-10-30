import './style.css';

type Screen = 'start' | 'play' | 'results';
const screens: Record<Screen, HTMLElement> = {
  start: document.querySelector('#start-screen')!,
  play: document.querySelector('#play-screen')!,
  results: document.querySelector('#results-screen')!,
};
const input = document.querySelector<HTMLInputElement>('#word-input')!;
const start = document.querySelector<HTMLButtonElement>('#start')!;
const restart = document.querySelector<HTMLButtonElement>('#restart')!;
const result = document.querySelector<HTMLElement>('#typed-result')!;

function show(screen: Screen) {
  for (const [name, element] of Object.entries(screens)) element.hidden = name !== screen;
  if (screen === 'play') input.focus();
  if (screen === 'start') start.focus();
  if (screen === 'results') restart.focus();
}

function startRound() {
  input.value = '';
  result.textContent = '';
  show('play');
}

start.addEventListener('click', startRound);
restart.addEventListener('click', startRound);
document.querySelector('#back')!.addEventListener('click', () => show('start'));
document.querySelector('#home')!.addEventListener('click', () => show('start'));
document.querySelector<HTMLFormElement>('#practice-form')!.addEventListener('submit', (event) => {
  event.preventDefault();
  result.textContent = input.value || 'No text entered';
  show('results');
});
