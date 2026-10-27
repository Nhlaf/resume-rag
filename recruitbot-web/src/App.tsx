/**
 * Phase 10: App Component
 * Root application with routing and global providers
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SearchPage } from './pages/SearchPage';
import { IngestionPage } from './pages/IngestionPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* Toast notifications */}
        <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e1e28',
            color: '#f1f1f5',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#34d399',
              secondary: '#1e1e28',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e1e28',
            },
          },
        }}
      />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/upload" element={<IngestionPage />} />
        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
