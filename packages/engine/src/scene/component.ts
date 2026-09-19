import type { Node } from "./new-node.ts";
import type { Scene } from "./scene.ts";

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

  /**
   * Called after this component's node enters the scene.
   */
  protected onEnterScene(_scene: Scene): void {}

  /**
   * Called before this component's node leaves the scene.
   */
  protected onExitScene(_scene: Scene): void {}

  /** @internal */
  public notifyEnterScene(scene: Scene): void {
    this.onEnterScene(scene);
  }

  /** @internal */
  public notifyExitScene(scene: Scene): void {
    this.onExitScene(scene);
  }
}
