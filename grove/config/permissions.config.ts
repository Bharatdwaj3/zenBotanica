const PERMISSIONS: Record<string, string[]> = {
  admin: ['listSpecimen', 'viewSpecimen', 'addSpecimen', 'editSpecimen', 'delSpecimen'],
  faculty: ['listSpecimen', 'viewSpecimen'],
  student: ['listSpecimen', 'viewSpecimen'],
};

export default PERMISSIONS;