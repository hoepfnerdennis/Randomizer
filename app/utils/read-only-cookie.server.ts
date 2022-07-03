import { redirect, createCookie } from "@remix-run/node";
import { isString } from "./guards";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

type ReadOnlyCookie = Record<string, string>;

export const readOnlyCookie = createCookie("read_only_session", {
  maxAge: 2_592_000, // one month
  secure: process.env.NODE_ENV === "production",
  secrets: [sessionSecret],
});

export async function getReadOnlyRandomizerSession(
  request: Request
): Promise<ReadOnlyCookie> {
  const cookieHeader = request.headers.get("Cookie");
  return (await readOnlyCookie.parse(cookieHeader)) || {};
}

export async function createReadOnlyRandomizerSession(
  request: Request,
  id: string,
  redirectTo: string
) {
  console.log(">>> createReadOnlyRandomizerSession", id);
  const readOnly = await getReadOnlyRandomizerSession(request);
  readOnly[id] = id;
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await readOnlyCookie.serialize(readOnly, {
        expires: new Date(Date.now() + 2_592_000_000),
      }),
    },
  });
}

export async function requireReadOnlyRandomizerId(
  id: string,
  request: Request,
  redirectTo: string
) {
  const readOnly = await getReadOnlyRandomizerSession(request);
  const randomizerId = readOnly[id];
  console.log(">>> requireReadOnlyRandomizerId", id, randomizerId);

  if (!isString(randomizerId)) {
    throw redirect(redirectTo);
  }
  return randomizerId;
}
