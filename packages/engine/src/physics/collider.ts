import { Vector3 } from "../math/vector3.ts";
import { Node } from "../scene/node.ts";

export abstract class Collider extends Node {
  // TODO: widen this method to parent class
  getWorldPosition(): Vector3 {
    const matrix = this.getWorldMatrix();

    // TODO: realize transform reconstruction through matrix class
    return new Vector3(matrix[12], matrix[13], matrix[14]);
  }
}
