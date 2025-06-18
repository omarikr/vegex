import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInterface from './ChatInterface';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    signOut: jest.fn(),
  }),
}));

// Mock supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { id: 'test-chat-id'}, error: null }),
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: { response: 'AI response' }, error: null }),
    },
  },
}));

// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));


describe('ChatInterface', () => {
  it('renders the welcome message correctly', async () => {
    const mockUser = { email: 'test@example.com' };
    const mockSignOut = jest.fn();

    await act(async () => {
      render(<ChatInterface user={mockUser} onSignOut={mockSignOut} />);
    });

    // Check for the welcome message
    // Use waitFor to ensure async operations (like loadChats) complete
    await waitFor(() => {
      const welcomeMessage = screen.getByText(
        `Welcome, ${mockUser.email} From AI assistant to Vegex.ie`
      );
      expect(welcomeMessage).toBeInTheDocument();
    });
  });
});
