# Sentrie Documentation

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

This is the documentation site for [Sentrie](https://github.com/sentrie-sh/sentrie), a policy-as-code tool. The site is built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build), and is deployed at [sentrie.sh](https://sentrie.sh).

## 🚀 Project Structure

```
.
├── public/              # Static assets (favicons, etc.)
├── src/
│   ├── assets/         # Images and other assets
│   ├── content/
│   │   └── docs/       # Documentation content (Markdown/MDX files)
│   │       ├── getting-started/
│   │       ├── reference/
│   │       ├── cli-reference/
│   │       └── ...
│   ├── content.config.ts
│   └── sentrie-grammar.ts  # Syntax highlighting grammar for Sentrie
├── astro.config.mjs     # Astro configuration
├── package.json
└── tsconfig.json
```

Documentation pages are written in Markdown (`.md`) or MDX (`.mdx`) and placed in `src/content/docs/`. Each file is exposed as a route based on its file name and directory structure.

## 🧞 Commands

All commands are run from the root of the project:

| Command             | Action                                           |
| :------------------ | :----------------------------------------------- |
| `yarn install`      | Installs dependencies                            |
| `yarn dev`          | Starts local dev server at `localhost:4321`      |
| `yarn build`        | Build production site to `./dist/`               |
| `yarn stage`        | Build staging site to `./dist-stage/`            |
| `yarn deploy-stage` | Deploy staging build to Surge                    |
| `yarn preview`      | Preview production build locally                 |
| `yarn astro ...`    | Run CLI commands like `astro add`, `astro check` |

## 📝 Documentation Sections

The documentation is organized into several main sections:

- **Getting Started**: Introduction to Sentrie, installation, and writing your first policy
- **Structure of a Policy Pack**: Understanding how policy packs are organized
- **Running Sentrie**: How to execute and serve policies
- **Language Reference**: Complete reference for the Sentrie language
- **TypeScript Modules**: Documentation for available TypeScript modules
- **CLI Reference**: Command-line interface documentation

## 🔗 Links

- **Live Site**: [sentrie.sh](https://sentrie.sh)
- **GitHub Repository**: [sentrie-sh/sentrie](https://github.com/sentrie-sh/sentrie)
- **Starlight Docs**: [starlight.astro.build](https://starlight.astro.build)
- **Astro Docs**: [docs.astro.build](https://docs.astro.build)
