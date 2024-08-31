import Dvorak, {
  renderRootComponent,
  useSignal,
  onload,
  unload,
} from "./dvorak";

export function App({ name }: { name: string }) {
  const [value, setValue] = useSignal(0);
  const [show, setShow] = useSignal(false);

  onload(() => {
    console.log("App onload");
  });

  unload(() => {
    console.log("App unload");
  });

  return (
    <div name={name} class={value}>
      <span>{value} -- "ee"</span>
      <button
        onClick={() => {
          setValue(value() + 1);
          setShow(!show());
        }}
      >
        BTN
      </button>
      <div>
        <Com d-if={show} />
        <Com />
        <See d-if={show} />
      </div>
    </div>
  );
}

function Com() {
  onload(() => {
    console.log("Com onload");
  });
  unload(() => {
    console.log("Com unload");
  });

  return <div>COM</div>;
}

function See() {
  return <div class="bg-blue-300">You see me</div>;
}

renderRootComponent(<App name="app name" />);
