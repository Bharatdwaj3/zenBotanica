export const buildGardenerRows = (masterList, apprenticeList, tendings, isOverdue) => {
  const withRole = [
    ...masterList.map((p) => ({ ...p, role: 'botanist' })),
    ...apprenticeList.map((p) => ({ ...p, role: 'apprentice' })),
  ];

  return withRole.map((person) => {
    const personTendings = tendings.filter((tending) => tending.userId === person.userId);
    return {
      id: person.id,
      userId: person.userId,
      name: `${person.Fname} ${person.Lname}`,
      role: person.role,
      tendings: personTendings,
      activeTendings: personTendings.filter((tending) => !tending.returnedAt).length,
      overdue: personTendings.filter(isOverdue).length,
      outstandingPenalties: personTendings.reduce((sum, tending) => sum + (tending.penaltyAmount || 0), 0),
    };
  });
};
