import { Vec3 } from "../math/vec3.ts";
import { Color } from "../rendering/color.ts";
import { Node } from "./node.ts";

export class DirectionalLight extends Node {
  readonly direction = new Vec3(0.5, 0.8, 1).normalize();
  readonly color = new Color(1, 1, 1);
}
