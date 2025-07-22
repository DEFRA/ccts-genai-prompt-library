import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test-utils';
import ManageModal from '../ManageModal';

// Mock useStore to always return isManageModalOpen: true
vi.mock('../../store/useStore', () => ({
  useStore: () => ({
    isManageModalOpen: true,
    toggleManageModal: vi.fn(),
    setModalMode: vi.fn(),
    toggleCreateModal: vi.fn(),
    setSelectedTemplate: vi.fn(),
    setInitialRoleId: vi.fn()
  })
}));

describe('ManageModal loading state (real Modal)', () => {
  it('renders spinner and loading modal with correct title when isLoadingOverride is true', () => {
    render(<ManageModal isLoadingOverride={true} />);
    expect(screen.getByRole('heading', { name: 'Manage Templates & Roles' })).toBeInTheDocument();
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
    expect(spinner).toHaveClass('border-b-2');
    expect(spinner).toHaveClass('border-blue-500');
  });
}); 