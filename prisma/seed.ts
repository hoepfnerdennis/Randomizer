import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  const { id } = await db.randomizer.create({ data: { name: "Pimmel" } });
  await db.value.createMany({
    data: [
      { name: "1", randomizerId: id },
      { name: "2", randomizerId: id },
      { name: "3", randomizerId: id },
    ],
  });
  await db.user.createMany({
    data: [
      {
        username: "admin",
        role: "ADMIN",
        // this is a hashed version of "twixrox"
        passwordHash:
          "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
      },
      {
        username: "user",
        role: "USER",
        // this is a hashed version of "twixrox"
        passwordHash:
          "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
      },
    ],
  });
}

seed();
