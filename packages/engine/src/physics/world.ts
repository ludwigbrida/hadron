import { Vector3 } from "../math/vector3.ts";
import { Body } from "./body.ts";
import { BoxCollider } from "./box-collider.ts";
import type { RaycastHit } from "./raycast-hit.ts";

const axes = [0, 1, 2] as const;

interface BoxRaycastHit {
  readonly distance: number;
  readonly normal: Vector3;
}

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
      const hit = this.getRayBoxHit(origin, direction, collider);

      if (
        hit !== undefined &&
        hit.distance <= maxDistance &&
        (nearestHit === undefined || hit.distance < nearestHit.distance)
      ) {
        nearestHit = {
          collider,
          distance: hit.distance,
          point: new Vector3(
            // TODO: replace with actual vector operations
            origin[0] + direction[0] * hit.distance,
            origin[1] + direction[1] * hit.distance,
            origin[2] + direction[2] * hit.distance,
          ),
          normal: hit.normal,
        };
      }
    }

    return nearestHit;
  }

  /**
   * Returns the first boundary hit between a normalized ray and a translated, axis-aligned box.
   *
   * Rays that originate inside the box report the exit face.
   *
   * @privateRemarks
   * Implementation of the slab-intersection algorithm.
   */
  private getRayBoxHit(
    origin: Readonly<Vector3>,
    direction: Readonly<Vector3>,
    collider: BoxCollider,
  ): BoxRaycastHit | undefined {
    const center = collider.getWorldPosition();
    const halfExtents = collider.halfExtents;

    let entryDistance = -Infinity;
    let exitDistance = Infinity;
    const entryNormal = new Vector3(0, 0, 0);
    const exitNormal = new Vector3(0, 0, 0);

    // axes serve as indices for vector dimensions
    for (const axis of axes) {
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
