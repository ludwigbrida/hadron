import { Component } from "./component.ts";
import type { Scene } from "./scene.ts";
import { Transform } from "./transform.ts";

export class Node {
  public readonly transform = new Transform();

  private sceneRef: Scene | undefined;
  private parentRef: Node | undefined;
  private readonly childRefs = new Set<Node>();

  private readonly components = new Set<Component>();

  public get scene(): Scene | undefined {
    return this.sceneRef;
  }

  /** @internal */
  public set scene(scene: Scene | undefined) {
    if (scene === this.sceneRef) {
      return;
    }

    if (this.sceneRef !== undefined) {
      for (const component of this.getComponents(Component)) {
        component.notifyExitScene();
      }
    }

    this.sceneRef = scene;

    if (scene !== undefined) {
      for (const component of this.getComponents(Component)) {
        component.notifyEnterScene();
      }
    }

    for (const child of this.childRefs) {
      child.scene = scene;
    }
  }

  public get parent(): Node | undefined {
    return this.parentRef;
  }

  public addChild(child: Node): this {
    if (child === this || this.isDescendantOf(child)) {
      throw new Error("A node cannot be its own ancestor.");
    }

    // Removing a child from its previous parent also removes its scene membership.
    child.parentRef?.removeChild(child);

    this.childRefs.add(child);
    child.parentRef = this;
    child.scene = this.scene;

    return this;
  }

  public removeChild(child: Node): this {
    if (this.childRefs.delete(child)) {
      child.scene = undefined;
      child.parentRef = undefined;
    }

    return this;
  }

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

  private isDescendantOf(node: Node): boolean {
    // Walk the ancestry tree upwards until reaching the root node.
    for (let ancestor: Node | undefined = this; ancestor; ancestor = ancestor.parentRef) {
      if (ancestor === node) {
        return true;
      }
    }
    return false;
  }
}

type ComponentType<T extends Component> = abstract new (...args: never[]) => T;
