import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { login } from "~/auth/authentication.server";
import { isString } from "~/utils/guards";

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
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="w-96 bg-white p-8 rounded-2xl">
        <h1 className="text-purple-700 text-4xl text-center mb-8">
          Randomizer 🎲
        </h1>
        <Form method="post" className="flex flex-col space-y-2">
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get("redirectTo") ?? undefined}
          />
          <div className="flex flex-col">
            <label htmlFor="username-input" className="text-xs">
              Benutzername
            </label>
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
              className="p-2 border border-solid border-purple-700 rounded"
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
          <div className="flex flex-col">
            <label htmlFor="password-input" className="text-xs">
              Passwort
            </label>
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
              className="p-2 border border-solid border-purple-700 rounded"
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
          <button
            type="submit"
            className="px-8 py-2 bg-purple-700 text-white hover:bg-purple-900 rounded"
          >
            Anmelden
          </button>
        </Form>
      </div>
    </main>
  );
}
