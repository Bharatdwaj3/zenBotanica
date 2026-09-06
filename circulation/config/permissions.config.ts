const PERMISSIONS: Record<string, string[]> = {
  admin: ['listLoan', 'viewLoan', 'returnBook', 'forceReturnBook', 'issueFine', 'issueLoan'],
  faculty: ['borrowBook', 'returnBook', 'viewLoan', 'payFine'],
  student: ['borrowBook', 'returnBook', 'viewLoan', 'payFine'],
};

export default PERMISSIONS;
