import { Vec3 } from "../math/vec3.ts";
import { Color } from "../rendering/color.ts";
import { Node } from "./node.ts";

export class DirectionalLight extends Node {
  readonly color = new Color(1, 1, 1);
  private readonly direction = new Vec3(0, 0, 1);

  getDirection(): Readonly<Vec3> {
    const worldMatrix = this.getWorldMatrix();

    return this.direction.set(worldMatrix[8], worldMatrix[9], worldMatrix[10]).normalize();
  }
}
