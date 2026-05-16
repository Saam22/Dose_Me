import React from 'react';
import './Toast.css';

/**
 * Toast
 * Props:
 *   msg     {string}              – message text to display
 *   type    {'success'|'error'|''} – visual style variant
 *   visible {boolean}             – show / hide
 */
export default function Toast({ msg, type = '', visible }) {
  return (
    <div
      className={`toast ${visible ? 'show' : ''} ${type}`}
      role="status"
      aria-live="polite"
    >
      {msg}
    </div>
  );
}
