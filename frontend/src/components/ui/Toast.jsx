export default function Toast({ message = "" }) {
  if (!message) {
    return null;
  }

  return <div>{message}</div>;
}
