import type { DataFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { Randomizer, User, UserRandomizer, Value } from "@prisma/client";
import { useEffect, useRef } from "react";
import { isString } from "~/utils/guards";
import { requireReadOnlyRandomizerId } from "~/utils/read-only-cookie.server";
import { notify } from "~/utils/notification.client";
import { db } from "~/database/db.server";
import { getUserId } from "~/utils/user-session.server";
import InputField from "~/components/InputField";
import Button from "~/components/Button";

type LoaderData = {
  randomizer: Randomizer & { values: Value[]; managers: UserRandomizer[] };
  isManager: boolean;
  isLoggedIn: boolean;
  userId: string | null;
  users?: Pick<User, "id" | "username">[];
};
type ActionData = {
  errors?: {
    name?: string;
    manager?: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export async function loader({ request, params }: DataFunctionArgs) {
  const { id } = params;
  if (!isString(id)) return redirect("/");
  const userId = await getUserId(request);
  const randomizer = await db.randomizer.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      password: true,
      values: true,
      managers: true,
    },
  });
  if (!randomizer) return redirect("/");
  const isManager = Boolean(
    randomizer.managers.find((manager) => manager.userId === userId)
  );
  if (!isManager)
    await requireReadOnlyRandomizerId(
      id,
      request,
      `/randomizer/${id}/authorize`
    );

  let users: Pick<User, "id" | "username">[] | undefined = undefined;
  if (isManager) {
    users = await db.user.findMany({ select: { id: true, username: true } });
  }
  const isLoggedIn = Boolean(userId);
  return json({ randomizer, isManager, isLoggedIn, userId, users });
}

export async function action({ request, params }: DataFunctionArgs) {
  const { id } = params;
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (!isString(id)) {
    return null;
  }
  const userId = await getUserId(request);
  let isManager = false;
  switch (_action) {
    case "create":
      if (!isString(values.name) || !isString(userId)) {
        return badRequest({
          errors: { name: "Name needs to be a string value" },
        });
      }
      return db.value.create({
        data: { name: values.name, randomizerId: id, userId },
      });
    case "remove":
      const removeRandomizer = await db.randomizer.findUnique({
        where: { id },
        select: { managers: true },
      });
      isManager = Boolean(
        removeRandomizer?.managers.find((manager) => manager.userId === userId)
      );
      if (
        !isString(values.id) ||
        !isString(userId) ||
        (!isManager && values.userId !== userId)
      ) {
        return badRequest({
          errors: { name: "Name needs to be a string value" },
        });
      }
      return db.value.delete({ where: { id: values.id } });
    case "delete":
      const deleteRandomizer = await db.randomizer.findUnique({
        where: { id },
        select: { managers: true },
      });
      isManager = Boolean(
        deleteRandomizer?.managers.find((manager) => manager.userId === userId)
      );
      if (!isString(userId) || !isManager) {
        return badRequest({
          errors: { name: "Name needs to be a string value" },
        });
      }
      await db.userRandomizer.deleteMany({
        where: { randomizer: { id } },
      });
      await db.randomizer.delete({
        where: { id },
      });
      return redirect("/");
    case "managers":
      const newManagers = formData.getAll("managers").map(String);
      if (!isString(userId) || newManagers.includes(userId)) {
        return badRequest({
          errors: { manager: "kannsch dich ned selber löschen" },
        });
      }
      const managersRandomizer = await db.randomizer.findUnique({
        where: { id },
        select: { managers: true },
      });

      const managersToRemove = managersRandomizer?.managers
        .filter(
          (manager) =>
            manager.userId !== userId && !newManagers.includes(manager.userId)
        )
        .map((mr) => mr.userId);

      const managersToSet = newManagers.filter((newManager) =>
        managersRandomizer?.managers.find(
          (manager) => manager.userId !== newManager
        )
      );

      if (managersToRemove?.length) {
        await db.userRandomizer.deleteMany({
          where: {
            randomizerId: id,
            OR: managersToRemove.map((managerToRemove) => ({
              userId: managerToRemove,
            })),
          },
        });
      }

      if (managersToSet?.length) {
        managersToSet.forEach(async (managerToSet) => {
          await db.userRandomizer.create({
            data: { randomizerId: id, userId: managerToSet },
          });
        });
      }

      return null;
    default:
      return null;
  }
}

function ValueItem({ value }: { value: Partial<Value> }) {
  const { isManager, userId } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const isDeleting = fetcher.submission?.formData.get("id") === value.id;
  return (
    <li hidden={isDeleting}>
      <fetcher.Form method="post" replace className="space-x-2">
        <input type="hidden" name="id" value={value.id} />
        <input type="hidden" name="userId" value={value.userId} />
        {value.name}
        {value.id && (isManager || value.userId === userId) && (
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
  const { randomizer, isLoggedIn, isManager, users, userId } =
    useLoaderData<LoaderData>();
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
        <div className="flex items-stretch space-x-2 my-2">
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
          {isManager && (
            <Form method="delete" className="flex">
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
          )}
        </div>
      </div>
      {isLoggedIn && (
        <Form
          method="post"
          replace
          ref={formRef}
          className="flex space-x-2 mb-4"
        >
          <InputField
            type="text"
            name="name"
            ref={inputRef}
            required
            minLength={1}
            maxLength={30}
            placeholder="Neue Option"
          />
          <Button
            type="submit"
            name="_action"
            value="create"
            disabled={isAdding}
          >
            Hinzufügen
          </Button>
        </Form>
      )}
      <ul className="space-y-2 mb-4 flex flex-col items-start">
        {randomizer?.values?.map((value) => (
          <ValueItem key={value.id} value={value} />
        ))}
      </ul>
      <Form method="post" action="dice">
        <input type="hidden" name="start" value={Date.now()} />
        <Button type="submit" name="_action" value="start">
          Würfel
        </Button>
      </Form>
      {isManager && users && (
        <details>
          <summary className="mt-2 cursor-pointer marker:text-purple-700">
            Randomizer-Manager
          </summary>
          <Form method="post">
            <fieldset className="flex flex-col gap-2">
              {users.map((user) => (
                <label key={user.id} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    name="managers"
                    value={user.username}
                    disabled={user.id === userId}
                    defaultChecked={Boolean(
                      randomizer.managers.find(
                        (manager) => manager.userId === user.id
                      )
                    )}
                    className="disabled:text-gray-500"
                  />
                  {user.username}
                </label>
              ))}
            </fieldset>
            <Button type="submit" name="_action" value="managers">
              submit
            </Button>
          </Form>
        </details>
      )}
    </>
  );
}
