import { Matrix4 } from "../math/matrix4.ts";
import { Component } from "./component.ts";
import type { Scene } from "./scene.ts";
import { Transform } from "./transform.ts";

export class Node {
  public readonly transform = new Transform();
  private readonly _worldMatrix = new Matrix4();

  private hostScene: Scene | undefined;
  private parentNode: Node | undefined;
  private readonly childNodes = new Set<Node>();

  private readonly components = new Set<Component>();

  public get host(): Scene | undefined {
    return this.hostScene;
  }

  public get worldMatrix(): Readonly<Matrix4> {
    const parent = this.parent;

    if (parent === undefined) {
      return this.transform.getMatrix();
    }

    return this._worldMatrix.setMultiply(parent.worldMatrix, this.transform.getMatrix());
  }

  /** @internal */
  public set host(scene: Scene | undefined) {
    if (scene === this.hostScene) {
      return;
    }

    const previousScene = this.host;

    if (previousScene !== undefined) {
      for (const component of this.getComponents(Component)) {
        component.notifyExitScene(previousScene);
      }
    }

    this.hostScene = scene;

    if (scene !== undefined) {
      for (const component of this.getComponents(Component)) {
        component.notifyEnterScene(scene);
      }
    }

    for (const child of this.childNodes) {
      child.host = scene;
    }
  }

  public get parent(): Node | undefined {
    return this.parentNode;
  }

  public get children(): ReadonlySet<Node> {
    return this.childNodes;
  }

  public addChild(child: Node): this {
    if (child === this || this.isDescendantOf(child)) {
      throw new Error("A node cannot be its own ancestor.");
    }

    // Removing a child from its previous parent also removes its scene membership.
    child.parentNode?.removeChild(child);

    this.childNodes.add(child);
    child.parentNode = this;
    child.host = this.host;

    return this;
  }

  public removeChild(child: Node): this {
    if (this.childNodes.delete(child)) {
      child.host = undefined;
      child.parentNode = undefined;
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

    if (this.host !== undefined) {
      component.notifyEnterScene(this.host);
    }

    return this;
  }

  public removeComponent(component: Component): this {
    if (this.components.delete(component)) {
      if (this.host !== undefined) {
        component.notifyExitScene(this.host);
      }

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
    for (let ancestor: Node | undefined = this; ancestor; ancestor = ancestor.parentNode) {
      if (ancestor === node) {
        return true;
      }
    }
    return false;
  }
}

type ComponentType<T extends Component> = abstract new (...args: never[]) => T;
