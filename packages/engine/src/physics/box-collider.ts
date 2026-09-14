import { Vector3 } from "../math/vector3.ts";
import { Node } from "../scene/node.ts";

export class BoxCollider extends Node {
  constructor(private readonly halfExtent: Readonly<Vector3>) {
    super();
  }
}
