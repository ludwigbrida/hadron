import { Vector3 } from "../math/vector3.ts";
import { type Aabb, Collider } from "./collider.ts";
import type { RaycastHit } from "./raycast-hit.ts";

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

  public override getWorldBounds(): Aabb {
    const center = this.getWorldPosition();
    const radius = new Vector3(this.radius, this.radius, this.radius);

    return {
      minimum: center.clone().subtract(radius),
      maximum: center.addScaled(radius, 1),
    };
  }
}
