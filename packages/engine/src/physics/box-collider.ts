import { Vector3 } from "../math/vector3.ts";
import { Collider } from "./collider.ts";

export interface BoxColliderOptions {
  readonly halfExtents: Readonly<Vector3>;
}

export class BoxCollider extends Collider {
  readonly halfExtents: Vector3;

  constructor(options: Readonly<BoxColliderOptions>) {
    super();

    this.halfExtents = options.halfExtents.clone();
  }

  // TODO: add world bounds for broad-phase collision detection
}
