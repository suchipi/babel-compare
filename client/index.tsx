const createClient = require("little-api/client");
const Box = require("react-boxxy");

const api: {
  compileCode: (
    code: string,
    babelVersion: 6 | 7,
    config: Object
  ) => Promise<string>;
} = createClient({
  url: "http://localhost:8080",
  methods: ["compileCode"]
});

// @ts-ignore
window.api = api;

const React = require("react");
const { useState, useEffect } = React;

const Column = Box.withProps({
  display: "flex",
  flexDirection: "column"
});

const Row = Box.withProps({
  display: "flex",
  flexDirection: "row"
});

const Input = ({ state, setState, ...props }) => (
  <textarea
    style={{
      minHeight: "8em"
    }}
    {...props}
    value={state}
    onChange={event => setState(event.target.value)}
  />
);

const INITIAL = {};
function useLocalStorageState(key, defaultValue) {
  const [state, setState] = useState(INITIAL);

  let outerState = state;
  if (state === INITIAL) {
    const value = localStorage.getItem(key);
    outerState = value || defaultValue;
  }

  const outerSetState = nextValue => {
    localStorage.setItem(key, nextValue);
    setState(nextValue);
  };

  return [outerState, outerSetState];
}

function App() {
  const [code, setCode] = useLocalStorageState(
    "code",
    "import Foo, { Bar } from 'baz';"
  );
  const [config6, setConfig6] = useLocalStorageState(
    "config6",
    JSON.stringify({ presets: ["babel-preset-env"] }, null, 2)
  );
  const [config7, setConfig7] = useLocalStorageState(
    "config7",
    JSON.stringify({ presets: ["@babel/preset-env"] }, null, 2)
  );

  const [result6, setResult6] = useState("");
  const [result7, setResult7] = useState("");

  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    handleButtonClick();
  }, []);

  const handleButtonClick = () => {
    setButtonDisabled(true);
    Promise.all([
      api
        .compileCode(code, 6, JSON.parse(config6))
        .then(setResult6)
        .catch(err => setResult6(err.stack)),
      api
        .compileCode(code, 7, JSON.parse(config7))
        .then(setResult7)
        .catch(err => setResult7(err.stack))
    ]).then(() => {
      setButtonDisabled(false);
    });
  };

  return (
    <Column>
      <Column>
        <h1>Code</h1>
        <Input state={code} setState={setCode} />
      </Column>

      <Row>
        <Column flexBasis="100%">
          <h2>Config (Babel 6)</h2>
          <Input state={config6} setState={setConfig6} />
        </Column>

        <Column flexBasis="100%">
          <h2>Config (Babel 7)</h2>
          <Input state={config7} setState={setConfig7} />
        </Column>
      </Row>

      <Row justifyContent="center">
        <button disabled={buttonDisabled} onClick={handleButtonClick}>
          Transform
        </button>
      </Row>

      <Row>
        <Column flexBasis="100%">
          <h2>Output (Babel 6)</h2>
          <pre>
            <code>{result6}</code>
          </pre>
        </Column>

        <Column flexBasis="100%">
          <h2>Output (Babel 7)</h2>
          <pre>
            <code>{result7}</code>
          </pre>
        </Column>
      </Row>
    </Column>
  );
}

const ReactDOM = require("react-dom");
ReactDOM.render(<App />, document.getElementById("root"));
