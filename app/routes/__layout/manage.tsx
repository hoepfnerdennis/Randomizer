import { Role } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import { updatePassword } from "~/auth/authentication.server";
import { requireUser } from "~/auth/validation.server";
import { isString } from "~/utils/guards";

type ActionData = {
  formError?: string;
  formSuccess?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  return json({ user });
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const form = await request.formData();
  const password = form.get("password");
  const confirm_password = form.get("confirm_password");

  if (!user || !isString(password) || !isString(confirm_password)) {
    return badRequest({ formError: "Eingaben nicht akzeptiert" });
  }

  return updatePassword({ user, password, confirm_password });
};

export default function Manage() {
  const { user } = useLoaderData();
  const actionData = useActionData<ActionData>();

  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isSubmitting) {
      formRef.current?.reset();
    }
  }, [isSubmitting]);

  return (
    <>
      Hallo {user.username} 👋
      <Form className="user-update-form" method="post" ref={formRef}>
        <h2>
          <label htmlFor="password-input">Passwort ändern</label>
        </h2>
        <div className="input-field">
          <input
            id="password-input"
            name="password"
            type="password"
            placeholder="neues Passwort"
            required
            minLength={6}
          />
          <input
            id="password-input"
            name="confirm_password"
            type="password"
            placeholder="wiederholen"
            required
            minLength={6}
          />
        </div>
        {actionData?.formError ? (
          <p className="form-error" role="alert">
            {actionData.formError}
          </p>
        ) : null}
        {actionData?.formSuccess ? (
          <p className="form-success" role="alert">
            {actionData.formSuccess}
          </p>
        ) : null}
        <button
          type="submit"
          className="button"
          name="_action"
          value="change_password"
        >
          Passwort ändern
        </button>
      </Form>
      <h2>Abmelden</h2>
      <Form action="/logout" method="post">
        <button type="submit" className="button" title="Logout">
          Abmelden 🔓
        </button>
      </Form>
      {user?.role === "ADMIN" ? (
        <>
          <h2>Neuen Nutzer anlegen</h2>
          <Form method="post">
            <div className="input-field">
              <input
                type="text"
                id="username-input"
                name="username"
                placeholder="Benutzername"
                required
                minLength={3}
              />
              <input
                id="password-input"
                name="password"
                type="password"
                placeholder="Passwort"
                required
                minLength={6}
              />
              <select name="role">
                {Object.values(Role).map((role) => (
                  <option value="role" key={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="button"
              name="_action"
              value="create_user"
            >
              Abschicken
            </button>
          </Form>
        </>
      ) : null}
    </>
  );
}
