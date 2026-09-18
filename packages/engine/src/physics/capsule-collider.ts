import { Aabb } from "../math/aabb.ts";
import { Vector3 } from "../math/vector3.ts";
import type { BoxCollider } from "./box-collider.ts";
import { Collider } from "./collider.ts";
import type { Collision } from "./collision.ts";
import { capsuleBoxCollision } from "./narrow-phase/capsule-box-collision.ts";
import { reverseCollision } from "./narrow-phase/reverse-collision.ts";
import type { RaycastHit } from "./raycast-hit.ts";
import type { SphereCollider } from "./sphere-collider.ts";

export interface CapsuleColliderOptions {
  // total height, including rounded ends; must be at least twice the radius
  readonly height: number;
  readonly radius: number;
}

// must be aligned with the local y-axis for now
export class CapsuleCollider extends Collider {
  readonly height: number;
  readonly radius: number;
  readonly halfSegmentHeight: number;

  constructor(options: Readonly<CapsuleColliderOptions>) {
    super();

    this.height = options.height;
    this.radius = options.radius;
    this.halfSegmentHeight = options.height / 2 - options.radius;
  }

  public override raycast(
    origin: Readonly<Vector3>,
    direction: Readonly<Vector3>,
  ): RaycastHit | undefined {
    const center = this.getWorldPosition();
    let nearestHit = this.getRayCylinderHit(origin, direction, center);
    const lowerHit = this.getRaySphereHit(
      origin,
      direction,
      center.clone().addScaled(new Vector3(0, 1, 0), -this.halfSegmentHeight),
    );
    const upperHit = this.getRaySphereHit(
      origin,
      direction,
      center.clone().addScaled(new Vector3(0, 1, 0), this.halfSegmentHeight),
    );

    if (
      lowerHit !== undefined &&
      (nearestHit === undefined || lowerHit.distance < nearestHit.distance)
    ) {
      nearestHit = lowerHit;
    }

    if (
      upperHit !== undefined &&
      (nearestHit === undefined || upperHit.distance < nearestHit.distance)
    ) {
      nearestHit = upperHit;
    }

    return nearestHit === undefined
      ? undefined
      : {
          collider: this,
          distance: nearestHit.distance,
          point: nearestHit.point,
          normal: nearestHit.normal,
        };
  }

  public override getWorldBounds(): Aabb {
    const center = this.getWorldPosition();

    return new Aabb(
      center.clone().subtract(new Vector3(this.radius, this.height / 2, this.radius)),
      center.addScaled(new Vector3(this.radius, this.height / 2, this.radius), 1),
    );
  }

  public override getCollision(candidate: Collider): Collision | undefined {
    // Let the candidate choose the handler for this capsule query.
    return candidate.getCollisionWithCapsule(this);
  }

  public override getCollisionWithBox(query: BoxCollider): Collision | undefined {
    // The available algorithm resolves a capsule, so reverse it to resolve the box query.
    const collision = capsuleBoxCollision(this, query);

    return collision === undefined ? undefined : reverseCollision(collision, this);
  }

  public override getCollisionWithSphere(_query: SphereCollider): Collision | undefined {
    // Capsule-sphere collision is not supported yet.
    return undefined;
  }

  public override getCollisionWithCapsule(_query: CapsuleCollider): Collision | undefined {
    // Capsule-capsule collision is not supported yet.
    return undefined;
  }

  private getRayCylinderHit(
    origin: Readonly<Vector3>,
    direction: Readonly<Vector3>,
    center: Readonly<Vector3>,
  ): CapsuleRaycastHit | undefined {
    const offsetX = origin[0] - center[0];
    const offsetZ = origin[2] - center[2];
    const horizontalDirectionSquared = direction[0] * direction[0] + direction[2] * direction[2];

    if (horizontalDirectionSquared === 0) {
      return undefined;
    }

    const projection = offsetX * direction[0] + offsetZ * direction[2];
    const radiusSquared = this.radius * this.radius;
    const discriminant =
      projection * projection -
      horizontalDirectionSquared * (offsetX * offsetX + offsetZ * offsetZ - radiusSquared);

    if (discriminant < 0) {
      return undefined;
    }

    const offsetDistance = Math.sqrt(discriminant);
    const entryDistance = (-projection - offsetDistance) / horizontalDirectionSquared;
    const exitDistance = (-projection + offsetDistance) / horizontalDirectionSquared;
    const distance = entryDistance >= 0 ? entryDistance : exitDistance;

    if (distance < 0) {
      return undefined;
    }

    const point = origin.clone().addScaled(direction, distance);
    const lowerY = center[1] - this.halfSegmentHeight;
    const upperY = center[1] + this.halfSegmentHeight;

    if (point[1] < lowerY || point[1] > upperY) {
      return undefined;
    }

    return {
      distance,
      point,
      normal: new Vector3(point[0] - center[0], 0, point[2] - center[2]).normalize(),
    };
  }

  private getRaySphereHit(
    origin: Readonly<Vector3>,
    direction: Readonly<Vector3>,
    center: Readonly<Vector3>,
  ): CapsuleRaycastHit | undefined {
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

    return {
      distance,
      point,
      normal: point.clone().subtract(center).normalize(),
    };
  }
}

interface CapsuleRaycastHit {
  readonly distance: number;
  readonly normal: Vector3;
  readonly point: Vector3;
}
