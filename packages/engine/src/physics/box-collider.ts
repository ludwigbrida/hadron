import { Vector3 } from "../math/vector3.ts";
import { Node } from "../scene/node.ts";

export interface BoxColliderOptions {
  readonly halfExtents: Readonly<Vector3>;
}

export class BoxCollider extends Node {
  readonly halfExtents: Vector3;

  constructor(options: Readonly<BoxColliderOptions>) {
    super();

    this.halfExtents = options.halfExtents.clone();
  }
}
