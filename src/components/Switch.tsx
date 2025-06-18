import React from 'react';
import '../styles/Switch.css';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => (
  <label className="switch" aria-label={label}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
    />
    <span className="slider round"></span>
  </label>
); 