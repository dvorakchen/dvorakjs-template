import { Component } from "./component";

export class Context {
  public static current: Component | null = null;
  public static parent: Component[] = [];
  private static id: number = 0;
  public static getId(): number {
    return ++this.id;
  }
}
