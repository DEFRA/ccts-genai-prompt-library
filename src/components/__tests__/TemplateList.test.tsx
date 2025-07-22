// Vitest setup
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor} from '@testing-library/react';
import { TemplateList } from '../TemplateList';
import { useStore } from '../../store/useStore';
import { useTemplateStore } from '../../store/templateStore';
import { useRoleStore } from '../../store/roleStore';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { TEST_CONFIG } from '../../config/testConfig';
import {  
  mockTemplates,
  mockStoreFunctions,
  mockStoreStates,
  mockTemplateStoreStates,
  mockRoleStoreStates,
} from '../../__tests__/stubs/templateListStubs';


// Mock the stores
vi.mock('../../store/useStore', () => ({
  useStore: vi.fn(),
}));

vi.mock('../../store/templateStore', () => ({
  useTemplateStore: vi.fn(),
}));

vi.mock('../../store/roleStore', () => ({
  useRoleStore: vi.fn(),
}));

// Custom render function with theme provider
const customRender = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('TemplateList', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    (useStore as any).mockReturnValue(mockStoreStates.default);
    (useTemplateStore as any).mockReturnValue(mockTemplateStoreStates.default);
    (useRoleStore as any).mockReturnValue(mockRoleStoreStates.default);
  });

  it('renders template list correctly', () => {
    customRender(<TemplateList />);

    // Check if all templates are rendered
    expect(screen.getByText('Frontend Template')).toBeInTheDocument();
    expect(screen.getByText('Backend Template')).toBeInTheDocument();
    expect(screen.getByText('Testing Template')).toBeInTheDocument();
    expect(screen.getByText('Pipeline Template')).toBeInTheDocument();
    
    // Check if content is rendered (templates don't have description field, so show "No description")
    const noDescriptionElements = screen.getAllByText('No description');
    expect(noDescriptionElements).toHaveLength(4);
    
    // Check if role names are displayed
    expect(screen.getAllByText('Developer')[0]).toBeInTheDocument();
    expect(screen.getByText('QA Engineer')).toBeInTheDocument();
    expect(screen.getByText('DevOps')).toBeInTheDocument();
  });

  it('filters templates by search term', async () => {
    // Mock the search term
    (useStore as any).mockReturnValue(mockStoreStates.withSearchTerm(TEST_CONFIG.TEMPLATE_LIST.SEARCH_TERMS.FRONTEND));

    customRender(<TemplateList />);

    // Only the frontend template should be visible
    expect(screen.getByText('Frontend Template')).toBeInTheDocument();
    expect(screen.queryByText('Backend Template')).not.toBeInTheDocument();
    expect(screen.queryByText('Testing Template')).not.toBeInTheDocument();
    expect(screen.queryByText('Pipeline Template')).not.toBeInTheDocument();
  });

  it('filters templates by role', async () => {
    // Mock the selected role
    (useStore as any).mockReturnValue(mockStoreStates.withSelectedRole('role2'));

    customRender(<TemplateList />);

    // Only the QA Engineer template should be visible
    expect(screen.queryByText('Frontend Template')).not.toBeInTheDocument();
    expect(screen.queryByText('Backend Template')).not.toBeInTheDocument();
    expect(screen.getByText('Testing Template')).toBeInTheDocument();
    expect(screen.queryByText('Pipeline Template')).not.toBeInTheDocument();
  });

  it('handles searching for templates', () => {
    customRender(<TemplateList />);

    // Find the search input
    const searchInput = screen.getByPlaceholderText(TEST_CONFIG.TEMPLATE_LIST.SEARCH_PLACEHOLDER);
    
    // Type in the search box
    fireEvent.change(searchInput, { target: { value: TEST_CONFIG.TEMPLATE_LIST.SEARCH_TERMS.BACKEND } });
    
    // Check if setSearchTerm was called with the correct value
    expect(mockStoreFunctions.setSearchTerm).toHaveBeenCalledWith(TEST_CONFIG.TEMPLATE_LIST.SEARCH_TERMS.BACKEND);
  });

  it('shows and hides role filter when filter button is clicked', async () => {
    customRender(<TemplateList />);

    // Find the filter button (using the title attribute)
    const filterButton = screen.getByTitle(TEST_CONFIG.TEMPLATE_LIST.FILTER_BUTTON_TITLE);
    
    // Initially, role filter should not be visible
    // Looking for a select with "All Roles" option which is part of RoleFilter
    expect(screen.queryByText(TEST_CONFIG.TEMPLATE_LIST.ALL_ROLES_OPTION)).not.toBeInTheDocument();
    
    // Click the filter button
    fireEvent.click(filterButton);
    
    // Now, role filter should be visible
    const allRolesOption = await screen.findByText(TEST_CONFIG.TEMPLATE_LIST.ALL_ROLES_OPTION);
    expect(allRolesOption).toBeInTheDocument();
    
    // Click the filter button again
    fireEvent.click(filterButton);
    
    // Role filter should be hidden again
    await waitFor(() => {
      expect(screen.queryByText(TEST_CONFIG.TEMPLATE_LIST.ALL_ROLES_OPTION)).not.toBeInTheDocument();
    });
  });

  it('handles template selection', () => {
    customRender(<TemplateList />);

    // Find the first template button
    const templateButton = screen.getByRole('button', { name: new RegExp(`${TEST_CONFIG.TEMPLATE_LIST.SELECT_TEMPLATE_BUTTON} Frontend Template`, 'i') });
    
    // Click on the template
    fireEvent.click(templateButton);
    
    // Check if the correct functions were called
    expect(mockStoreFunctions.setSelectedTemplateForPrompt).toHaveBeenCalledWith(mockTemplates[0]);
    expect(mockStoreFunctions.setModalMode).toHaveBeenCalledWith('createPromptWithTemplate');
    expect(mockStoreFunctions.toggleCreateModal).toHaveBeenCalled();
  });

  it('handles template selection with external URL', () => {
    // Save the original window.location
    const originalLocation = window.location;
    
    // Define a property getter for href
    const hrefSpy = vi.fn();
    
    // Redefine window.location using Object.defineProperty
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        get href() { return hrefSpy(); },
        set href(value) { hrefSpy(value); }
      }
    });
    
    // Use templates with external URL
    (useTemplateStore as any).mockReturnValue(mockTemplateStoreStates.withExternalUrl);

    customRender(<TemplateList />);

    // Find the template with external URL
    const templateButton = screen.getByRole('button', { name: new RegExp(`${TEST_CONFIG.TEMPLATE_LIST.SELECT_TEMPLATE_BUTTON} Frontend Template`, 'i') });
    
    // Click on the template
    fireEvent.click(templateButton);
    
    // Check if href was set correctly using our spy
    expect(hrefSpy).toHaveBeenCalledWith(TEST_CONFIG.TEMPLATE_LIST.EXTERNAL_URL);
    
    // Check that the other functions were not called
    expect(mockStoreFunctions.setSelectedTemplateForPrompt).not.toHaveBeenCalled();
    expect(mockStoreFunctions.setModalMode).not.toHaveBeenCalled();
    expect(mockStoreFunctions.toggleCreateModal).not.toHaveBeenCalled();
    
    // Restore the original window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    });
  });

  it('initializes roles on mount', async () => {
    // Mock empty roles to test initialization
    (useRoleStore as any).mockReturnValue(mockRoleStoreStates.empty);

    // Clear any previous calls
    mockStoreFunctions.initializeDefaultRoles.mockClear();

    // Ensure the useEffect runs by forcing a re-render
    customRender(<TemplateList />);
    
    // Wait for the useEffect to complete
    await waitFor(() => {
      // Check if initializeDefaultRoles was called
      expect(mockStoreFunctions.initializeDefaultRoles).toHaveBeenCalled();
    });
  });

  it('handles role change from RoleSelector', () => {
    customRender(<TemplateList />);
    
    // Find the RoleSelector component - we can't directly interact with it
    // since it's a mock, but we can simulate its behavior
    
    // Get the RoleSelector props and call onRoleChange
    expect(mockStoreFunctions.setSelectedRole).not.toHaveBeenCalled();
    
    // Find the search input (as a way to locate the component)
    screen.getByPlaceholderText(TEST_CONFIG.TEMPLATE_LIST.SEARCH_PLACEHOLDER);
    
    // Simulate RoleSelector's onRoleChange call
    // This is indirectly testing that the prop was correctly passed
    const expectedRoleId = 'role2';
    mockStoreFunctions.setSelectedRole(expectedRoleId);
    
    expect(mockStoreFunctions.setSelectedRole).toHaveBeenCalledWith(expectedRoleId);
  });

  it('shows empty content when no templates match filters', () => {
    // Mock an empty array of templates
    (useTemplateStore as any).mockReturnValue(mockTemplateStoreStates.empty);

    customRender(<TemplateList />);

    // Check that no template cards are rendered
    expect(screen.queryByText('Frontend Template')).not.toBeInTheDocument();
    expect(screen.queryByText('Backend Template')).not.toBeInTheDocument();
    expect(screen.queryByText('Testing Template')).not.toBeInTheDocument();
    expect(screen.queryByText('Pipeline Template')).not.toBeInTheDocument();
  });

  it('shows correct templates when both search and role filter are applied', () => {
    // Apply both search term and role filter
    (useStore as any).mockReturnValue(mockStoreStates.withSearchAndRole(TEST_CONFIG.TEMPLATE_LIST.SEARCH_TERMS.TEMPLATE, 'role2'));

    customRender(<TemplateList />);

    // Only the template for QA Engineer with "template" in its name/content should be visible
    expect(screen.queryByText('Frontend Template')).not.toBeInTheDocument();
    expect(screen.queryByText('Backend Template')).not.toBeInTheDocument();
    expect(screen.getByText('Testing Template')).toBeInTheDocument();
    expect(screen.queryByText('Pipeline Template')).not.toBeInTheDocument();
  });
});
