export const buildMemberRows = (facultyList, studentList, loans, isOverdue) => {
  const withRole = [
    ...facultyList.map((p) => ({ ...p, role: 'faculty' })),
    ...studentList.map((p) => ({ ...p, role: 'student' })),
  ];

  return withRole.map((person) => {
    const personLoans = loans.filter((loan) => loan.userId === person.userId);
    return {
      id: person.id,
      userId: person.userId,
      name: `${person.Fname} ${person.Lname}`,
      role: person.role,
      loans: personLoans,
      activeLoans: personLoans.filter((loan) => !loan.returnedAt).length,
      overdue: personLoans.filter(isOverdue).length,
      outstandingFines: personLoans.reduce((sum, loan) => sum + (loan.fineAmount || 0), 0),
    };
  });
};
