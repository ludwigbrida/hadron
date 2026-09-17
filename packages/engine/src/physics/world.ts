import { Vector3 } from "../math/vector3.ts";
import { Body } from "./body.ts";
import { BoxCollider } from "./box-collider.ts";
import type { RaycastHit } from "./raycast-hit.ts";

export class World {
  private readonly bodies = new Set<Body>();

  public addBody(body: Body): this {
    this.bodies.add(body);
    return this;
  }

  public removeBody(body: Body): this {
    this.bodies.delete(body);
    return this;
  }

  /**
   * Returns the nearest box hit by a normalized ray.
   */
  public raycast(
    origin: Readonly<Vector3>,
    direction: Readonly<Vector3>,
    maxDistance: number,
  ): RaycastHit | undefined {
    let nearestHit: RaycastHit | undefined;

    // TODO: make this generic over all colliders
    for (const collider of this.getBoxColliders()) {
      const distance = this.getRayBoxDistance(origin, direction, collider);

      if (
        distance !== undefined &&
        distance <= maxDistance &&
        (nearestHit === undefined || distance < nearestHit.distance)
      ) {
        nearestHit = {
          collider,
          distance,
          point: new Vector3(
            origin[0] + direction[0] * distance,
            origin[1] + direction[1] * distance,
            origin[2] + direction[2] * distance,
          ),
        };
      }
    }

    return nearestHit;
  }

  /**
   * Get the distance between
   *
   * @privateRemarks
   * Implementation of the slab-intersection algorithm.
   * Does only support axis-aligned bounding boxes for now (translation, but not rotation or scale).
   */
  private getRayBoxDistance(
    origin: Readonly<Vector3>,
    direction: Readonly<Vector3>,
    collider: BoxCollider,
  ): number | undefined {
    const center = collider.getWorldPosition();
    const halfExtents = collider.halfExtents;

    let entryDistance = -Infinity;
    let exitDistance = Infinity;

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

      entryDistance = Math.max(entryDistance, Math.min(firstDistance, secondDistance));
      exitDistance = Math.min(exitDistance, Math.max(firstDistance, secondDistance));

      if (entryDistance > exitDistance) {
        return undefined;
      }
    }

    if (exitDistance < 0) {
      return undefined;
    }

    return Math.max(entryDistance, 0);
  }

  *[Symbol.iterator](): IterableIterator<Body> {
    yield* this.bodies;
  }

  *getBoxColliders(): IterableIterator<BoxCollider> {
    for (const body of this.bodies) {
      for (const child of body) {
        if (child instanceof BoxCollider) {
          yield child;
        }
      }
    }
  }
}
