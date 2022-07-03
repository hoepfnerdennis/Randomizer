import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { db } from "~/database/db.server";
import { destroyUserSession, getUserId } from "~/utils/user-session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) return json({});
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });
  if (!user) return destroyUserSession(request);
  return json({ user });
};

export default function Layout() {
  const { user } = useLoaderData();
  const location = useLocation();
  const currentLocation = new URLSearchParams([
    ["redirectTo", location.pathname],
  ]);
  return (
    <main className="flex flex-col max-w-3xl mx-auto my-8 bg-white p-8 rounded-3xl">
      <h1 className="text-purple-700 text-4xl text-center mb-8">
        <Link
          to="/"
          className=" no-underline hover:no-underline focus:no-underline"
        >
          Randomizer - der Zufallsgenerator 🎲
        </Link>
      </h1>
      <Outlet />
      <footer className="flex gap-4 justify-center items-center mt-4">
        {user ? (
          <>
            <Link to="/" className="text-purple-700 hover:underline">
              {user.username}
            </Link>
            <span className="text-xs">-</span>
            <Form action="/logout" method="post">
              <input
                type="hidden"
                name="redirectTo"
                value={location.pathname}
              />
              <button
                type="submit"
                className="text-purple-700 hover:underline"
                title="Logout"
              >
                Abmelden
              </button>
            </Form>
          </>
        ) : (
          <>
            <Link
              to={`/login?${currentLocation}`}
              className="text-purple-700 hover:underline"
            >
              Anmelden
            </Link>
            <span className="text-xs">-</span>
            <Link
              to={`/register?${currentLocation}`}
              className="text-purple-700 hover:underline"
            >
              Registrieren
            </Link>
          </>
        )}
      </footer>
    </main>
  );
}
