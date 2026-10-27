# Phase 10 - Retrieval UI Setup Implementation

## Overview

Phase 10 establishes the **infrastructure foundation** for the search/retrieval interface. This is the setup phase that configures all necessary tools, stores, types, and utilities that subsequent phases will build upon.

**Think of this as**: Laying the foundation before building the house.

---

## What Was Built

### Complete Infrastructure Stack

```
Configuration Layer
├── Vite (dev server + build)
├── TailwindCSS (styling)
├── TypeScript (type safety)
└── Environment variables

Type System Layer
├── SearchMode, SearchRequest, SearchResponse
├── CandidateProfile, Experience, Education
└── Message, ChatState

State Management Layer (Zustand)
├── search.store (mode, weights, results)
├── chat.store (messages)
└── ui.store (modals, drawer)

API Layer
├── search.api (searchResumes, getCandidateById)
└── API proxy configuration

Utility Layer
└── formatters (score, date, duration, text)

Component Layer
├── Layout (AppShell)
├── Common (BrandAvatar, LoadingDots, EmptyState)
└── Pages (SearchPage, IngestionPage placeholders)

Application Layer
├── Routing (React Router)
└── Global providers (Toaster)
```

---

## Architecture Decisions

### 1. Zustand for State Management

**Why Zustand?**
- Lightweight (3KB vs Redux 45KB)
- No boilerplate (no actions, reducers)
- TypeScript-first
- React hooks API
- Easy to test

**Alternative Considered**: Redux Toolkit
**Reason Chosen**: Simpler for this application size

### 2. TailwindCSS for Styling

**Why Tailwind?**
- Utility-first (rapid development)
- Consistent design system
- Tree-shaking (small bundle)
- Dark mode support built-in
- No CSS naming conflicts

**Alternative Considered**: Emotion/styled-components
**Reason Chosen**: Better performance, smaller bundle

### 3. Vite for Build Tool

**Why Vite?**
- Fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ESM support
- Built-in TypeScript support
- Simple configuration

**Alternative Considered**: Create React App
**Reason Chosen**: Much faster dev experience

---

## File Structure Explained

### Types (`src/types/`)

**search.types.ts**
```typescript
export type SearchMode = 'vector' | 'bm25' | 'hybrid';

export interface SearchRequest {
  query: string;
  searchType: 'vector' | 'keyword' | 'hybrid'; // Backend API format
  topK: number;
  bm25Weight?: number;
  vectorWeight?: number;
}

export interface SearchResult {
  candidateId: string;
  name: string;
  email?: string;
  score: number;
  experienceYears?: number;
  content: string; // Resume snippet
}
```

**Why separate types?**
- Single source of truth
- Reusable across components
- Type safety at compile time
- Easy to maintain

---

### Stores (`src/lib/stores/`)

**search.store.ts** - Search state
```typescript
interface SearchStore {
  searchMode: SearchMode;        // 'vector' | 'bm25' | 'hybrid'
  bm25Weight: number;            // 0-100
  vectorWeight: number;          // 0-100
  topK: number;                  // Number of results
  results: SearchResult[];       // Search results
  isSearching: boolean;          // Loading state
  lastSearchQuery: string;       // Last query
  lastSearchDuration: number;    // Search duration (ms)
  error: string | null;          // Error message
  
  // Actions
  setSearchMode: (mode) => void;
  setWeights: (bm25, vector) => void;
  setTopK: (k) => void;
  setResults: (results, query, duration) => void;
  setSearching: (isSearching) => void;
  setError: (error) => void;
  clearResults: () => void;
}
```

**chat.store.ts** - Chat messages
```typescript
interface ChatStore {
  messages: Message[];           // All messages
  isProcessing: boolean;         // Loading state
  
  addUserMessage: (text) => void;
  addBotMessage: (content: ReactNode) => void;
  setProcessing: (isProcessing) => void;
  clearMessages: () => void;
}
```

**ui.store.ts** - UI state
```typescript
interface UIStore {
  isCandidateModalOpen: boolean;
  selectedCandidateId: string | null;
  isMobileDrawerOpen: boolean;
  
  openCandidateModal: (id) => void;
  closeCandidateModal: () => void;
  toggleMobileDrawer: () => void;
  closeMobileDrawer: () => void;
}
```

---

### API Client (`src/lib/api/`)

**search.api.ts**
```typescript
export const searchApi = {
  // Main search endpoint
  async searchResumes(params: SearchRequest): Promise<SearchResponse> {
    const response = await apiClient.post('/v1/search', params);
    return response.data;
  },

  // Get full candidate profile
  async getCandidateById(id: string): Promise<CandidateProfile> {
    const response = await apiClient.get(`/v1/search/resumes/${id}`);
    return response.data;
  },

  // List all candidates (admin/testing)
  async listResumes(limit: number = 50): Promise<CandidateProfile[]> {
    const response = await apiClient.get(`/v1/search/resumes`, {
      params: { limit },
    });
    return response.data;
  },

  // Check if system is ready
  async checkReadiness(): Promise<{ ready: boolean; resumeCount: number }> {
    const response = await apiClient.get('/v1/search/readiness');
    return response.data;
  },
};
```

