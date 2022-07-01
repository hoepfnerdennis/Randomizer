import type { Randomizer, User } from "@prisma/client";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/auth/validation.server";
import { getRandomizers } from "~/database/queries.server";
import stylesUrl from "~/styles/index.css";

type LoaderData = { randomizers: Randomizer[]; user: User };

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  const randomizers = await getRandomizers();
  return json({ randomizers, user });
};

export default function Index() {
  const { randomizers, user } = useLoaderData<LoaderData>();
  return (
    <>
      <p>Wähle einen Zufallsgenerator:</p>
      <ul>
        {randomizers?.map((randomizer) => (
          <li key={randomizer.id}>
            <Link to={`randomizer/${randomizer.id}`} className="button">
              {randomizer.name}
            </Link>
          </li>
        ))}
      </ul>
      {user?.role === "ADMIN" && (
        <>
          <p>Oder erstelle einen neuen:</p>
          <Link to="randomizer/new" className="button">
            erstellen
          </Link>
        </>
      )}
    </>
  );
}
