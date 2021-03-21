/**
 * Create element description including type, props and children,
 * which is used to create fibers.
 */
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

/**
 * Create DOM from fiber
 */
function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => (dom[name] = fiber.props[name]));

  return dom;
}

// unit of work means fiber
let nextUnitOfWork = null;

function render(element, container) {
  // root fiber
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

/**
 * Attach DOM node to fiber and construct the fiber tree
 */
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  const elements = fiber.props.children;
  let prevSibling = null;

  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    // Kinda like InnoDB leaf nodes
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
  }

  // return next unit of work
  if (fiber.child) {
    return fiber.child;
  }

  for (let nextFiber = fiber; nextFiber; ) {
    // If there's any slibling, it's the next unit of work
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // Otherwise, lookup fiber's parent's sliblings
    nextFiber = nextFiber.parent;
  }
  // We will reach there when we reach to root fiber(root fiber has no parent and siblings)
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

export const YoReact = {
  createElement,
  render,
};
