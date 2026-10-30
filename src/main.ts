import './style.css';
import { wordsAt } from './falling-words';

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
const wordLayer = document.querySelector<HTMLElement>('#falling-words')!;
const wordElements = new Map<number, HTMLElement>();
let activeScreen: Screen = 'start';
let frame: number | undefined;
let previousTime: number | undefined;
let elapsed = 0;

function renderWords() {
  const words = wordsAt(elapsed);
  for (const [id, element] of wordElements) {
    if (!words.some((word) => word.id === id)) {
      element.remove();
      wordElements.delete(id);
    }
  }
  for (const word of words) {
    let element = wordElements.get(word.id);
    if (!element) {
      element = document.createElement('span');
      element.className = 'falling-word';
      element.textContent = word.text;
      element.style.left = `${word.lane * 33.333}%`;
      wordLayer.append(element);
      wordElements.set(word.id, element);
    }
    element.style.top = `${word.progress * 100}%`;
  }
}

function animate(timestamp: number) {
  if (activeScreen !== 'play') return;
  if (previousTime !== undefined && !document.hidden) elapsed += timestamp - previousTime;
  previousTime = document.hidden ? undefined : timestamp;
  renderWords();
  frame = requestAnimationFrame(animate);
}

document.addEventListener('visibilitychange', () => { previousTime = undefined; });

function show(screen: Screen) {
  activeScreen = screen;
  if (frame !== undefined) cancelAnimationFrame(frame);
  frame = undefined;
  previousTime = undefined;
  for (const [name, element] of Object.entries(screens)) element.hidden = name !== screen;
  if (screen === 'play') {
    input.focus();
    frame = requestAnimationFrame(animate);
  }
  if (screen === 'start') start.focus();
  if (screen === 'results') restart.focus();
}

function startRound() {
  input.value = '';
  result.textContent = '';
  elapsed = 0;
  wordElements.clear();
  wordLayer.replaceChildren();
  renderWords();
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
