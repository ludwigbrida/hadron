import { Vec3 } from "../math/vec3.ts";
import { Color } from "../rendering/color.ts";

export class DirectionalLight {
  readonly direction = new Vec3(0.5, 0.8, 1).normalize();
  readonly color = new Color(1, 1, 1);
}
