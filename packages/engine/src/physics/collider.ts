import { Vector3 } from "../math/vector3.ts";
import { Node } from "../scene/node.ts";
import type { RaycastHit } from "./raycast-hit.ts";

export abstract class Collider extends Node {
  abstract raycast(origin: Readonly<Vector3>, direction: Readonly<Vector3>): RaycastHit | undefined;

  abstract getWorldBounds(): Aabb;

  // TODO: widen this method to parent class
  getWorldPosition(): Vector3 {
    const matrix = this.getWorldMatrix();

    // TODO: realize transform reconstruction through matrix class
    return new Vector3(matrix[12], matrix[13], matrix[14]);
  }
}

export interface Aabb {
  readonly minimum: Vector3;
  readonly maximum: Vector3;
}
