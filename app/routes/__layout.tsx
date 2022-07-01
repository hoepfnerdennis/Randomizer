import type { LinksFunction } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";
import stylesUrl from "~/styles/layout.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export default function Layout() {
  return (
    <main className="container">
      <div className="header">
        <h1 className="heading">
          <Link to="/" className="home">
            Randomizer - der Zufallsgenerator 🎲
          </Link>
        </h1>
        <Link to="/manage">Konto 👤</Link>
      </div>
      <Outlet />
    </main>
  );
}
