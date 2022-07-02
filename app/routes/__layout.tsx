import { Link, Outlet } from "@remix-run/react";

export default function Layout() {
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
    </main>
  );
}
