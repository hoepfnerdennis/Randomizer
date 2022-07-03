import type { Randomizer, Value } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

function values(randomizerId: string, length: number): Value[] {
  return new Array(length).fill("").map((_, i) => ({
    id: `${randomizerId}-v${i + 1}`,
    name: `Value ${i + 1}`,
    randomizerId,
  }));
}

function randomizers(length: number): Randomizer[] {
  return new Array(length).fill("").map((_, i) => ({
    id: `r${i + 1}`,
    name: `Randomizer ${i + 1}`,
    password: "123456",
  }));
}

async function seed() {
  randomizers(3).forEach(async (r) => {
    await db.randomizer.create({ data: r });
    values(r.id, 6).forEach(async (v) => {
      await db.value.create({ data: v });
    });
  });
}

seed();
