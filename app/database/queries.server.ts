import type { Randomizer, Value } from "@prisma/client";
import { createLogger } from "~/utils/logger.server";
import { db } from "./db.server";

const LOG = createLogger("db");

export async function createRandomizer(
  name: Randomizer["name"],
  password: Randomizer["password"]
  // userId: Randomizer["userId"]
) {
  LOG.verbose(`createRandomizer ${name}`);
  return db.randomizer.create({
    data: {
      name,
      password,
      // manager: { connect: { id: userId } }
    },
  });
}
export async function getRandomizer(id: Randomizer["id"]) {
  LOG.verbose(`getRandomizer ${id}`);
  return db.randomizer.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      values: true,
      // manager: true,
      password: true,
    },
  });
}
export async function getRandomizers() {
  LOG.verbose(`getRandomizers`);
  return db.randomizer.findMany({
    select: {
      id: true,
      name: true,
      // manager: true,
    },
  });
}
export async function deleteRandomizer(id: Randomizer["id"]) {
  LOG.verbose(`deleteRandomizer ${id}`);
  return db.randomizer.delete({ where: { id } });
}

export async function addValueToRandomizer(
  randomizerId: Value["randomizerId"],
  name: Value["name"]
) {
  LOG.verbose(`addValueToRandomizer ${randomizerId} ${name}`);
  return db.value.create({ data: { name, randomizerId } });
}
export async function removeValueFromRandomizer(id: Value["id"]) {
  LOG.verbose(`removeValueFromRandomizer ${id}`);
  return db.value.delete({ where: { id } });
}

// export async function getUserByUsername(username: User["username"]) {
//   return db.user.findUnique({
//     where: { username },
//     select: { id: true, username: true },
//   });
// }

// export async function getUserById(id: User["id"]) {
//   return db.user.findUnique({
//     where: { id },
//     select: { id: true, username: true },
//   });
// }
