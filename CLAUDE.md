# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Taiwan Stock Market Information System that provides real-time stock data from both TWSE (Taiwan Stock Exchange) and TPEx (Taipei Exchange) markets.

### Key Features
- **Unified Stock Search**: Search across both TWSE (上市) and TPEx (上櫃) stocks
- **Manual Search Mode**: Search-first UX pattern with manual trigger (button/Enter key)
- **Performance Optimized**: Context/API caching, selective memoization, efficient filtering
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Real-time Data**: Direct API integration with Taiwan stock exchanges

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
- **State Management**: React Context API with optimized providers
- **Performance**: Selective React.memo, useCallback, useMemo

### Directory Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components (Button, Input, etc.)
│   ├── SearchBar.tsx    # Search input with manual trigger
│   ├── StockList.tsx    # Optimized stock display component
│   ├── LoadingState.tsx # Loading states (default/inline)
│   └── ErrorBoundary.tsx # Error handling component
├── contexts/
│   └── StockContext.tsx # Unified stock data management
├── hooks/
│   └── useOptimizedSearch.ts # Search optimization with caching
├── lib/
│   ├── api.ts           # API layer for TWSE/TPEx integration
│   ├── simpleCache.ts   # Simple caching implementation
│   └── utils.ts         # Utility functions (cn for className merging)
├── types/
│   └── stock.ts         # TypeScript interfaces for stock data
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles and Tailwind directives
```

### API Integration

#### Data Sources
- **TWSE API**: `/api/twse/exchangeReport/STOCK_DAY_ALL` (上市股票)
- **TPEx API**: `/api/tpex/tpex_mainboard_daily_close_quotes` (上櫃股票)

#### Proxy Configuration
```typescript
// vite.config.ts
'/api/twse': {
  target: 'https://www.twse.com.tw',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/twse/, ''),
},
'/api/tpex': {
  target: 'https://www.tpex.org.tw/openapi/v1',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/tpex/, ''),
}
```

#### Data Flow
1. **Parallel API Calls**: Both TWSE and TPEx APIs called simultaneously
2. **Data Transformation**: Raw API responses transformed to unified `Stock` interface
3. **Error Resilience**: If one API fails, system continues with available data
4. **Caching Layer**: Results cached to improve performance and reduce API calls

### Performance Optimizations

#### React Optimizations
- **Selective memoization**: `StockItem` memoized; other UI components avoid premature memo
- **Stable callbacks**: Event handlers wrapped with `useCallback`
- **Derived values**: Use `useMemo` for lightweight computed stats

#### Search Optimizations
- **Manual Trigger**: Search only executes on button click or Enter key
- **Efficient Filtering**: Uses for-loop instead of array methods for better performance
- **Result Limiting**: Maximum 100 results to prevent UI lag
- **Priority Matching**: Exact matches > starts with > contains

#### Context Optimizations
- **Unified loader**: Single `loadStocks` path (cache-first, then API) used by fetch/refresh/ensure
- **Memoized Context Value**: Prevents unnecessary provider re-renders
- **Stable Function References**: All context functions use `useCallback`

### TypeScript Architecture

#### Core Interfaces
```typescript
// Unified stock interface
interface Stock {
  date: string
  code: string
  name: string
  closingPrice: string
  change: string
  openingPrice: string
  highestPrice: string
  lowestPrice: string
  tradeVolume: string
  tradeValue: string
  transaction: string
  source: 'twse' | 'tpex'
}

// Internal API response types
interface TwseApiResponse { /* TWSE specific fields */ }
interface TpexApiResponse { /* TPEx specific fields */ }
```

### Component Patterns

#### Search-First UX Pattern
- **Initial State**: Shows search prompt, no data displayed
- **Search Trigger**: Manual activation via button or Enter key
- **Loading States**: Inline loading indicators during search
- **Result Display**: Shows filtered results with clear statistics
- **Error Handling**: Graceful degradation with retry options

#### Performance-First Design
- **Minimal Re-renders**: Aggressive use of React optimization patterns
- **Efficient State Updates**: Batched updates and stable references
- **Smart Caching**: Multiple caching layers (search, API, context)
- **Responsive Loading**: Non-blocking UI updates with setTimeout

### Key Configurations
- **Path Aliases**: `@/*` maps to `./src/*` (configured in both tsconfig.json and vite.config.ts)
- **shadcn/ui**: Configured with "new-york" style, CSS variables enabled, neutral base color
- **TypeScript**: Project references pattern with separate configs for app and node
- **ESLint**: Modern flat config with React hooks and refresh plugins

### Development Patterns
- **Functional Components**: All components use function syntax with TypeScript
- **Import Aliases**: Consistent use of `@/` prefix for clean import paths
- **Composition Pattern**: Leverages Radix Slot pattern for component composition
- **Type Safety**: Strict TypeScript with proper interface definitions
- **Performance First**: Every component and hook optimized for minimal re-renders
- **Error Boundaries**: Comprehensive error handling at component and API levels