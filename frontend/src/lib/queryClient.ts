import { QueryClient } from '@tanstack/react-query';

// Module-level singleton so both App.tsx (provider) and AuthContext.tsx (consumer)
// share the same QueryClient instance. Using a module export avoids circular
// dependency and prop-drilling issues.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
