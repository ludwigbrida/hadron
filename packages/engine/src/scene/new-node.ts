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
}
