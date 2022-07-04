import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();

async function seed() {
  const admin = await db.user.create({
    data: { username: "admin", passwordHash: bcrypt.hashSync("12345") },
  });

  const randomizer = await db.randomizer.create({
    data: {
      name: "Was soll ich heute essen?",
      password: "12345",
    },
  });

  await db.randomizer.update({
    where: { id: randomizer.id },
    data: {
      managers: {
        connectOrCreate: {
          create: { userId: admin.id },
          where: {
            randomizerId_userId: {
              randomizerId: randomizer.id,
              userId: admin.id,
            },
          },
        },
      },
    },
  });

  await db.value.create({
    data: { name: "Pizza", randomizerId: randomizer.id, userId: admin.id },
  });
  await db.value.create({
    data: { name: "Pasta", randomizerId: randomizer.id, userId: admin.id },
  });
  await db.value.create({
    data: { name: "Pommes", randomizerId: randomizer.id, userId: admin.id },
  });
}

seed();
