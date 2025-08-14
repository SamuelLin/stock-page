# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (runs TypeScript compilation first, then Vite build)
- `pnpm lint` - Run ESLint to check code quality
- `pnpm preview` - Preview production build locally

### Package Management
- Uses `pnpm` as package manager (not npm or yarn)
- Dependencies locked with `pnpm-lock.yaml`

## Project Architecture

### Tech Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite with React plugin
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: shadcn/ui with Radix UI primitives
- **Component Variants**: class-variance-authority (cva)
- **Icons**: Lucide React
- **Linting**: ESLint with TypeScript and React plugins

### Directory Structure
```
src/
├── components/
│   └── ui/           # shadcn/ui components (Button, etc.)
├── lib/
│   └── utils.ts      # Utility functions (cn for className merging)
├── assets/           # Static assets
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles and Tailwind directives
```

### Key Configurations
- **Path Aliases**: `@/*` maps to `./src/*` (configured in both tsconfig.json and vite.config.ts)
- **shadcn/ui**: Configured with "new-york" style, CSS variables enabled, neutral base color
- **TypeScript**: Project references pattern with separate configs for app and node
- **ESLint**: Modern flat config with React hooks and refresh plugins

### Component Architecture
- Uses shadcn/ui design system with consistent component patterns
- Components use `cn()` utility for className merging (clsx + tailwind-merge)
- Button component demonstrates the pattern: cva for variants, Radix Slot for composition
- TypeScript interfaces follow React.ComponentProps pattern for extensibility

### Styling Approach
- Tailwind CSS v4 with CSS variables for theming
- Components use cva for consistent variant-based styling
- Focus on accessibility with proper focus-visible states and ARIA support
- Dark mode ready with CSS variable-based color system

### Development Patterns
- Functional components with TypeScript
- Import aliases (@/ prefix) for clean import paths
- Composition over inheritance (Radix Slot pattern)
- Props destructuring with TypeScript interface extensions