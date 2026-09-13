const PERMISSIONS: Record<string, string[]> = {
  curator: ['listSession', 'viewSession', 'returnBook', 'forceReturnBook', 'issuePenalty', 'issueSession', 'listCareTask', 'manageCareTask', 'waivePenalty', 'completeCareTask'],
  botanist: ['borrowBook', 'returnBook', 'viewSession', 'payPenalty', 'listCareTask'],
  apprentice: ['borrowBook', 'returnBook', 'viewSession', 'payPenalty'],
  caretaker: ['listCareTask', 'completeCareTask'],
};

export default PERMISSIONS;
