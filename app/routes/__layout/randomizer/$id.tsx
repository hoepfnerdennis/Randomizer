import type { DataFunctionArgs, LinksFunction } from "@remix-run/node";
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
  getValuesForRandomizer,
  removeValueFromRandomizer,
} from "~/database/queries.server";
import { isString } from "~/utils/guards";
import styleUrl from "~/styles/randomizer.css";
import { requireUser } from "~/auth/validation.server";

type LoaderData = {
  values: Value[];
  randomizer: Randomizer;
  userRole: User["role"];
};
type ActionData = {
  errors?: {
    name: string | undefined;
  };
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styleUrl },
];

const badRequest = (data: ActionData) => json(data, { status: 400 });

export async function loader({ request, params }: DataFunctionArgs) {
  const { id } = params;
  if (!isString(id)) {
    return redirect("/");
  }
  const user = await requireUser(request);

  const randomizer = await getRandomizer(id);
  if (!randomizer) {
    return redirect("/");
  }
  const values = await getValuesForRandomizer(id);
  return json({ randomizer, values, userRole: user?.role });
}

export async function action({ request, params }: DataFunctionArgs) {
  const user = await requireUser(request);
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
      if (user?.role !== "ADMIN") {
        return json(null, { status: 401 });
      }
      if (!isString(values.id)) {
        return badRequest({
          errors: { name: "Name needs to be a string value" },
        });
      }
      return removeValueFromRandomizer(values.id);
    case "delete":
      if (user?.role !== "ADMIN") {
        return json(null, { status: 401 });
      }
      await deleteRandomizer(id);
      return redirect("/");
    default:
      return null;
  }
}

function ValueItem({
  value,
  isAdmin,
}: {
  value: Partial<Value>;
  isAdmin: boolean;
}) {
  const fetcher = useFetcher();
  const isDeleting = fetcher.submission?.formData.get("id") === value.id;
  return (
    <li hidden={isDeleting} className="chip">
      {isAdmin ? (
        <fetcher.Form method="post" replace className="chip-container">
          <input type="hidden" name="id" value={value.id} />
          {value.name}
          {value.id && (
            <button type="submit" name="_action" value="remove">
              x
            </button>
          )}
        </fetcher.Form>
      ) : (
        value.name
      )}
    </li>
  );
}

export default function JokesIndexRoute() {
  const { values, randomizer, userRole } = useLoaderData<LoaderData>();
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

  const isAdmin = userRole === "ADMIN";

  return (
    <>
      <h2>
        👉 <em className="highlight">{randomizer.name}</em>
        {isAdmin && (
          <Form method="delete" className="delete">
            <button
              type="submit"
              name="_action"
              value="delete"
              className="button delete"
              title="Randomizer löschen"
            >
              Löschen
            </button>
          </Form>
        )}
      </h2>
      <ul>
        {values?.map((value) => (
          <ValueItem key={value.id} value={value} isAdmin={isAdmin} />
        ))}
      </ul>
      <Form method="post" replace ref={formRef} className="create">
        <fieldset>
          <input
            type="text"
            name="name"
            ref={inputRef}
            required
            minLength={1}
            maxLength={30}
            placeholder="..."
          />{" "}
          <button
            type="submit"
            name="_action"
            value="create"
            disabled={isAdding}
            className="button"
          >
            Hinzufügen
          </button>
        </fieldset>
      </Form>
      {/* <button className="button start" onClick={() => console.log("click")}>
        Start
      </button> */}
    </>
  );
}
