## ![CanBan](public/dog.svg)Ban

Kanban + Calendar app built with Astro, React, and Tailwind CSS.

### Prerequisites
- Node.js LTS: 18.18+ or 20+
- npm (or Yarn/Pnpm if you prefer)
- Git

Check your Node version:

```pwsh
node -v
```

### Clone the repository

```pwsh
git clone https://github.com/p4rzivalDM/CanBan.git
cd CanBan
```

Or download the ZIP from GitHub and extract it.

### Install dependencies

```pwsh
npm install
```

### Start development server

```pwsh
npm run dev
```

By default, Astro serves the app at `http://localhost:4321` (the terminal will show the exact URL).

### Production build

```pwsh
npm run build
```

The output will be generated in `dist/`.

### Preview the build

```pwsh
npm run preview
```

### Notes
- UI: shadcn/ui + Tailwind CSS are already configured.
- If you run into dependency issues: remove `node_modules` and the lock file, then reinstall.

```pwsh
Remove-Item -Recurse -Force node_modules; Remove-Item package-lock.json; npm install
```

