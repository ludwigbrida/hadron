import type { Component } from "./component.ts";

export class Node {
  private readonly components = new Set<Component>();

  public addComponent(component: Component): this {
    if (component.owner === this) {
      return this;
    }

    component.owner?.removeComponent(component);
    this.components.add(component);
    component.owner = this;

    return this;
  }

  public removeComponent(component: Component): this {
    if (this.components.delete(component)) {
      component.owner = undefined;
    }

    return this;
  }

  public getComponent<T extends Component>(type: ComponentType<T>): T | undefined {
    for (const component of this.components) {
      if (component instanceof type) {
        return component;
      }
    }

    return undefined;
  }

  public *getComponents<T extends Component>(type: ComponentType<T>): IterableIterator<T> {
    for (const component of this.components) {
      if (component instanceof type) {
        yield component;
      }
    }
  }
}

type ComponentType<T extends Component> = abstract new (...args: never[]) => T;
