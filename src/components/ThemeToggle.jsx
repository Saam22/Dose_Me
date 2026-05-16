import React from 'react';
import './ThemeToggle.css';

/**
 * ThemeToggle
 * Props:
 *   isDark   {boolean} – current theme state
 *   onToggle {function} – callback to flip the theme
 */
export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
    >
      <div className="theme-toggle-icon">
        <span className="material-symbols-outlined">
          {isDark ? 'dark_mode' : 'light_mode'}
        </span>
      </div>
      <span className="theme-toggle-text">
        {isDark ? 'الوضع الداكن' : 'الوضع الفاتح'}
      </span>
    </button>
  );
}
