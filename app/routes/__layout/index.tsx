import type { Randomizer } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getRandomizers } from "~/database/queries.server";
import { getUserId } from "~/utils/user-session.server";

type LoaderData = { randomizers: Randomizer[]; isLoggedIn: boolean };

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  const randomizers = await getRandomizers();
  return json({ randomizers, isLoggedIn: Boolean(userId) });
};

export default function Index() {
  const { randomizers, isLoggedIn } = useLoaderData<LoaderData>();
  return (
    <>
      <p>Wähle einen Zufallsgenerator:</p>
      <ul className="flex flex-col space-y-2 mb-8">
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
    </>
  );
}
