import type { Node } from "./new-node.ts";

export abstract class Component {
  private ownerNode: Node | undefined;

  public get owner(): Node | undefined {
    return this.ownerNode;
  }

  /** @internal */
  public set owner(node: Node | undefined) {
    if (node === undefined) {
      this.onDetach();
      this.ownerNode = undefined;
      return;
    }

    this.ownerNode = node;
    this.onAttach();
  }

  protected onAttach(): void {}

  protected onDetach(): void {}
}
