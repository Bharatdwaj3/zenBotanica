const PERMISSIONS: Record<string, string[]> = {
  admin: ['listSession', 'viewSession', 'returnBook', 'forceReturnBook', 'issuePenalty', 'issueSession'],
  faculty: ['borrowBook', 'returnBook', 'viewSession', 'payPenalty'],
  student: ['borrowBook', 'returnBook', 'viewSession', 'payPenalty'],
};

export default PERMISSIONS;
