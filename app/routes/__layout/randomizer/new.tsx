import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { createRandomizer } from "~/database/queries.server";
import { isString } from "~/utils/guards";
import stylesUrl from "~/styles/new.css";
import { requireUserRole } from "~/auth/validation.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserRole("ADMIN", request);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserRole("ADMIN", request);
  const formData = await request.formData();
  const { name } = Object.fromEntries(formData);

  if (!isString(name)) {
    return null;
  }
  const randomizer = await createRandomizer(name);
  return redirect(`/randomizer/${randomizer.id}`);
};

export default function NewRandomizer() {
  return (
    <Form method="post">
      <label htmlFor="new-input">Erstelle einen neuen Zufallsgenerator</label>
      <fieldset>
        <input
          id="new-input"
          type="text"
          name="name"
          placeholder="..."
          required
          minLength={5}
          maxLength={50}
        />
        <button type="submit" className="button">
          Erstellen
        </button>
      </fieldset>
    </Form>
  );
}
