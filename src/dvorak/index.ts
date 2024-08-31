export { useSignal } from "./single";
import { onload, unload } from "./lifetime";
import { Component, createElement } from "./component";

export function createFragment(
  _attributes: Record<string, any>,
  ...children: any
) {
  const fragment = document.createDocumentFragment();
}

export function renderRootComponent(rootComponent: Component | HTMLElement) {
  if (rootComponent instanceof HTMLElement) {
    document.body.appendChild(rootComponent);
  } else {
    rootComponent.loadAt(document.getElementById("root")!).init();
  }
}

export { onload, unload };

export default {
  onload,
  unload,
  createFragment,
  createElement,
};
