import type { ActionFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { createRandomizer } from "~/database/queries.server";
import { isString } from "~/utils/guards";
import { createReadOnlyRandomizerSession } from "~/utils/read-only-session.server";

function generatePassword(length: number) {
  const CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
  return new Array(length)
    .fill("")
    .map(() => CHARS.charAt(Math.floor(Math.random() * CHARS.length + 1)))
    .join("");
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  if (!isString(name)) return null;
  const password = generatePassword(8);
  const randomizer = await createRandomizer(name, password);
  return createReadOnlyRandomizerSession(
    randomizer.id,
    `/randomizer/${randomizer.id}`
  );
};

export default function NewRandomizer() {
  return (
    <Form method="post" className="flex flex-col items-center">
      <label htmlFor="new-input" className="mb-2">
        Erstelle einen neuen Zufallsgenerator
      </label>
      <fieldset className="space-x-2">
        <input
          id="new-input"
          type="text"
          name="name"
          placeholder="Name"
          required
          minLength={5}
          maxLength={50}
          className="p-2 border border-solid border-purple-700 rounded"
        />
        <button
          type="submit"
          className="px-8 py-2 bg-purple-700 text-white hover:bg-purple-900 rounded"
        >
          Erstellen
        </button>
      </fieldset>
    </Form>
  );
}
