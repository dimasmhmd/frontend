// src/components/Card.jsx
import React from 'react';

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);