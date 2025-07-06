import React from 'react';
import { Role } from '../../types';

interface Props {
  roleFromExpertise: string;
  allRoles: Role[];
  selectedRole: string;
  setSelectedRole: (role: string) => void;
}

export const RoleSelectionSection: React.FC<Props> = ({
  roleFromExpertise,
  allRoles,
  selectedRole,
  setSelectedRole
}) => (
  <div>
    <label htmlFor="role" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
      Role
    </label>
    <select
      id="role"
      value={selectedRole || roleFromExpertise || ''}
      onChange={(e) => setSelectedRole(e.target.value)}
      className="w-full text-[0.75rem] p-2 border dark:border-dark-border rounded-lg"
    >
      <option value="">Choose a Role</option>
      {allRoles.map((role) => (
        <option key={role.id} value={role.id}>{role.name}</option>
      ))}
    </select>
  </div>
); 