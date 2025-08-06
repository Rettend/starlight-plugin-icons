# PLAN.md

This document outlines the plan for converting the custom icon functionality in the `/docs` directory into a reusable Astro integration package, `starlight-plugin-icons`, located in the `/src` directory. This version is updated based on the official Starlight plugin and UnoCSS preset documentation.

## 1. Project Goals

- **Create a distributable NPM package** (`starlight-plugin-icons`) that provides icon functionality for Astro Starlight projects.
- **Refactor all custom code** (components, scripts, styles) from `/docs` into a well-structured library in `/src`.
- **Convert all JavaScript code to TypeScript** for better maintainability and type safety.
- **Provide a simple and flexible API** leveraging Starlight's plugin system.
- **Minimize user boilerplate** by automating processes and providing a clean configuration interface.
- **Automate icon safelist generation** by hooking into the Astro build process, removing the need for manual `predev`/`prebuild` scripts.
- **Update the `/docs` application** to serve as the official documentation and a working example of the plugin.

## 2. Final Directory Structure

```plaintext
starlight-plugin-icons/
├── docs/                     # Documentation site (consumer of the plugin)
│   ├── astro.config.mjs      # Will use the starlight-plugin-icons integration
│   └── ...
├── src/                      # The plugin source code
│   ├── components/           # Re-usable components for users to import
│   │   ├── Card.astro
│   │   ├── IconLink.astro
│   │   ├── FileTree.astro
│   │   └── starlight/        # Overridable Starlight components
│   │       └── Sidebar.astro
│   ├── lib/                  # Core logic and utilities
│   │   ├── material-icons.ts # Logic for fetching and resolving material icons
│   │   ├── rehype-file-tree.ts # Rehype plugin for FileTree icons
│   │   └── safelist.ts       # Logic for generating the icon safelist
│   ├── styles/
│   │   └── main.css          # All custom CSS required by the plugin
│   ├── index.ts              # Main Astro integration entry point
│   ├── uno.ts                # UnoCSS preset for easy user configuration
│   └── types.ts              # All TypeScript type definitions
├── package.json              # Root package.json for the workspace
├── tsconfig.json             # Root TypeScript configuration
└── PLAN.md                   # This file
```

## 3. Refactoring Plan

### Phase 1: Setup and Core Integration

1. **Initialize `/src`:** Create the directory structure outlined above.
2. **Develop the Astro Integration (`src/index.ts`):**
   - Create the main `starlightPluginIcons` function that returns an Astro integration object.
   - **Hook into Astro:** Use the `astro:config:setup` hook to find the user's Starlight configuration and programmatically inject our component overrides and custom CSS. This is the standard way for a Starlight plugin to work.
   - **Automate Safelist Generation:** Implement the `astro:build:start` (for `astro build`) and `astro:server:start` (for `astro dev`) hooks. These hooks will trigger the icon safelist generation logic (`src/lib/safelist.ts`) automatically. This eliminates the need for users to add scripts to their `package.json`.

### Phase 2: Code Migration and TypeScript Conversion

1. **Migrate Components:**
   - Move user-facing components like `Card.astro`, `FileTree.astro`, and `IconLink.astro` to `src/components`.
   - Move Starlight component overrides like `Sidebar.astro` to `src/components/starlight`.
2. **Migrate and Convert Logic:**
   - Move `docs/src/lib/material-icons.mjs` to `src/lib/material-icons.ts`.
   - Move `docs/src/components/starlight/rehype-file-tree.ts` to `src/lib/rehype-file-tree.ts`.
   - Move the logic from `docs/scripts/generate-icon-safelist.mjs` into a new `src/lib/safelist.ts` module.
   - Convert all logic to TypeScript, ensuring strong type definitions.
3. **Migrate Styles:** Consolidate CSS from `docs/src/styles/custom.css` into `src/styles/main.css`. The integration will inject this file.

### Phase 3: Tooling and API Polish

1. **Create UnoCSS Preset (`src/uno.ts`):**
   - Following the official UnoCSS preset guide, create a function that returns a `Preset` object.
   - This preset will be responsible for providing the `safelist` by reading the generated cache file.
   - It will also automatically configure the `presetIcons` with the necessary collections and customizations.
   - This simplifies the user's `uno.config.ts` dramatically.
2. **Finalize Plugin Options:** Refine the options object passed to the main integration to allow users to toggle each feature on or off. The integration will conditionally apply hooks and overrides based on these options.

## 4. API Design

### Plugin Configuration (`astro.config.mjs`)

The API remains simple. The key change is the **removal of manual script setup**, as this is now handled by the plugin's Astro hooks.

```javascript
// astro.config.mjs
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { starlightPluginIcons } from 'starlight-plugin-icons'

export default defineConfig({
  integrations: [
    starlight({
      title: 'My Awesome Docs',
      // The user's Starlight config
    }),
    starlightPluginIcons({
      // Options to enable/disable features.
      // Defaults to true, so users can omit this for full functionality.
      sidebar: true, // Enable custom sidebar icons
      extractSafelist: true, // Automatically generate the icon safelist for FileTree and Code Blocks
    }),
  ],
})
```

### UnoCSS Configuration (`uno.config.ts`)

Users will import the preset from the plugin, which greatly simplifies their config.

```typescript
// uno.config.ts
import { presetStarlightIcons } from 'starlight-plugin-icons/uno'
import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      // Users can still define their own custom collections here
      collections: {
        // ...
      },
    }),
    presetStarlightIcons(), // Our preset handles the rest!
  ],
})
```

## 5. Feature Implementation Details

- **Plugin Hooks:**
  - `astro:config:setup`: Used to inject component overrides (`Card`, `Sidebar`, etc.) and the plugin's custom CSS (`src/styles/main.css`) into the Starlight config.
  - `astro:build:start` / `astro:server:start`: These hooks will be used to run the `generateSafelist` function from `src/lib/safelist.ts` before the dev server starts or a build is initiated. The hook's payload provides the root directory, which is essential for finding content files.
- **UnoCSS Preset:**
  - The exported `presetStarlightIcons` function in `src/uno.ts` will return a `Preset` object.
  - This preset will contain a `safelist` property that reads the `.material-icons-cache/material-icons-safelist.json` file.
  - It will also merge the necessary `presetIcons` configurations for Iconify and material icons.
- **Component Overrides:** The integration will use the `starlight.components` configuration to override `FileTree` and `Sidebar`. This is a clean, officially supported method for extending Starlight. User-facing components like `Card` and `IconLink` will be exported for manual import.

## 6. Minimal Setup Guides

The documentation will be updated to reflect this new, simpler setup process.

**Example for enabling only Code Block icons:**

1. **Install:** `npm install starlight-plugin-icons unocss`
2. **Configure `astro.config.mjs`:**

   ```javascript
   import { starlightPluginIcons } from 'starlight-plugin-icons'

   starlightPluginIcons({
     sidebar: false,
     extractSafelist: true, // Only enable what you need
   })
   ```

3. **Configure `uno.config.ts`:**

   ```typescript
   import { presetStarlightIcons } from 'starlight-plugin-icons/uno'
   import { defineConfig } from 'unocss'

   export default defineConfig({
     presets: [presetStarlightIcons()],
   })
   ```

4. **Done!** No need to add `prebuild` scripts. The plugin handles safelist generation automatically.
