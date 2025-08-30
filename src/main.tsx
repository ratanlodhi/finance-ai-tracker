import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Loader2 } from 'lucide-react';

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Unable to render the application.');
}

// Create a loading component similar to patterns used elsewhere in the project
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Loading FinanceAI...</p>
    </div>
  </div>
);

// Create root and render with loading fallback
const root = createRoot(rootElement);

// Render the app with a suspense boundary for better UX
root.render(
  <App />
);
