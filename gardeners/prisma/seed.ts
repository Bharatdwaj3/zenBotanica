import prisma from "../config/prisma-client.ts";
import crypto from "crypto";

const hashPassword = (password: string) => {
  return crypto.pbkdf2Sync(password, 'mionchoillte-salt', 10000, 64, 'sha512').toString('hex');
};

const CURATOR_EMAIL = "curator@mionchoillte.local";
const CURATOR_PASSWORD = "curator123";
const CURATOR_USERNAME = "head_curator";

const botanistUsers = [
  { email: "elara.woods@mionchoillte.local", username: "elara.botanist", Fname: "Elara", Lname: "Woods", age: 34, gender: "Female", Expertise: "Botany" },
  { email: "silas.green@mionchoillte.local", username: "silas.botanist", Fname: "Silas", Lname: "Green", age: 41, gender: "Male", Expertise: "Ecology" },
  { email: "aria.leaf@mionchoillte.local", username: "aria.botanist", Fname: "Aria", Lname: "Leaf", age: 29, gender: "Female", Expertise: "Horticulture" },
  { email: "orion.root@mionchoillte.local", username: "orion.botanist", Fname: "Orion", Lname: "Root", age: 37, gender: "Male", Expertise: "Mycology" },
];

const apprenticeUsers = [
  { email: "luna.bloom@mionchoillte.local", username: "luna.apprentice", Fname: "Luna", Lname: "Bloom", age: 20, gender: "Female", Subjects: "Botany" },
  { email: "atlas.stone@mionchoillte.local", username: "atlas.apprentice", Fname: "Atlas", Lname: "Stone", age: 21, gender: "Male", Subjects: "Geology" },
  { email: "nova.seed@mionchoillte.local", username: "nova.apprentice", Fname: "Nova", Lname: "Seed", age: 19, gender: "Female", Subjects: "Horticulture" },
  { email: "rowan.branch@mionchoillte.local", username: "rowan.apprentice", Fname: "Rowan", Lname: "Branch", age: 22, gender: "Male", Subjects: "Ecology" },
];

async function main() {
  await prisma.user.upsert({
    where: { email: CURATOR_EMAIL },
    update: {},
    create: {
      email: CURATOR_EMAIL,
      username: CURATOR_USERNAME,
      password: hashPassword(CURATOR_PASSWORD),
      role: "curator",
    },
  });
  console.log(`Curator ready: ${CURATOR_EMAIL}`);

  for (const user of botanistUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        username: user.username,
        password: hashPassword("password123"),
        role: "botanist",
        botanist: {
          create: {
            Fname: user.Fname,
            Lname: user.Lname,
            age: user.age,
            gender: user.gender,
            Expertise: user.Expertise as any,
            email: user.email, // FIX: Added required email field
          },
        },
      },
    });
    console.log(`Botanist ready: ${user.email}`);
  }

  for (const user of apprenticeUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        username: user.username,
        password: hashPassword("password123"),
        role: "apprentice",
        apprentice: {
          create: {
            Fname: user.Fname,
            Lname: user.Lname,
            age: user.age,
            gender: user.gender,
            Subjects: user.Subjects as any,
            email: user.email, // FIX: Added required email field
          },
        },
      },
    });
    console.log(`Apprentice ready: ${user.email}`);
  }

  console.log("Done. Seeded users.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
