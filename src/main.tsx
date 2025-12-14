import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

// Configure QueryClient with global error handling for 401
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401 errors
        if (error?.statusCode === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>

      <App />
    </QueryClientProvider>

  </StrictMode>,
)
