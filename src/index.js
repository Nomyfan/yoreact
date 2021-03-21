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

  updateDom(dom, {}, fiber.props);

  return dom;
}

// unit of work means fiber
let nextUnitOfWork = null;
// wip root fiber
let wipRoot = null;
// current root fiber, holding the state of current fiber tree.
let currentRoot = null;
let deletions = null;

function updateDom(dom, prevProps, nextProps) {
  const isEvent = (key) => key.startsWith("on");
  const isProperty = (key) => key !== "children" && !isEvent(key);
  const isNew = (prev, next) => (key) => prev[key] !== next[key];
  const isGone = (_prev, next) => (key) => !(key in next);

  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => (dom[name] = ""));

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => (dom[name] = nextProps[name]));

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  // Since we start from `fiber.child`, `fiber.parent` is always accessable.
  const domParent = fiber.parent.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  // If we have done the update, wip fiber tree becomes the current fiber tree.
  currentRoot = wipRoot;
  wipRoot = null;
}

function render(element, container) {
  // root fiber
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

function reconcileChildren(wipFiber, elements) {
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  for (let index = 0; index < elements.length || oldFiber !== null; index++) {
    const element = elements[index];
    let newFiber = null;

    // React also use keys
    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    } else {
      if (element) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: "PLACEMENT",
        };
      }

      if (oldFiber) {
        oldFiber.effectTag = "DELETION";
        deletions.push(oldFiber);
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
  }
}

/**
 * Attach DOM node to fiber and construct the fiber tree
 */
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

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

  if (!nextUnitOfWork && wipRoot) {
    // we have done all unit of work, so we can update the DOM tree
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

export const YoReact = {
  createElement,
  render,
};
