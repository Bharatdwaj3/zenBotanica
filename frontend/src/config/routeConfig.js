// Central list of which routes need auth, and which roles are allowed.
// requiredRole: 'any' = just needs to be logged in, no specific role.
//               array e.g. ['admin', 'faculty'] = only these roles allowed.
export const protectedRoutes = {
  '/profile': 'any',
  '/complete-profile': 'any',
  '/read/:id': 'any',
  '/wishlist': 'any',
  '/cart': 'any',
  '/staff/new': ['admin', 'faculty'],
};
