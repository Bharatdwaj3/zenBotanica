const PERMISSIONS: Record<string, string[]> = {
  admin: ['listBook', 'viewBook', 'addBook', 'editBook', 'delBook'],
  faculty: ['listBook', 'viewBook'],
  student: ['listBook', 'viewBook'],
};

export default PERMISSIONS;