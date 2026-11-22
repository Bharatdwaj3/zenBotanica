const PERMISSIONS: Record<string, string[]> = {
  curator: ['listSpecimen', 'viewSpecimen', 'addSpecimen', 'editSpecimen', 'delSpecimen'],
  botanist: ['listSpecimen', 'viewSpecimen'],
  apprentice: ['listSpecimen', 'viewSpecimen'],
  caretaker: ['listSpecimen', 'viewSpecimen'],
  admin: ['listSpecimen', 'viewSpecimen', 'addSpecimen', 'editSpecimen', 'delSpecimen'],
  faculty: ['listSpecimen', 'viewSpecimen'],
  student: ['listSpecimen', 'viewSpecimen'],
};

export default PERMISSIONS;