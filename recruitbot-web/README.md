# RecruitBot Web - AI-Powered Resume Search

Modern, responsive web application for searching and discovering candidates using semantic search, keyword matching, and hybrid ranking.

## 🚀 Features

### Search Capabilities
- **Vector Search**: Semantic similarity-based candidate matching
- **BM25 Search**: Traditional keyword-based search with TF-IDF scoring
- **Hybrid Search**: Combine vector and BM25 with adjustable weights (50/50, 70/30, 30/70)

### User Interface
- **Chat-style Interface**: Conversational search experience
- **Real-time Results**: Live result cards with ranking and scores
- **Candidate Profiles**: Detailed modal with contact, skills, experience, education
- **Responsive Design**: Mobile-first, works on all devices
- **Dark Theme**: Modern dark UI with indigo-pink gradient accents

### Technical Features
- ⚡ **Fast**: Vite build tool with HMR
- 🎨 **Styled**: TailwindCSS utility-first styling
- 🔒 **Type-safe**: Full TypeScript coverage
- ♿ **Accessible**: WCAG 2.1 AA compliant
- 📱 **Mobile-ready**: Touch-optimized, responsive layout

## 📦 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5.x
- **Styling**: TailwindCSS 3.x
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:3000

### Installation

```bash
# Clone repository
git clone <repository-url>
cd recruitbot-web

# Install dependencies
npm install

# Create environment file
cp .env.development .env

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

### Environment Variables

Create `.env.development` file:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=RecruitBot
```

For production, create `.env.production`:

```env
VITE_API_BASE_URL=https://your-backend-api.com
VITE_APP_NAME=RecruitBot
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── candidate/     # Candidate profile modal components
│   ├── chat/          # Chat interface (messages, input)
│   ├── common/        # Reusable UI components
│   ├── layout/        # App shell, sidebar, mobile drawer
│   ├── results/       # Search result cards and list
│   └── sidebar/       # Search controls and settings
├── lib/
│   ├── api/           # API client and endpoints
│   ├── stores/        # Zustand state management
│   └── utils/         # Helper functions
├── pages/             # Route pages
├── types/             # TypeScript type definitions
├── hooks/             # Custom React hooks
└── App.tsx            # Root component with routing
```

## 🎯 Usage

### Basic Search

1. Type your query in the chat input
2. Press Enter to search
3. View ranked results in the right panel (desktop)
4. Click any result card to view full candidate profile

### Search Modes

**Vector Search** (Default)
- Semantic similarity matching
- Best for natural language queries
- Example: "Python developer with ML experience"

**BM25 Search**
- Keyword-based matching
- Best for exact skill matching
- Example: "Java AWS Docker"

**Hybrid Search**
- Combines vector and BM25
- Adjust weights with sliders (BM25 / Vector)
- Use presets: 50/50, 70/30, 30/70

### Suggestion Chips

Click any suggestion to auto-search:
- 🔍 Selenium QA 3 yrs
- 🐍 Python ML dev
- ☁️ Java AWS backend
- ⚡ Lead QA Cypress

### Adjust Results

- Change "Top K" limit: 3, 5, 10, or 20 results
- Clear chat to start fresh

## 🔌 API Endpoints

The frontend consumes these backend endpoints:

### Search
```http
POST /v1/search
Content-Type: application/json

{
  "query": "Python developer",
  "searchType": "vector",  # or "keyword" or "hybrid"
  "topK": 5,
  "vectorWeight": 0.7,     # hybrid only
  "bm25Weight": 0.3        # hybrid only
}
```

### Get Candidate Profile
```http
GET /v1/search/resumes/:id
```

### List Resumes
```http
GET /v1/search/resumes?limit=50
```

## 🧪 Development

### Run Dev Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Type Check

```bash
npm run type-check
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (drawer sidebar, full-width chat)
- **Tablet**: 768px - 1023px (fixed sidebar, full-width chat)
- **Desktop**: ≥ 1024px (sidebar + split chat/results)

## 🎨 Design Tokens

```javascript
colors: {
  primary: '#6366f1',       // Indigo
  accent: '#ec4899',        // Pink
  'bg-base': '#0f0f13',     // Dark background
  'bg-surface': '#18181f',  // Surface cards
  'bg-card': '#1e1e28',     // Card backgrounds
}
```

## ⌨️ Keyboard Shortcuts

- **Enter**: Submit search query
- **Shift+Enter**: New line in input
- **Escape**: Close candidate modal

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Build & Host Anywhere

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🐛 Troubleshooting

### Port 5173 already in use
```bash
# Kill existing process or change port in vite.config.ts
```

### API CORS errors
- Backend must allow origin http://localhost:5173
- Check backend CORS configuration

### Results not displaying
- Verify backend is running on port 3000
- Check browser console for errors
- Ensure MongoDB is connected (backend)

### Modal not opening
- Check browser console for API errors
- Verify `/v1/search/resumes/:id` endpoint works

## 📄 License

MIT

## 👥 Contributors

- [Your Name]

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components inspired by [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Need help?** Open an issue or contact [your-email@example.com]
