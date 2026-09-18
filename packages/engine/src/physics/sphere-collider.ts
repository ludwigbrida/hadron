import { Aabb } from "../math/aabb.ts";
import { Vector3 } from "../math/vector3.ts";
import type { BoxCollider } from "./box-collider.ts";
import type { CapsuleCollider } from "./capsule-collider.ts";
import { Collider } from "./collider.ts";
import type { Collision } from "./collision.ts";
import { reverseCollision } from "./narrow-phase/reverse-collision.ts";
import { sphereBoxCollision } from "./narrow-phase/sphere-box-collision.ts";
import { sphereSphereCollision } from "./narrow-phase/sphere-sphere-collision.ts";
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

    return new Aabb(center.clone().subtract(radius), center.addScaled(radius, 1));
  }

  public override getCollision(candidate: Collider): Collision | undefined {
    // Let the candidate choose the handler for this sphere query.
    return candidate.getCollisionWithSphere(this);
  }

  public override getCollisionWithBox(query: BoxCollider): Collision | undefined {
    // The available algorithm resolves a sphere, so reverse it to resolve the box query.
    const collision = sphereBoxCollision(this, query);

    return collision === undefined ? undefined : reverseCollision(collision, this);
  }

  public override getCollisionWithSphere(query: SphereCollider): Collision | undefined {
    return sphereSphereCollision(query, this);
  }

  public override getCollisionWithCapsule(_query: CapsuleCollider): Collision | undefined {
    // Capsule-sphere collision is not supported yet.
    return undefined;
  }
}
