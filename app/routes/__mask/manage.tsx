import { Role } from "@prisma/client";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
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
import Button from "~/components/Button";
import InputField from "~/components/InputField";
import { db } from "~/database/db.server";
import { isString } from "~/utils/guards";
import { requireUserId } from "~/utils/user-session.server";
import bcrypt from "bcryptjs";

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
  const userId = await requireUserId(request);
  const form = await request.formData();
  const password = form.get("password");
  const new_password = form.get("new_password");
  const confirm_new_password = form.get("confirm_new_password");

  if (new_password !== confirm_new_password) {
    return badRequest({ formError: "Passwörter müssen übereinstimmen" });
  }

  if (
    !isString(password) ||
    !isString(new_password) ||
    !isString(confirm_new_password)
  ) {
    return badRequest({ formError: "Eingaben nicht akzeptiert" });
  }

  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user) {
    return badRequest({ formError: "Eingaben nicht akzeptiert" });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordCorrect) {
    return badRequest({ formError: "Eingaben nicht akzeptiert" });
  }

  const newPasswordHash = await bcrypt.hash(new_password, 10);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });
  return redirect("/");
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
    <Form className="flex flex-col space-y-2" method="post" ref={formRef}>
      <InputField
        type="password"
        name="password"
        label="Altes Passwort"
        placeholder="Altes Passwort"
        required
        minLength={6}
      />
      <InputField
        type="password"
        name="new_password"
        label="Neues Passwort"
        placeholder="Neues Passwort"
        required
        minLength={6}
      />
      <InputField
        type="password"
        name="confirm_new_password"
        label="Wiederhole neues Passwort"
        placeholder="Wiederhole neues Passwort"
        required
        minLength={6}
      />
      <Button type="submit">Passwort ändern</Button>
      {actionData?.formError && (
        <p className="text-base text-red-500 mt-1" role="alert">
          {actionData.formError}
        </p>
      )}
    </Form>
  );
}
