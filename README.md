## ![CanBan](public/dog.svg)Ban Calendar

A powerful Kanban + Calendar hybrid task management application built with Astro, React, and Tailwind CSS.

## Description

CanBan combines the visual flexibility of a Kanban board with the time-awareness of a Calendar view, allowing you to manage tasks both by workflow status and by scheduled dates. Switch seamlessly between single and split views, customize your layout preferences, and enjoy smooth drag-and-drop interactions with intuitive controls.

## Getting Started

### Dependencies

* Node.js LTS: 18.18+ or 20+
* npm (or Yarn/Pnpm if you prefer)
* Git
* Windows 10+ / macOS / Linux

Check your Node version:

```pwsh
node -v
```

### Installing

1. Clone the repository:

```pwsh
git clone https://github.com/p4rzivalDM/CanBan.git
cd CanBan
```

Or download the ZIP from GitHub and extract it.

2. Install dependencies:

```pwsh
npm install
```

### Executing program

1. Start the development server:

```pwsh
npm run dev
```

By default, Astro serves the app at `http://localhost:4321` (check the terminal for the exact URL).

2. Open the app in your browser and start creating tasks.

3. Use the view buttons at the top to switch between Kanban, Calendar, and Split view modes.

4. Drag the divider in split view to adjust the layout, or use the settings to customize limits.

### Building for production

Generate a production build:

```pwsh
npm run build
```

The output will be generated in the `dist/` folder.

Preview the production build:

```pwsh
npm run preview
```

## Help

**Port 4321 already in use?**

The terminal will suggest an alternative port. You can also specify a custom port in `astro.config.mjs`.

## Authors

[p4rzivalDM](https://github.com/p4rzivalDM)

## Version History

* 0.2 - In Development (develop branch)
    * Improved import/export functionality and data persistence
    * Enhanced user interface and interaction refinements
    * Skeleton loading states during view dragging
    * Markdown editor integration and loading experience improvements
    * Dependency updates and calendar card formatting fixes
    * Enhanced drag and drop functionality
    * Improved Kanban system with compact view mode
    * Full split/single view switching with smooth transitions
    * Settings modal with configurable divider limits
    * Swap views feature to interchange Kanban and Calendar positions
    * Export/Import functionality with complete settings persistence

* 0.1 - Current Release (main branch)
    * Basic Kanban and Calendar views
    * Fundamental task management structure
    * Initial UI components using shadcn/ui

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details

## Acknowledgments

* [Astro](https://astro.build/)
* [React](https://react.dev/)
* [shadcn/ui](https://ui.shadcn.com/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Lucide Icons](https://lucide.dev/)

