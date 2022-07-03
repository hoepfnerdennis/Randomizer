import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import Button from "~/components/Button";
import InputField from "~/components/InputField";
import { db } from "~/database/db.server";
import { isString } from "~/utils/guards";
import { createUserSession } from "~/utils/user-session.server";
import { validatePassword, validateUsername } from "~/utils/validation.server";

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    username: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");
  const redirectTo = form.get("redirectTo") || "/";
  if (!isString(username) || !isString(password) || !isString(redirectTo))
    return badRequest({ formError: "Eingaben nicht akzeptiert" });
  const fields = { username };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });
  let user = await db.user.findUnique({
    where: { username },
    select: { id: true, passwordHash: true },
  });
  if (!user)
    return badRequest({
      fields,
      formError: "Benutzername und/oder Passwort nicht korrekt",
    });
  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword)
    return badRequest({
      fields,
      formError: "Benutzername und/oder Passwort nicht korrekt",
    });
  return createUserSession(user.id, redirectTo);
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  return (
    <>
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
        <Button type="submit">Anmelden</Button>
      </Form>
      {actionData?.formError && (
        <p className="text-base text-red-500 mt-1" role="alert">
          {actionData.formError}
        </p>
      )}
    </>
  );
}
