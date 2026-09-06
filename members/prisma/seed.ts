import bcrypt from 'bcryptjs';
import prisma from '../config/prisma-client.ts';
import { ADMIN_EMAIL, ADMIN_PASSWORD, DEFAULT_USER_PASSWORD } from '../config/env.config.ts';

const ADMIN_USERNAME = 'admin';

const facultyUsers = [
  { email: 'ravi.sharma@library.local', username: 'ravi.faculty', Fname: 'Ravi', Lname: 'Sharma', age: 34, gender: 'Male', Expertise: 'Computer_Science' },
  { email: 'meera.iyer@library.local', username: 'meera.faculty', Fname: 'Meera', Lname: 'Iyer', age: 41, gender: 'Female', Expertise: 'History' },
  { email: 'arjun.verma@library.local', username: 'arjun.faculty', Fname: 'Arjun', Lname: 'Verma', age: 29, gender: 'Male', Expertise: 'Literature' },
  { email: 'priya.nair@library.local', username: 'priya.faculty', Fname: 'Priya', Lname: 'Nair', age: 37, gender: 'Female', Expertise: 'Geography' },
];

const studentUsers = [
  { email: 'aditya.rao@library.local', username: 'aditya.student', Fname: 'Aditya', Lname: 'Rao', age: 20, gender: 'Male', Subjects: 'Computer_Science' },
  { email: 'sneha.kulkarni@library.local', username: 'sneha.student', Fname: 'Sneha', Lname: 'Kulkarni', age: 21, gender: 'Female', Subjects: 'Social_Studies' },
  { email: 'karan.mehta@library.local', username: 'karan.student', Fname: 'Karan', Lname: 'Mehta', age: 19, gender: 'Male', Subjects: 'Literature' },
  { email: 'divya.menon@library.local', username: 'divya.student', Fname: 'Divya', Lname: 'Menon', age: 22, gender: 'Female', Subjects: 'History' },
];

async function main() {
  const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      password: hashedAdminPassword,
      role: 'admin',
    },
  });
  console.log(`Admin ready: ${admin.email} (username: ${admin.username})`);

  const hashedDefaultPassword = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10);

  for (const f of facultyUsers) {
    const user = await prisma.user.upsert({
      where: { email: f.email },
      update: {},
      create: {
        email: f.email,
        username: f.username,
        password: hashedDefaultPassword,
        role: 'faculty',
        faculty: {
          create: {
            email: f.email,
            Fname: f.Fname,
            Lname: f.Lname,
            age: f.age,
            gender: f.gender,
            Expertise: f.Expertise,
          },
        },
      },
    });
    console.log(`Faculty ready: ${user.email} (username: ${user.username})`);
  }

  for (const s of studentUsers) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        username: s.username,
        password: hashedDefaultPassword,
        role: 'student',
        student: {
          create: {
            email: s.email,
            Fname: s.Fname,
            Lname: s.Lname,
            age: s.age,
            gender: s.gender,
            Subjects: s.Subjects,
          },
        },
      },
    });
    console.log(`Student ready: ${user.email} (username: ${user.username})`);
  }

  console.log(`Done. Seeded ${facultyUsers.length + studentUsers.length} non-admin users.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
