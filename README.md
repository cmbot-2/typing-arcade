# Typing Arcade

A typing warm-up that runs in the browser.

Start a round, type into the word field, then press Enter or use the finish button to see what you typed. Restart clears the input and puts the cursor back in the field. The warm-up does not grade your input or calculate a score.

## Run locally

Use Node.js 20.19.x or Node.js 22.12+ and npm. From the repository folder:

```sh
npm ci
npm run dev
```

Open the local URL printed in the terminal.

## Development

```sh
npm run check   # Check TypeScript
npm run build   # Check types and build into dist/
npm run preview # Serve the build locally
```

Built with TypeScript and Vite.
