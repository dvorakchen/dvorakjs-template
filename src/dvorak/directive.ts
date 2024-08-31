import { ComponentOrRawElement } from "./component";
import { OBSERVE_KEY, SignalGetter } from "./single";

let directivesSet = new Set<string>(["d-if"]);

export function isDefaultDirectives(key: string): boolean {
  return directivesSet.has(key);
}

export function bindDirective(
  coe: ComponentOrRawElement,
  key: string,
  value: SignalGetter<boolean>
) {
  if (!isDefaultDirectives(key) || typeof value !== "function") {
    return;
  }

  switch (key) {
    case "d-if":
      bindIf(coe, value);
  }
}

function bindIf(coe: ComponentOrRawElement, value: SignalGetter<boolean>) {
  value[OBSERVE_KEY](() => {
    const isShow = value();
    if (isShow) {
      coe.render();
    } else {
      coe.unrender();
    }
  });
}
