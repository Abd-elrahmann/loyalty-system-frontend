import { getUserPermissions, getFirstAccessibleRoute } from './permissions.js';

/**
 * Debug current user permissions
 * Call this in browser console: window.debugPermissions()
 */
export const debugPermissions = () => {
  console.group('🔍 Debug Permissions');
  
  try {
    const token = localStorage.getItem('token');
    const profile = localStorage.getItem('profile');
    
    console.log('Token exists:', !!token);
    console.log('Profile exists:', !!profile);
    
    if (profile) {
      const user = JSON.parse(profile);
      console.log('Full user object:', user);
      console.log('User role:', user.role);
      console.log('User permissions (raw):', user.permissions);
      console.log('User rolePermissions (raw):', user.rolePermissions);
      
      const extractedPermissions = getUserPermissions(user);
      console.log('Extracted permissions:', extractedPermissions);
      console.log('Permissions count:', extractedPermissions.length);
      
      const firstRoute = getFirstAccessibleRoute(user);
      console.log('First accessible route:', firstRoute);
      
      if (extractedPermissions.length === 0) {
        console.warn('⚠️  No permissions found! This will cause empty sidebar');
        console.log('Possible solutions:');
        console.log('1. Check if login response contains permissions');
        console.log('2. Check if API /api/roles/{role} returns permissions');
        console.log('3. Verify permissions are being saved correctly');
      } else {
        console.log('✅ Permissions found successfully');
      }
      
    } else {
      console.warn('❌ No profile found in localStorage');
    }
    
  } catch (error) {
    console.error('Error debugging permissions:', error);
  }
  
  console.groupEnd();
};

/**
 * Test permissions with mock data
 */
export const testPermissions = () => {
  console.group('🧪 Test Permissions');
  
  // Test with login response format
  const mockUserWithPermissions = {
    id: 44,
    role: 'CASHIER',
    permissions: ['users', 'pos', 'invoices']
  };
  
  console.log('Test 1 - User with permissions array:');
  console.log('Mock user:', mockUserWithPermissions);
  console.log('Extracted permissions:', getUserPermissions(mockUserWithPermissions));
  console.log('First route:', getFirstAccessibleRoute(mockUserWithPermissions));
  
  // Test with API response format
  const mockUserWithRolePermissions = {
    id: 44,
    role: 'CASHIER',
    rolePermissions: [
      { page: 'dashboard' },
      { page: 'pos' },
      { page: 'invoices' }
    ]
  };
  
  console.log('\nTest 2 - User with rolePermissions:');
  console.log('Mock user:', mockUserWithRolePermissions);
  console.log('Extracted permissions:', getUserPermissions(mockUserWithRolePermissions));
  console.log('First route:', getFirstAccessibleRoute(mockUserWithRolePermissions));
  
  // Test with no permissions
  const mockUserNoPermissions = {
    id: 44,
    role: 'CASHIER'
  };
  
  console.log('\nTest 3 - User with no permissions:');
  console.log('Mock user:', mockUserNoPermissions);
  console.log('Extracted permissions:', getUserPermissions(mockUserNoPermissions));
  console.log('First route:', getFirstAccessibleRoute(mockUserNoPermissions));
  
  console.groupEnd();
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.debugPermissions = debugPermissions;
  window.testPermissions = testPermissions;
}
