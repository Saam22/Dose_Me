import React from 'react';
import './Logo.css';

/**
 * Logo
 * Props:
 *   onClick {function} – fired when the logo icon is clicked
 */
export default function Logo({ onClick }) {
  return (
    <div className="logo-wrap">
      <div
        className="logo-icon"
        onClick={onClick}
        title="DoseMe"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        aria-label="DoseMe logo"
      >
        <span className="material-symbols-outlined">health_and_safety</span>
      </div>
      <h1 className="logo-title">DoseMe</h1>
    </div>
  );
}
