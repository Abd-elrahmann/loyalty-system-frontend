
export const permissionRouteMap = {
  'dashboard': '/dashboard',
  'managers': '/mangers',
  'pos': '/point-of-sale', 
  'invoices': '/invoice',
  'customers': '/customers',
  'products': '/products',
  'transactions': '/transactions',
  'reports': '/reports',
  'rewards': '/rewards',
  'settings': '/settings'
};


export const routePermissionMap = {
  '/dashboard': 'dashboard',
  '/mangers': 'managers',
  '/point-of-sale': 'pos',
  '/invoice': 'invoices',
  '/customers': 'customers',
  '/products': 'products',
  '/transactions': 'transactions',
  '/reports': 'reports',
  '/rewards': 'rewards',
  '/settings': 'settings'
};

/**

 * @param {Object} user 
 * @returns {Array}
 */ 
export const getUserPermissions = (user) => {
  if (!user) return [];
  
  if (user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions;
  }
  
  if (user.rolePermissions && Array.isArray(user.rolePermissions) && user.rolePermissions.length > 0) {
    return user.rolePermissions.map(perm => perm.page);
  }

  
  return [];
};

/**
 * 
 * @param {string} role 
 * @returns {Promise<Array>} 
 */
export const fetchRolePermissions = async (role) => {
  try {
    const Api = (await import('../Config/Api.js')).default;
    const response = await Api.get(`/api/roles/${role}`);
    return response.data || [];
  } catch (error) {
    console.warn('Error fetching role permissions:', error);
    return [];
  }
};

/**
 * 
 * @param {Array|Object} userPermissionsOrUser
 * @param {string} route                           
 * @returns {boolean}
 */
export const hasRouteAccess = (userPermissionsOrUser, route) => {
  if (!Array.isArray(userPermissionsOrUser) && userPermissionsOrUser?.role === 'ADMIN') {
    return true;
  }
  
  let userPermissions;
  
  if (Array.isArray(userPermissionsOrUser)) {
    userPermissions = userPermissionsOrUser;
  } else {
    userPermissions = getUserPermissions(userPermissionsOrUser);
  }
  
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  const requiredPermission = routePermissionMap[route];
  if (!requiredPermission) {
    return false;
  }
  
  return userPermissions.includes(requiredPermission);
};

/**
 *
 * @param {Array|Object} userPermissionsOrUser 
 * @returns {string}
 */
export const getFirstAccessibleRoute = (userPermissionsOrUser) => {
  if (!Array.isArray(userPermissionsOrUser) && userPermissionsOrUser?.role === 'ADMIN') {
    return '/dashboard';
  }
  
  let userPermissions;
  
  if (Array.isArray(userPermissionsOrUser)) {
    userPermissions = userPermissionsOrUser;
  } else {
    userPermissions = getUserPermissions(userPermissionsOrUser);
  }
  
  if (!userPermissions || userPermissions.length === 0) {
    return '/login'; 
  }
  
  const permissionPriority = ['dashboard', 'pos', 'invoices', 'customers', 'products', 'transactions', 'users', 'reports', 'rewards', 'settings'];
  
  for (const permission of permissionPriority) {
    if (userPermissions.includes(permission) && permissionRouteMap[permission]) {
      return permissionRouteMap[permission];
    }
  }
  
  return '/login';
};

/**
 * 
 * @param {Array} routes 
 * @param {Array|Object} userPermissionsOrUser 
 * @returns {Array}
 */
export const filterRoutesByPermissions = (routes, userPermissionsOrUser) => {
  if (!Array.isArray(userPermissionsOrUser) && userPermissionsOrUser?.role === 'ADMIN') {
    return routes;
  }
  
  let userPermissions;
  
  if (Array.isArray(userPermissionsOrUser)) {
    userPermissions = userPermissionsOrUser;
  } else {
    userPermissions = getUserPermissions(userPermissionsOrUser);
  }
  
  if (!userPermissions || userPermissions.length === 0) {
    return [];
  }
  
  return routes.filter(route => {
    const requiredPermission = routePermissionMap[route.path];
    return requiredPermission && userPermissions.includes(requiredPermission);
  });
};
