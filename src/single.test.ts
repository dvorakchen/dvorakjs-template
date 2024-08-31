import { OBSERVE_KEY, useSignal } from "./dvorak/single";

test("should first", () => {
  const [value, setValue] = useSignal(0);
  let ob = "";

  expect(value()).toBe(0);
  setValue(1);
  expect(value()).toBe(1);

  expect(ob).toBe("");

  value[OBSERVE_KEY](() => {
    ob = "new";
  });

  setValue(2);

  expect(ob).toBe("new");
});
