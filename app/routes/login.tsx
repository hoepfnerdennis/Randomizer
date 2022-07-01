import type { ActionFunction, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { login } from "~/auth/authentication.server";
import stylesUrl from "~/styles/login.css";
import { isString } from "~/utils/guards";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    username: string;
    password: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");
  const redirectTo = form.get("redirectTo") || "/";

  if (!isString(username) || !isString(password) || !isString(redirectTo)) {
    return badRequest({ formError: "Eingaben nicht akzeptiert" });
  }

  return login({ username, password, redirectTo });
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  return (
    <main>
      <h1 className="heading">Randomizer 🎲</h1>
      <Form method="post">
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get("redirectTo") ?? undefined}
        />
        <div className="input-field">
          <label htmlFor="username-input">Benutzername</label>
          <input
            type="text"
            id="username-input"
            name="username"
            placeholder="Benutzername"
            required
            minLength={3}
            defaultValue={actionData?.fields?.username}
            aria-invalid={Boolean(actionData?.fieldErrors?.username)}
            aria-errormessage={
              actionData?.fieldErrors?.username ? "username-error" : undefined
            }
          />
          {actionData?.fieldErrors?.username ? (
            <p
              className="form-validation-error"
              role="alert"
              id="username-error"
            >
              {actionData.fieldErrors.username}
            </p>
          ) : null}
        </div>
        <div className="input-field">
          <label htmlFor="password-input">Passwort</label>
          <input
            id="password-input"
            name="password"
            type="password"
            placeholder="Passwort"
            required
            minLength={6}
            aria-invalid={
              Boolean(actionData?.fieldErrors?.password) || undefined
            }
            aria-errormessage={
              actionData?.fieldErrors?.password ? "password-error" : undefined
            }
          />
          {actionData?.fieldErrors?.password ? (
            <p
              className="form-validation-error"
              role="alert"
              id="password-error"
            >
              {actionData.fieldErrors.password}
            </p>
          ) : null}
        </div>
        {actionData?.formError ? (
          <p className="form-validation-error" role="alert">
            {actionData.formError}
          </p>
        ) : null}
        <button type="submit" className="button">
          Abschicken
        </button>
      </Form>
    </main>
  );
}
