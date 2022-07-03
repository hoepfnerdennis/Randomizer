import type { ForwardedRef } from "react";
import { forwardRef, useId } from "react";

type InputProps = {
  label?: string;
  error?: string;
} & Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "aria-invalid" | "aria-errormessage" | "id" | "className"
>;

function InputField(
  { label, error, ...inputProps }: InputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const inputId = useId();
  const errorId = useId();
  return (
    <label htmlFor={inputId} className="text-xs flex flex-col">
      {label ?? null}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-errormessage={error ? errorId : undefined}
        className="text-base p-2 border border-solid border-purple-700 rounded"
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-500 mt-1" role="alert">
          {error}
        </p>
      )}
    </label>
  );
}

export default forwardRef(InputField);
