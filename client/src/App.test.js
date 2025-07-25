import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

// Mock the context providers for testing
jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    loading: false
  })
}));

jest.mock('./context/SocketContext', () => ({
  SocketProvider: ({ children }) => children
}));

jest.mock('./context/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children
}));

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderWithProviders = (ui) => {
  const testQueryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('App Component', () => {
  test('renders without crashing', () => {
    renderWithProviders(<App />);
  });

  test('renders home page by default', () => {
    renderWithProviders(<App />);
    // This would depend on your Home component content
    // expect(screen.getByText(/welcome to taskflow/i)).toBeInTheDocument();
  });
});
