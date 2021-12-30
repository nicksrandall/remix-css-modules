import stylesheet from "../routes-built/Home/index.css";
export { default } from "../routes-built/Home";

export function links() {
  return [
    {
      rel: "stylesheet",
      href: stylesheet,
    },
  ];
}
