import prisma from "../config/prisma-client.ts";
import { GARDENERS_SERVICE_URL, INTERNAL_SERVICE_SECRET } from "../config/env.config.ts";

const specimens = [
  { title: "Monstera Deliciosa", author: "Nature", publisher: "Tropical Nursery", isbn: "9780000000001", genre: ["FLORA"] },
  { title: "Ficus Lyrata", author: "Nature", publisher: "Indoor Nursery", isbn: "9780000000002", genre: ["FLORA"] },
  { title: "Bonsai Juniper", author: "Master Gardener", publisher: "Zen Nursery", isbn: "9780000000003", genre: ["FLORA"] },
  { title: "Red-Eared Slider", author: "Nature", publisher: "Aquatic Habitat", isbn: "9780000000004", genre: ["FAUNA"] },
  { title: "Poecilotheria Metallica", author: "Nature", publisher: "Exotic Habitat", isbn: "9780000000005", genre: ["FAUNA"] },
  { title: "Axolotl", author: "Nature", publisher: "Aquatic Habitat", isbn: "9780000000006", genre: ["FAUNA"] },
  { title: "Amanita Muscaria", author: "Nature", publisher: "Forest Floor", isbn: "9780000000007", genre: ["FUNGUS"] },
  { title: "Lion's Mane", author: "Nature", publisher: "Woodland Nursery", isbn: "9780000000008", genre: ["FUNGUS"] },
  { title: "Amethyst Geode", author: "Earth", publisher: "Mineral Deposits", isbn: "9780000000009", genre: ["MINERAL"] },
  { title: "Obsidian", author: "Earth", publisher: "Volcanic Glass", isbn: "9780000000010", genre: ["MINERAL"] },
  { title: "Antique Brass Compass", author: "Artisan", publisher: "Vintage Artifacts", isbn: "9780000000011", genre: ["ARTIFACT"] },
  { title: "Victorian Terrarium", author: "Artisan", publisher: "Glassworks", isbn: "9780000000012", genre: ["ARTIFACT"] },
  { title: "Holy Basil (Tulsi)", author: "Nature", publisher: "Herbal Garden", isbn: "9780000000013", genre: ["HERB"] },
  { title: "Lavender", author: "Nature", publisher: "Herbal Garden", isbn: "9780000000014", genre: ["HERB"] },
  { title: "Heirloom Tomato Seeds", author: "Nature", publisher: "Seed Vault", isbn: "9780000000015", genre: ["SEED"] },
  { title: "Lotus Seeds", author: "Nature", publisher: "Seed Vault", isbn: "9780000000016", genre: ["SEED"] },
  { title: "Mysterious Glowing Spore", author: "Unknown", publisher: "Deep Cave", isbn: "9780000000017", genre: ["UNKNOWN"] },
  { title: "Unidentified Fossil", author: "Unknown", publisher: "Excavation Site", isbn: "9780000000018", genre: ["UNKNOWN"] },
];

const userEmails = [
  "elara.woods@mionchoillte.local",
  "silas.green@mionchoillte.local",
  "aria.leaf@mionchoillte.local",
  "orion.root@mionchoillte.local",
  "luna.bloom@mionchoillte.local",
  "atlas.stone@mionchoillte.local",
  "nova.seed@mionchoillte.local",
  "rowan.branch@mionchoillte.local",
];

async function resolveUserId(email) {
  const res = await fetch(`${GARDENERS_SERVICE_URL}/api/v1/internal/user/by-email/${email}`, {
    headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET },
  });
  if (!res.ok) throw new Error(`Could not resolve user for ${email} (status ${res.status})`);
  const data = await res.json();
  return data.id;
}

async function main() {
  for (const b of specimens) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: {
        title: b.title,
        author: b.author,
        publisher: b.publisher,
        isbn: b.isbn,
        genre: b.genre as any,
        totalCopies: 5,
        availableCopies: 5,
        coverUrl: `https://covers.openlibrary.org/b/isbn/${b.isbn}-M.jpg`,
      },
    });
    console.log(`Seeded: ${b.title}`);
  }
  console.log(`Done. Seeded ${specimens.length} specimens.`);

  console.log("Resolving user IDs from gardeners service...");
  const userIds = [];
  for (const email of userEmails) {
    userIds.push(await resolveUserId(email));
  }

  const seededSpecimens = await prisma.book.findMany({ take: 8, orderBy: { id: "asc" } });

  console.log("Seeding cart items...");
  for (let i = 0; i < userIds.length; i++) {
    const specimen = seededSpecimens[i % seededSpecimens.length];
    await prisma.cart_item.upsert({
      where: { userId_bookId: { userId: userIds[i], bookId: specimen.id } },
      update: {},
      create: { userId: userIds[i], bookId: specimen.id },
    });
  }
  console.log(`Seeded ${userIds.length} cart items.`);

  console.log("Seeding wishlist items...");
  for (let i = 0; i < userIds.length; i++) {
    const specimen = seededSpecimens[(i + 3) % seededSpecimens.length];
    await prisma.wishlist_item.upsert({
      where: { userId_bookId: { userId: userIds[i], bookId: specimen.id } },
      update: {},
      create: { userId: userIds[i], bookId: specimen.id },
    });
  }
  console.log(`Seeded ${userIds.length} wishlist items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
