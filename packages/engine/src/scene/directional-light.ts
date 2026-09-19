import { Vector3 } from "../math/vector3.ts";
import { Color } from "../rendering/color.ts";
import { Component } from "./component.ts";

export class DirectionalLight extends Component {
  readonly color = new Color(1, 1, 1);
  private readonly direction = new Vector3(0, 0, 1);

  getDirection(): Readonly<Vector3> {
    const worldMatrix = this.owner!.worldMatrix;

    return this.direction.setXyz(worldMatrix[8], worldMatrix[9], worldMatrix[10]).normalize();
  }
}
