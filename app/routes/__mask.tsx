import { Link, Outlet } from "@remix-run/react";

export default function Mask() {
  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="w-96 bg-white p-8 rounded-2xl">
        <h1 className="text-purple-700 text-4xl text-center mb-4">
          <Link to="/" className="hover:underline">
            Randomizer 🎲
          </Link>
        </h1>
        <Outlet />
      </div>
    </main>
  );
}
