const PERMISSIONS: Record<string, string[]> = {
  admin: [
    'listFaculty', 'addFaculty', 'viewFaculty', 'editFaculty', 'delFaculty',
    'listStudent', 'addStudent', 'viewStudent', 'editStudent', 'delStudent',
  ],
  faculty: ['viewFaculty', 'editFaculty', 'delFaculty', 'viewStudent', 'addStudent'],
  student: ['listFaculty', 'viewFaculty'],
};

export default PERMISSIONS;