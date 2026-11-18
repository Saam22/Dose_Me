// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

const USERS_KEY = 'doseme-users';
const CURRENT_USER_KEY = 'doseme_current_user';

function normalizeEmail(value) {
  return (value || '').toString().trim().toLowerCase();
}

function findUser(users, email) {
  const key = normalizeEmail(email);
  const match = Object.keys(users).find((k) => normalizeEmail(k) === key);
  return match ? users[match] : null;
}

function readUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load user:', e);
    }
    setLoading(false);
  }, []);

  // Sign Up - يحفظ كل بيانات المستخدم بنفس صيغة التطبيق (مفتاح pass)
  const signup = (profileData) => {
    try {
      const existingUsers = readUsers();

      if (findUser(existingUsers, profileData.email)) {
        return { success: false, error: 'البريد الإلكتروني مسجل بالفعل' };
      }

      const newUser = {
        pass: profileData.password,
        name: profileData.fullName,
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        role: profileData.role || 'patient',
        age: profileData.age,
        height: profileData.height,
        weight: profileData.weight,
        bloodType: profileData.bloodType,
        conditions: profileData.conditions || [],
        allergies: profileData.allergies || [],
        medications: profileData.medications || '',
        notes: profileData.notes || '',
        createdAt: new Date().toISOString(),
      };

      existingUsers[profileData.email] = newUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(existingUsers));

      const loggedUser = {
        email: newUser.email,
        name: newUser.fullName,
        fullData: newUser,
      };
      setUser(loggedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedUser));

      return { success: true };
    } catch {
      return { success: false, error: 'حدث خطأ، حاول مرة أخرى' };
    }
  };

  // Sign In - يتحقق من البريد وكلمة المرور
  const signin = (email, password) => {
    try {
      const existingUsers = readUsers();
      const userRecord = findUser(existingUsers, email);

      if (!userRecord) {
        return { success: false, error: 'البريد الإلكتروني غير مسجل' };
      }

      const storedPassword = userRecord.pass ?? userRecord.password;
      if (storedPassword !== password) {
        return { success: false, error: 'كلمة المرور غير صحيحة' };
      }

      const loggedUser = {
        email: userRecord.email,
        name: userRecord.fullName || userRecord.name,
        fullData: userRecord,
      };
      setUser(loggedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedUser));

      return { success: true };
    } catch {
      return { success: false, error: 'حدث خطأ، حاول مرة أخرى' };
    }
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return { user, loading, signup, signin, signout };
}
