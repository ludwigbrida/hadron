import { Mat4 } from "../math/mat4.ts";
import { Vector3 } from "../math/vector3.ts";

export class Transform {
  readonly position = new Vector3(0, 0, 0);
  readonly rotation = new Vector3(0, 0, 0);
  readonly scale = new Vector3(1, 1, 1);

  private readonly matrix = new Mat4();

  getMatrix(): Readonly<Mat4> {
    return this.matrix
      .setTranslation(this.position)
      .rotateY(this.rotation[1])
      .rotateX(this.rotation[0])
      .rotateZ(this.rotation[2])
      .scale(this.scale);
  }
}
