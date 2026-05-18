# DAE

Static marketing website for DAE, the Dental Patient Acquisition Platform.

## Project Structure

- `index.html` - main landing page markup
- `styles.css` - site styling and responsive layout
- `script.js` - interactive behavior for navigation and counters
- `assets/dae-logo-white.svg` - DAE brand logo used in the header

## Component Note

This project is a static HTML/CSS/JavaScript site, not a React, TypeScript, Tailwind, or shadcn application. Because of that, there is no default `/components/ui` path and no package manifest for installing React-specific dependencies such as `three` or `@react-three/fiber`.

If this site is later migrated to shadcn, create components in `/components/ui` so generated and shared UI primitives live in the standard shadcn location. Until then, shader-inspired effects are implemented natively in `script.js` and `styles.css` to keep the site lightweight.
