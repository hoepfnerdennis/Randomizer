import { Link } from "@remix-run/react";
import type { PropsWithChildren } from "react";

type LoginContainerProps = PropsWithChildren<{ error?: string }>;

export default function LoginContainer({
  children,
  error,
}: LoginContainerProps) {
  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="w-96 bg-white p-8 rounded-2xl">
        <h1 className="text-purple-700 text-4xl text-center mb-4">
          <Link to="/" className="hover:underline">
            Randomizer 🎲
          </Link>
        </h1>
        {children}
        {error && (
          <p className="text-base text-red-500 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
