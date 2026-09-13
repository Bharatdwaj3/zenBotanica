const PERMISSIONS: Record<string, string[]> = {
  curator: ['manageViolations', 'listViolations', 'listHelpRequests', 'manageHelpRequests', 'listTickets'],
  botanist: ['listHelpRequests', 'manageHelpRequests'],
  caretaker: ['manageViolations'],
  tourist: ['buyTicket', 'payViolationFine'],
  farmer: ['submitHelpRequest'],
};
export default PERMISSIONS;
