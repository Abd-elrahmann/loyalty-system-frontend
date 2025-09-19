import { useEffect } from 'react';
import { updateUserPermissions } from '../utilities/user.jsx';

/**
 * Hook to sync user permissions when they are updated
 * This should be used in components that might update permissions
 */
export const usePermissionsSync = () => {
  useEffect(() => {
    const handlePermissionsUpdate = async (event) => {
      const { role } = event.detail || {};
      if (role) {
        await updateUserPermissions(role);
      }
    };

    // Listen for permission update events
    window.addEventListener('permissionsUpdated', handlePermissionsUpdate);

    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdate);
    };
  }, []);
};

/**
 * Trigger permissions update event
 * Call this after updating permissions via API
 * @param {string} role - The role that was updated
 */
export const triggerPermissionsUpdate = (role) => {
  window.dispatchEvent(new CustomEvent('permissionsUpdated', {
    detail: { role }
  }));
};

/**
 * Refresh current user permissions from API
 * Useful when permissions might have been updated by another admin
 */
export const refreshCurrentUserPermissions = async () => {
  try {
    const profile = localStorage.getItem('profile');
    if (profile) {
      const user = JSON.parse(profile);
      if (user.role) {
        await updateUserPermissions(user.role);
      }
    }
  } catch (error) {
    console.warn('Error refreshing current user permissions:', error);
  }
};
