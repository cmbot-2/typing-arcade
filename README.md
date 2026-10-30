# Typing Arcade

A typing warm-up that runs in the browser.

Words fall through three lanes at a steady pace. Type a word you see, then press Enter or use the finish button to see what you typed. Restart clears the field and starts a fresh stream. This is an unscored warm-up: typing does not remove words yet. Words leave the field after eight seconds.

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
