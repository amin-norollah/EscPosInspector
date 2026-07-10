# Contributing to ESC/POS Receipt Inspector

Thanks for your interest in improving **EscPosInspector**! Contributions of all
kinds are welcome ; bug reports, new command handlers, renderer improvements,
documentation, and test streams.

## Code of conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating,
you agree to uphold it. Please report unacceptable behavior to
an-dev@cntxts.com.

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
git clone https://github.com/amin-norollah/EscPosInspector.git
cd esc-pos-inspector
npm install
npm run dev
```

Open the local development URL shown in your terminal.

### Build

```bash
npm run build
npm run preview
```

## How to contribute

### Reporting bugs

Open a [bug report](https://github.com/amin-norollah/EscPosInspector/issues/new/choose)
and include:

- what you loaded (file type, hex, or Base64) and, when possible, the sample
  input bytes
- what you expected to happen
- what actually happened (screenshots or decoded output help)
- browser and OS

### Suggesting features

Open a [feature request](https://github.com/amin-norollah/EscPosInspector/issues/new/choose)
describing the ESC/POS behavior or workflow you would like to see supported.

### Submitting changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-change`)
3. Make focused changes ; add parser/renderer support in small, reviewable
   commits
4. Include sample input bytes when adding command support
5. Verify the app builds and runs (`npm run build`)
6. Open a pull request describing the ESC/POS behavior and the test stream

## Coding guidelines

- **Keep modules small.** The project is split into `parser/`, `renderer/`,
  `inspector/`, `preview/`, `fileLoader/`, `printService/`, and `types/`. One
  responsibility per module.
- **Extend the typed command model** rather than adding special-case UI logic.
- **Prefer no new runtime dependencies.** The runtime has no third-party
  dependencies beyond React; keep it lightweight and fully client-side.
- Match the existing code style, naming, and formatting.

## Adding a new command handler

1. Add or extend the command type in `src/types/`.
2. Decode the bytes in `src/parser/`.
3. Render or display it in `src/renderer/` and/or `src/inspector/`.
4. Add the command to the **Supported commands** table in the README.
5. Include the sample input bytes you used in your pull request.

Thank you for helping make receipt debugging less painful!
