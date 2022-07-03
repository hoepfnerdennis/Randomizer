import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { login } from "~/auth/authentication.server";
import Button from "~/components/Button";
import InputField from "~/components/InputField";
import LoginContainer from "~/components/LoginContainer";
import { db } from "~/database/db.server";
import { isString } from "~/utils/guards";
import { createLogger } from "~/utils/logger.server";
import { createUserSession } from "~/utils/user-session.server";
import { validatePassword, validateUsername } from "~/utils/validation.server";

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username?: string;
    password?: string;
    confirm_password?: string;
  };
  fields?: {
    username?: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");
  const confirm_password = form.get("confirm_password");
  const redirectTo = form.get("redirectTo") || "/";
  if (
    !isString(username) ||
    !isString(password) ||
    !isString(confirm_password) ||
    !isString(redirectTo)
  )
    return badRequest({ formError: "Eingaben nicht akzeptiert" });
  const usernameAlreadyExists = await db.user.findUnique({
    where: { username },
    select: { username: true },
  });
  if (usernameAlreadyExists)
    return badRequest({
      fieldErrors: { username: "Benutzername bereits vergeben" },
    });
  const fields = { username };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });

  if (password !== confirm_password)
    return badRequest({
      fieldErrors: { confirm_password: "Passwörter müssen übereinstimmen" },
    });
  const passwordHash = await bcrypt.hash(password, 10);
  const { id } = await db.user.create({ data: { username, passwordHash } });
  return createUserSession(id, redirectTo);
};

export default function Register() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  return (
    <LoginContainer error={actionData?.formError}>
      <Form method="post" className="flex flex-col space-y-2">
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get("redirectTo") ?? undefined}
        />
        <InputField
          type="text"
          name="username"
          label="Benutzername"
          placeholder="Benutzername"
          required
          minLength={3}
          error={actionData?.fieldErrors?.username}
          defaultValue={actionData?.fields?.username}
        />
        <InputField
          type="password"
          name="password"
          label="Passwort"
          placeholder="Passwort"
          required
          minLength={5}
          error={actionData?.fieldErrors?.password}
        />
        <InputField
          type="password"
          name="confirm_password"
          label="Passwort wiederholen"
          placeholder="Passwort wiederholen"
          required
          minLength={6}
          error={actionData?.fieldErrors?.confirm_password}
        />
        <Button type="submit">Registrieren</Button>
      </Form>
    </LoginContainer>
  );
}
