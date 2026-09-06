import prisma from '../config/prisma-client.ts';
import { MEMBERS_SERVICE_URL, CATALOG_SERVICE_URL, INTERNAL_SERVICE_SECRET } from '../config/env.config.ts';

// NOTE: this script is not idempotent like members'/catalog's seed scripts —
// loan/fine have no unique field to upsert on. Running it twice creates
// duplicate rows. Fine for a one-off test seed, just don't re-run blindly.

const ADMIN_EMAIL = 'admin@library.local';

const userEmails = [
  'ravi.sharma@library.local',
  'meera.iyer@library.local',
  'arjun.verma@library.local',
  'priya.nair@library.local',
  'aditya.rao@library.local',
  'sneha.kulkarni@library.local',
  'karan.mehta@library.local',
  'divya.menon@library.local',
];

const bookIsbns = [
  '9780061120084', // To Kill a Mockingbird
  '9780141439518', // Pride and Prejudice
  '9780743273565', // The Great Gatsby
  '9780062316097', // Sapiens
  '9780547928227', // The Hobbit
  '9780553380163', // A Brief History of Time
  '9780441172719', // Dune
  '9780307949486', // The Girl with the Dragon Tattoo
];

async function resolveUserId(email: string): Promise<number> {
  const res = await fetch(`${MEMBERS_SERVICE_URL}/api/v1/internal/user/by-email/${email}`, {
    headers: { 'x-internal-secret': INTERNAL_SERVICE_SECRET },
  });
  if (!res.ok) throw new Error(`Could not resolve user for ${email} (status ${res.status})`);
  const data = await res.json();
  return data.id;
}

async function resolveBookId(isbn: string): Promise<number> {
  const res = await fetch(`${CATALOG_SERVICE_URL}/api/v1/internal/book/by-isbn/${isbn}`, {
    headers: { 'x-internal-secret': INTERNAL_SERVICE_SECRET },
  });
  if (!res.ok) throw new Error(`Could not resolve book for ISBN ${isbn} (status ${res.status})`);
  const data = await res.json();
  return data.id;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log('Resolving user IDs from members service...');
  const adminId = await resolveUserId(ADMIN_EMAIL);
  const userIds: number[] = [];
  for (const email of userEmails) {
    userIds.push(await resolveUserId(email));
  }

  console.log('Resolving book IDs from catalog service...');
  const bookIds: number[] = [];
  for (const isbn of bookIsbns) {
    bookIds.push(await resolveBookId(isbn));
  }

  // Mix of loan states: active (not due yet), overdue, returned
  const loanPlan = [
    { userIndex: 0, bookIndex: 0, dueInDays: 10, returned: false },  // active
    { userIndex: 1, bookIndex: 1, dueInDays: -3, returned: false },  // overdue
    { userIndex: 2, bookIndex: 2, dueInDays: -1, returned: true },   // returned late
    { userIndex: 3, bookIndex: 3, dueInDays: 14, returned: false },  // active
    { userIndex: 4, bookIndex: 4, dueInDays: -7, returned: false },  // overdue
    { userIndex: 5, bookIndex: 5, dueInDays: 5, returned: true },    // returned on time
    { userIndex: 6, bookIndex: 6, dueInDays: 7, returned: false },   // active
    { userIndex: 7, bookIndex: 7, dueInDays: -5, returned: false },  // overdue
  ];

  console.log('Seeding loans...');
  for (const l of loanPlan) {
    await prisma.loan.create({
      data: {
        userId: userIds[l.userIndex],
        bookId: bookIds[l.bookIndex],
        borrowedAt: daysFromNow(l.dueInDays - 14),
        dueAt: daysFromNow(l.dueInDays),
        returnedAt: l.returned ? daysFromNow(l.dueInDays - 2) : null,
        fineAmount: !l.returned && l.dueInDays < 0 ? Math.abs(l.dueInDays) * 5 : 0,
      },
    });
  }
  console.log(`Seeded ${loanPlan.length} loans.`);

  // Fines: mix of paid and unpaid
  const finePlan = [
    { userIndex: 1, amount: 15, reason: 'Overdue return', paid: false },
    { userIndex: 4, amount: 35, reason: 'Overdue return', paid: false },
    { userIndex: 7, amount: 25, reason: 'Overdue return', paid: false },
    { userIndex: 2, amount: 10, reason: 'Late return fee', paid: true },
    { userIndex: 5, amount: 5, reason: 'Damaged cover', paid: true },
  ];

  console.log('Seeding fines...');
  for (const f of finePlan) {
    await prisma.fine.create({
      data: {
        userId: userIds[f.userIndex],
        amount: f.amount,
        reason: f.reason,
        issuedBy: adminId,
        paid: f.paid,
      },
    });
  }
  console.log(`Seeded ${finePlan.length} fines.`);

  console.log('Done.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
