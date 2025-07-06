// Vitest setup
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import { SearchBar } from '../SearchBar';
import { useStore } from '../../store/useStore';

// Mock the useStore hook
vi.mock('../../store/useStore', () => ({
  useStore: vi.fn()
}));

describe('SearchBar', () => {
  let mockSetSearchTerm;
  
  beforeEach(() => {
    // Reset mocks between tests
    mockSetSearchTerm = vi.fn();
    
    // Create a mock implementation that only returns what the SearchBar component needs
    vi.mocked(useStore).mockImplementation((selector) => {
      // This is a simplified mock that only returns what SearchBar needs
      return {
        searchTerm: '',
        setSearchTerm: mockSetSearchTerm
      };
    });
  });
  
  it('renders search input correctly', () => {
    render(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText('Search templates...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });
    it('calls setSearchTerm when input changes', () => {
    render(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(mockSetSearchTerm).toHaveBeenCalledWith('test search');
  });
  
  it('does not show clear button when search term is empty', () => {
    render(<SearchBar />);
    
    const clearButton = screen.queryByRole('button');
    expect(clearButton).not.toBeInTheDocument();
  });    it('shows clear button when search term is not empty', () => {
    // Override the mock for this specific test
    vi.mocked(useStore).mockImplementation(() => {
      return {
        searchTerm: 'existing search',
        setSearchTerm: mockSetSearchTerm
      };
    });
    
    render(<SearchBar />);
    
    const clearButton = screen.getByTestId('clear-search-button');
    expect(clearButton).toBeInTheDocument();
  });    it('clears search term when clear button is clicked', () => {
    // Override the mock for this specific test
    vi.mocked(useStore).mockImplementation(() => {
      return {
        searchTerm: 'existing search',
        setSearchTerm: mockSetSearchTerm
      };
    });
    
    render(<SearchBar />);
    
    const clearButton = screen.getByTestId('clear-search-button');
    fireEvent.click(clearButton);
    
    expect(mockSetSearchTerm).toHaveBeenCalledWith('');
  });
});
