import { YoReact } from "../src";

/** @jsx YoReact.createElement */
function App() {
  const [count, setCount] = YoReact.useState(0);

  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}

YoReact.render(<App />, document.getElementById("root"));
