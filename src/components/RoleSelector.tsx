import React from "react";

const roles = [
  { id: "automation-engineer", name: "Automation Engineer" },
  { id: "qa-engineer", name: "QA Engineer" },
  { id: "qa-lead", name: "QA Lead" },
];

interface RoleSelectorProps {
  selectedRole: string | null;
  onRoleChange: (roleId: string | null) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleChange,
}) => {
  return <div className="mb-0"></div>;
};
