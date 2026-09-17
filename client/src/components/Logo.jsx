import React from 'react';
import logoImage from '../assets/logo.jpg';

export default function Logo({ className = 'h-10 w-10', ...props }) {
  return (
    <img
      src={logoImage}
      alt="Quizzy Logo"
      className={`shrink-0 rounded-xl object-cover shadow-sm ${className}`}
      {...props}
    />
  );
}
