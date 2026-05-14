import React from 'react';
import './GlassCard.css';

const GlassCard = ({ children, title, className = '', ...props }) => {
  return (
    <div className={`sys-glass-card ${className}`} {...props}>
      {title && <h3 className="sys-glass-card-title">{title}</h3>}
      <div className="sys-glass-card-content">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
