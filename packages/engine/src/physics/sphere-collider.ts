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

    const offset = origin.clone().subtract(center);

    const projection = offset.dot(direction);

    const closestDistanceSquared = offset.lengthSquared() - projection * projection;

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

    const point = origin.clone().addScaled(direction, distance);

    const normal = point.clone().subtract(center).normalize();

    return {
      collider: this,
      distance,
      point,
      normal,
    };
  }
}
