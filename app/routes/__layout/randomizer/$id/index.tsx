import type { DataFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { Randomizer, User, Value } from "@prisma/client";
import { useEffect, useRef } from "react";
import {
  addValueToRandomizer,
  deleteRandomizer,
  getRandomizer,
  removeValueFromRandomizer,
} from "~/database/queries.server";
import { isString } from "~/utils/guards";
import { requireUser } from "~/auth/validation.server";
import { requireReadOnlyRandomizerId } from "~/utils/read-only-session.server";
import { notify } from "~/utils/notification.client";

type LoaderData = {
  randomizer: Randomizer & { values: Value[] };
};
type ActionData = {
  errors?: {
    name: string | undefined;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export async function loader({ request, params }: DataFunctionArgs) {
  const { id } = params;
  if (!isString(id)) return redirect("/");
  await requireReadOnlyRandomizerId(id, request, `/randomizer/${id}/authorize`);
  const randomizer = await getRandomizer(id);
  if (!randomizer) return redirect("/");
  return json({ randomizer });
}

export async function action({ request, params }: DataFunctionArgs) {
  const { id } = params;
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (!isString(id)) {
    return null;
  }

  switch (_action) {
    case "create":
      if (!isString(values.name)) {
        return badRequest({
          errors: { name: "Name needs to be a string value" },
        });
      }
      return addValueToRandomizer(id, values.name);
    case "remove":
      if (!isString(values.id)) {
        return badRequest({
          errors: { name: "Name needs to be a string value" },
        });
      }
      return removeValueFromRandomizer(values.id);
    case "delete":
      await deleteRandomizer(id);
      return redirect("/");
    default:
      return null;
  }
}

function ValueItem({ value }: { value: Partial<Value> }) {
  const fetcher = useFetcher();
  const isDeleting = fetcher.submission?.formData.get("id") === value.id;
  return (
    <li hidden={isDeleting}>
      <fetcher.Form method="post" replace className="space-x-2">
        <input type="hidden" name="id" value={value.id} />
        {value.name}
        {value.id && (
          <button
            type="submit"
            name="_action"
            value="remove"
            className="text-xs underline hover:text-purple-700"
          >
            entfernen
          </button>
        )}
      </fetcher.Form>
    </li>
  );
}

export default function JokesIndexRoute() {
  const { randomizer } = useLoaderData<LoaderData>();
  const transition = useTransition();
  const isAdding =
    transition.state === "submitting" &&
    transition.submission.formData.get("_action") === "create";

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [isAdding]);

  return (
    <>
      <div className="flex w-full justify-between mb-4">
        <h2 className="text-2xl">{randomizer.name}</h2>
        <div className="flex items-end space-x-2">
          <input
            type="text"
            value={randomizer.password}
            className="px-2 py-0 border border-solid border-purple-700 rounded text-xs"
            readOnly
            onClick={(e) => {
              e.currentTarget.select();
              navigator.clipboard.writeText(randomizer.password);
              notify("Passwort kopiert!");
            }}
          />
          <Form method="delete">
            <button
              type="submit"
              name="_action"
              value="delete"
              className="bg-red-600 px-4 py-1 rounded text-white hover:bg-red-900 text-xs"
              title="Randomizer löschen"
            >
              Löschen
            </button>
          </Form>
        </div>
      </div>
      <Form method="post" replace ref={formRef} className="flex space-x-2 mb-4">
        <input
          type="text"
          name="name"
          ref={inputRef}
          required
          minLength={1}
          maxLength={30}
          placeholder="Neue Option"
          className="p-2 border border-solid border-purple-700 rounded"
        />
        <button
          type="submit"
          name="_action"
          value="create"
          disabled={isAdding}
          className="px-8 py-2 bg-purple-700 text-white hover:bg-purple-900 rounded"
        >
          Hinzufügen
        </button>
      </Form>
      <ul className="space-y-2 mb-4 flex flex-col items-start">
        {randomizer?.values?.map((value) => (
          <ValueItem key={value.id} value={value} />
        ))}
      </ul>

      {/* <button className="button start" onClick={() => console.log("click")}>
        Start
      </button> */}
    </>
  );
}
