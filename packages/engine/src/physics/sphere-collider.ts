import { type RaycastHit, Vector3 } from "@hadron/engine";
import { Collider } from "./collider.ts";

export interface SphereColliderOptions {
  readonly radius: number;
}

export class SphereCollider extends Collider {
  readonly radius: number;

  constructor(options: Readonly<SphereColliderOptions>) {
    super();

    this.radius = options.radius;
  }

  public override raycast(
    origin: Readonly<Vector3>,
    direction: Readonly<Vector3>,
  ): RaycastHit | undefined {
    const center = this.getWorldPosition();

    const offsetX = origin[0] - center[0];
    const offsetY = origin[1] - center[1];
    const offsetZ = origin[2] - center[2];

    const projection = offsetX * direction[0] + offsetY * direction[1] + offsetZ * direction[2];

    const centerDistanceSquared = offsetX * offsetX + offsetY * offsetY + offsetZ * offsetZ;

    const closestDistanceSquared = centerDistanceSquared - projection * projection;

    const radiusSquared = this.radius * this.radius;

    if (closestDistanceSquared > radiusSquared) {
      return undefined;
    }

    const offsetDistance = Math.sqrt(radiusSquared - closestDistanceSquared);

    const entryDistance = -projection - offsetDistance;
    const exitDistance = -projection + offsetDistance;

    const distance = entryDistance >= 0 ? entryDistance : exitDistance;

    if (distance < 0) {
      return undefined;
    }

    const point = new Vector3(
      origin[0] + direction[0] * distance,
      origin[1] + direction[1] * distance,
      origin[2] + direction[2] * distance,
    );

    const normal = new Vector3(
      (point[0] - center[0]) / this.radius,
      (point[1] - center[1]) / this.radius,
      (point[2] - center[2]) / this.radius,
    );

    return {
      collider: this,
      distance,
      point,
      normal,
    };
  }
}
