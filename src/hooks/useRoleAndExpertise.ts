import { useState, useMemo } from "react";
import { Role } from "../types";

interface UseRoleAndExpertiseProps {
  roles: Role[];
}

export const useRoleAndExpertise = ({ roles }: UseRoleAndExpertiseProps) => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedExpertise, setSelectedExpertise] = useState<string>("");

  const expertiseOptions = useMemo(() => {
    if (!selectedRole) return [];
    const role = roles.find((r) => r.id === selectedRole);
    return role?.expertise || [];
  }, [selectedRole, roles]);

  return {
    selectedRole,
    setSelectedRole,
    selectedExpertise,
    setSelectedExpertise,
    expertiseOptions,
  };
};
