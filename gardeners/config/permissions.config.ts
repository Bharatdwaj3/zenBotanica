const PERMISSIONS: Record<string, string[]> = {
  admin: [
    'listMaster', 'addMaster', 'viewMaster', 'editMaster', 'delMaster',
    'listApprentice', 'addApprentice', 'viewApprentice', 'editApprentice', 'delApprentice',
  ],
  master: ['viewMaster', 'editMaster', 'delMaster', 'viewApprentice', 'addApprentice'],
  apprentice: ['listMaster', 'viewMaster'],
};

export default PERMISSIONS;