import prisma from "../config/prisma-client.ts";

const specimens = [
  { title: "Monstera Deliciosa", cultivator: "Nature", nursery: "Tropical Nursery", accessionNumber: "9780000000001", genre: ["FLORA"] },
  { title: "Ficus Lyrata", cultivator: "Nature", nursery: "Indoor Nursery", accessionNumber: "9780000000002", genre: ["FLORA"] },
  { title: "Red-Eared Slider", cultivator: "Nature", nursery: "Aquatic Habitat", accessionNumber: "9780000000004", genre: ["FAUNA"] },
  { title: "Amanita Muscaria", cultivator: "Nature", nursery: "Forest Floor", accessionNumber: "9780000000007", genre: ["FUNGUS"] },
  { title: "Amethyst Geode", cultivator: "Earth", nursery: "Mineral Deposits", accessionNumber: "9780000000009", genre: ["MINERAL"] },
  { title: "Antique Brass Compass", cultivator: "Artisan", nursery: "Vintage Artifacts", accessionNumber: "9780000000011", genre: ["ARTIFACT"] },
  { title: "Holy Basil (Tulsi)", cultivator: "Nature", nursery: "Herbal Garden", accessionNumber: "9780000000013", genre: ["HERB"] },
  { title: "Heirloom Tomato Seeds", cultivator: "Nature", nursery: "Seed Vault", accessionNumber: "9780000000015", genre: ["SEED"] },
  { title: "Mysterious Glowing Spore", cultivator: "Unknown", nursery: "Deep Cave", accessionNumber: "9780000000017", genre: ["UNKNOWN"] },
];

async function main() {
  for (const b of specimens) {
    // @ts-ignore
    await prisma.specimen.upsert({
      where: { accessionNumber: b.accessionNumber },
      update: {},
      create: {
        title: b.title, cultivator: b.cultivator, nursery: b.nursery, accessionNumber: b.accessionNumber,
        genre: b.genre as any, totalCopies: 5, availableCopies: 5,
        coverUrl: `https://covers.openlibrary.org/b/isbn/${b.accessionNumber}-M.jpg`,
      },
    });
    console.log(`Seeded: ${b.title}`);
  }
  console.log(`Done. Seeded ${specimens.length} specimens.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
