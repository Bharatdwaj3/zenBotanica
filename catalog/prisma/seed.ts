import prisma from "../config/prisma-client.ts";
import { MEMBERS_SERVICE_URL, INTERNAL_SERVICE_SECRET } from "../config/env.config.ts";

const books = [
  { title: "To Kill a Mockingbird", author: "Harper Lee", publisher: "Harper Perennial", isbn: "9780061120084", genre: ["FICTION"] },
  { title: "Pride and Prejudice", author: "Jane Austen", publisher: "Penguin Classics", isbn: "9780141439518", genre: ["FICTION"] },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", publisher: "Scribner", isbn: "9780743273565", genre: ["FICTION"] },
  { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", publisher: "Harper Perennial", isbn: "9780060883287", genre: ["FICTION"] },

  { title: "Sapiens", author: "Yuval Noah Harari", publisher: "Harper", isbn: "9780062316097", genre: ["NON_FICTION"] },
  { title: "Educated", author: "Tara Westover", publisher: "Random House", isbn: "9780399590504", genre: ["NON_FICTION"] },
  { title: "The Immortal Life of Henrietta Lacks", author: "Rebecca Skloot", publisher: "Crown", isbn: "9781400052189", genre: ["NON_FICTION"] },
  { title: "Into the Wild", author: "Jon Krakauer", publisher: "Anchor", isbn: "9780385486804", genre: ["NON_FICTION"] },

  { title: "The Hobbit", author: "J.R.R. Tolkien", publisher: "Houghton Mifflin", isbn: "9780547928227", genre: ["FANTASY"] },
  { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", publisher: "Scholastic", isbn: "9780590353427", genre: ["FANTASY"] },
  { title: "A Game of Thrones", author: "George R.R. Martin", publisher: "Bantam", isbn: "9780553573404", genre: ["FANTASY"] },
  { title: "The Name of the Wind", author: "Patrick Rothfuss", publisher: "DAW Books", isbn: "9780756404741", genre: ["FANTASY"] },

  { title: "A Brief History of Time", author: "Stephen Hawking", publisher: "Bantam", isbn: "9780553380163", genre: ["SCIENCE"] },
  { title: "Cosmos", author: "Carl Sagan", publisher: "Ballantine Books", isbn: "9780345539434", genre: ["SCIENCE"] },
  { title: "The Selfish Gene", author: "Richard Dawkins", publisher: "Oxford University Press", isbn: "9780198788607", genre: ["SCIENCE"] },
  { title: "The Origin of Species", author: "Charles Darwin", publisher: "Penguin Classics", isbn: "9780451529060", genre: ["SCIENCE"] },

  { title: "Dune", author: "Frank Herbert", publisher: "Ace Books", isbn: "9780441172719", genre: ["SCIENCE_FICTION"] },
  { title: "1984", author: "George Orwell", publisher: "Signet Classics", isbn: "9780451524935", genre: ["SCIENCE_FICTION"] },
  { title: "Brave New World", author: "Aldous Huxley", publisher: "Harper Perennial", isbn: "9780060850524", genre: ["SCIENCE_FICTION"] },
  { title: "Ender's Game", author: "Orson Scott Card", publisher: "Tor Books", isbn: "9780812550702", genre: ["SCIENCE_FICTION"] },

  { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", publisher: "Vintage Crime", isbn: "9780307949486", genre: ["MYSTERY"] },
  { title: "Gone Girl", author: "Gillian Flynn", publisher: "Broadway Books", isbn: "9780307588371", genre: ["MYSTERY"] },
  { title: "And Then There Were None", author: "Agatha Christie", publisher: "William Morrow", isbn: "9780062073488", genre: ["MYSTERY"] },
  { title: "The Big Sleep", author: "Raymond Chandler", publisher: "Vintage Crime", isbn: "9780394758282", genre: ["MYSTERY"] },

  { title: "Me Before You", author: "Jojo Moyes", publisher: "Penguin Books", isbn: "9780143124542", genre: ["ROMANCE"] },
  { title: "The Notebook", author: "Nicholas Sparks", publisher: "Grand Central Publishing", isbn: "9780446605236", genre: ["ROMANCE"] },
  { title: "Outlander", author: "Diana Gabaldon", publisher: "Dell", isbn: "9780440212560", genre: ["ROMANCE"] },
  { title: "The Fault in Our Stars", author: "John Green", publisher: "Dutton Books", isbn: "9780525478812", genre: ["ROMANCE"] },

  { title: "Dracula", author: "Bram Stoker", publisher: "Penguin Classics", isbn: "9780141439846", genre: ["HORROR"] },
  { title: "The Shining", author: "Stephen King", publisher: "Anchor", isbn: "9780307743657", genre: ["HORROR"] },
  { title: "Frankenstein", author: "Mary Shelley", publisher: "Penguin Classics", isbn: "9780141439471", genre: ["HORROR"] },
  { title: "It", author: "Stephen King", publisher: "Scribner", isbn: "9781501142970", genre: ["HORROR"] },

  { title: "Guns, Germs, and Steel", author: "Jared Diamond", publisher: "W. W. Norton", isbn: "9780393317558", genre: ["HISTORY"] },
  { title: "A People's History of the United States", author: "Howard Zinn", publisher: "Harper Perennial", isbn: "9780062397348", genre: ["HISTORY"] },
  { title: "The Diary of a Young Girl", author: "Anne Frank", publisher: "Bantam", isbn: "9780553296983", genre: ["HISTORY"] },
  { title: "1776", author: "David McCullough", publisher: "Simon & Schuster", isbn: "9780743226721", genre: ["HISTORY"] },

  { title: "Steve Jobs", author: "Walter Isaacson", publisher: "Simon & Schuster", isbn: "9781451648539", genre: ["BIOGRAPHY"] },
  { title: "Long Walk to Freedom", author: "Nelson Mandela", publisher: "Back Bay Books", isbn: "9780316548182", genre: ["BIOGRAPHY"] },
  { title: "The Autobiography of Malcolm X", author: "Malcolm X", publisher: "Ballantine Books", isbn: "9780345350688", genre: ["BIOGRAPHY"] },
  { title: "Benjamin Franklin: An American Life", author: "Walter Isaacson", publisher: "Simon & Schuster", isbn: "9780743258074", genre: ["BIOGRAPHY"] },

  { title: "Leaves of Grass", author: "Walt Whitman", publisher: "Penguin Classics", isbn: "9780140421996", genre: ["POETRY"] },
  { title: "The Complete Poems of Emily Dickinson", author: "Emily Dickinson", publisher: "Back Bay Books", isbn: "9780316184137", genre: ["POETRY"] },
  { title: "Milk and Honey", author: "Rupi Kaur", publisher: "Andrews McMeel", isbn: "9781449474256", genre: ["POETRY"] },
  { title: "The Waste Land and Other Poems", author: "T.S. Eliot", publisher: "Mariner Books", isbn: "9780156948777", genre: ["POETRY"] },

  { title: "Hamlet", author: "William Shakespeare", publisher: "Simon & Schuster", isbn: "9780743477123", genre: ["DRAMA"] },
  { title: "A Streetcar Named Desire", author: "Tennessee Williams", publisher: "New Directions", isbn: "9780811216029", genre: ["DRAMA"] },
];

const userEmails = [
  "ravi.sharma@library.local",
  "meera.iyer@library.local",
  "arjun.verma@library.local",
  "priya.nair@library.local",
  "aditya.rao@library.local",
  "sneha.kulkarni@library.local",
  "karan.mehta@library.local",
  "divya.menon@library.local",
];

async function resolveUserId(email) {
  const res = await fetch(`${MEMBERS_SERVICE_URL}/api/v1/internal/user/by-email/${email}`, {
    headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET },
  });
  if (!res.ok) throw new Error(`Could not resolve user for ${email} (status ${res.status})`);
  const data = await res.json();
  return data.id;
}

async function main() {
  for (const b of books) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: {
        title: b.title,
        author: b.author,
        publisher: b.publisher,
        isbn: b.isbn,
        genre: b.genre,
        totalCopies: 5,
        availableCopies: 5,
        coverUrl: `https://covers.openlibrary.org/b/isbn/${b.isbn}-M.jpg`,
      },
    });
    console.log(`Seeded: ${b.title}`);
  }
  console.log(`Done. Seeded ${books.length} books.`);

  console.log("Resolving user IDs from members service...");
  const userIds = [];
  for (const email of userEmails) {
    userIds.push(await resolveUserId(email));
  }

  const seededBooks = await prisma.book.findMany({ take: 8, orderBy: { id: "asc" } });

  console.log("Seeding cart items...");
  for (let i = 0; i < userIds.length; i++) {
    const book = seededBooks[i % seededBooks.length];
    await prisma.cart_item.upsert({
      where: { userId_bookId: { userId: userIds[i], bookId: book.id } },
      update: {},
      create: { userId: userIds[i], bookId: book.id },
    });
  }
  console.log(`Seeded ${userIds.length} cart items.`);

  console.log("Seeding wishlist items...");
  for (let i = 0; i < userIds.length; i++) {
    const book = seededBooks[(i + 3) % seededBooks.length];
    await prisma.wishlist_item.upsert({
      where: { userId_bookId: { userId: userIds[i], bookId: book.id } },
      update: {},
      create: { userId: userIds[i], bookId: book.id },
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
