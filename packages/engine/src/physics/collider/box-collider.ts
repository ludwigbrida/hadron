import { Aabb } from "../../math/aabb.ts";
import { Vector3 } from "../../math/vector3.ts";
import type { Collision } from "../collision/collision.ts";
import { boxBoxCollision } from "../collision/narrow-phase/box-box-collision.ts";
import { capsuleBoxCollision } from "../collision/narrow-phase/capsule-box-collision.ts";
import { sphereBoxCollision } from "../collision/narrow-phase/sphere-box-collision.ts";
import type { RaycastHit } from "../query/raycast-hit.ts";
import type { CapsuleCollider } from "./capsule-collider.ts";
import { Collider } from "./collider.ts";
import type { SphereCollider } from "./sphere-collider.ts";

export interface BoxColliderOptions {
  readonly halfExtents: Readonly<Vector3>;
}

export class BoxCollider extends Collider {
  readonly halfExtents: Vector3;

  constructor(options: Readonly<BoxColliderOptions>) {
    super();

    this.halfExtents = options.halfExtents.clone();
  }

  // TODO: add world bounds for broad-phase collision detection

  public override raycast(
    origin: Readonly<Vector3>,
    direction: Readonly<Vector3>,
  ): RaycastHit | undefined {
    const hit = this.getRayHit(origin, direction);

    if (hit === undefined) {
      return undefined;
    }

    return {
      collider: this,
      distance: hit.distance,
      point: new Vector3(
        origin[0] + direction[0] * hit.distance,
        origin[1] + direction[1] * hit.distance,
        origin[2] + direction[2] * hit.distance,
      ),
      normal: hit.normal,
    };
  }

  public override getWorldBounds(): Aabb {
    const center = this.getWorldPosition();

    return new Aabb(
      center.clone().addScaled(this.halfExtents, -1),
      center.addScaled(this.halfExtents, 1),
    );
  }

  public override getCollision(candidate: Collider): Collision | undefined {
    // Let the candidate choose the handler for this box query.
    return candidate.getCollisionWithBox(this);
  }

  public override getCollisionWithBox(query: BoxCollider): Collision | undefined {
    return boxBoxCollision(query, this);
  }

  public override getCollisionWithSphere(query: SphereCollider): Collision | undefined {
    return sphereBoxCollision(query, this);
  }

  public override getCollisionWithCapsule(query: CapsuleCollider): Collision | undefined {
    return capsuleBoxCollision(query, this);
  }

  /**
   * Returns the first boundary hit between a normalized ray and a translated, axis-aligned box.
   *
   * Rays that originate inside the box report the exit face.
   *
   * @privateRemarks
   * Implementation of the slab-intersection algorithm.
   */
  private getRayHit(
    origin: Readonly<Vector3>,
    direction: Readonly<Vector3>,
  ): BoxRaycastHit | undefined {
    const center = this.getWorldPosition();
    const halfExtents = this.halfExtents;

    let entryDistance = -Infinity;
    let exitDistance = Infinity;
    const entryNormal = new Vector3(0, 0, 0);
    const exitNormal = new Vector3(0, 0, 0);

    // axes serve as indices for vector dimensions
    for (const axis of [0, 1, 2] as const) {
      const minimum = center[axis] - halfExtents[axis];
      const maximum = center[axis] + halfExtents[axis];
      const axisOrigin = origin[axis];
      const axisDirection = direction[axis];

      if (axisDirection === 0) {
        if (axisOrigin < minimum || axisOrigin > maximum) {
          return undefined;
        }

        continue;
      }

      const firstDistance = (minimum - axisOrigin) / axisDirection;
      const secondDistance = (maximum - axisOrigin) / axisDirection;
      const nearDistance = Math.min(firstDistance, secondDistance);
      const farDistance = Math.max(firstDistance, secondDistance);
      const nearNormal = firstDistance < secondDistance ? -1 : 1;
      const farNormal = -nearNormal;

      if (nearDistance > entryDistance) {
        entryDistance = nearDistance;
        entryNormal.setXyz(0, 0, 0);
        entryNormal[axis] = nearNormal;
      }

      if (farDistance < exitDistance) {
        exitDistance = farDistance;
        exitNormal.setXyz(0, 0, 0);
        exitNormal[axis] = farNormal;
      }

      if (entryDistance > exitDistance) {
        return undefined;
      }
    }

    if (exitDistance < 0) {
      return undefined;
    }

    return entryDistance >= 0
      ? { distance: entryDistance, normal: entryNormal }
      : { distance: exitDistance, normal: exitNormal };
  }
}

interface BoxRaycastHit {
  readonly distance: number;
  readonly normal: Vector3;
}