**Why separate API file?**
- Centralizes all API calls
- Easy to mock for testing
- Type-safe responses
- Single place to add interceptors

---

### Formatters (`src/lib/utils/`)

**formatters.ts**
```typescript
// Score formatting
formatScore(0.87, 'vector')  → "87%"
formatScore(12.5, 'bm25')    → "12.50"

// Duration formatting
formatDuration(234)   → "234ms"
formatDuration(2341)  → "2.34s"

// Date formatting
formatDate(new Date()) → "Sep 17, 2026"
formatTime(new Date()) → "14:30"
formatRelativeTime(date) → "2 hours ago"

// Text utilities
truncateText("Long text...", 50) → "Long text... (truncated)"

// Theme helpers
getScoreColorClass('vector') → "text-score-vector bg-score-vector/10"
getSearchModeLabel('hybrid') → "Hybrid Search"
```

**Why formatters?**
- Consistent display across app
- Reusable logic
- Easy to test
- Localization-ready

---

## Configuration Details

### Vite Configuration

**vite.config.ts**
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Import shortcuts
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/v1': {
        target: 'http://localhost:3000',    // Backend API
        changeOrigin: true,
      },
    },
  },
});
```

**What this does:**
1. **Path alias**: Use `@/` instead of `../../../`
2. **API proxy**: Avoid CORS in development
3. **Port**: Runs on 5173

---

### TailwindCSS Configuration

**tailwind.config.js**
```javascript
theme: {
  extend: {
    colors: {
      // Brand
      primary: '#6366f1',      // Indigo
      accent: '#ec4899',       // Pink
      
      // Backgrounds
      'bg-base': '#0f0f13',    // Darkest
      'bg-surface': '#18181f', // Dark
      'bg-card': '#1e1e28',    // Card
      
      // Text
      'text-primary': '#f1f1f5',
      'text-muted': '#8b8ba0',
      
      // Search modes
      'score-vector': '#818cf8',
      'score-bm25': '#f472b6',
      'score-hybrid': '#34d399',
    },
    animation: {
      'status-pulse': 'status-pulse 2s ease-in-out infinite',
      'dot-bounce': 'dot-bounce 0.6s ease-in-out infinite',
    },
  },
}
```

**Color System:**
- Dark theme optimized for long sessions
- High contrast for readability
- Color-coded search modes
- Accessible (WCAG AA)

---

## Component Architecture

### AppShell Layout

```
┌─────────────────────────────────────┐
│  AppShell (flex h-screen)           │
│  ┌────────┬────────────────────────┐│
│  │Sidebar │  Main Content          ││
│  │260px   │  flex-1                ││
│  │        │                        ││
│  │        │                        ││
│  │        │                        ││
│  └────────┴────────────────────────┘│
└─────────────────────────────────────┘
```

**Why this layout?**
- Responsive (will collapse on mobile)
- Fixed sidebar width (easy to navigate)
- Flexible main area (adapts to content)
- Full height (no scrolling on shell)

---

### BrandAvatar Component

```
┌──────────────────┐
│  ┌────┐          │
│  │ R  │ RecruitBot │
│  │🟢  │ Online    │
│  └────┘          │
└──────────────────┘
```

**Features:**
- SVG gradient logo (indigo → pink)
- Pulsing status dot (shows "online")
- Brand name
- Reusable across app

---

## State Flow Example

### Search Flow
```
User types query
    ↓
setSearching(true)
    ↓
API call: searchApi.searchResumes()
    ↓
setResults(results, query, duration)
    ↓
setSearching(false)
    ↓
UI updates with results
```

### Chat Flow
```
User submits query
    ↓
addUserMessage(text)
    ↓
UI shows user bubble
    ↓
setProcessing(true)
    ↓
Perform search
    ↓
addBotMessage(<ResultsList>)
    ↓
setProcessing(false)
    ↓
UI shows bot bubble with results
```

---

## TypeScript Benefits

### Type Safety Example

**Before (JavaScript):**
```javascript
// Easy to make mistakes
const result = results[0];
console.log(result.namee); // Typo! Runtime error
console.log(result.score.toFixed(2)); // What if score is undefined?
```

**After (TypeScript):**
```typescript
const result: SearchResult = results[0];
console.log(result.namee); // ❌ Compile error: Property 'namee' does not exist
console.log(result.score.toFixed(2)); // ✅ Type-safe, score is number
```

### Auto-completion

IDE knows all properties:
- `result.` → shows: candidateId, name, email, score, etc.
- `useSearchStore().` → shows: searchMode, setSearchMode, etc.

---

## Environment Variables

### Development
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=RecruitBot
VITE_ENABLE_MOCK=false
```

