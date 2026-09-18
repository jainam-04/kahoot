import React from 'react';
import logoImage from '../assets/logo1.png';

export default function Logo({ className = 'h-10 w-10', ...props }) {
  return (
    <img
      src={logoImage}
      alt="Quizy Logo"
      className={`shrink-0 object-contain mix-blend-screen ${className}`}
      {...props}
    />
  );
}
