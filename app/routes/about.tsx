import stylesheet from "../routes-built/About/index.css";
export { default } from "../routes-built/About";

export function links() {
  return [
    {
      rel: "stylesheet",
      href: stylesheet,
    },
  ];
}
