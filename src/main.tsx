import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import Cookies from 'js-cookie';

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
      onError: (error: any) => {
        // Handle 401 errors globally in React Query
        if (error?.statusCode === 401) {
          Cookies.remove("token");
          if (window.location.pathname !== "/login" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      },
    },
    mutations: {
      onError: (error: any) => {
        // Handle 401 errors globally in React Query mutations
        if (error?.statusCode === 401) {
          Cookies.remove("token");
          if (window.location.pathname !== "/login" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
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
