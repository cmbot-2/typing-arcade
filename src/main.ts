import './style.css';
import { expiredWordCount, wordsAt } from './falling-words';
import { createRound, matchedLength, syncRound, typeInput } from './round';
import { advanceClock, createClock, pauseClock, resumeClock } from './clock';

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
const pause = document.querySelector<HTMLButtonElement>('#pause')!;
const pauseNotice = document.querySelector<HTMLElement>('#pause-notice')!;
let round = createRound();
let activeScreen: Screen = 'start';
let frame: number | undefined;
let clock = createClock();

function renderWords() {
  const allWords = wordsAt(clock.elapsed);
  const previousTarget = round.targetId;
  const previousLives = round.lives;
  round = syncRound(round, allWords, expiredWordCount(clock.elapsed));
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

function stopAnimation() {
  if (frame !== undefined) cancelAnimationFrame(frame);
  frame = undefined;
}

function renderPause() {
  input.disabled = activeScreen !== 'play' || clock.paused;
  pause.textContent = clock.paused ? 'Resume' : 'Pause';
  pauseNotice.hidden = activeScreen !== 'play' || !clock.paused;
}

function pauseRound(automatic = false) {
  if (activeScreen !== 'play' || clock.paused) return;
  // A hidden page freezes at the last visible frame, even if its event was delayed.
  clock = pauseClock(clock, automatic ? clock.previous ?? performance.now() : performance.now());
  stopAnimation();
  renderWords();
  if (activeScreen !== 'play') return;
  renderPause();
  if (!document.hidden) pause.focus();
}

function resumeRound() {
  if (activeScreen !== 'play' || !clock.paused || document.hidden) return;
  clock = resumeClock(clock, performance.now());
  input.value = round.input;
  renderPause();
  input.focus();
  frame = requestAnimationFrame(animate);
}

function animate(timestamp: number) {
  frame = undefined;
  if (activeScreen !== 'play' || clock.paused) return;
  if (document.hidden) { pauseRound(true); return; }
  clock = advanceClock(clock, timestamp);
  renderWords();
  if (activeScreen === 'play' && !clock.paused) frame = requestAnimationFrame(animate);
}

pause.addEventListener('click', () => { if (clock.paused) resumeRound(); else pauseRound(); });
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || event.repeat || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || activeScreen !== 'play') return;
  event.preventDefault();
  if (clock.paused) resumeRound(); else pauseRound();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseRound(true);
  else if (activeScreen === 'play' && clock.paused) pause.focus();
});
window.addEventListener('pagehide', () => pauseRound(true));

function show(screen: Screen) {
  activeScreen = screen;
  stopAnimation();
  clock = pauseClock(clock, clock.previous ?? performance.now());
  for (const [name, element] of Object.entries(screens)) element.hidden = name !== screen;
  renderPause();
  if (screen === 'play') resumeRound();
  if (screen === 'start') start.focus();
  if (screen === 'results') restart.focus();
}

function startRound() {
  round = createRound();
  input.value = '';
  result.textContent = '';
  clock = createClock();
  wordElements.clear();
  wordLayer.replaceChildren();
  feedback.textContent = 'Type the first letter of a falling word to target it.';
  renderWords();
  show('play');
}

start.addEventListener('click', startRound);
restart.addEventListener('click', startRound);
function handleInput() {
  if (document.hidden) pauseRound(true);
  if (activeScreen !== 'play' || clock.paused) { input.value = round.input; return; }
  // Settle expirations before scoring, even between animation frames.
  const value = input.value;
  clock = advanceClock(clock, performance.now());
  renderWords();
  if (activeScreen !== 'play') return;
  // An expired target clears its partial input rather than retargeting it.
  if (value !== input.value) return;
  const previousCompleted = round.completed;
  round = typeInput(round, wordsAt(clock.elapsed), input.value);
  input.value = round.input;
  const target = wordsAt(clock.elapsed).find((word) => word.id === round.targetId);
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
  if (document.hidden) pauseRound(true);
  clock = advanceClock(clock, performance.now());
  renderWords();
  if (activeScreen === 'play') finishRound();
});
renderPause();
