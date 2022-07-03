import type { Prisma, Randomizer } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/database/db.server";
import { getReadOnlyRandomizerSession } from "~/utils/read-only-cookie.server";
import { getUserId } from "~/utils/user-session.server";

type LoaderData = { randomizers: Randomizer[]; isLoggedIn: boolean };

export const loader: LoaderFunction = async ({ request }) => {
  const ids = await getReadOnlyRandomizerSession(request);
  const userId = await getUserId(request);

  const randomizerFilter: Prisma.RandomizerWhereInput["OR"] = Object.keys(
    ids
  ).map((id) => ({ id }));

  if (userId) {
    randomizerFilter.push({
      managers: { some: { userId: { equals: userId } } },
    });
  }

  const randomizers = await db.randomizer.findMany({
    where: {
      OR: randomizerFilter,
    },
  }); //await getRandomizers();
  return json({ randomizers, isLoggedIn: Boolean(userId) });
};

export default function Index() {
  const { randomizers, isLoggedIn } = useLoaderData<LoaderData>();
  if (!randomizers) {
    return (
      <p>
        <span className="text-purple-700 font-bold">Randomizer</span> ist ein
        Tool für Entscheidungen, die du nicht selbst treffen möchtest. Melde
        dich an und erstelle einen Zufallsgenerator, lade deine Freunde ein,
        Vorschläge beizusteuern und lass den Zufall entscheiden
      </p>
    );
  }
  return (
    <div className="space-y-8">
      <p className="text-sm text-center">
        <span className="text-purple-700 font-bold">Randomizer</span> ist ein
        Tool für Entscheidungen, die du nicht selbst treffen möchtest. Melde
        dich an und erstelle einen Zufallsgenerator, lade deine Freunde ein,
        Vorschläge beizusteuern und lass den Zufall entscheiden!
      </p>
      {randomizers.length ? (
        <>
          <p>Wähle einen Zufallsgenerator:</p>
          <ul className="flex flex-col space-y-2">
            {randomizers?.map((randomizer) => (
              <li key={randomizer.id} className="block">
                <Link
                  to={`randomizer/${randomizer.id}`}
                  className="block border border-purple-700 text-purple-700 rounded py-4 px-8 hover:bg-purple-100"
                >
                  {randomizer.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {isLoggedIn && (
        <>
          <p>Oder erstelle einen neuen:</p>
          <Link
            to="randomizer/new"
            className="block border border-purple-700 text-purple-700 rounded py-4 px-8 hover:bg-purple-100"
          >
            erstellen
          </Link>
        </>
      )}
    </div>
  );
}
