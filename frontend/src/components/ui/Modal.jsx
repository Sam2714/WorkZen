export default function Modal({ open = false, children }) {
  if (!open) {
    return null;
  }

  return <div>{children}</div>;
}
