import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { isString } from "./guards";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "read_only_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createReadOnlyRandomizerSession(
  id: string,
  redirectTo: string
) {
  const session = await storage.getSession();
  session.set(id, id);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

function getReadOnlyRandomizerSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function requireReadOnlyRandomizerId(
  id: string,
  request: Request,
  redirectTo: string
) {
  const session = await getReadOnlyRandomizerSession(request);
  const randomizerId = session.get(id);
  if (!isString(randomizerId)) {
    throw redirect(redirectTo);
  }
  return randomizerId;
}
