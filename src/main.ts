import './style.css';
import { expiredWordCount, wordsAt } from './falling-words';
import { createRound, matchedLength, syncRound, typeInput } from './round';

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
const score = document.querySelector<HTMLElement>('#score')!;
const completed = document.querySelector<HTMLElement>('#completed')!;
const lives = document.querySelector<HTMLElement>('#lives')!;
const feedback = document.querySelector<HTMLElement>('#typing-status')!;
let round = createRound();
let activeScreen: Screen = 'start';
let frame: number | undefined;
let previousTime: number | undefined;
let elapsed = 0;

function renderWords() {
  const allWords = wordsAt(elapsed);
  const previousTarget = round.targetId;
  const previousLives = round.lives;
  round = syncRound(round, allWords, expiredWordCount(elapsed));
  if (previousTarget !== null && round.targetId === null) {
    input.value = '';
    feedback.textContent = 'That word reached the bottom. Pick another word.';
  }
  if (round.lives < previousLives) feedback.textContent = `Missed ${previousLives - round.lives} word(s). ${round.lives} lives left.`;
  const words = allWords.filter((word) => !round.completedIds.includes(word.id));
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
      element.dataset.wordId = String(word.id);
      element.append(document.createElement('span'), document.createElement('span'));
      element.children[0]!.className = 'matched';
      element.style.left = `${word.lane * 33.333}%`;
      wordLayer.append(element);
      wordElements.set(word.id, element);
    }
    element.style.top = `${word.progress * 100}%`;
    const targeted = word.id === round.targetId;
    const length = targeted ? matchedLength(word.text, round.input) : 0;
    element.classList.toggle('targeted', targeted);
    element.children[0]!.textContent = word.text.slice(0, length);
    element.children[1]!.textContent = word.text.slice(length);
  }
  score.textContent = String(round.score);
  completed.textContent = String(round.completed);
  lives.textContent = String(round.lives);
  if (round.lives === 0 && activeScreen === 'play') finishRound();
}

function advanceClock(timestamp: number) {
  if (previousTime !== undefined && !document.hidden) elapsed += Math.max(0, timestamp - previousTime);
  previousTime = document.hidden ? undefined : Math.max(timestamp, previousTime ?? timestamp);
}

function animate(timestamp: number) {
  if (activeScreen !== 'play') return;
  advanceClock(timestamp);
  renderWords();
  if (activeScreen === 'play') frame = requestAnimationFrame(animate);
}

document.addEventListener('visibilitychange', () => { previousTime = undefined; });

function show(screen: Screen) {
  activeScreen = screen;
  if (frame !== undefined) cancelAnimationFrame(frame);
  frame = undefined;
  previousTime = undefined;
  for (const [name, element] of Object.entries(screens)) element.hidden = name !== screen;
  input.disabled = screen !== 'play';
  if (screen === 'play') {
    previousTime = performance.now();
    input.focus();
    frame = requestAnimationFrame(animate);
  }
  if (screen === 'start') start.focus();
  if (screen === 'results') restart.focus();
}

function startRound() {
  round = createRound();
  input.value = '';
  result.textContent = '';
  elapsed = 0;
  wordElements.clear();
  wordLayer.replaceChildren();
  feedback.textContent = 'Type the first letter of a falling word to target it.';
  renderWords();
  show('play');
}

start.addEventListener('click', startRound);
restart.addEventListener('click', startRound);
function handleInput() {
  if (activeScreen !== 'play') return;
  // Settle expirations before scoring, even between animation frames.
  const value = input.value;
  advanceClock(performance.now());
  renderWords();
  if (activeScreen !== 'play') return;
  // An expired target clears its partial input rather than retargeting it.
  if (value !== input.value) return;
  const previousCompleted = round.completed;
  round = typeInput(round, wordsAt(elapsed), input.value);
  input.value = round.input;
  const target = wordsAt(elapsed).find((word) => word.id === round.targetId);
  feedback.textContent = round.completed > previousCompleted
    ? `${round.lastWord} complete! +${round.lastWord.length * 10} points.`
    : target
      ? matchedLength(target.text, round.input) === round.input.length
        ? `Target: ${target.text}. Keep going!` : `Target: ${target.text}. Backspace to fix the mismatch.`
      : round.input ? 'No word starts with that letter. Clear it and try another.'
        : 'Type the first letter of a falling word to target it.';
  renderWords();
}
input.addEventListener('input', (event) => { if (!event.isComposing) handleInput(); });
input.addEventListener('compositionend', handleInput);
document.querySelector('#back')!.addEventListener('click', () => show('start'));
document.querySelector('#home')!.addEventListener('click', () => show('start'));
function finishRound() {
  result.textContent = round.lastWord || 'None yet';
  document.querySelector('#results-title')!.textContent = round.lives === 0 ? 'Game over.' : 'Nice warm-up.';
  document.querySelector('#result-reason')!.textContent = round.lives === 0
    ? 'Three words reached the bottom. Ready for another round?' : `Warm-up finished with ${round.lives} lives left.`;
  document.querySelector('#result-score')!.textContent = String(round.score);
  document.querySelector('#result-completed')!.textContent = String(round.completed);
  show('results');
}
document.querySelector<HTMLFormElement>('#practice-form')!.addEventListener('submit', (event) => {
  event.preventDefault();
  if (activeScreen !== 'play') return;
  advanceClock(performance.now());
  renderWords();
  if (activeScreen === 'play') finishRound();
});
