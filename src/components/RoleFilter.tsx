import React, { useMemo } from 'react';
import { useRoleStore } from '../store/roleStore';
import { useStore } from '../store/useStore';
import { Users } from 'lucide-react';

interface RoleFilterProps {
  onRoleChange: (roleId: string) => void;
}

export const RoleFilter: React.FC<RoleFilterProps> = ({ onRoleChange }) => {
  const { selectedRole } = useStore();
  const { getAllRoles } = useRoleStore();

  const allRoles = useMemo(() => {
    const roles = getAllRoles();
    return roles.sort((a, b) => a.name.localeCompare(b.name));
  }, [getAllRoles]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    onRoleChange(roleId);
  };

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Role</h3>
      </div>
      <select
        value={selectedRole || ''}
        onChange={handleRoleChange}
        className="w-full px-3 py-2 text-sm rounded-xs bg-white dark:bg-vscode-dropdown text-gray-800 dark:text-vscode-dropdown-fg border border-gray-300 dark:border-vscode-border focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-vscode-active"
      >
        <option value="">All Roles</option>
        {allRoles.map((role) => (
          <option key={`role-option-${role.id}`} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </div>
  );
};