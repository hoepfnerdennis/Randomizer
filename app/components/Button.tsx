type ButtonProps = Omit<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
  "className"
>;

export default function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      className="px-8 py-2 bg-purple-700 text-white hover:bg-purple-900 rounded"
    />
  );
}
