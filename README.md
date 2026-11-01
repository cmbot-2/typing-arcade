# Typing Arcade

A typing warm-up that runs in the browser.

Words fall through three lanes at a steady pace. The first matching letter locks a target, and correct letters are highlighted as you type. If several words start with that letter, the oldest one is selected. Backspace fixes a mistake; clearing the input releases the target. Letter case does not matter.

Finishing a word removes it automatically and awards 10 points per letter. Words drift away after eight seconds; an unfinished target clears when it leaves. Press Enter or choose **Finish warm-up** to see your score and completed-word count. **Try again** starts a fresh round.

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
