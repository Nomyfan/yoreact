import { YoReact } from "../src";

// const element = YoReact.createElement(
//   "div",
//   { id: "foo" },
//   YoReact.createElement("a", null, "bar"),
//   YoReact.createElement("b")
// );

// JSX style
/** @jsx YoReact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);

YoReact.render(element, document.getElementById("root"));
