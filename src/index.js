export function createElement(type, props, ...children) {
  children = children.map((child) =>
    typeof child === "object" ? child : createTextElement(child)
  );

  return {
    type,
    props: {
      ...props,
      children,
    },
  };
}

function createTextElement(text) {
  // In fact, React doesn't wrap primitive values or
  // create empty arrays when there aren't children.
  // That's for performance consideration, which isn't
  // the point we should take to much care of. Let's
  // focus the simplification.
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(element, container) {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => (dom[name] = element.props[name]));

  element.props.children.forEach((child) => render(child.type, dom));

  container.appendChild(dom);
}

export const YoReact = {
  createElement,
  render,
};
