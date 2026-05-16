import React from 'react';
import './Background.css';

/**
 * Background
 * Renders the animated canvas: three floating orbs + dot-grid overlay.
 * Sits at position:fixed with z-index:0 behind all page content.
 */
export default function Background() {
  return (
    <div className="bg-canvas" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="bg-grid" />
    </div>
  );
}
