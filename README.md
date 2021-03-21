# YoReact

Follow the tutorial, [Build your own React](https://pomb.us/build-your-own-react/), to build a simple React step by step.

# Conception

- Component
  - host component
  - function component
  - ...
- Fiber
  - alternate fiber tree
  - wip fiber tree
- DOM
- Reconciliation

# Procedure

First, we use `createElement` to create an object holding the element type, props, and children. After this, we get an element tree. Constructing an element tree is a recursive call of `createElement`.

Then we pass that element tree to `render` function.

## reconciliation phase

There's **reconciliation phase**, however, it doesn't mean rendering DOM element to the page immediately. In this phase, we render a fiber tree from the element tree. The updated state will be set to fiber. The props in fiber is `prevProps`, while the props in element is `nextProps`. According to the props changing and element tree changing, React do the operation called `diff` on fiber tree. So, there're two fiber tree in memory, one is called _alternate_, the current fiber tree, and the another is _wipRoot_, the newer fiber tree. When all the fiber nodes have been updated, we can go to the **commit phase**.

## commit phase

What this phase do is updating the DOM tree according to the _wipRoot_ tree. Then set _wipRoot_ to be the _alternate_.

# Concurrent mode

Reconciliation isn't done at once. Instead, React use something a little kinda like _coroutine_. React only do reconciliation when the main thread is idle. In our code, we accomplish it by using `requestIdleCallback`. However, React doesn't use it anymore. Now it uses the [scheduler package](https://github.com/facebook/react/tree/master/packages/scheduler).

# Hooks

The magic in hooks is not magical. It exposes the state, and a function to do update. The function will memorize the state transform function and setup the next reconciliation work. With the state transform function, in reconcilation phases, function component can get the updated state from hooks.
