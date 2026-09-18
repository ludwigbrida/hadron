import { Matrix4 } from "../math/matrix4.ts";
import { Transform } from "./transform.ts";

/** @internal */
export interface NodeTree {
  onNodeAttached(node: Node): void;
  onNodeDetached(node: Node): void;
}

export class Node {
  readonly transform = new Transform();
  private readonly childNodes = new Set<Node>();
  private readonly worldMatrix = new Matrix4();
  private parentNode: Node | undefined;
  private tree: NodeTree | undefined;

  get parent(): Node | undefined {
    return this.parentNode;
  }

  addChild(child: Node): this {
    if (child === this || this.isDescendantOf(child)) {
      throw new Error("A node cannot be its own ancestor.");
    }

    // Leaving the previous parent also deactivates the child's scene-tree subtree.
    child.parentNode?.removeChild(child);

    // The child inherits this node's tree, which activates any bodies it contains.
    this.childNodes.add(child);
    child.parentNode = this;
    child.setTree(this.tree);

    return this;
  }

  removeChild(child: Node): this {
    if (this.childNodes.delete(child)) {
      // Detach the subtree before clearing its parent so scene lifecycle observers
      // can remove any bodies that are no longer part of the scene.
      child.setTree(undefined);
      child.parentNode = undefined;
    }

    return this;
  }

  getWorldMatrix(): Readonly<Matrix4> {
    const parent = this.parentNode;

    if (!parent) {
      return this.transform.getMatrix();
    }

    return this.worldMatrix.setMultiply(parent.getWorldMatrix(), this.transform.getMatrix());
  }

  [Symbol.iterator](): IterableIterator<Node> {
    return this.childNodes.values();
  }

  /** @internal */
  setTree(tree: NodeTree | undefined): void {
    if (tree === this.tree) {
      return;
    }

    this.tree?.onNodeDetached(this);
    this.tree = tree;
    this.tree?.onNodeAttached(this);

    // Descendants share their ancestor's scene membership.
    for (const child of this.childNodes) {
      child.setTree(tree);
    }
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
