import type { Role } from "@prisma/client";
import { redirect } from "@remix-run/node";
import { getUserById } from "~/database/queries.server";
import { getUserId, requireUserId } from "~/utils/session.server";
import { logout } from "./authentication.server";

export async function requireUserRole(role: Role, request: Request) {
  const user = await requireUser(request);
  if (user?.role !== role) {
    throw redirect("/");
  }
}

export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await requireUserId(request, redirectTo);
  try {
    const user = await getUserById(userId);
    return user;
  } catch {
    throw logout(request);
  }
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await getUserById(userId);
    return user;
  } catch {
    throw logout(request);
  }
}
