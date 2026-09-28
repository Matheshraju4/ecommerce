# ARM Farms Diagram Studio

A read-only React/Vite viewer for the ERD JSON snapshots and Excalidraw drawing in the parent directory. The source files remain the source of truth; this application imports them at build time and Vite reloads them during development.

The interface uses Tailwind CSS 4 and local shadcn/ui components with a custom ARM Farms theme. Theme tokens are in `src/index.css`; application layout styles are in `src/styles.css`.

## Run

```powershell
cd diagram-studio
npm install
npm run dev
```

Open the local URL printed by Vite. For a production bundle, run `npm run build`.

## Views

- **Overview** summarizes the current model.
- **Data model** lets you choose a schema snapshot, focus on a domain, search collections, inspect fields, and download a high-resolution PNG of the visible collection set.
- **Role journeys** shows all four roles or one role at a time.
- **Architecture** shows the architecture section of the Excalidraw source and its CDN/Redis notes.

The Excalidraw views are read-only here. Use the original `.excalidraw` file for editing. PNG export renders the complete selected diagram at 3× resolution. Choose a domain or role before exporting for a focused image.
