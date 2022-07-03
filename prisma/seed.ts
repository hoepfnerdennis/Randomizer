import type { Value } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();

function values(userId: string, randomizerId: string, length: number): Value[] {
  return new Array(length).fill("").map((_, i) => ({
    id: `${randomizerId}-v${i + 1}`,
    name: `Value ${i + 1}`,
    randomizerId,
    userId,
  }));
}

const randomizers = [
  {
    id: "r1",
    name: "Randomizer 1",
    password: "123456",
  },
  {
    id: "r2",
    name: "Randomizer 2",
    password: "123456",
  },
  {
    id: "r3",
    name: "Randomizer 3",
    password: "123456",
  },
];

const users = [
  {
    id: "manager",
    username: "manager",
    passwordHash: bcrypt.hashSync("123456"),
  },
  {
    id: "admin",
    username: "admin",
    passwordHash: bcrypt.hashSync("123456"),
  },
];

const userRandomizers = [
  { randomizerId: randomizers[0].id, userId: users[0].id },
  { randomizerId: randomizers[1].id, userId: users[1].id },
  { randomizerId: randomizers[2].id, userId: users[0].id },
];

async function seed() {
  randomizers.forEach(async (randomizer) => {
    await db.randomizer.create({ data: randomizer });
    values(
      userRandomizers.find((ur) => ur.randomizerId === randomizer.id)?.userId!!,
      randomizer.id,
      6
    ).forEach(async (value) => {
      await db.value.create({ data: value });
    });
  });

  users.forEach(async (user) => {
    await db.user.create({
      data: {
        ...user,
        Randomizers: {
          create: {
            randomizer: {
              connect: {
                id: userRandomizers.find((ur) => ur.userId === user.id)
                  ?.randomizerId,
              },
            },
          },
        },
      },
    });
  });

  // userRandomizers.forEach(async (userRandomizer) => {
  //   await db.userRandomizer.create({ data: userRandomizer });
  // });

  // userRandomizers.forEach(async (userRandomizer) => {
  //   await db.user.update({
  //     where: { id: userRandomizer.userId },
  //     data: {
  //       randomizers: {
  //         connectOrCreate: {
  //           create: { randomizerId: userRandomizer.randomizerId },
  //           where: { randomizerId_userId: userRandomizer },
  //         },
  //       },
  //     },
  //   });
  // });
}

seed();
