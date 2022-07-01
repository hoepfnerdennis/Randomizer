import type { Randomizer, User, Value } from "@prisma/client";
import { db } from "./db.server";

const mockRandomizers: Randomizer[] = [
  { id: "r1", name: "randomizer 1" },
  { id: "r2", name: "randomizer 2" },
  { id: "r3", name: "randomizer 3" },
  { id: "r4", name: "randomizer 4" },
  { id: "r5", name: "randomizer 5" },
];
const mockValues: Value[] = [
  { id: "v1", name: "name 1", randomizerId: "r1" },
  { id: "v2", name: "name 2", randomizerId: "r1" },
  { id: "v3", name: "name 3", randomizerId: "r1" },
  { id: "v4", name: "name 4", randomizerId: "r1" },
  { id: "v5", name: "name 5", randomizerId: "r2" },
  { id: "v6", name: "name 6", randomizerId: "r2" },
  { id: "v7", name: "name 7", randomizerId: "r2" },
  { id: "v8", name: "name 8", randomizerId: "r2" },
  { id: "v9", name: "name 9", randomizerId: "r3" },
  { id: "v10", name: "name 10", randomizerId: "r3" },
  { id: "v11", name: "name 11", randomizerId: "r3" },
  { id: "v12", name: "name 12", randomizerId: "r3" },
  { id: "v13", name: "name 13", randomizerId: "r4" },
  { id: "v14", name: "name 14", randomizerId: "r4" },
  { id: "v15", name: "name 15", randomizerId: "r4" },
  { id: "v16", name: "name 16", randomizerId: "r4" },
  { id: "v17", name: "name 17", randomizerId: "r5" },
  { id: "v18", name: "name 18", randomizerId: "r5" },
  { id: "v19", name: "name 19", randomizerId: "r5" },
  { id: "v20", name: "name 20", randomizerId: "r5" },
];

const mockUsers: User[] = [
  {
    id: "u1",
    username: "admin",
    role: "ADMIN",
    passwordHash:
      "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
  },
  {
    id: "u2",
    username: "user",
    role: "USER",
    passwordHash:
      "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
  },
];

export async function createRandomizer(name: Randomizer["name"]) {
  //   return db.randomizer.create({ data: { name } });
  return mockRandomizers[0];
}
export async function getRandomizer(id: Randomizer["id"]) {
  //   return db.randomizer.findUnique({ where: { id } });
  return mockRandomizers.find((randomizer) => randomizer.id === id);
}
export async function getRandomizers() {
  //   return db.randomizer.findMany();
  return mockRandomizers;
}
export async function deleteRandomizer(id: Randomizer["id"]) {
  //   return db.randomizer.delete({ where: { id } });
  return null;
}

export async function addValueToRandomizer(
  randomizerId: Value["randomizerId"],
  name: Value["name"]
) {
  //   return db.value.create({ data: { name, randomizerId } });
  return mockValues.push({
    id: mockValues[mockValues.length - 1].id + "1",
    name,
    randomizerId,
  });
}
export async function getValuesForRandomizer(id: Randomizer["id"]) {
  //   return db.randomizer.findUnique({ where: { id } }).values()
  return mockValues.filter((value) => value.randomizerId === id);
}
export async function removeValueFromRandomizer(id: Value["id"]) {
  //   return db.value.delete({ where: { id } });
  return null;
}

export async function getUserByUsername(username: User["username"]) {
  // return db.user.findUnique({
  //   where: { username },
  //   select: { id: true, role: true, username: true },
  // });
  return mockUsers.find((user) => user.username === username);
}

export async function getUserById(id: User["id"]) {
  // return db.user.findUnique({
  //   where: { id },
  //   select: { id: true, role: true, username: true },
  // });
  return mockUsers.find((user) => user.id === id);
}

export async function updateUserById(id: User["id"], user: Partial<User>) {
  // return db.user.update({ where: { id }, data: {} });
  return mockUsers.find((user) => user.id === id);
}
