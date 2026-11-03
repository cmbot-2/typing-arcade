# Typing Arcade

A typing warm-up that runs in the browser.

Words fall through three lanes, starting gently and gaining pace as you play. The first matching letter locks a target, and correct letters are highlighted as you type. If several words start with that letter, the oldest one is selected. Backspace fixes a mistake; clearing the input releases the target. Letter case does not matter.

Finishing a word removes it automatically and awards 10 points per letter. Each run starts with three lives. An unfinished word costs one life when it reaches the bottom; its partial input clears if it was your target. Completed words never cost lives.

Every 30 seconds of active play raises the level, stopping at level 4 after 90 seconds. At most five words can be on screen.

| Level | New word every | Full fall at this pace | New word length |
| --- | --- | --- | --- |
| 1 | 1.6 seconds | 8 seconds | 4–5 letters |
| 2 | 1.4 seconds | 7 seconds | 5–6 letters |
| 3 | 1.2 seconds | 6 seconds | 6–7 letters |
| 4 | 1 second | 5 seconds | 7–8 letters |

Words already falling speed up when the level changes, keeping their text and position at the transition. Pausing freezes the difficulty as well as the words.

At zero lives the round ends automatically, scoring stops, and your results appear. You can also press Enter or choose **Finish warm-up** to end early. **Try again** resets the score, completed words, all three lives, and difficulty to level 1.

Choose **Pause** or press **Esc** to hold the round; **Resume** or Esc continues from the same position with your partial input intact. Switching tabs automatically pauses. Returning keeps the game paused until you resume, so time away never moves words or costs lives. Typing is disabled while paused; you can still finish the round or return to the start screen.

## Run locally

Use Node.js 20.19.x or Node.js 22.12+ and npm. From the repository folder:

```sh
npm ci
npm run dev
```

Open the local URL printed in the terminal.

## Development

```sh
npm test        # Run regression checks
npm run check   # Check TypeScript
npm run build   # Check types and build into dist/
npm run preview # Serve the build locally
```

Built with TypeScript and Vite.
