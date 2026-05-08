// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

const USERS_KEY = 'doseme_users';
const CURRENT_USER_KEY = 'doseme_current_user';

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

  // Sign Up - يحفظ كل بيانات المستخدم
  const signup = (profileData) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      
      // Check if email exists
      if (existingUsers[profileData.email]) {
        return { success: false, error: 'البريد الإلكتروني مسجل بالفعل' };
      }
      
      // Create full user object with all signup data
      const newUser = {
        email: profileData.email,
        password: profileData.password,
        fullName: profileData.fullName,
        phone: profileData.phone,
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
      
      // Auto login after signup
      const loggedUser = { 
        email: newUser.email, 
        name: newUser.fullName,
        fullData: newUser 
      };
      setUser(loggedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedUser));
      
      return { success: true };
    } catch (e) {
      return { success: false, error: 'حدث خطأ، حاول مرة أخرى' };
    }
  };

  // Sign In - يتحقق من البريد وكلمة المرور
  const signin = (email, password) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      const userRecord = existingUsers[email];
      
      if (!userRecord) {
        return { success: false, error: 'البريد الإلكتروني غير مسجل' };
      }
      
      if (userRecord.password !== password) {
        return { success: false, error: 'كلمة المرور غير صحيحة' };
      }
      
      const loggedUser = { 
        email: userRecord.email, 
        name: userRecord.fullName,
        fullData: userRecord 
      };
      setUser(loggedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedUser));
      
      return { success: true };
    } catch (e) {
      return { success: false, error: 'حدث خطأ، حاول مرة أخرى' };
    }
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return { user, loading, signup, signin, signout };
}