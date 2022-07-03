import { User } from "@prisma/client";
import { json } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { db } from "~/database/db.server";
// import { getUserByUsername } from "~/database/queries.server";
import { isString } from "~/utils/guards";
import { createLogger } from "~/utils/logger.server";
import {
  createUserSession,
  destroyUserSession,
} from "~/utils/user-session.server";
import { validatePassword, validateUsername } from "~/utils/validation.server";

type LoginCredentials = {
  username: string;
  password: string;
  redirectTo?: string;
};

type UpdateCredentials = {
  user: User;
  password: string;
  confirm_password: string;
};

type LoginData = {
  formError?: string;
  fieldErrors?: {
    username?: string;
    password?: string;
  };
  fields?: {
    username?: string;
    password?: string;
  };
};

const badRequest = (data: LoginData) => json(data, { status: 400 });

export async function login({
  username,
  password,
  redirectTo = "/",
}: LoginCredentials) {
  if (!isString(username) || !isString(password) || !isString(redirectTo)) {
    return badRequest({ formError: "Eingaben nicht akzeptiert" });
  }

  const fields = { username, password };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  let user; // = await getUserByUsername(username);
  if (!user) {
    return badRequest({
      fields,
      formError: "Benutzername und/oder Passwort nicht korrekt",
    });
  }

  const isCorrectPassword = undefined; // = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) {
    return badRequest({
      fields,
      formError: "Benutzername und/oder Passwort nicht korrekt",
    });
  }

  return createUserSession(user.id, redirectTo);
}

export async function updatePassword({
  user,
  password,
  confirm_password,
}: UpdateCredentials) {
  if (!isString(password) || !isString(confirm_password)) {
    return badRequest({ formError: "Eingaben nicht akzeptiert" });
  }

  if (password !== confirm_password) {
    return badRequest({ formError: "Passwörter müssen übereinstimmen" });
  }

  const newPasswordHash = await bcrypt.hash(password, 10);
  const isConfirmedPasswordCorrect = await bcrypt.compare(
    confirm_password,
    newPasswordHash
  );

  if (!isConfirmedPasswordCorrect) {
    return badRequest({ formError: "Passwörter müssen übereinstimmen" });
  }

  // await updateUserById(user.id, { passwordHash: newPasswordHash });

  return json({ formSuccess: "Passwort aktualisiert" }, { status: 201 });
}

export async function logout(request: Request) {
  return destroyUserSession(request);
}
