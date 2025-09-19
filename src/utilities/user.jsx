import { useState, useEffect } from 'react';
import { fetchRolePermissions } from './permissions.js';

export const useUser = () => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const profile = localStorage.getItem("profile");
    
    if (!token) {
      return null;
    }
    
    return profile ? JSON.parse(profile) : { role: "ADMIN" };
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const profile = localStorage.getItem("profile");
      
      if (!token) {
        setUser(null);
        return;
      }
      
      setUser(profile ? JSON.parse(profile) : { role: "ADMIN" });
    };

    window.addEventListener('storage', handleStorageChange);
    
    window.addEventListener('userProfileUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userProfileUpdate', handleStorageChange);
    };
  }, []);

  return user;
};

export const updateUserProfile = () => {
  window.dispatchEvent(new CustomEvent('userProfileUpdate'));
};

/**
 *
 * @param {string} role 
 */
export const updateUserPermissions = async (role) => {
  try {
    const profile = localStorage.getItem('profile');
    if (profile && role) {
      const user = JSON.parse(profile);
      const rolePermissions = await fetchRolePermissions(role);
      
      const updatedUser = {
        ...user,
        rolePermissions: rolePermissions
      };
      
      localStorage.setItem('profile', JSON.stringify(updatedUser));
      updateUserProfile();
    }
  } catch (error) {
    console.warn('Error updating user permissions:', error);
  }
};


