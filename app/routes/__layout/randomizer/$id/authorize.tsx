import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { login } from "~/auth/authentication.server";
import { getRandomizer } from "~/database/queries.server";
import { isString } from "~/utils/guards";
import { createReadOnlyRandomizerSession } from "~/utils/read-only-session.server";

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

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  if (!isString(id)) return redirect("/");
  const randomizer = await getRandomizer(id);
  if (!randomizer) return redirect("/");
  return json({ randomizer });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  if (!isString(id)) return redirect("/");
  const form = await request.formData();
  const password = form.get("password");
  if (!isString(password))
    return badRequest({ formError: "Eingaben nicht akzeptiert" });
  const randomizer = await getRandomizer(id);
  if (randomizer?.password !== password)
    return badRequest({ formError: "Eingaben nicht akzeptiert" });
  return createReadOnlyRandomizerSession(id, `/randomizer/${id}`);
};

export default function Authorize() {
  const { randomizer } = useLoaderData();
  const actionData = useActionData<ActionData>();
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl mb-4">{randomizer?.name}</h2>
      <Form method="post" className="space-x-2">
        <input
          type="password"
          name="password"
          placeholder="Passwort"
          required
          aria-invalid={Boolean(actionData?.formError)}
          aria-errormessage={actionData?.formError ? "form-error" : undefined}
          className="p-2 border border-solid border-purple-700 rounded"
        />
        <button
          type="submit"
          className="px-8 py-2 bg-purple-700 text-white hover:bg-purple-900 rounded"
        >
          Anmelden
        </button>
      </Form>
      {actionData?.formError ? (
        <p id="form-error" role="alert">
          {actionData.formError}
        </p>
      ) : null}
    </div>
  );
}