### Production
```env
VITE_API_BASE_URL=https://api.recruitbot.com
VITE_APP_NAME=RecruitBot
VITE_ENABLE_MOCK=false
```

**Access in code:**
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

**Why `VITE_` prefix?**
- Only variables with `VITE_` are exposed to client
- Prevents accidental exposure of secrets

---

## Routing Setup

### Routes Configured

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Redirect | → `/search` |
| `/search` | SearchPage | Search interface (Phase 11-15) |
| `/upload` | IngestionPage | Resume upload (Phase 1-9) |
| `*` | Redirect | → `/search` (404 handler) |

**Why React Router?**
- Client-side routing (fast)
- Declarative routes
- Nested routes support
- TypeScript integration

---

## Testing Strategy

### Unit Tests (Future)

**Example: formatScore**
```typescript
describe('formatScore', () => {
  it('formats vector scores as percentage', () => {
    expect(formatScore(0.87, 'vector')).toBe('87%');
  });
  
  it('formats BM25 scores as decimal', () => {
    expect(formatScore(12.5, 'bm25')).toBe('12.50');
  });
});
```

**Example: search.store**
```typescript
describe('searchStore', () => {
  it('updates search mode', () => {
    useSearchStore.getState().setSearchMode('hybrid');
    expect(useSearchStore.getState().searchMode).toBe('hybrid');
  });
});
```

---

## Performance Considerations

### Bundle Size Targets

| Metric | Target | Notes |
|--------|--------|-------|
| **Initial JS** | <250 KB | Gzipped |
| **Initial CSS** | <50 KB | Gzipped |
| **First Load** | <3s | On 3G |
| **Time to Interactive** | <5s | On 3G |

**Optimizations:**
- Code splitting (React.lazy)
- Tree shaking (Vite + Rollup)
- Image optimization
- Font subsetting

---

## Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text on background: 7:1 (AAA)
- Interactive elements: 4.5:1 (AA)

**Keyboard Navigation:**
- All interactive elements focusable
- Focus indicators visible
- Logical tab order

**Screen Readers:**
- Semantic HTML
- ARIA labels where needed
- Alt text for images

---

## Known Limitations

1. **Placeholders Only** - SearchPage and IngestionPage are placeholders
2. **No Search Functionality** - Will be added in Phase 12-13
3. **No Sidebar UI** - Will be built in Phase 11
4. **No Modal** - Will be added in Phase 14
5. **No Mobile Optimization** - Will be added alongside components

These are **expected** for Phase 10.

---

## Next Phase Preview

**Phase 11: Sidebar Module**

Will implement:
- Search mode selector buttons (Vector/BM25/Hybrid)
- Hybrid weight sliders with live preview
- Weight preset buttons (50/50, 70/30, 30/70)
- Results limit dropdown (3, 5, 10, 20)
- Clear chat button
- Mobile responsive drawer

---

## Troubleshooting

### Common Issues

**Issue: Module not found '@/...'**
```bash
# Restart dev server
npm run dev
```

**Issue: Tailwind styles not working**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**Issue: API calls fail with CORS**
```bash
# Ensure backend is running
cd c:\Users\FaithNhlamuloKubayi\Pictures\resume_rag
npm run dev
```

**Issue: Type errors**
```bash
# Check for errors
npx tsc --noEmit
```

---

## Files Created Summary

**Total: 24 files (~1,200 lines of code)**

### Configuration (6 files)
1. vite.config.ts - Vite setup
2. tailwind.config.js - Tailwind theme
3. postcss.config.js - PostCSS
4. .env.development - Dev env vars
5. .env.production - Prod env vars
6. index.html - HTML entry

### Types (3 files)
1. search.types.ts - Search types
2. candidate.types.ts - Candidate types
3. chat.types.ts - Chat types

### Stores (3 files)
1. search.store.ts - Search state
2. chat.store.ts - Chat state
3. ui.store.ts - UI state

### API & Utils (2 files)
1. search.api.ts - API client
2. formatters.ts - Utilities

### Components (5 files)
1. AppShell.tsx - Layout
2. BrandAvatar.tsx - Logo
3. LoadingDots.tsx - Animation
4. EmptyState.tsx - Placeholder
5. SearchPage.tsx - Page

### App Setup (3 files)
1. App.tsx - Router
2. main.tsx - Entry
3. index.css - Styles

### Pages (2 files)
1. SearchPage.tsx - Search
2. IngestionPage.tsx - Upload

---

## Acceptance Criteria

Phase 10 is **complete** when:

✅ Dev server starts without errors  
✅ Dark theme applied correctly  
✅ Brand avatar shows with gradient  
✅ Routing works (/, /search, /upload)  
✅ Zustand stores functional  
✅ API proxy works  
✅ TypeScript builds without errors  
✅ Toast notifications work  
✅ No console errors  

---

**Phase 10 Status**: ✅ **IMPLEMENTATION COMPLETE** - Ready for Testing

**Next**: Phase 11 - Sidebar Module
