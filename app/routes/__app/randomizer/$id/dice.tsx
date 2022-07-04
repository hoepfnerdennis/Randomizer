import type {
  ActionFunction,
  DataFunctionArgs,
  LinksFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import Button from "~/components/Button";
import { db } from "~/database/db.server";
import { isString } from "~/utils/guards";
import { requireReadOnlyRandomizerId } from "~/utils/read-only-cookie.server";
import { getUserId } from "~/utils/user-session.server";
import styleUrl from "~/styles/dice.css";
import { useEffect } from "react";
import Dices from "~/components/Dices";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styleUrl },
];

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
      selectedValue: true,
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

  const isLoggedIn = Boolean(userId);
  return json({
    randomizer,
    isManager,
    isLoggedIn,
    userId,
    selectedValue: randomizer.selectedValue,
  });
}

export const action: ActionFunction = async ({ params, request }) => {
  const { id } = params;
  const formData = await request.formData();
  const _action = formData.get("_action");
  if (!isString(id)) return null;
  const userId = await getUserId(request);
  const randomizer = await db.randomizer.findUnique({
    where: { id },
    select: { managers: true, values: true, name: true },
  });
  const isManager = Boolean(
    randomizer?.managers.find((manager) => manager.userId === userId)
  );
  if (!isManager) return null;
  const start = Number(formData.get("start"));
  switch (_action) {
    case "reset":
      await db.randomizer.update({
        where: { id },
        data: { selectedValue: { disconnect: true } },
      });
      return null;
    case "start":
      return json({ start });
    case "stop":
      const diff = (Date.now() - start) % (randomizer?.values.length ?? 1);
      const selectedValue = randomizer?.values[diff];
      if (!selectedValue) {
        return null;
      }
      const newRandomizer = await db.randomizer.update({
        where: { id },
        data: {
          selectedValue: {
            connect: {
              id: selectedValue.id,
            },
          },
        },
        select: {
          selectedValue: true,
        },
      });
      return json({ selected: newRandomizer.selectedValue });
    default:
      return null;
  }
};

export default function Dice() {
  const { randomizer, selectedValue, isManager } = useLoaderData();
  const actionData = useActionData();

  return (
    <div className="space-y-4">
      <Link
        className="text-purple-700 hover:underline"
        to={`/randomizer/${randomizer.id}`}
      >
        {"< Zurück"}
      </Link>
      <h2 className="text-2xl">{randomizer.name}</h2>
      {selectedValue?.name ? (
        <div className="h-56 flex flex-col items-center justify-center">
          <h3 className="text-8xl text-center text-purple-700">
            {selectedValue?.name}
          </h3>
        </div>
      ) : !selectedValue && actionData?.start ? (
        <div className="h-56">
          <Dices />
        </div>
      ) : (
        <div className="h-56 flex flex-col items-center justify-center">
          {isManager
            ? "Wirf die Würfel und lass das Schicksal entscheiden..."
            : "Frage die Wahrsagerin deines Vertrauens, ob sie dir dein Schicksal vorhersagen kann"}
        </div>
      )}
      {isManager && (
        <Form method="post" replace className="flex flex-col items-stretch">
          <input
            type="hidden"
            name="start"
            value={actionData?.start || Date.now()}
          />
          <Button
            type="submit"
            name="_action"
            value={
              selectedValue ? "reset" : actionData?.start ? "stop" : "start"
            }
          >
            {selectedValue
              ? "Karten neu mischen"
              : actionData?.start
              ? "Anhalten"
              : "Würfel werfen"}
          </Button>
        </Form>
      )}
    </div>
  );
}
