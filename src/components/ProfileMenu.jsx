// src/components/ProfileMenu.jsx
import React, { useState, useRef, useEffect } from 'react';

export default function ProfileMenu({ user, onLogout, onViewProfile, onSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="profile-menu" ref={menuRef}>
      <button className="profile-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="profile-avatar">
          {getInitials(user?.name)}
        </div>
        <span className="profile-name">{user?.name}</span>
        <span className="profile-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <div className="dropdown-avatar">{getInitials(user?.name)}</div>
            <div className="dropdown-info">
              <div className="dropdown-name">{user?.name}</div>
              <div className="dropdown-email">{user?.email}</div>
            </div>
          </div>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item" onClick={() => { onViewProfile?.(); setIsOpen(false); }}>
            <span className="material-symbols-outlined">person</span>
            ملفي الشخصي
          </button>
          <button className="dropdown-item" onClick={() => { onSettings?.(); setIsOpen(false); }}>
            <span className="material-symbols-outlined">settings</span>
            الإعدادات
          </button>
          <button className="dropdown-item" onClick={() => {}}>
            <span className="material-symbols-outlined">help</span>
            المساعدة
          </button>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item logout" onClick={() => { onLogout(); setIsOpen(false); }}>
            <span className="material-symbols-outlined">logout</span>
            تسجيل خروج
          </button>
        </div>
      )}
    </div>
  );
}