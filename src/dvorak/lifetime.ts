import { Context } from "./context";

export function onload(cb: () => void) {
  if (Context.current !== null) {
    Context.current.runOnload = cb;
  }
}

export function unload(cb: () => void) {
  if (Context.current !== null) {
    Context.current.runUnload = cb;
  }
}
