import { Transform } from "./transform.ts";

export class Node {
  readonly transform = new Transform();
  private readonly childNodes = new Set<Node>();
  private parentNode: Node | undefined;

  get parent(): Node | undefined {
    return this.parentNode;
  }

  addChild(child: Node): this {
    if (child === this || this.isDescendantOf(child)) {
      throw new Error("A node cannot be its own ancestor.");
    }

    // remove child from its previous parent
    child.parentNode?.removeChild(child);

    // add child to this new parent node
    this.childNodes.add(child);
    child.parentNode = this;

    return this;
  }

  removeChild(child: Node): this {
    if (this.childNodes.delete(child)) {
      // TODO: check if necessary due to duplication in addChild()
      child.parentNode = undefined;
    }

    return this;
  }

  [Symbol.iterator](): IterableIterator<Node> {
    return this.childNodes.values();
  }

  private isDescendantOf(node: Node): boolean {
    // walk the ancestry tree upwards until reaching the root node
    for (let ancestor: Node | undefined = this; ancestor; ancestor = ancestor.parentNode) {
      if (ancestor === node) {
        return true;
      }
    }

    return false;
  }
}
