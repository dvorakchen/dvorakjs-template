import { Context } from "./context";
import { isSignalGetter, OBSERVE_KEY, SignalGetter } from "./single";
import { bindDirective, isDefaultDirectives } from "./directive";

export type ComponentOrRawElement = Component | RawElement;

export function createElement(
  ident: string | ComponentFunc,
  attributes: Attributes,
  ...children: ComponentOrRawElement[]
): ComponentOrRawElement {
  if (typeof ident === "function") {
    return new Component(ident, attributes, children);
  }

  return new RawElement(ident, attributes, children);
}

abstract class BaseComponent {
  protected _nodeList: HTMLElement[] = [];
  protected _placeholder = document.createComment("");

  abstract loadAt(host: HTMLElement);

  abstract render(): void;

  abstract unrender(): void;

  public directiveIf(isShow: boolean) {
    if (isShow) {
      this.show();
    } else {
      this.hide();
    }
  }

  private show() {
    if (this._nodeList[0].parentNode !== null) {
      return;
    }

    if (this._placeholder.parentNode === null) {
      throw `Component placeholder error`;
    }

    this._placeholder.after(...this._nodeList);
    this._placeholder.remove();
  }

  private hide() {
    if (this._nodeList[0].parentNode === null) {
      return;
    }

    const temp = this._nodeList[0];
    temp.parentNode?.insertBefore(this._placeholder, temp);

    for (const node of this._nodeList) {
      node.remove();
    }
  }
}

export class RawElement extends BaseComponent {
  constructor(
    private nodeName: string,
    private attributes: Attributes,
    private children: ComponentOrRawElement[]
  ) {
    super();
  }

  private _host: HTMLElement;

  loadAt(host: HTMLElement): ComponentOrRawElement {
    this._host = host;
    return this;
  }

  public render(): void {}

  public unrender(): void {}

  public build(): HTMLElement[] {
    const cur = document.createElement(this.nodeName);
    this._nodeList.push(cur);

    bindAttributes(cur, this.attributes);

    for (const child of this.children) {
      if (typeof child === "function" && isSignalGetter(child)) {
        bindReactivityChild(cur, child);
      } else if (child instanceof Component || child instanceof RawElement) {
        child.loadAt(cur).init();
      } else {
        const textNode = document.createTextNode(child + "");
        cur.appendChild(textNode);
      }
    }

    return this._nodeList;
  }

  public init() {
    if (this._nodeList.length === 0) {
      this.build();
    }
    let value: SignalGetter<boolean> | null = getAttributeValue(
      this.attributes,
      "d-if"
    );

    if (value === null || value()) {
      this._host.append(...this._nodeList);
      this.render();
    } else {
      this._host.appendChild(this._placeholder);
      // this.unrender();
    }
  }
}

export type AttributeValue = SignalGetter<any> | string;

export type Attributes = Record<string, AttributeValue>;

export type ComponentFunc = (
  attributes: Attributes,
  ...children: ComponentOrRawElement[]
) => ComponentOrRawElement;

export class Component extends BaseComponent {
  constructor(
    private componentFunc: ComponentFunc,
    private attributes: Attributes,
    private children: ComponentOrRawElement[]
  ) {
    super();
    this.id = Context.getId();
  }

  private id: number;
  private _parent: Component | null = null;
  private _childComponents: Component[] = [];

  private _isRendered = false;
  private _host: HTMLElement;

  public get isRendered(): boolean {
    return this._isRendered;
  }

  loadAt(host: HTMLElement): ComponentOrRawElement {
    this._host = host;
    return this;
  }

  public runOnload: () => void;
  public runUnload: () => void;

  public addChildComponent(child: Component): void {
    this._childComponents.push(child);
  }

  public build(): HTMLElement[] {
    if (this._nodeList.length !== 0) {
      return this._nodeList;
    }

    if (Context.parent.length !== 0) {
      this._parent = Context.parent[Context.parent.length - 1];
      this._parent.addChildComponent(this);
    }

    Context.parent.push(this);

    Context.current = this;
    this._nodeList = this.componentFunc(
      this.attributes,
      ...this.children
    ).build();
    Context.current = null;

    Context.parent.pop();

    this.attributes &&
      Object.entries(this.attributes)
        .filter(
          (attribute) =>
            isDefaultDirectives(attribute[0]) && isSignalGetter(attribute[1])
        )
        .forEach((attribute) => {
          bindDirective(
            this,
            attribute[0],
            attribute[1] as SignalGetter<boolean>
          );
        });

    return this._nodeList;
  }

  public render() {
    this.directiveIf(true);
    if (this.runOnload !== undefined) {
      setTimeout(this.runOnload, 0);
    }
  }

  public unrender() {
    this.directiveIf(false);
    if (this.runUnload !== undefined) {
      setTimeout(this.runUnload, 0);
    }
  }

  public init() {
    if (this._nodeList.length === 0) {
      this.build();
    }

    let value: SignalGetter<boolean> | null = getAttributeValue(
      this.attributes,
      "d-if"
    );

    if (value === null || value()) {
      this._host.append(...this._nodeList);
      this.render();
    } else {
      this._host.appendChild(this._placeholder);
      // this.unrender();
    }
  }
}

function bindAttributes(ele: HTMLElement, attributes: Attributes) {
  if (attributes === null || typeof attributes !== "object") {
    return;
  }

  Object.entries(attributes).forEach((attribute) => {
    const key = attribute[0];
    const value = attribute[1];

    if (isDefaultDirectives(key) && isSignalGetter(value)) {
      bindDirective(this, key, value);
    } else if (typeof value === "function") {
      bindEvents(ele, key, value);
    }

    if (typeof value === "string") {
      ele.setAttribute(key, value);
    } else if (isSignalGetter(value)) {
      value[OBSERVE_KEY](() => {
        ele.setAttribute(key, value());
      });
    }
  });
}

function bindEvents(ele: HTMLElement, type: string, value: Function) {
  switch (type) {
    case "onClick":
      bindOnClick(ele, value);
      break;
    case "onChange":
      bindOnChange(ele, value);
      break;
    default:
      return;
  }
}

function bindOnClick(ele: HTMLElement, ev: Function) {
  ele.addEventListener("click", (mouseEvent: MouseEvent) => {
    ev(mouseEvent);
  });
}

function bindOnChange(ele: HTMLElement, ev: Function) {
  ele.addEventListener("change", (event) => {
    ev(event);
  });
}

function bindReactivityChild(
  parentElement: HTMLElement,
  child: SignalGetter<any>
) {
  let preNode = buildSignalNode();
  parentElement.appendChild(preNode);

  child[OBSERVE_KEY](() => {
    const updatedNode = buildSignalNode();
    parentElement.replaceChild(updatedNode, preNode);
    preNode = updatedNode;
  });

  function buildSignalNode(): Text | HTMLElement {
    let value = child();
    let signalNode: Text | HTMLElement;
    if (value instanceof HTMLElement) {
      signalNode = value;
    } else {
      signalNode = document.createTextNode(value);
    }

    return signalNode;
  }
}

function getAttributeValue<T>(attributes: Attributes, key: string): T | null {
  const attribute =
    attributes &&
    Object.entries(attributes).find((attribute) => attribute[0] === key);
  if (attribute === undefined || attribute === null) {
    return null;
  }

  let value = attribute[1] as T;

  return value;
}
