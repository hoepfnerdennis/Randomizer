import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "~/styles/tailwind.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Randomizer",
  viewport: "width=device-width,initial-scale=1",
  "theme-color": "#7e22ce",
  "msapplication-TileColor": "#7e22ce",
});

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap",
    },
    { rel: "stylesheet", href: styles },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      sizes: "32x32",
      type: "image/png",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      sizes: "16x16",
      type: "image/png",
      href: "/favicon-16x16.png",
    },
    { rel: "mask-icon", color: "#7e22ce", href: "/safari-pinned-tab.svg" },
    { rel: "manifest", href: "/site.webmanifest", crossOrigin: "anonymous" },
  ];
};

export default function App() {
  return (
    <html lang="de">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-purple-700">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
